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

async function loadPhotosPage(cityId, uid = '8ew8WV6wdVWGDeyYet2LC4VIK3n2', react = React, indexMocks = {}, globals = {}) {
  const access = await loadModule('../src/auth/photoAccess.ts', {});
  const noop = () => {};
  const auth = { user: { uid }, loading: false, error: null };
  const { default: Page } = await loadModule('../src/pages/PhotosPage.tsx', {
    react,
    'react/jsx-runtime': jsxRuntime,
    'react-router-dom': {
      useParams: () => ({ cityId }),
      Link: ({ children, to, ...props }) => React.createElement('a', { href: to, ...props }, children),
    },
    '../auth/AuthProvider': { default: ({ children }) => children },
    '../auth/AuthContext': { useAuth: () => auth },
    '../auth/photoAccess': { canAccessPhotos: access.canAccessPhotos },
    '../components/AuthButton': { default: () => React.createElement('button', {}, 'Salir') },
    '../components/NotFound': { default: () => null },
    '../components/PhotoThumbnail': { default: () => null },
    '../components/PhotoViewer': { default: () => null },
    '../data/itinerary': { itinerary: { cities: [{ id: 'kyoto', name: 'Kioto' }] } },
    '../photos/createPreview': { createPhotoAssets: noop },
    '../photos/captureDate': { getPhotoCapturedAt: noop },
    '../photos/photoCache': { evictCachedPhotoBlobs: noop },
    '../photos/pendingUploads': { deletePendingPhoto: noop, listPendingPhotos: async () => [], savePendingPhoto: noop },
    '../photos/photoExports': { getCityExportLinks: noop, startCityExport: noop, subscribeToCityExport: noop },
    '../photos/photoIndex': {
      countIndexedCityPhotos: noop, deletePhotoIndex: noop, listCityPhotoPage: noop, savePhotoIndex: noop,
      ...indexMocks,
    },
    '../photos/photoStorage': { deleteCityPhoto: noop, uploadPendingPhoto: noop },
    '../photos/types': { MAX_ORIGINAL_BYTES: 30 * 1024 * 1024 },
  }, { localStorage: { getItem: () => null }, ...globals });
  return Page;
}

async function renderPhotosPage(cityId, uid) {
  const Page = await loadPhotosPage(cityId, uid);
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

// Controla estados y efectos del componente real para probar sus eventos sin
// abrir un navegador. No reproduce layout ni gestos nativos de Safari.
function componentHarness() {
  const slots = [];
  let cursor = 0, dirty = false, effects = [], tree;
  const sameDeps = (left, right) => left && right && left.length === right.length && left.every((value, index) => Object.is(value, right[index]));
  const hooks = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!slots[index]) slots[index] = { value: typeof initial === 'function' ? initial() : initial };
      return [slots[index].value, (update) => {
        const value = typeof update === 'function' ? update(slots[index].value) : update;
        if (!Object.is(value, slots[index].value)) { slots[index].value = value; dirty = true; }
      }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!slots[index]) slots[index] = { current: initial };
      return slots[index];
    },
    useCallback(callback, deps) {
      const index = cursor++;
      if (!sameDeps(slots[index]?.deps, deps)) slots[index] = { value: callback, deps };
      return slots[index].value;
    },
    useEffect(effect, deps) {
      const index = cursor++;
      if (!sameDeps(slots[index]?.deps, deps)) effects.push(() => {
        slots[index]?.cleanup?.();
        slots[index] = { deps, cleanup: effect() };
      });
    },
  };
  return {
    hooks,
    render(Component, props = {}) {
      for (let attempts = 0; attempts < 15; attempts++) {
        cursor = 0; dirty = false; effects = [];
        tree = Component(props);
        effects.forEach((effect) => effect());
        if (!dirty) return tree;
      }
      throw new Error('El componente no terminó de actualizarse');
    },
    dispose() { slots.forEach((slot) => slot?.cleanup?.()); },
  };
}

