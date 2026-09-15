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
  if (!photo.preview) throw new Error('La foto todavía no tiene vista previa.');
  const basePath = photoPath(photo.cityId, photo.photoId);
  const originalPath = `${basePath}/original`;
  const previewPath = `${basePath}/preview.jpg`;
  const customMetadata = {
    tripId: 'japan-2026',
    cityId: photo.cityId,
    photoId: photo.photoId,
    uploaderUid,
    originalName: photo.originalName,
    createdAt: photo.createdAt,
  };

  if (!await objectExists(originalPath)) {
    await uploadBlob(originalPath, photo.original, {
      contentType: photo.contentType,
      cacheControl: 'private,max-age=86400',
      customMetadata,
    }, (fraction) => onProgress(fraction * 0.85));
  } else {
    onProgress(0.85);
  }

  if (!await objectExists(previewPath)) {
    await uploadBlob(previewPath, photo.preview, {
      contentType: 'image/jpeg',
      cacheControl: 'private,max-age=86400',
      customMetadata,
    }, (fraction) => onProgress(0.85 + fraction * 0.15));
  }
  onProgress(1);
}

export async function listCityPhotos(cityId: string): Promise<PhotoRecord[]> {
  const prefixes = new Map<string, string>();
  let pageToken: string | undefined;

  do {
    const page = await list(ref(photoStorage, `${PHOTO_ROOT}/${cityId}`), { maxResults: 100, pageToken });
    page.prefixes.forEach((prefix) => prefixes.set(prefix.name, prefix.fullPath));
    pageToken = page.nextPageToken;
  } while (pageToken);

  const records = await Promise.all([...prefixes].map(async ([photoId, fullPath]) => {
    try {
      const previewPath = `${fullPath}/preview.jpg`;
      const metadata = await getMetadata(ref(photoStorage, previewPath));
      return {
        photoId,
        cityId,
        originalPath: `${fullPath}/original`,
        previewPath,
        originalName: metadata.customMetadata?.originalName ?? 'foto',
        createdAt: metadata.customMetadata?.createdAt ?? metadata.timeCreated,
        uploaderUid: metadata.customMetadata?.uploaderUid ?? '',
      } satisfies PhotoRecord;
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'storage/object-not-found') return null;
      throw error;
    }
  }));

  return records
    .filter((record): record is PhotoRecord => record !== null)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
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
  await deleteObjectIfPresent(photo.previewPath);
}
