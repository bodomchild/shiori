import { after, before, beforeEach, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';

const FER_UID = '8ew8WV6wdVWGDeyYet2LC4VIK3n2';
const LORE_UID = 'HnuScK26yENhDdMC37HEfzYLzsE3';
const OTHER_UID = 'another-user';
const projectId = 'demo-shiori-firestore-rules';
let testEnvironment;

function photoData(cityId, photoId, uploaderUid = FER_UID) {
  const base = `trips/japan-2026/photos/${cityId}/${photoId}`;
  return {
    photoId,
    cityId,
    originalPath: `${base}/original`,
    previewPath: `${base}/preview.jpg`,
    thumbnailPath: `${base}/thumbnail.jpg`,
    originalName: 'foto.jpg',
    createdAt: '2026-10-13T12:00:00.000Z',
    capturedAt: '2026-10-13T10:00:00.000Z',
    sortAt: '2026-10-13T10:00:00.000Z',
    uploaderUid,
    originalSize: 1234,
  };
}

function photoRef(database, cityId, photoId) {
  return doc(database, `trips/japan-2026/cities/${cityId}/photos/${photoId}`);
}

before(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: { rules: await readFile(new URL('../firestore.rules', import.meta.url), 'utf8') },
  });
});

beforeEach(async () => testEnvironment.clearFirestore());
after(async () => testEnvironment.cleanup());

test('Fer y Lore pueden crear y leer entradas válidas', async () => {
  const ferDatabase = testEnvironment.authenticatedContext(FER_UID).firestore();
  const loreDatabase = testEnvironment.authenticatedContext(LORE_UID).firestore();
  await assertSucceeds(setDoc(photoRef(ferDatabase, 'osaka', 'photo-1'), photoData('osaka', 'photo-1')));
  await assertSucceeds(getDoc(photoRef(loreDatabase, 'osaka', 'photo-1')));
  await assertSucceeds(setDoc(photoRef(loreDatabase, 'kyoto', 'photo-2'), photoData('kyoto', 'photo-2', LORE_UID)));
});

test('una cuenta no autorizada no puede leer ni escribir el índice', async () => {
  const database = testEnvironment.authenticatedContext(OTHER_UID).firestore();
  await assertFails(setDoc(photoRef(database, 'osaka', 'photo-1'), photoData('osaka', 'photo-1', OTHER_UID)));
  await assertFails(getDoc(photoRef(database, 'osaka', 'photo-1')));
});

test('nadie puede acceder al índice sin iniciar sesión', async () => {
  const database = testEnvironment.unauthenticatedContext().firestore();
  await assertFails(getDoc(photoRef(database, 'osaka', 'photo-1')));
});

test('rechaza ciudades y rutas de Storage que no coinciden', async () => {
  const database = testEnvironment.authenticatedContext(FER_UID).firestore();
  await assertFails(setDoc(photoRef(database, 'nara', 'photo-1'), photoData('nara', 'photo-1')));
  await assertFails(setDoc(photoRef(database, 'osaka', 'photo-2'), {
    ...photoData('osaka', 'photo-2'),
    previewPath: 'trips/japan-2026/photos/kyoto/photo-2/preview.jpg',
  }));
});

test('una cuenta autorizada puede borrar una entrada', async () => {
  const ferDatabase = testEnvironment.authenticatedContext(FER_UID).firestore();
  const loreDatabase = testEnvironment.authenticatedContext(LORE_UID).firestore();
  const reference = photoRef(ferDatabase, 'osaka', 'photo-1');
  await assertSucceeds(setDoc(reference, photoData('osaka', 'photo-1')));
  await assertSucceeds(deleteDoc(photoRef(loreDatabase, 'osaka', 'photo-1')));
});

test('solamente las cuentas autorizadas pueden completar la migración', async () => {
  const path = 'trips/japan-2026/migrations/storage-photo-index-v1';
  const ferDatabase = testEnvironment.authenticatedContext(FER_UID).firestore();
  const otherDatabase = testEnvironment.authenticatedContext(OTHER_UID).firestore();
  await assertSucceeds(setDoc(doc(ferDatabase, path), { completedAt: '2026-09-25T12:00:00.000Z', photoCount: 0, version: 1 }));
  await assertFails(setDoc(doc(otherDatabase, path), { completedAt: '2026-09-25T12:00:00.000Z', photoCount: 0, version: 1 }));
});

test('cada persona solamente puede leer sus propias exportaciones', async () => {
  const path = 'trips/japan-2026/exports/job-1';
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), path), {
      cityId: 'osaka',
      status: 'ready',
      createdBy: FER_UID,
    });
    await setDoc(doc(context.firestore(), `${path}/parts/001`), { status: 'ready' });
  });

  const ferDatabase = testEnvironment.authenticatedContext(FER_UID).firestore();
  const loreDatabase = testEnvironment.authenticatedContext(LORE_UID).firestore();
  await assertSucceeds(getDoc(doc(ferDatabase, path)));
  await assertSucceeds(getDoc(doc(ferDatabase, `${path}/parts/001`)));
  await assertFails(getDoc(doc(loreDatabase, path)));
  await assertFails(getDoc(doc(loreDatabase, `${path}/parts/001`)));
  await assertFails(setDoc(doc(ferDatabase, path), { status: 'changed' }));
});
