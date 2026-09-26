import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createContext, SourceTextModule, SyntheticModule } from 'node:vm';
import ts from 'typescript';
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';

// Ejecuta los módulos reales con descargas y Firestore controlados, sin navegador
// ni dependencias de testing adicionales. Cada prueba usa su propia caché.
async function loadModule(path, dependencies, globals = {}) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
  });
  const context = createContext({ console, Blob, Request, Response, ...globals });
  const module = new SourceTextModule(outputText, { context });
  await module.link((specifier) => {
    const exports = dependencies[specifier];
    assert.ok(exports, `Falta el mock para ${specifier}`);
    return new SyntheticModule(Object.keys(exports), function () {
      for (const [name, value] of Object.entries(exports)) this.setExport(name, value);
    }, { context });
  });
  await module.evaluate();
  return module.namespace;
}

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

const flush = () => new Promise((resolve) => setImmediate(resolve));

function loadImageCache(download, cache) {
  return loadModule('../src/photos/photoCache.ts', {
    './photoStorage': { loadPhotoBlob: download },
  }, cache ? {
    window: { location: { origin: 'https://shiori.test' }, caches: cache },
    caches: cache,
  } : { window: { location: { origin: 'https://shiori.test' } } });
}

test('inicia las 20 descargas y una foto lista no espera a las demás', async () => {
  const requests = Array.from({ length: 20 }, deferred);
  let started = 0;
  const cache = await loadImageCache(() => requests[started++].promise);
  const photos = requests.map((_, index) => cache.loadGalleryPhotoBlob(`photo-${index}`));
  assert.equal(started, 20);
  let firstReady = false;
  void photos[0].then(() => { firstReady = true; });
  requests[12].resolve(new Blob(['foto lista']));
  assert.equal(await (await photos[12]).text(), 'foto lista');
  assert.equal(firstReady, false);
  requests.forEach((request) => request.resolve(new Blob(['foto'])));
  await Promise.all(photos);
});

test('muestra la foto sin esperar una escritura de caché lenta', async () => {
  const writing = deferred();
  let writes = 0;
  const cache = await loadImageCache(async () => new Blob(['foto']), {
    open: async () => ({
      match: async () => undefined,
      put: () => { writes += 1; return writing.promise; },
    }),
  });
  assert.equal(await (await cache.loadGalleryPhotoBlob('photo')).text(), 'foto');
  assert.equal(writes, 1);
  writing.resolve();
});

test('reutiliza solicitudes en curso y fotos ya cargadas', async () => {
  const download = deferred();
  let downloads = 0;
  const cache = await loadImageCache(() => { downloads += 1; return download.promise; });
  const first = cache.loadGalleryPhotoBlob('photo');
  const second = cache.loadGalleryPhotoBlob('photo');
  assert.equal(first, second);
  download.resolve(new Blob(['foto']));
  await first;
  await cache.loadGalleryPhotoBlob('photo');
  assert.equal(downloads, 1);
});

test('lee una miniatura persistida sin descargarla nuevamente', async () => {
  let downloads = 0;
  const cache = await loadImageCache(async () => { downloads += 1; return new Blob(); }, {
    open: async () => ({ match: async () => new Response(new Blob(['guardada'])) }),
  });
  assert.equal(await (await cache.loadGalleryPhotoBlob('photo')).text(), 'guardada');
  assert.equal(downloads, 0);
});

test('una caché no disponible no impide cargar una foto', async () => {
  const cache = await loadImageCache(async () => new Blob(['foto']), {
    open: async () => { throw new Error('No hay espacio'); },
  });
  assert.equal(await (await cache.loadGalleryPhotoBlob('photo')).text(), 'foto');
});

test('una foto fallida puede reintentarse sin afectar otras descargas', async () => {
  let attempts = 0;
  const cache = await loadImageCache(async () => {
    if (attempts++ === 0) throw new Error('Sin conexión');
    return new Blob(['foto']);
  });
  await assert.rejects(cache.loadGalleryPhotoBlob('photo'));
  assert.equal(await (await cache.loadGalleryPhotoBlob('photo')).text(), 'foto');
});

