import {
  collection,
  deleteDoc,
  doc,
  documentId,
  getCountFromServer,
  getDocsFromCache,
  getDocsFromServer,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  type DocumentData,
  type QuerySnapshot,
} from 'firebase/firestore';
import { photoDatabase } from '../firebase';
import type { PhotoPageCursor, PhotoRecord } from './types';

const TRIP_ID = 'japan-2026';

function cityPhotos(cityId: string) {
  return collection(photoDatabase, `trips/${TRIP_ID}/cities/${cityId}/photos`);
}

function photoDocument(cityId: string, photoId: string) {
  return doc(photoDatabase, `trips/${TRIP_ID}/cities/${cityId}/photos/${photoId}`);
}

function serializablePhoto(photo: PhotoRecord): DocumentData {
  return {
    photoId: photo.photoId,
    cityId: photo.cityId,
    originalPath: photo.originalPath,
    previewPath: photo.previewPath,
    ...(photo.thumbnailPath ? { thumbnailPath: photo.thumbnailPath } : {}),
    originalName: photo.originalName,
    createdAt: photo.createdAt,
    ...(photo.capturedAt ? { capturedAt: photo.capturedAt } : {}),
    sortAt: photo.sortAt,
    uploaderUid: photo.uploaderUid,
    originalSize: photo.originalSize,
  };
}

function photoFromData(data: DocumentData): PhotoRecord {
  return {
    photoId: String(data.photoId),
    cityId: String(data.cityId),
    originalPath: String(data.originalPath),
    previewPath: String(data.previewPath),
    ...(data.thumbnailPath ? { thumbnailPath: String(data.thumbnailPath) } : {}),
    originalName: String(data.originalName || 'foto'),
    createdAt: String(data.createdAt),
    ...(data.capturedAt ? { capturedAt: String(data.capturedAt) } : {}),
    sortAt: String(data.sortAt || data.capturedAt || data.createdAt),
    uploaderUid: String(data.uploaderUid || ''),
    originalSize: Number(data.originalSize || 0),
  };
}

export async function savePhotoIndex(photo: PhotoRecord) {
  await setDoc(photoDocument(photo.cityId, photo.photoId), serializablePhoto(photo));
}

export async function deletePhotoIndex(photo: PhotoRecord) {
  await deleteDoc(photoDocument(photo.cityId, photo.photoId));
}

export interface CityPhotoPage {
  photos: PhotoRecord[];
  nextCursor: PhotoPageCursor | null;
}

function photoPageFromSnapshot(snapshot: QuerySnapshot<DocumentData>, pageSize: number): CityPhotoPage {
  const pageDocuments = snapshot.docs.slice(0, pageSize);
  const photos = pageDocuments.map((entry) => photoFromData(entry.data()));
  const last = pageDocuments.at(-1);
  const nextCursor = snapshot.size > pageSize && last
    ? { sortAt: String(last.get('sortAt')), photoId: last.id }
    : null;
  return { photos, nextCursor };
}

export async function listCityPhotoPage(
  cityId: string,
  pageSize: number,
  cursor?: PhotoPageCursor,
  onCachedPage?: (page: CityPhotoPage) => void,
) {
  const constraints = [
    orderBy('sortAt', 'desc'),
    orderBy(documentId(), 'desc'),
    ...(cursor ? [startAfter(cursor.sortAt, cursor.photoId)] : []),
    limit(pageSize + 1),
  ];
  const pageQuery = query(cityPhotos(cityId), ...constraints);
  let serverFinished = false;
  const cachedPage = getDocsFromCache(pageQuery).then((snapshot) => {
    // Una caché vacía no demuestra que la ciudad esté vacía en el servidor.
    if (snapshot.empty) return null;
    const page = photoPageFromSnapshot(snapshot, pageSize);
    if (!serverFinished) onCachedPage?.(page);
    return page;
  }).catch(() => null);

  try {
    const snapshot = await getDocsFromServer(pageQuery);
    return photoPageFromSnapshot(snapshot, pageSize);
  } catch (error) {
    // Un permiso revocado no debe quedar oculto por la caché.
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
    if (code === 'permission-denied' || code === 'unauthenticated') throw error;
    const fallback = await cachedPage;
    if (fallback) return fallback;
    throw error;
  } finally {
    serverFinished = true;
  }
}

export async function countIndexedCityPhotos(cityId: string) {
  return (await getCountFromServer(cityPhotos(cityId))).data().count;
}

