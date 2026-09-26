import { getFirestore } from 'firebase-admin/firestore';
import { onObjectDeleted, onObjectFinalized } from 'firebase-functions/v2/storage';

const REGION = 'us-central1';
const BUCKET = 'shiori-japan-2026.firebasestorage.app';
const PHOTO_PATTERN = /^trips\/japan-2026\/photos\/(osaka|kyoto|kanazawa|kawaguchiko|hakone|tokyo)\/([^/]+)\/preview\.jpg$/;

function photoDocument(cityId: string, photoId: string) {
  return getFirestore().doc(`trips/japan-2026/cities/${cityId}/photos/${photoId}`);
}

export const indexCityPhoto = onObjectFinalized({ bucket: BUCKET, region: REGION }, async (event) => {
  const object = event.data;
  const match = object.name?.match(PHOTO_PATTERN);
  if (!match) return;

  const [, cityId, photoId] = match;
  const metadata = object.metadata ?? {};
  const basePath = `trips/japan-2026/photos/${cityId}/${photoId}`;
  const createdAt = metadata.createdAt ?? object.timeCreated ?? new Date().toISOString();
  const capturedAt = metadata.capturedAt;

  await photoDocument(cityId, photoId).set({
    photoId,
    cityId,
    originalPath: `${basePath}/original`,
    previewPath: `${basePath}/preview.jpg`,
    ...(metadata.hasThumbnail === 'true' ? { thumbnailPath: `${basePath}/thumbnail.jpg` } : {}),
    originalName: metadata.originalName ?? 'foto',
    createdAt,
    ...(capturedAt ? { capturedAt } : {}),
    sortAt: capturedAt ?? createdAt,
    uploaderUid: metadata.uploaderUid ?? '',
    originalSize: Number(metadata.originalSize ?? 0),
  }, { merge: true });
});

export const removeCityPhotoIndex = onObjectDeleted({ bucket: BUCKET, region: REGION }, async (event) => {
  const match = event.data.name?.match(PHOTO_PATTERN);
  if (!match) return;
  const [, cityId, photoId] = match;
  await photoDocument(cityId, photoId).delete();
});
