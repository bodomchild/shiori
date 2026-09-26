import { loadPhotoBlob } from './photoStorage';

const CACHE_NAME = 'shiori-photo-thumbnails-v1';
const MAX_CONCURRENT_DOWNLOADS = 4;
const pendingLoads = new Map<string, Promise<Blob>>();
const downloadQueue: Array<{
  path: string;
  resolve: (blob: Blob) => void;
  reject: (error: unknown) => void;
}> = [];
let activeDownloads = 0;

function cacheRequest(path: string) {
  return new Request(`${window.location.origin}/__shiori-photo-cache__/${encodeURIComponent(path)}`);
}

function runDownloadQueue() {
  while (activeDownloads < MAX_CONCURRENT_DOWNLOADS && downloadQueue.length > 0) {
    const next = downloadQueue.shift();
    if (!next) return;
    activeDownloads += 1;
    void loadPhotoBlob(next.path).then(next.resolve, next.reject).finally(() => {
      activeDownloads -= 1;
      runDownloadQueue();
    });
  }
}

function queuedDownload(path: string) {
  return new Promise<Blob>((resolve, reject) => {
    downloadQueue.push({ path, resolve, reject });
    runDownloadQueue();
  });
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
  const blob = await queuedDownload(path);
  if (cache) {
    try {
      await cache.put(cacheRequest(path), new Response(blob, {
        headers: { 'Content-Type': blob.type || 'image/jpeg' },
      }));
    } catch {
      // Una cuota llena no impide mostrar la miniatura ya descargada.
    }
  }
  return blob;
}

export function loadGalleryPhotoBlob(path: string) {
  const existing = pendingLoads.get(path);
  if (existing) return existing;
  const pending = loadAndCache(path).finally(() => pendingLoads.delete(path));
  pendingLoads.set(path, pending);
  return pending;
}

export async function evictCachedPhotoBlobs(paths: Array<string | undefined>) {
  if (!('caches' in window)) return;
  try {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(paths.filter((path): path is string => Boolean(path)).map((path) => cache.delete(cacheRequest(path))));
  } catch {
    // El borrado remoto no debe fallar porque el navegador no permita limpiar su caché.
  }
}
