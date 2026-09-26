import { ZipArchive } from 'archiver';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getFunctions } from 'firebase-admin/functions';
import { getStorage } from 'firebase-admin/storage';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { onTaskDispatched } from 'firebase-functions/v2/tasks';

const REGION = 'us-central1';
const EXPORT_BUCKET = 'shiori-japan-2026-exports';
const ALLOWED_UIDS = new Set([
  '8ew8WV6wdVWGDeyYet2LC4VIK3n2',
  'HnuScK26yENhDdMC37HEfzYLzsE3',
]);
const CITY_IDS = new Set(['osaka', 'kyoto', 'kanazawa', 'kawaguchiko', 'hakone', 'tokyo']);
const TARGET_PART_BYTES = 1.5 * 1024 * 1024 * 1024;
const UNKNOWN_PHOTO_BYTES = 20 * 1024 * 1024;
const MAX_PHOTOS_PER_PART = 150;
const EXPORT_LIFETIME_MS = 48 * 60 * 60 * 1000;

interface ExportPhoto {
  originalPath: string;
  originalName: string;
  estimatedSize: number;
}

interface ExportTaskData {
  jobId: string;
  partId: string;
}

function requireAllowedUser(uid: string | undefined) {
  if (!uid || !ALLOWED_UIDS.has(uid)) throw new HttpsError('permission-denied', 'Esta cuenta no está habilitada.');
  return uid;
}

function splitIntoParts(photos: ExportPhoto[]) {
  const parts: ExportPhoto[][] = [];
  let current: ExportPhoto[] = [];
  let currentBytes = 0;

  for (const photo of photos) {
    const wouldOverflow = current.length > 0
      && (currentBytes + photo.estimatedSize > TARGET_PART_BYTES || current.length >= MAX_PHOTOS_PER_PART);
    if (wouldOverflow) {
      parts.push(current);
      current = [];
      currentBytes = 0;
    }
    current.push(photo);
    currentBytes += photo.estimatedSize;
  }
  if (current.length) parts.push(current);
  return parts;
}