test('el borrado espera la escritura pendiente y elimina ambas cachés', async () => {
  const writing = deferred();
  let deleted = 0;
  let downloads = 0;
  const cache = await loadImageCache(async () => { downloads += 1; return new Blob(['foto']); }, {
    open: async () => ({
      match: async () => undefined,
      put: () => writing.promise,
      delete: async () => { deleted += 1; return true; },
    }),
  });
  await cache.loadGalleryPhotoBlob('photo');
  const eviction = cache.evictCachedPhotoBlobs(['photo']);
  await flush();
  assert.equal(deleted, 0);
  writing.resolve();
  await eviction;
  assert.equal(deleted, 1);
  await cache.loadGalleryPhotoBlob('photo');
  assert.equal(downloads, 2);
});

test('la caché en memoria tiene un límite y conserva las fotos recientes', async () => {
  const downloads = [];
  const blob = new Blob([new Uint8Array(17 * 1024 * 1024)]);
  const cache = await loadImageCache(async (path) => { downloads.push(path); return blob; });
  await cache.loadGalleryPhotoBlob('old');
  await cache.loadGalleryPhotoBlob('recent');
  await cache.loadGalleryPhotoBlob('recent');
  await cache.loadGalleryPhotoBlob('old');
  assert.deepEqual(downloads, ['old', 'recent', 'old']);
});

function snapshot(ids) {
  const docs = ids.map((id) => {
    const data = {
      photoId: id, cityId: 'kyoto', originalPath: `${id}/original`, previewPath: `${id}/preview`,
      originalName: `${id}.jpg`, createdAt: '2026-09-26T12:00:00Z', sortAt: '2026-09-26T12:00:00Z',
    };
    return { id, data: () => data, get: (name) => data[name] };
  });
  return { docs, size: docs.length, empty: docs.length === 0 };
}

async function loadPhotoIndex(local, remote) {
  const firestore = {
    collection: () => ({}), doc: () => ({}), documentId: () => 'id',
    orderBy: () => ({}), limit: () => ({}), query: () => ({}), startAfter: () => ({}),
    deleteDoc: () => {}, setDoc: () => {}, writeBatch: () => {}, getDoc: () => {},
    getCountFromServer: () => { throw new Error('La página no debe consultar el conteo'); },
    getDocsFromCache: () => local.promise, getDocsFromServer: () => remote.promise,
  };
  return loadModule('../src/photos/photoIndex.ts', {
    'firebase/firestore': firestore,
    '../firebase': { photoDatabase: {} },
    './photoStorage': { listCityPhotos: () => [] },
  });
}

test('muestra datos locales mientras espera al servidor, sin consultar el conteo', async () => {
  const local = deferred(), remote = deferred();
  const index = await loadPhotoIndex(local, remote);
  const shown = [];
  const pending = index.listCityPhotoPage('kyoto', 20, undefined, (page) => shown.push(page.photos[0].photoId));
  local.resolve(snapshot(['cached']));
  await flush();
  assert.deepEqual(shown, ['cached']);
  remote.resolve(snapshot(['fresh']));
  assert.equal((await pending).photos[0].photoId, 'fresh');
});

test('una respuesta local tardía no reemplaza los datos frescos', async () => {
  const local = deferred(), remote = deferred();
  const index = await loadPhotoIndex(local, remote);
  const shown = [];
  const pending = index.listCityPhotoPage('kyoto', 20, undefined, (page) => shown.push(page));
  remote.resolve(snapshot(['fresh']));
  assert.equal((await pending).photos[0].photoId, 'fresh');
  local.resolve(snapshot(['cached']));
  await flush();
  assert.equal(shown.length, 0);
});

test('una caché vacía no se presenta como una ciudad sin fotos', async () => {
  const local = deferred(), remote = deferred();
  const index = await loadPhotoIndex(local, remote);
  const shown = [];
  const pending = index.listCityPhotoPage('kyoto', 20, undefined, (page) => shown.push(page));
  local.resolve(snapshot([]));
  await flush();
  assert.equal(shown.length, 0);
  remote.resolve(snapshot(['fresh']));
  assert.equal((await pending).photos[0].photoId, 'fresh');
});

test('si el servidor no está disponible conserva los datos locales', async () => {
  const local = deferred(), remote = deferred();
  const index = await loadPhotoIndex(local, remote);
  const pending = index.listCityPhotoPage('kyoto', 20);
  local.resolve(snapshot(['cached']));
  remote.reject({ code: 'unavailable' });
  assert.equal((await pending).photos[0].photoId, 'cached');
});

