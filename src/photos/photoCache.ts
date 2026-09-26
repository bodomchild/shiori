import { loadPhotoBlob } from './photoStorage';

const CACHE_NAME = 'shiori-photo-thumbnails-v1';
const pendingLoads = new Map<string, Promise<Blob>>();
const pendingWrites = new Map<string, Promise<void>>();
const memoryBlobs = new Map<string, Blob>();
const MAX_MEMORY_BYTES = 32 * 1024 * 1024;
let memoryBytes = 0;

function cacheRequest(path: string) {
  return new Request(`${window.location.origin}/__shiori-photo-cache__/${encodeURIComponent(path)}`);
}

function rememberBlob(path: string, blob: Blob) {
  const previous = memoryBlobs.get(path);
  if (previous) memoryBytes -= previous.size;
  memoryBlobs.delete(path);
  memoryBlobs.set(path, blob);
  memoryBytes += blob.size;
  while (memoryBytes > MAX_MEMORY_BYTES && memoryBlobs.size > 0) {
    const oldest = memoryBlobs.keys().next().value!;
    memoryBytes -= memoryBlobs.get(oldest)!.size;
    memoryBlobs.delete(oldest);
  }
}

async function loadAndCache(path: string) {
  let cache: Cache | null = null;
  if ('caches' in window) {
    try {
      cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(cacheRequest(path));
      if (cached) return await cached.blob();
    } catch {
      // Si el navegador no permite Cache Storage, la foto sigue cargando desde Firebase.
    }
  }
  const blob = await loadPhotoBlob(path);
  if (cache) {
    const writing = cache.put(cacheRequest(path), new Response(blob, {
      headers: { 'Content-Type': blob.type || 'image/jpeg' },
    })).catch(() => {
      // Una cuota llena no impide mostrar la miniatura ya descargada.
    }).finally(() => {
      if (pendingWrites.get(path) === writing) pendingWrites.delete(path);
    });
    pendingWrites.set(path, writing);
  }
  return blob;
}

export function loadGalleryPhotoBlob(path: string) {
  const cached = memoryBlobs.get(path);
  if (cached) {
    memoryBlobs.delete(path);
    memoryBlobs.set(path, cached);
    return Promise.resolve(cached);
  }
  const existing = pendingLoads.get(path);
  if (existing) return existing;
  const pending = loadAndCache(path).then((blob) => {
    rememberBlob(path, blob);
    return blob;
  }).finally(() => pendingLoads.delete(path));
  pendingLoads.set(path, pending);
  return pending;
}

export async function evictCachedPhotoBlobs(paths: Array<string | undefined>) {
  // Esperar las escrituras pendientes evita que reaparezca una copia local
  // después de borrar una foto mientras su caché terminaba de guardarse.
  const validPaths = paths.filter((path): path is string => Boolean(path));
  await Promise.all(validPaths.map(async (path) => {
    await pendingLoads.get(path)?.catch(() => {});
    await pendingWrites.get(path);
  }));
  for (const path of paths) {
    if (!path) continue;
    const blob = memoryBlobs.get(path);
    if (blob) memoryBytes -= blob.size;
    memoryBlobs.delete(path);
  }
  if (!('caches' in window)) return;
  try {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(validPaths.map((path) => cache.delete(cacheRequest(path))));
  } catch {
    // El borrado remoto no debe fallar porque el navegador no permita limpiar su caché.
  }
}