function safeFileName(name: string, index: number) {
  const cleaned = name.replace(/[\\/<>:"|?*\u0000-\u001f]/g, '_').trim() || 'foto.jpg';
  return `${String(index + 1).padStart(4, '0')}-${cleaned}`;
}

export const startCityExport = onCall({ region: REGION, timeoutSeconds: 120 }, async (request) => {
  const uid = requireAllowedUser(request.auth?.uid);
  const cityId = typeof request.data?.cityId === 'string' ? request.data.cityId : '';
  if (!CITY_IDS.has(cityId)) throw new HttpsError('invalid-argument', 'La ciudad no es válida.');

  const database = getFirestore();
  const photosSnapshot = await database.collection(`trips/japan-2026/cities/${cityId}/photos`)
    .orderBy('sortAt', 'asc')
    .get();
  if (photosSnapshot.empty) throw new HttpsError('failed-precondition', 'La ciudad todavía no tiene fotos.');

  const photos = photosSnapshot.docs.map((entry) => {
    const data = entry.data();
    const originalSize = Number(data.originalSize || 0);
    return {
      originalPath: String(data.originalPath),
      originalName: String(data.originalName || 'foto.jpg'),
      estimatedSize: originalSize > 0 ? originalSize : UNKNOWN_PHOTO_BYTES,
    } satisfies ExportPhoto;
  });
  const parts = splitIntoParts(photos);
  const job = database.collection('trips/japan-2026/exports').doc();
  const expiresAt = Timestamp.fromMillis(Date.now() + EXPORT_LIFETIME_MS);
  const batch = database.batch();
  batch.set(job, {
    cityId,
    status: 'queued',
    createdBy: uid,
    createdAt: Timestamp.now(),
    expiresAt,
    photoCount: photos.length,
    totalBytes: photos.reduce((total, photo) => total + photo.estimatedSize, 0),
    partCount: parts.length,
    completedParts: 0,
  });
  parts.forEach((part, index) => {
    const partId = String(index + 1).padStart(3, '0');
    batch.set(job.collection('parts').doc(partId), {
      status: 'queued',
      index,
      photos: part,
      estimatedBytes: part.reduce((total, photo) => total + photo.estimatedSize, 0),
    });
  });
  await batch.commit();

  try {
    const queue = getFunctions().taskQueue<ExportTaskData>('processCityExport');
    await Promise.all(parts.map((_, index) => queue.enqueue({
      jobId: job.id,
      partId: String(index + 1).padStart(3, '0'),
    })));
  } catch (error) {
    await job.update({ status: 'error', error: 'No se pudieron iniciar las tareas de exportación.' });
    throw error;
  }

  return { jobId: job.id, partCount: parts.length };
});

export const processCityExport = onTaskDispatched({
  region: REGION,
  memory: '1GiB',
  timeoutSeconds: 1800,
  maxInstances: 2,
  concurrency: 1,
  retryConfig: { maxAttempts: 3, minBackoffSeconds: 30 },
  rateLimits: { maxConcurrentDispatches: 2 },
}, async (request) => {
  const { jobId, partId } = request.data;
  if (!jobId || !partId) throw new Error('Faltan datos de la tarea.');

  const database = getFirestore();
  const job = database.doc(`trips/japan-2026/exports/${jobId}`);
  const part = job.collection('parts').doc(partId);
  const [jobSnapshot, partSnapshot] = await Promise.all([job.get(), part.get()]);
  if (!jobSnapshot.exists || !partSnapshot.exists) throw new Error('La exportación no existe.');
  if (partSnapshot.get('status') === 'ready') return;

  const cityId = String(jobSnapshot.get('cityId'));
  const partCount = Number(jobSnapshot.get('partCount'));
  const photos = partSnapshot.get('photos') as ExportPhoto[];
  const fileName = `${cityId}-fotos-${partId}-de-${String(partCount).padStart(3, '0')}.zip`;
  const objectPath = `exports/${jobId}/${fileName}`;
  const outputFile = getStorage().bucket(EXPORT_BUCKET).file(objectPath);
  await Promise.all([
    jobSnapshot.get('status') === 'queued' ? job.update({ status: 'processing' }) : Promise.resolve(),
    part.update({ status: 'processing', startedAt: Timestamp.now() }),
  ]);

  try {
    await new Promise<void>((resolve, reject) => {
      const output = outputFile.createWriteStream({
        resumable: false,
        metadata: {
          contentType: 'application/zip',
          cacheControl: 'private,no-store',
          metadata: { jobId, cityId, expiresAt: String(jobSnapshot.get('expiresAt').toMillis()) },
        },
      });
      const archive = new ZipArchive({ forceZip64: true, zlib: { level: 0 } });
      output.on('finish', resolve);
      output.on('error', reject);
      archive.on('error', reject);
      archive.pipe(output);
      photos.forEach((photo, index) => {
        const source = getStorage().bucket().file(photo.originalPath).createReadStream();
        source.on('error', reject);
        archive.append(source, {
          name: safeFileName(photo.originalName, index),
        });
      });
      void archive.finalize();
    });

    const [metadata] = await outputFile.getMetadata();
    await database.runTransaction(async (transaction) => {
      const [latestJob, latestPart] = await Promise.all([transaction.get(job), transaction.get(part)]);
      if (latestPart.get('status') === 'ready') return;
      const completedParts = Math.min(Number(latestJob.get('completedParts') || 0) + 1, partCount);
      transaction.update(part, {
        status: 'ready',
        completedAt: Timestamp.now(),
        objectPath,
        fileName,
        size: Number(metadata.size || 0),
      });
      transaction.update(job, {
        completedParts,
        ...(completedParts === partCount ? { status: 'ready', completedAt: Timestamp.now() } : {}),
      });
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    await part.update({ status: 'error', error: errorMessage });
    if (request.context.retryCount >= 2) await job.update({ status: 'error', error: 'No se pudo preparar una de las partes.' });
    throw error;
  }
});

export const getCityExportLinks = onCall({ region: REGION, timeoutSeconds: 120 }, async (request) => {
  const uid = requireAllowedUser(request.auth?.uid);
  const jobId = typeof request.data?.jobId === 'string' ? request.data.jobId : '';
  if (!jobId) throw new HttpsError('invalid-argument', 'Falta la exportación.');

  const job = getFirestore().doc(`trips/japan-2026/exports/${jobId}`);
  const jobSnapshot = await job.get();
  if (!jobSnapshot.exists || jobSnapshot.get('createdBy') !== uid) throw new HttpsError('not-found', 'La exportación no existe.');
  if (jobSnapshot.get('status') !== 'ready') throw new HttpsError('failed-precondition', 'La exportación todavía no está lista.');
  if (jobSnapshot.get('expiresAt').toMillis() <= Date.now()) throw new HttpsError('failed-precondition', 'La exportación venció. Preparala nuevamente.');

  const parts = await job.collection('parts').orderBy('index', 'asc').get();
  const expires = Date.now() + 60 * 60 * 1000;
  const links = await Promise.all(parts.docs.map(async (entry) => {
    const fileName = String(entry.get('fileName'));
    const [url] = await getStorage().bucket(EXPORT_BUCKET).file(String(entry.get('objectPath'))).getSignedUrl({
      version: 'v4',
      action: 'read',
      expires,
      responseDisposition: `attachment; filename="${fileName}"`,
    });
    return { fileName, size: Number(entry.get('size') || 0), url };
  }));
  return { links, expiresAt: new Date(expires).toISOString() };
});
