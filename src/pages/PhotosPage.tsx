import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import AuthProvider from '../auth/AuthProvider';
import { useAuth } from '../auth/AuthContext';
import { canAccessPhotos } from '../auth/photoAccess';
import AuthButton from '../components/AuthButton';
import NotFound from '../components/NotFound';
import PhotoThumbnail from '../components/PhotoThumbnail';
import PhotoViewer from '../components/PhotoViewer';
import { itinerary } from '../data/itinerary';
import { createPhotoAssets } from '../photos/createPreview';
import { getPhotoCapturedAt } from '../photos/captureDate';
import { evictCachedPhotoBlobs } from '../photos/photoCache';
import { deletePendingPhoto, listPendingPhotos, savePendingPhoto } from '../photos/pendingUploads';
import { getCityExportLinks, startCityExport, subscribeToCityExport, type CityExportJob, type CityExportLink } from '../photos/photoExports';
import { countIndexedCityPhotos, deletePhotoIndex, listCityPhotoPage, savePhotoIndex, type CityPhotoPage } from '../photos/photoIndex';
import { deleteCityPhoto, uploadPendingPhoto } from '../photos/photoStorage';
import { MAX_ORIGINAL_BYTES, type PendingPhoto, type PhotoPageCursor, type PhotoRecord, type UploadStatus } from '../photos/types';

type PageSize = 20 | 50 | 100;
type BatchItemState = 'waiting' | 'active' | 'saved' | 'pending' | 'error';

interface UploadBatch {
  id: string;
  total: number;
  items: Record<string, BatchItemState>;
}

const PAGE_SIZE_KEY = 'shiori:photo-page-size';

function initialPageSize(): PageSize {
  const saved = Number(localStorage.getItem(PAGE_SIZE_KEY));
  return saved === 50 || saved === 100 ? saved : 20;
}

async function runTwoAtATime<T>(items: T[], worker: (item: T) => Promise<void>) {
  let index = 0;
  async function run() {
    while (index < items.length) {
      const item = items[index++];
      await worker(item);
    }
  }
  await Promise.all([run(), run()]);
}

function uploadErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (code.includes('unauthorized')) return 'Esta cuenta todavía no está habilitada en Storage.';
  if (!navigator.onLine) return 'Sin conexión. La foto quedó guardada en este dispositivo.';
  if (error instanceof Error && error.message) return error.message;
  return 'No se pudo subir la foto. Quedó guardada para reintentar.';
}

function exportErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (!navigator.onLine) return 'No hay conexión. Probá nuevamente cuando vuelva internet.';
  if (code.includes('permission-denied')) return 'Esta cuenta no tiene permiso para preparar descargas.';
  if (code.includes('internal')) return 'No pudimos generar los enlaces de descarga. Probá nuevamente en unos minutos.';
  if (error instanceof Error && error.message && !/internal(?:\[500\])?/i.test(error.message)) return error.message;
  return 'No se pudo preparar la descarga. Probá nuevamente.';
}

function galleryErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (code === 'permission-denied' || code === 'unauthenticated') return 'Esta cuenta no tiene permiso para ver las fotos.';
  if (!navigator.onLine) return 'No hay conexión y estas fotos todavía no están guardadas en este dispositivo.';
  return 'No se pudo cargar la galería. Probá nuevamente.';
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${Math.ceil(bytes / 1024 ** 2)} MB`;
  return `${Math.ceil(bytes / 1024)} KB`;
}

function PhotosContent() {
  const { cityId } = useParams();
  const city = cityId ? itinerary.cities.find((entry) => entry.id === cityId) : undefined;
  const exportScope = city?.id ?? 'all';
  const { user, loading, error: authError } = useAuth();
  const hasPhotoAccess = canAccessPhotos(user?.uid);
  const galleryScope = `${user?.uid ?? ''}:${city?.id ?? ''}`;
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [nextCursor, setNextCursor] = useState<PhotoPageCursor | null>(null);
  const [pageSize, setPageSize] = useState<PageSize>(initialPageSize);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cityPhotoCount, setCityPhotoCount] = useState<number | null>(null);
  const [countFailed, setCountFailed] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, UploadStatus>>({});
  const [uploadBatch, setUploadBatch] = useState<UploadBatch | null>(null);
  const [photoCounts, setPhotoCounts] = useState<Record<string, number>>({});
  const [loadingPhotoCounts, setLoadingPhotoCounts] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoRecord | null>(null);
  const [navigatingPhoto, setNavigatingPhoto] = useState(false);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [exportJobId, setExportJobId] = useState<string | null>(null);
  const [exportJob, setExportJob] = useState<CityExportJob | null>(null);
  const [exportLinks, setExportLinks] = useState<CityExportLink[]>([]);
  const [exportError, setExportError] = useState<string | null>(null);
  const [startingExport, setStartingExport] = useState(false);
  const [loadingExportLinks, setLoadingExportLinks] = useState(false);
  const [linksRequestedFor, setLinksRequestedFor] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const exportStartingRef = useRef(false);
  const galleryScopeRef = useRef<string | null>(galleryScope);
  const galleryRequestRef = useRef(0);
  const countRequestRef = useRef(0);
  const selectedPhotoRef = useRef<PhotoRecord | null>(null);
  const viewerRequestRef = useRef(0);
  const navigatingPhotoRef = useRef(false);
  const moreRequestRef = useRef<number | null>(null);
  galleryScopeRef.current = galleryScope;
  const inFlight = useRef(new Set<string>());
  const statusTimers = useRef(new Map<string, number>());

  const scheduleStatusRemoval = useCallback((id: string) => {
    const previousTimer = statusTimers.current.get(id);
    if (previousTimer) window.clearTimeout(previousTimer);
    const timer = window.setTimeout(() => {
      setStatuses((current) => {
        if (current[id]?.state !== 'saved') return current;
        const next = { ...current };
        delete next[id];
        return next;
      });
      statusTimers.current.delete(id);
    }, 5000);
    statusTimers.current.set(id, timer);
  }, []);

  const updateBatchItem = useCallback((batchId: string | undefined, itemId: string, state: BatchItemState) => {
    if (!batchId) return;
    setUploadBatch((current) => current?.id === batchId
      ? { ...current, items: { ...current.items, [itemId]: state } }
      : current);
  }, []);

  const refreshGallery = useCallback(async () => {
    if (!hasPhotoAccess || !city) return;
    const requestId = ++galleryRequestRef.current;
    const isCurrent = () => galleryScopeRef.current === galleryScope && galleryRequestRef.current === requestId;
    const showPage = (page: CityPhotoPage) => {
      if (!isCurrent()) return;
      setPhotos(page.photos);
      setNextCursor(page.nextCursor);
    };
    const showCachedPage = (page: CityPhotoPage) => {
      if (!isCurrent()) return;
      // Al refrescar, conservar la grilla actual hasta recibir datos nuevos.
      setPhotos((current) => current.length > 0 ? current : page.photos);
      setNextCursor((current) => current ?? page.nextCursor);
    };
    setLoadingPhotos(true);
    setLoadingMore(false);
    setGalleryError(null);
    try {
      showPage(await listCityPhotoPage(city.id, pageSize, undefined, showCachedPage));
    } catch (error) {
      if (isCurrent()) {
        const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
        if (code === 'permission-denied' || code === 'unauthenticated') {
          setPhotos([]);
          setNextCursor(null);
        }
        setGalleryError(galleryErrorMessage(error));
      }
    } finally {
      if (isCurrent()) setLoadingPhotos(false);
    }
  }, [city, galleryScope, hasPhotoAccess, pageSize]);

  const refreshCityCount = useCallback(async () => {
    if (!hasPhotoAccess || !city) return;
    const requestId = ++countRequestRef.current;
    const isCurrent = () => galleryScopeRef.current === galleryScope && countRequestRef.current === requestId;
    setCountFailed(false);
    try {
      const count = await countIndexedCityPhotos(city.id);
      if (isCurrent()) setCityPhotoCount(count);
    } catch {
      if (isCurrent()) setCountFailed(true);
    }
  }, [city, galleryScope, hasPhotoAccess]);

  const loadMorePhotos = useCallback(async (): Promise<PhotoRecord[] | null> => {
    if (!hasPhotoAccess || !city || !nextCursor || loadingPhotos || moreRequestRef.current !== null) return null;
    const requestId = galleryRequestRef.current;
    const isCurrent = () => galleryScopeRef.current === galleryScope && galleryRequestRef.current === requestId;
    moreRequestRef.current = requestId;
    setLoadingMore(true);
    setGalleryError(null);
    try {
      const page = await listCityPhotoPage(city.id, pageSize, nextCursor);
      if (!isCurrent()) return null;
      setPhotos((current) => {
        const byId = new Map(current.map((photo) => [photo.photoId, photo]));
        page.photos.forEach((photo) => byId.set(photo.photoId, photo));
        return [...byId.values()].sort((left, right) => right.sortAt.localeCompare(left.sortAt) || right.photoId.localeCompare(left.photoId));
      });
      setNextCursor(page.nextCursor);
      return page.photos;
    } catch (error) {
      if (isCurrent()) setGalleryError(galleryErrorMessage(error));
      return null;
    } finally {
      if (moreRequestRef.current === requestId) moreRequestRef.current = null;
      if (isCurrent()) setLoadingMore(false);
    }
  }, [city, galleryScope, hasPhotoAccess, loadingPhotos, nextCursor, pageSize]);

  const selectPhoto = useCallback((photo: PhotoRecord | null) => {
    // Invalidar una navegación pendiente si se cierra el visor o se abre otra foto.
    viewerRequestRef.current += 1;
    selectedPhotoRef.current = photo;
    navigatingPhotoRef.current = false;
    setNavigatingPhoto(false);
    setViewerError(null);
    setSelectedPhoto(photo);
  }, []);

  async function navigatePhoto(direction: -1 | 1) {
    const currentPhoto = selectedPhotoRef.current;
    if (!currentPhoto || navigatingPhotoRef.current) return;
    const index = photos.findIndex((photo) => photo.photoId === currentPhoto.photoId);
    if (index < 0) return;
    const adjacent = photos[index + direction];
    if (adjacent) {
      selectPhoto(adjacent);
      return;
    }
    if (direction !== 1 || !nextCursor || loadingPhotos) return;

    const requestId = ++viewerRequestRef.current;
    navigatingPhotoRef.current = true;
    setNavigatingPhoto(true);
    setViewerError(null);
    const page = await loadMorePhotos();
    if (viewerRequestRef.current !== requestId) return;
    navigatingPhotoRef.current = false;
    setNavigatingPhoto(false);
    if (page === null) {
      setViewerError('No se pudieron cargar más fotos. Probá nuevamente con la flecha.');
      return;
    }
    const nextPhoto = page.find((photo) => !photos.some((loaded) => loaded.photoId === photo.photoId));
    if (nextPhoto) selectPhoto(nextPhoto);
  }

  const processPending = useCallback(async (pending: PendingPhoto) => {
    if (!user || !hasPhotoAccess || inFlight.current.has(pending.id)) return;
    inFlight.current.add(pending.id);
    updateBatchItem(pending.batchId, pending.id, 'active');
    let prepared = pending;
    const updateStatus = (update: Partial<UploadStatus>) => setStatuses((current) => ({
      ...current,
      [pending.id]: {
        ...(current[pending.id] ?? {
          id: pending.id,
          cityId: pending.cityId,
          fileName: pending.originalName,
          state: 'preparing' as const,
          progress: 0,
          message: 'Preparando…',
        }),
        ...update,
      },
    }));

    try {
      if (!prepared.preview || !prepared.thumbnail) {
        updateStatus({ state: 'preparing', message: 'Preparando vistas previas…' });
        prepared = { ...prepared, ...await createPhotoAssets(prepared.original) };
        await savePendingPhoto(prepared);
      }
      if (!navigator.onLine) {
        updateStatus({ state: 'queued', message: 'Guardada en el teléfono; esperando conexión.' });
        updateBatchItem(pending.batchId, pending.id, 'pending');
        return;
      }
      updateStatus({ state: 'uploading', message: 'Subiendo a la nube…' });
      const record = await uploadPendingPhoto(prepared, user.uid, (progress) => {
        updateStatus({ state: 'uploading', progress, message: `Subiendo… ${Math.round(progress * 100)}%` });
      });
      await savePhotoIndex(record);
      await deletePendingPhoto(prepared.id);
      updateStatus({ state: 'saved', progress: 1, message: 'Guardada en la nube.' });
      updateBatchItem(pending.batchId, pending.id, 'saved');
      if (prepared.cityId === city?.id && galleryScopeRef.current === galleryScope) {
        setPhotos((current) => [record, ...current.filter((photo) => photo.photoId !== record.photoId)]
          .sort((left, right) => right.sortAt.localeCompare(left.sortAt) || right.photoId.localeCompare(left.photoId))
          .slice(0, Math.max(pageSize, current.length)));
        setCityPhotoCount((current) => current === null ? null : current + 1);
      }
      scheduleStatusRemoval(pending.id);
    } catch (error) {
      updateStatus({ state: 'queued', message: uploadErrorMessage(error) });
      updateBatchItem(pending.batchId, pending.id, 'pending');
    } finally {
      inFlight.current.delete(pending.id);
    }
  }, [city?.id, galleryScope, hasPhotoAccess, pageSize, scheduleStatusRemoval, updateBatchItem, user]);

  const resumePending = useCallback(async () => {
    if (!user || !hasPhotoAccess) return;
    try {
      await runTwoAtATime(await listPendingPhotos(), processPending);
    } catch (error) {
      setGalleryError(uploadErrorMessage(error));
    }
  }, [hasPhotoAccess, processPending, user]);

  useEffect(() => {
    galleryScopeRef.current = galleryScope;
    galleryRequestRef.current += 1;
    countRequestRef.current += 1;
    setPhotos([]);
    setNextCursor(null);
    setCityPhotoCount(null);
    setCountFailed(false);
    setLoadingPhotos(false);
    setLoadingMore(false);
    moreRequestRef.current = null;
    setGalleryError(null);
    selectPhoto(null);
    return () => {
      galleryScopeRef.current = null;
      galleryRequestRef.current += 1;
      countRequestRef.current += 1;
      viewerRequestRef.current += 1;
    };
  }, [galleryScope, selectPhoto]);

  useEffect(() => { void refreshGallery(); }, [refreshGallery]);
  useEffect(() => { void refreshCityCount(); }, [refreshCityCount]);

  useEffect(() => {
    if (!hasPhotoAccess || city) {
      setPhotoCounts({});
      setLoadingPhotoCounts(false);
      return;
    }

    let active = true;
    let remaining = itinerary.cities.length;
    setPhotoCounts({});
    setLoadingPhotoCounts(true);
    itinerary.cities.forEach((entry) => {
      void countIndexedCityPhotos(entry.id).then((count) => {
        if (active) setPhotoCounts((current) => ({ ...current, [entry.id]: count }));
      }).catch(() => {
        // Un conteo fallido no bloquea las otras ciudades ni las descargas.
      }).finally(() => {
        remaining -= 1;
        if (active && remaining === 0) setLoadingPhotoCounts(false);
      });
    });

    return () => { active = false; };
  }, [city, hasPhotoAccess, user?.uid]);

  useEffect(() => () => {
    statusTimers.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  useEffect(() => {
    void resumePending();
    const handleOnline = () => { void resumePending(); };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [resumePending]);

  useEffect(() => {
    setExportJob(null);
    setExportLinks([]);
    setExportError(null);
    setLinksRequestedFor(null);
    setExportJobId(localStorage.getItem(`shiori:photo-export:${exportScope}`));
  }, [exportScope]);

  useEffect(() => {
    if (!hasPhotoAccess || !exportJobId) return;
    return subscribeToCityExport(exportJobId, setExportJob, (error) => setExportError(exportErrorMessage(error)));
  }, [exportJobId, hasPhotoAccess, user?.uid]);

  const refreshExportLinks = useCallback(async () => {
    if (!exportJobId) return;
    setLinksRequestedFor(exportJobId);
    setLoadingExportLinks(true);
    setExportError(null);
    try {
      setExportLinks((await getCityExportLinks(exportJobId)).links);
    } catch (error) {
      setExportError(exportErrorMessage(error));
    } finally {
      setLoadingExportLinks(false);
    }
  }, [exportJobId]);

  useEffect(() => {
    if (exportJob?.status === 'ready' && linksRequestedFor !== exportJobId) void refreshExportLinks();
  }, [exportJob?.status, exportJobId, linksRequestedFor, refreshExportLinks]);

  async function handleStartExport() {
    if (!user || !hasPhotoAccess || exportStartingRef.current || exportJob?.status === 'queued' || exportJob?.status === 'processing') return;
    exportStartingRef.current = true;
    setStartingExport(true);
    setExportError(null);
    setExportLinks([]);
    setLinksRequestedFor(null);
    setExportJobId(null);
    setExportJob({
      id: 'starting',
      status: 'queued',
      scope: exportScope,
      photoCount: city ? cityPhotoCount ?? 0 : totalTripPhotos,
      partCount: 0,
      completedParts: 0,
    });
    try {
      const result = await startCityExport(exportScope);
      localStorage.setItem(`shiori:photo-export:${exportScope}`, result.jobId);
      setExportJob({
        id: result.jobId,
        status: 'queued',
        scope: exportScope,
        photoCount: city ? cityPhotoCount ?? 0 : totalTripPhotos,
        partCount: result.partCount,
        completedParts: 0,
      });
      setExportJobId(result.jobId);
    } catch (error) {
      setExportJob(null);
      setExportError(exportErrorMessage(error));
    } finally {
      exportStartingRef.current = false;
      setStartingExport(false);
    }
  }

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    if (!city || !hasPhotoAccess) return;
    const files = [...(event.target.files ?? [])];
    event.target.value = '';
    if (!files.length) return;
    const batchId = crypto.randomUUID();
    const batchItems = files.map((file) => ({ file, id: `${Date.now()}-${crypto.randomUUID()}` }));
    setUploadBatch({
      id: batchId,
      total: batchItems.length,
      items: Object.fromEntries(batchItems.map(({ id }) => [id, 'waiting' as const])),
    });

    await runTwoAtATime(batchItems, async ({ file, id }) => {
      updateBatchItem(batchId, id, 'active');
      if (!file.type.startsWith('image/')) {
        setStatuses((current) => ({ ...current, [id]: { id, cityId: city.id, fileName: file.name, state: 'error', progress: 0, message: 'El archivo no es una imagen.' } }));
        updateBatchItem(batchId, id, 'error');
        return;
      }
      if (file.size > MAX_ORIGINAL_BYTES) {
        setStatuses((current) => ({ ...current, [id]: { id, cityId: city.id, fileName: file.name, state: 'error', progress: 0, message: 'La foto supera el máximo de 30 MB.' } }));
        updateBatchItem(batchId, id, 'error');
        return;
      }
      const createdAt = new Date().toISOString();
      const pending: PendingPhoto = {
        id,
        batchId,
        photoId: id,
        cityId: city.id,
        original: file,
        originalName: file.name || `foto-${id}`,
        contentType: file.type,
        createdAt,
        capturedAt: await getPhotoCapturedAt(file, createdAt),
      };
      try {
        await savePendingPhoto(pending);
        await processPending(pending);
      } catch {
        setStatuses((current) => ({ ...current, [id]: { id, cityId: city.id, fileName: file.name, state: 'error', progress: 0, message: 'No hubo espacio para guardar la copia temporal.' } }));
        updateBatchItem(batchId, id, 'error');
      }
    });
    if (navigator.onLine) {
      void refreshCityCount();
      await refreshGallery();
    }
  }

  if (cityId && !city) return <NotFound />;
  const cityStatuses = Object.values(statuses).filter((status) => status.cityId === city?.id);
  const totalTripPhotos = Object.values(photoCounts).reduce((total, count) => total + count, 0);
  const batchStates = uploadBatch ? Object.values(uploadBatch.items) : [];
  const batchSaved = batchStates.filter((state) => state === 'saved').length;
  const batchActive = batchStates.filter((state) => state === 'active').length;
  const batchWaiting = batchStates.filter((state) => state === 'waiting').length;
  const batchPending = batchStates.filter((state) => state === 'pending').length;
  const batchErrors = batchStates.filter((state) => state === 'error').length;
  const batchUploading = batchActive + batchWaiting > 0;
  const exportBusy = startingExport || exportJob?.status === 'queued' || exportJob?.status === 'processing';
  const selectedPhotoIndex = selectedPhoto ? photos.findIndex((photo) => photo.photoId === selectedPhoto.photoId) : -1;
  const exportPanel = (exportJob || exportError) && <section className="city-export" aria-live="polite">
    {startingExport ? <p>Iniciando la preparación de la descarga…</p> : exportJob?.status === 'queued' && <p>La descarga está en cola.</p>}
    {exportJob?.status === 'processing' && <p>Preparando archivos ZIP: {exportJob.completedParts} de {exportJob.partCount} listos. Podés cerrar la página y volver después.</p>}
    {exportJob?.status === 'ready' && <>
      <p>Descarga lista en {exportJob.partCount} {exportJob.partCount === 1 ? 'archivo' : 'archivos'}. Los enlaces duran una hora.</p>
      {loadingExportLinks ? <span>Generando enlaces…</span> : <div className="city-export-links">
        {exportLinks.map((link) => <a href={link.url} key={link.fileName}>Descargar {link.fileName} · {formatBytes(link.size)}</a>)}
        <button type="button" onClick={() => { void refreshExportLinks(); }}>Renovar enlaces</button>
      </div>}
    </>}
    {exportJob?.status === 'error' && <p>No se pudo preparar la descarga. Podés crearla nuevamente.</p>}
    {exportJob?.status === 'expired' && <p>La descarga anterior venció. Podés prepararla nuevamente desde el botón.</p>}
    {exportError && <p className="photo-export-error" role="alert">{exportError}</p>}
  </section>;

  return <div className="page-shell photos-page">
    <Link className="back-link" to={city ? '/photos' : '/'}>{city ? '← Todas las ciudades' : '← Todo el viaje'}</Link>
    <p className="eyebrow"><span className="red-dot" /> RECUERDOS DEL VIAJE</p>
    <h1 className="page-title">{city ? `Fotos de ${city.name}.` : 'Fotos por ciudad.'}</h1>
    <p className="page-description">{city ? 'Originales protegidos en la nube y una vista previa liviana para recorrerlos.' : 'Las fotos se guardan en la nube privada de Lore y Fer, agrupadas solamente por ciudad.'}</p>

    {loading ? <div className="auth-compact" aria-live="polite"><span className="auth-status">Comprobando sesión…</span></div> : user ?
      <div className="auth-compact" aria-label="Cuenta conectada">
        <span>{user.displayName ?? user.email}</span>
        <AuthButton />
      </div> : <section className="auth-card" aria-live="polite">
      <>
        <span className="auth-symbol" aria-hidden="true">写</span>
        <div><h2>Ingresá para guardar fotos</h2><p>El itinerario es público. Solamente la galería necesita una cuenta autorizada.</p></div>
      </>
      <AuthButton />
      {authError && <p className="auth-error" role="alert">{authError}</p>}
    </section>}
    {user && !hasPhotoAccess && <p className="gallery-error" role="alert">Esta cuenta no está habilitada para ver las fotos. Ingresá con la cuenta de Lore o Fer.</p>}

    {!city && hasPhotoAccess && <>
      <section className="photo-all-export">
        <div><h2>Descargar todo el viaje</h2><p>Un ZIP por ciudad; las ciudades grandes se dividen en partes de hasta 4 GB o 500 fotos.</p></div>
        <button className="download-city-button" type="button" disabled={exportBusy} onClick={() => { void handleStartExport(); }}>
          {startingExport ? 'Iniciando…' : exportJob?.status === 'queued' || exportJob?.status === 'processing' ? 'Preparando ZIP…' : exportJob?.status === 'ready' ? 'Actualizar descarga' : exportJob?.status === 'expired' ? 'Preparar de nuevo' : 'Descargar todo'}
        </button>
      </section>
      {exportPanel}
    </>}

    {!city && <div className="photo-city-grid" aria-label="Galerías por ciudad">
      {itinerary.cities.map((entry) => {
        const count = photoCounts[entry.id];
        const summary = !hasPhotoAccess ? 'Abrir fotos' : count !== undefined
          ? `${count} ${count === 1 ? 'foto' : 'fotos'}`
          : loadingPhotoCounts ? 'Contando fotos…' : 'Cantidad no disponible';
        return <Link to={`/photos/${entry.id}`} key={entry.id}>
          <span>Galería</span><h2>{entry.name}</h2><p>{summary} <b aria-hidden="true">→</b></p>
        </Link>;
      })}
    </div>}

    {city && hasPhotoAccess && <>
      <nav className="photo-city-nav" aria-label="Cambiar ciudad">
        {itinerary.cities.map((entry) => <Link className={entry.id === city.id ? 'is-current' : ''} to={`/photos/${entry.id}`} key={entry.id}>{entry.name}</Link>)}
      </nav>
      <section className="photo-toolbar">
        <div><h2>Galería</h2><p>{cityPhotoCount === null ? countFailed ? 'Cantidad no disponible.' : 'Contando fotos…' : cityPhotoCount ? `${cityPhotoCount} ${cityPhotoCount === 1 ? 'foto guardada' : 'fotos guardadas'}` : 'Todavía no hay fotos guardadas.'}</p></div>
        <div className="photo-toolbar-actions">
          <button className="download-city-button" type="button" disabled={exportBusy} onClick={() => { void handleStartExport(); }}>
            {startingExport ? 'Iniciando…' : exportJob?.status === 'queued' || exportJob?.status === 'processing' ? 'Preparando ZIP…' : exportJob?.status === 'ready' ? 'Actualizar descarga' : exportJob?.status === 'expired' ? 'Preparar de nuevo' : 'Descargar ciudad'}
          </button>
          <button className="upload-button" type="button" disabled={batchUploading} onClick={() => inputRef.current?.click()}>Agregar fotos</button>
        </div>
        <input ref={inputRef} className="visually-hidden" type="file" accept="image/*" multiple onChange={(event) => { void handleFiles(event); }} />
      </section>

      <div className="gallery-page-size">
        <label htmlFor="photo-page-size">Fotos por página</label>
        <select id="photo-page-size" value={pageSize} onChange={(event) => {
          const nextPageSize = Number(event.target.value) as PageSize;
          localStorage.setItem(PAGE_SIZE_KEY, String(nextPageSize));
          setPageSize(nextPageSize);
        }}>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {exportPanel}

      {uploadBatch && <section className={`upload-batch-summary ${batchUploading ? 'is-active' : 'is-finished'}`} aria-live="polite">
        <div>
          <strong>{batchUploading ? `Subiendo ${batchSaved} de ${uploadBatch.total}` : `Se subieron ${batchSaved}/${uploadBatch.total} fotos`}</strong>
          <span>{batchActive > 0 ? `${batchActive} en curso` : ''}{batchActive > 0 && batchWaiting > 0 ? ' · ' : ''}{batchWaiting > 0 ? `${batchWaiting} por cargar` : ''}{batchPending > 0 ? `${batchActive + batchWaiting > 0 ? ' · ' : ''}${batchPending} pendientes de reintento` : ''}{batchErrors > 0 ? `${batchActive + batchWaiting + batchPending > 0 ? ' · ' : ''}${batchErrors} con error` : ''}</span>
        </div>
        <progress value={batchSaved} max={uploadBatch.total}>{batchSaved} de {uploadBatch.total}</progress>
        {!batchUploading && <div className="upload-batch-actions">
          {batchPending > 0 && <button type="button" onClick={() => { void resumePending(); }}>Reintentar pendientes</button>}
          <button type="button" onClick={() => setUploadBatch(null)}>Cerrar</button>
        </div>}
      </section>}

      {cityStatuses.length > 0 && <div className="upload-list" aria-live="polite">
        {cityStatuses.map((status) => <div className={`upload-row is-${status.state}`} key={status.id}>
          <div><strong>{status.fileName}</strong><span>{status.message}</span></div>
          {status.state === 'uploading' && <progress value={status.progress} max={1}>{Math.round(status.progress * 100)}%</progress>}
          {status.state === 'queued' && <button type="button" onClick={() => { void resumePending(); }}>Reintentar</button>}
        </div>)}
      </div>}

      {galleryError && <p className="gallery-error" role="alert">{galleryError} <button type="button" onClick={() => { void refreshGallery(); }}>Reintentar</button></p>}
      <p className="gallery-load-status" role="status">{loadingPhotos ? photos.length > 0 ? 'Actualizando galería…' : 'Cargando fotos…' : ''}</p>
      {!galleryError && loadingPhotos && photos.length === 0 ? <>
        <div className="photo-grid photo-grid-placeholder" aria-hidden="true">
          {Array.from({ length: Math.min(pageSize, 8) }, (_, index) => <div className="photo-thumbnail" key={index}><span className="photo-thumbnail-placeholder">Cargando…</span></div>)}
        </div>
      </> : photos.length > 0 && <>
        <div className="photo-grid">
          {photos.map((photo) => <PhotoThumbnail photo={photo} onSelect={() => selectPhoto(photo)} key={photo.photoId} />)}
        </div>
        {nextCursor && <button className="load-more-photos" type="button" disabled={loadingMore || loadingPhotos} onClick={() => { void loadMorePhotos(); }}>{loadingMore ? 'Cargando…' : 'Cargar más fotos'}</button>}
      </>}
    </>}

    {hasPhotoAccess && selectedPhoto && <PhotoViewer photo={selectedPhoto}
      onClose={() => selectPhoto(null)}
      onNavigate={(direction) => { void navigatePhoto(direction); }}
      hasPrevious={selectedPhotoIndex > 0}
      hasNext={selectedPhotoIndex >= 0 && (
        selectedPhotoIndex < photos.length - 1 || Boolean(nextCursor && !loadingPhotos && !loadingMore)
      )}
      position={Math.max(1, selectedPhotoIndex + 1)}
      total={cityPhotoCount === null ? null : Math.max(cityPhotoCount, photos.length)}
      navigating={navigatingPhoto}
      navigationError={viewerError}
      onDelete={async () => {
        await deleteCityPhoto(selectedPhoto);
        await deletePhotoIndex(selectedPhoto);
        await evictCachedPhotoBlobs([selectedPhoto.thumbnailPath, selectedPhoto.previewPath]);
        setPhotos((current) => current.filter((photo) => photo.photoId !== selectedPhoto.photoId));
        setCityPhotoCount((current) => current === null ? null : Math.max(0, current - 1));
        selectPhoto(null);
      }} />}
  </div>;
}

export default function PhotosPage() {
  return <AuthProvider><PhotosContent /></AuthProvider>;
}
