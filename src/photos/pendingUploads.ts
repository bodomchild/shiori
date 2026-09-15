import type { PendingPhoto } from './types';

const DATABASE_NAME = 'shiori-photo-outbox';
const STORE_NAME = 'pending-photos';
const DATABASE_VERSION = 1;

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('No se pudo abrir IndexedDB.'));
  });
}

function transactionComplete(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Falló la operación local.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Se canceló la operación local.'));
  });
}

export async function savePendingPhoto(photo: PendingPhoto) {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(photo);
    await transactionComplete(transaction);
  } finally {
    database.close();
  }
}

export async function deletePendingPhoto(id: string) {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(id);
    await transactionComplete(transaction);
  } finally {
    database.close();
  }
}

export async function listPendingPhotos() {
  const database = await openDatabase();
  try {
    return await new Promise<PendingPhoto[]>((resolve, reject) => {
      const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
      request.onsuccess = () => resolve(request.result as PendingPhoto[]);
      request.onerror = () => reject(request.error ?? new Error('No se pudieron leer las subidas pendientes.'));
    });
  } finally {
    database.close();
  }
}
