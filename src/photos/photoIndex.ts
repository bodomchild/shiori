import {
  collection,
  deleteDoc,
  doc,
  documentId,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  writeBatch,
  type DocumentData,
} from 'firebase/firestore';
import { photoDatabase } from '../firebase';
import { listCityPhotos } from './photoStorage';
import type { PhotoPageCursor, PhotoRecord } from './types';

const TRIP_ID = 'japan-2026';
const PAGE_SIZE = 50;
const MIGRATION_ID = 'storage-photo-index-v1';

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

export async function listCityPhotoPage(cityId: string, cursor?: PhotoPageCursor) {
  const constraints = [
    orderBy('sortAt', 'desc'),
    orderBy(documentId(), 'desc'),
    ...(cursor ? [startAfter(cursor.sortAt, cursor.photoId)] : []),
    limit(PAGE_SIZE + 1),
  ];
  const snapshot = await getDocs(query(cityPhotos(cityId), ...constraints));
  const pageDocuments = snapshot.docs.slice(0, PAGE_SIZE);
  const photos = pageDocuments.map((entry) => photoFromData(entry.data()));
  const last = pageDocuments.at(-1);
  const nextCursor = snapshot.size > PAGE_SIZE && last
    ? { sortAt: String(last.get('sortAt')), photoId: last.id }
    : null;
  return { photos, nextCursor };
}

export async function countIndexedCityPhotos(cityId: string) {
  return (await getCountFromServer(cityPhotos(cityId))).data().count;
}

export async function ensurePhotoIndex(cityIds: string[]) {
  const marker = doc(photoDatabase, `trips/${TRIP_ID}/migrations/${MIGRATION_ID}`);
  if ((await getDoc(marker)).exists()) return;

  const photos = (await Promise.all(cityIds.map((cityId) => listCityPhotos(cityId)))).flat();
  for (let offset = 0; offset < photos.length; offset += 400) {
    const batch = writeBatch(photoDatabase);
    photos.slice(offset, offset + 400).forEach((photo) => {
      batch.set(photoDocument(photo.cityId, photo.photoId), serializablePhoto(photo));
    });
    await batch.commit();
  }

  await setDoc(marker, {
    completedAt: new Date().toISOString(),
    photoCount: photos.length,
    version: 1,
  });
}