test('un permiso revocado se informa incluso cuando hay datos locales', async () => {
  const local = deferred(), remote = deferred();
  const index = await loadPhotoIndex(local, remote);
  const pending = index.listCityPhotoPage('kyoto', 20);
  local.resolve(snapshot(['cached']));
  remote.reject({ code: 'permission-denied' });
  await assert.rejects(pending, (error) => error.code === 'permission-denied');
});

test('la página conserva el cursor al mostrar caché y al recibir datos frescos', async () => {
  const local = deferred(), remote = deferred();
  const index = await loadPhotoIndex(local, remote);
  const pending = index.listCityPhotoPage('kyoto', 2);
  local.resolve(snapshot(['a', 'b', 'c']));
  remote.resolve(snapshot(['a', 'b', 'c']));
  const page = await pending;
  assert.equal(page.photos.length, 2);
  assert.equal(page.nextCursor.photoId, 'b');
});

test('solo las dos cuentas habilitadas pueden abrir datos locales', async () => {
  const { canAccessPhotos } = await loadModule('../src/auth/photoAccess.ts', {});
  assert.equal(canAccessPhotos('8ew8WV6wdVWGDeyYet2LC4VIK3n2'), true);
  assert.equal(canAccessPhotos('HnuScK26yENhDdMC37HEfzYLzsE3'), true);
  assert.equal(canAccessPhotos('another-user'), false);
  assert.equal(canAccessPhotos(undefined), false);
});

async function renderPhotosPage(cityId, uid = '8ew8WV6wdVWGDeyYet2LC4VIK3n2') {
  const access = await loadModule('../src/auth/photoAccess.ts', {});
  const noop = () => {};
  const { default: Page } = await loadModule('../src/pages/PhotosPage.tsx', {
    react: React,
    'react/jsx-runtime': jsxRuntime,
    'react-router-dom': {
      useParams: () => ({ cityId }),
      Link: ({ children, to, ...props }) => React.createElement('a', { href: to, ...props }, children),
    },
    '../auth/AuthProvider': { default: ({ children }) => children },
    '../auth/AuthContext': { useAuth: () => ({ user: { uid }, loading: false, error: null }) },
    '../auth/photoAccess': { canAccessPhotos: access.canAccessPhotos },
    '../components/AuthButton': { default: () => React.createElement('button', {}, 'Salir') },
    '../components/NotFound': { default: () => null },
    '../components/PhotoThumbnail': { default: () => null },
    '../components/PhotoViewer': { default: () => null },
    '../data/itinerary': { itinerary: { cities: [{ id: 'kyoto', name: 'Kioto' }] } },
    '../photos/createPreview': { createPhotoAssets: noop },
    '../photos/captureDate': { getPhotoCapturedAt: noop },
    '../photos/photoCache': { evictCachedPhotoBlobs: noop },
    '../photos/pendingUploads': { deletePendingPhoto: noop, listPendingPhotos: noop, savePendingPhoto: noop },
    '../photos/photoExports': { getCityExportLinks: noop, startCityExport: noop, subscribeToCityExport: noop },
    '../photos/photoIndex': {
      countIndexedCityPhotos: noop, deletePhotoIndex: noop, listCityPhotoPage: noop, savePhotoIndex: noop,
    },
    '../photos/photoStorage': { deleteCityPhoto: noop, uploadPendingPhoto: noop },
    '../photos/types': { MAX_ORIGINAL_BYTES: 30 * 1024 * 1024 },
  }, { localStorage: { getItem: () => null } });
  return renderToStaticMarkup(React.createElement(Page));
}

test('Descargar todo está habilitado aun antes de consultar cantidades o fotos', async () => {
  const html = await renderPhotosPage(undefined);
  const button = html.match(/<button\b[^>]*>Descargar todo<\/button>/)?.[0];
  assert.ok(button);
  assert.doesNotMatch(button, /disabled/);
});

test('Descargar ciudad está habilitado mientras todavía se cuentan sus fotos', async () => {
  const html = await renderPhotosPage('kyoto');
  assert.match(html, /Contando fotos/);
  const button = html.match(/<button\b[^>]*>Descargar ciudad<\/button>/)?.[0];
  assert.ok(button);
  assert.doesNotMatch(button, /disabled/);
});

test('una cuenta no habilitada no puede ver controles de galería ni descargas', async () => {
  const html = await renderPhotosPage('kyoto', 'another-user');
  assert.match(html, /Esta cuenta no está habilitada/);
  assert.doesNotMatch(html, /Descargar ciudad|Descargar todo|Agregar fotos/);
});