function findElement(tree, predicate) {
  if (!tree || typeof tree !== 'object') return undefined;
  if (Array.isArray(tree)) {
    for (const child of tree) { const found = findElement(child, predicate); if (found) return found; }
    return undefined;
  }
  return predicate(tree) ? tree : findElement(tree.props?.children, predicate);
}

async function viewerHarness(overrides = {}) {
  const harness = componentHarness();
  const navigations = [];
  const globals = { document: { body: { style: { overflow: '' } } }, URL };
  const { default: Viewer } = await loadModule('../src/components/PhotoViewer.tsx', {
    react: harness.hooks, 'react/jsx-runtime': jsxRuntime,
    '../photos/photoStorage': { loadPhotoBlob: async () => new Blob() },
    '../photos/photoCache': { loadGalleryPhotoBlob: async () => new Blob() },
  }, globals);
  const props = {
    photo: { photoId: 'a', previewPath: 'a/preview', originalName: 'a.jpg' },
    onClose: () => {}, onDelete: async () => {}, onNavigate: (direction) => navigations.push(direction),
    hasPrevious: true, hasNext: true, position: 2, total: 30, navigating: false, navigationError: null,
    ...overrides,
  };
  const draw = () => harness.render(Viewer, props);
  return { ...harness, navigations, props, draw };
}

function swipe(tree, from, to, { cancel = false, multitouch = false } = {}) {
  const stage = findElement(tree, (element) => element.props?.className === 'photo-viewer-stage');
  const touch = (point) => ({ identifier: 1, clientX: point[0], clientY: point[1] });
  stage.props.onTouchStart({ touches: [touch(from)] });
  if (multitouch) stage.props.onTouchStart({ touches: [touch(from), { identifier: 2 }] });
  if (cancel) stage.props.onTouchCancel();
  stage.props.onTouchEnd({ touches: [], changedTouches: [touch(to)] });
}

test('el visor navega con botones, teclado y deslizamientos en ambas direcciones', async () => {
  const viewer = await viewerHarness();
  const tree = viewer.draw();
  findElement(tree, (element) => element.props?.['aria-label'] === 'Foto siguiente').props.onClick();
  tree.props.onKeyDown({ key: 'ArrowLeft', preventDefault() {} });
  swipe(tree, [200, 100], [80, 110]);
  swipe(tree, [80, 100], [200, 110]);
  assert.deepEqual(viewer.navigations, [1, -1, 1, -1]);
  viewer.dispose();
});

test('el visor ignora toques, scroll vertical, gestos cancelados y pinch con dos dedos', async () => {
  const viewer = await viewerHarness();
  const tree = viewer.draw();
  swipe(tree, [200, 100], [190, 100]);
  swipe(tree, [200, 100], [100, 300]);
  swipe(tree, [200, 100], [80, 100], { cancel: true });
  swipe(tree, [200, 100], [80, 100], { multitouch: true });
  tree.props.onKeyDown({ key: 'ArrowLeft', altKey: true });
  assert.deepEqual(viewer.navigations, []);
  viewer.dispose();
});

test('los límites de la galería no vuelven a la primera o última foto', async () => {
  const viewer = await viewerHarness({ hasPrevious: false, hasNext: false });
  const tree = viewer.draw();
  assert.equal(findElement(tree, (element) => element.props?.['aria-label'] === 'Foto anterior').props.disabled, true);
  assert.equal(findElement(tree, (element) => element.props?.['aria-label'] === 'Foto siguiente').props.disabled, true);
  tree.props.onKeyDown({ key: 'ArrowLeft', preventDefault() {} });
  swipe(tree, [200, 100], [80, 100]);
  assert.deepEqual(viewer.navigations, []);
  viewer.dispose();
});

