import { FirebaseError } from 'firebase/app';
import {
  deleteObject,
  getBlob,
  getMetadata,
  list,
  ref,
  uploadBytesResumable,
  type UploadMetadata,
} from 'firebase/storage';
import { photoStorage } from '../firebase';
import type { PendingPhoto, PhotoRecord } from './types';

const PHOTO_ROOT = 'trips/japan-2026/photos';

function photoPath(cityId: string, photoId: string) {
  return `${PHOTO_ROOT}/${cityId}/${photoId}`;
}

async function objectExists(path: string) {
  try {
    await getMetadata(ref(photoStorage, path));
    return true;
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'storage/object-not-found') return false;
    throw error;
  }
}

function uploadBlob(path: string, blob: Blob, metadata: UploadMetadata, onProgress: (fraction: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const task = uploadBytesResumable(ref(photoStorage, path), blob, metadata);
    task.on('state_changed',
      (snapshot) => onProgress(snapshot.totalBytes ? snapshot.bytesTransferred / snapshot.totalBytes : 0),
      reject,
      () => resolve(),
    );
  });
}

export async function uploadPendingPhoto(photo: PendingPhoto, uploaderUid: string, onProgress: (fraction: number) => void) {
  if (!photo.preview || !photo.thumbnail) throw new Error('La foto todavía no tiene sus vistas previas.');
  const basePath = photoPath(photo.cityId, photo.photoId);
  const originalPath = `${basePath}/original`;
  const thumbnailPath = `${basePath}/thumbnail.jpg`;
  const previewPath = `${basePath}/preview.jpg`;
  const customMetadata = {
    tripId: 'japan-2026',
    cityId: photo.cityId,
    photoId: photo.photoId,
    uploaderUid,
    originalName: photo.originalName,
    createdAt: photo.createdAt,
    originalSize: String(photo.original.size),
    hasThumbnail: 'true',
    ...(photo.capturedAt ? { capturedAt: photo.capturedAt } : {}),
  };

  if (!await objectExists(originalPath)) {
    await uploadBlob(originalPath, photo.original, {
      contentType: photo.contentType,
      cacheControl: 'private,max-age=86400',
      customMetadata,
    }, (fraction) => onProgress(fraction * 0.8));
  } else {
    onProgress(0.8);
  }

  if (!await objectExists(thumbnailPath)) {
    await uploadBlob(thumbnailPath, photo.thumbnail, {
      contentType: 'image/jpeg',
      cacheControl: 'private,max-age=86400',
      customMetadata,
    }, (fraction) => onProgress(0.8 + fraction * 0.1));
  } else {
    onProgress(0.9);
  }

  // La vista previa se sube al final y funciona como señal de foto completa.
  if (!await objectExists(previewPath)) {
    await uploadBlob(previewPath, photo.preview, {
      contentType: 'image/jpeg',
      cacheControl: 'private,max-age=86400',
      customMetadata,
    }, (fraction) => onProgress(0.9 + fraction * 0.1));
  }
  onProgress(1);
  return {
    photoId: photo.photoId,
    cityId: photo.cityId,
    originalPath,
    previewPath,
    thumbnailPath,
    originalName: photo.originalName,
    createdAt: photo.createdAt,
    ...(photo.capturedAt ? { capturedAt: photo.capturedAt } : {}),
    sortAt: photo.capturedAt ?? photo.createdAt,
    uploaderUid,
    originalSize: photo.original.size,
  } satisfies PhotoRecord;
}

async function listCityPhotoFolders(cityId: string) {
  const prefixes = new Map<string, string>();
  let pageToken: string | undefined;

  do {
    const page = await list(ref(photoStorage, `${PHOTO_ROOT}/${cityId}`), { maxResults: 100, pageToken });
    page.prefixes.forEach((prefix) => prefixes.set(prefix.name, prefix.fullPath));
    pageToken = page.nextPageToken;
  } while (pageToken);

  return prefixes;
}

export async function countCityPhotos(cityId: string) {
  return (await listCityPhotoFolders(cityId)).size;
}

export async function listCityPhotos(cityId: string): Promise<PhotoRecord[]> {
  const prefixes = await listCityPhotoFolders(cityId);

  const records = await Promise.all([...prefixes].map(async ([photoId, fullPath]) => {
    try {
      const previewPath = `${fullPath}/preview.jpg`;
      const metadata = await getMetadata(ref(photoStorage, previewPath));
      return {
        photoId,
        cityId,
        originalPath: `${fullPath}/original`,
        previewPath,
        ...(metadata.customMetadata?.hasThumbnail === 'true' ? { thumbnailPath: `${fullPath}/thumbnail.jpg` } : {}),
        originalName: metadata.customMetadata?.originalName ?? 'foto',
        createdAt: metadata.customMetadata?.createdAt ?? metadata.timeCreated,
        ...(metadata.customMetadata?.capturedAt ? { capturedAt: metadata.customMetadata.capturedAt } : {}),
        sortAt: metadata.customMetadata?.capturedAt ?? metadata.customMetadata?.createdAt ?? metadata.timeCreated,
        uploaderUid: metadata.customMetadata?.uploaderUid ?? '',
        originalSize: Number(metadata.customMetadata?.originalSize ?? 0),
      } satisfies PhotoRecord;
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'storage/object-not-found') return null;
      throw error;
    }
  }));

  return records
    .filter((record): record is PhotoRecord => record !== null)
    .sort((left, right) => {
      const byCaptureDate = (right.capturedAt ?? right.createdAt).localeCompare(left.capturedAt ?? left.createdAt);
      return byCaptureDate || right.createdAt.localeCompare(left.createdAt) || right.photoId.localeCompare(left.photoId);
    });
}

export function loadPhotoBlob(path: string) {
  return getBlob(ref(photoStorage, path));
}

async function deleteObjectIfPresent(path: string) {
  try {
    await deleteObject(ref(photoStorage, path));
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'storage/object-not-found') return;
    throw error;
  }
}

export async function deleteCityPhoto(photo: PhotoRecord) {
  // Mantener la vista previa hasta el final permite reintentar si falla el
  // borrado del original. La galería usa la vista previa como registro visible.
  await deleteObjectIfPresent(photo.originalPath);
  if (photo.thumbnailPath) await deleteObjectIfPresent(photo.thumbnailPath);
  await deleteObjectIfPresent(photo.previewPath);
}
