import { after, before, beforeEach, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { deleteObject, getMetadata, list, ref, uploadBytes } from 'firebase/storage';

const FER_UID = '8ew8WV6wdVWGDeyYet2LC4VIK3n2';
const OTHER_UID = 'another-user';
const projectId = 'demo-shiori-storage-rules';
let testEnvironment;

function metadata(cityId, photoId, uploaderUid = FER_UID, contentType = 'image/jpeg') {
  return {
    contentType,
    customMetadata: {
      tripId: 'japan-2026',
      cityId,
      photoId,
      uploaderUid,
      originalName: 'foto.jpg',
      createdAt: '2026-10-13T12:00:00.000Z',
    },
  };
}

before(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId,
    storage: { rules: await readFile(new URL('../storage.rules', import.meta.url), 'utf8') },
  });
});

beforeEach(async () => testEnvironment.clearStorage());
after(async () => testEnvironment.cleanup());

test('Fer puede crear, leer y listar originales y vistas previas válidas', async () => {
  const storage = testEnvironment.authenticatedContext(FER_UID).storage();
  const base = 'trips/japan-2026/photos/osaka/photo-1';
  await assertSucceeds(uploadBytes(ref(storage, `${base}/original`), new Uint8Array([1, 2]), metadata('osaka', 'photo-1')));
  await assertSucceeds(uploadBytes(ref(storage, `${base}/preview.jpg`), new Uint8Array([3]), metadata('osaka', 'photo-1')));
  await assertSucceeds(getMetadata(ref(storage, `${base}/original`)));
  await assertSucceeds(list(ref(storage, 'trips/japan-2026/photos/osaka')));
});

test('una cuenta no autorizada no puede leer ni crear fotos', async () => {
  const storage = testEnvironment.authenticatedContext(OTHER_UID).storage();
  const path = 'trips/japan-2026/photos/osaka/photo-2/original';
  await assertFails(uploadBytes(ref(storage, path), new Uint8Array([1]), metadata('osaka', 'photo-2', OTHER_UID)));
  await assertFails(getMetadata(ref(storage, path)));
});

test('nadie puede acceder sin iniciar sesión', async () => {
  const storage = testEnvironment.unauthenticatedContext().storage();
  await assertFails(list(ref(storage, 'trips/japan-2026/photos/osaka')));
});

test('rechaza ciudades, metadatos y tipos de archivo no permitidos', async () => {
  const storage = testEnvironment.authenticatedContext(FER_UID).storage();
  await assertFails(uploadBytes(ref(storage, 'trips/japan-2026/photos/nara/photo-3/original'), new Uint8Array([1]), metadata('nara', 'photo-3')));
  await assertFails(uploadBytes(ref(storage, 'trips/japan-2026/photos/osaka/photo-4/original'), new Uint8Array([1]), metadata('kyoto', 'photo-4')));
  await assertFails(uploadBytes(ref(storage, 'trips/japan-2026/photos/osaka/photo-5/original'), new Uint8Array([1]), metadata('osaka', 'photo-5', FER_UID, 'text/plain')));
});

test('rechaza originales mayores a 30 MB', async () => {
  const storage = testEnvironment.authenticatedContext(FER_UID).storage();
  const oversized = new Uint8Array(30 * 1024 * 1024 + 1);
  await assertFails(uploadBytes(ref(storage, 'trips/japan-2026/photos/osaka/photo-6/original'), oversized, metadata('osaka', 'photo-6')));
});

test('rechaza vistas previas mayores a 2 MB', async () => {
  const storage = testEnvironment.authenticatedContext(FER_UID).storage();
  const oversized = new Uint8Array(2 * 1024 * 1024 + 1);
  await assertFails(uploadBytes(ref(storage, 'trips/japan-2026/photos/osaka/photo-preview/preview.jpg'), oversized, metadata('osaka', 'photo-preview')));
});

test('la aplicación no puede sobrescribir ni borrar una foto', async () => {
  const storage = testEnvironment.authenticatedContext(FER_UID).storage();
  const object = ref(storage, 'trips/japan-2026/photos/osaka/photo-7/original');
  await assertSucceeds(uploadBytes(object, new Uint8Array([1]), metadata('osaka', 'photo-7')));
  await assertFails(uploadBytes(object, new Uint8Array([2]), metadata('osaka', 'photo-7')));
  await assertFails(deleteObject(object));
});