test('confirmar un borrado bloquea el cambio de foto y cancelar lo vuelve a habilitar', async () => {
  const viewer = await viewerHarness();
  findElement(viewer.draw(), (element) => element.props?.className === 'photo-delete-button').props.onClick();
  const confirmation = viewer.draw();
  swipe(confirmation, [200, 100], [80, 100]);
  confirmation.props.onKeyDown({ key: 'ArrowRight', preventDefault() {} });
  assert.deepEqual(viewer.navigations, []);
  findElement(confirmation, (element) => element.type === 'button' && element.props.children === 'Cancelar').props.onClick();
  swipe(viewer.draw(), [200, 100], [80, 100]);
  assert.deepEqual(viewer.navigations, [1]);
  viewer.dispose();
});

async function galleryHarness(fetchPage) {
  const harness = componentHarness();
  const Page = await loadPhotosPage('kyoto', undefined, harness.hooks, {
    listCityPhotoPage: fetchPage, countIndexedCityPhotos: async () => 30,
  }, { window: { addEventListener() {}, removeEventListener() {} }, navigator: { onLine: true } });
  const Content = Page().props.children.type;
  const draw = () => harness.render(Content);
  draw();
  await flush();
  draw();
  const viewer = () => findElement(draw(), (element) => Boolean(element.props?.onNavigate));
  const open = (id) => findElement(draw(), (element) => element.props?.photo?.photoId === id).props.onSelect();
  return { ...harness, draw, viewer, open };
}

function photoPage(ids, hasMore = false) {
  const photos = ids.map((photoId) => ({
    photoId, sortAt: `2026-09-${String(29 - (photoId.charCodeAt(0) - 97)).padStart(2, '0')}T00:00:00Z`,
    previewPath: `${photoId}/preview`, originalName: `${photoId}.jpg`,
  }));
  return { photos, nextCursor: hasMore ? { photoId: ids.at(-1), sortAt: photos.at(-1).sortAt } : null };
}

test('el visor carga la siguiente página una sola vez y avanza al terminar', async () => {
  const pending = deferred();
  let calls = 0;
  const gallery = await galleryHarness(async () => ++calls === 1 ? photoPage(['a', 'b'], true) : pending.promise);
  gallery.open('b');
  gallery.viewer().props.onNavigate(1);
  const waiting = gallery.viewer();
  assert.equal(waiting.props.navigating, true);
  waiting.props.onNavigate(1);
  assert.equal(calls, 2);
  pending.resolve(photoPage(['c']));
  await flush();
  assert.equal(gallery.viewer().props.photo.photoId, 'c');
  assert.equal(gallery.viewer().props.hasNext, false);
  assert.equal(gallery.viewer().props.hasPrevious, true);
  gallery.viewer().props.onNavigate(-1);
  assert.equal(gallery.viewer().props.photo.photoId, 'b');
  gallery.dispose();
});

test('cerrar el visor durante la paginación evita que se reabra con una respuesta tardía', async () => {
  const pending = deferred();
  let calls = 0;
  const gallery = await galleryHarness(async () => ++calls === 1 ? photoPage(['a'], true) : pending.promise);
  gallery.open('a');
  gallery.viewer().props.onNavigate(1);
  gallery.viewer().props.onClose();
  pending.resolve(photoPage(['b']));
  await flush();
  assert.equal(gallery.viewer(), undefined);
  gallery.dispose();
});

test('un error al cargar más fotos conserva la actual y permite reintentar desde el visor', async () => {
  let calls = 0;
  const gallery = await galleryHarness(async () => {
    calls += 1;
    if (calls === 1) return photoPage(['a'], true);
    if (calls === 2) throw new Error('Sin conexión');
    return photoPage(['b']);
  });
  gallery.open('a');
  gallery.viewer().props.onNavigate(1);
  await flush();
  const failed = gallery.viewer();
  assert.equal(failed.props.photo.photoId, 'a');
  assert.match(failed.props.navigationError, /Probá nuevamente/);
  assert.equal(failed.props.navigating, false);
  failed.props.onNavigate(1);
  await flush();
  assert.equal(gallery.viewer().props.photo.photoId, 'b');
  gallery.dispose();
});
