import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import AuthProvider from '../auth/AuthProvider';
import { useAuth } from '../auth/AuthContext';
import AuthButton from '../components/AuthButton';
import NotFound from '../components/NotFound';
import PhotoThumbnail from '../components/PhotoThumbnail';
import PhotoViewer from '../components/PhotoViewer';
import { itinerary } from '../data/itinerary';
import { createPhotoAssets } from '../photos/createPreview';
import { getPhotoCapturedAt } from '../photos/captureDate';
import { deletePendingPhoto, listPendingPhotos, savePendingPhoto } from '../photos/pendingUploads';
import { getCityExportLinks, startCityExport, subscribeToCityExport, type CityExportJob, type CityExportLink } from '../photos/photoExports';
import { countIndexedCityPhotos, deletePhotoIndex, ensurePhotoIndex, listCityPhotoPage, savePhotoIndex } from '../photos/photoIndex';
import { deleteCityPhoto, uploadPendingPhoto } from '../photos/photoStorage';
import { MAX_ORIGINAL_BYTES, type PendingPhoto, type PhotoPageCursor, type PhotoRecord, type UploadStatus } from '../photos/types';

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

function formatBytes(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${Math.ceil(bytes / 1024 ** 2)} MB`;
  return `${Math.ceil(bytes / 1024)} KB`;
}

function PhotosContent() {
  const { cityId } = useParams();
  const city = cityId ? itinerary.cities.find((entry) => entry.id === cityId) : undefined;
  const { user, loading, error: authError } = useAuth();
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [nextCursor, setNextCursor] = useState<PhotoPageCursor | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cityPhotoCount, setCityPhotoCount] = useState(0);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, UploadStatus>>({});
  const [photoCounts, setPhotoCounts] = useState<Record<string, number>>({});
  const [loadingPhotoCounts, setLoadingPhotoCounts] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoRecord | null>(null);
  const [indexReady, setIndexReady] = useState(false);
  const [exportJobId, setExportJobId] = useState<string | null>(null);
  const [exportJob, setExportJob] = useState<CityExportJob | null>(null);
  const [exportLinks, setExportLinks] = useState<CityExportLink[]>([]);
  const [exportError, setExportError] = useState<string | null>(null);
  const [startingExport, setStartingExport] = useState(false);
  const [loadingExportLinks, setLoadingExportLinks] = useState(false);
  const [linksRequestedFor, setLinksRequestedFor] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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

  const refreshGallery = useCallback(async () => {
    if (!user || !city || !indexReady) return;
    setLoadingPhotos(true);
    setGalleryError(null);
    try {
      const [page, count] = await Promise.all([
        listCityPhotoPage(city.id),
        countIndexedCityPhotos(city.id),
      ]);
      setPhotos(page.photos);
      setNextCursor(page.nextCursor);
      setCityPhotoCount(count);
    } catch (error) {
      setGalleryError(uploadErrorMessage(error));
    } finally {
      setLoadingPhotos(false);
    }
  }, [city, indexReady, user]);

  const loadMorePhotos = useCallback(async () => {
    if (!city || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    setGalleryError(null);
    try {
      const page = await listCityPhotoPage(city.id, nextCursor);
      setPhotos((current) => {
        const byId = new Map(current.map((photo) => [photo.photoId, photo]));
        page.photos.forEach((photo) => byId.set(photo.photoId, photo));
        return [...byId.values()].sort((left, right) => right.sortAt.localeCompare(left.sortAt) || right.photoId.localeCompare(left.photoId));
      });
      setNextCursor(page.nextCursor);
    } catch (error) {
      setGalleryError(uploadErrorMessage(error));
    } finally {
      setLoadingMore(false);
    }
  }, [city, loadingMore, nextCursor]);

  const processPending = useCallback(async (pending: PendingPhoto) => {
    if (!user || inFlight.current.has(pending.id)) return;
    inFlight.current.add(pending.id);
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
        return;
      }
      updateStatus({ state: 'uploading', message: 'Subiendo a la nube…' });
      const record = await uploadPendingPhoto(prepared, user.uid, (progress) => {
        updateStatus({ state: 'uploading', progress, message: `Subiendo… ${Math.round(progress * 100)}%` });
      });
      await savePhotoIndex(record);
      await deletePendingPhoto(prepared.id);
      updateStatus({ state: 'saved', progress: 1, message: 'Guardada en la nube.' });
      if (prepared.cityId === city?.id) {
        setPhotos((current) => [record, ...current.filter((photo) => photo.photoId !== record.photoId)]
          .sort((left, right) => right.sortAt.localeCompare(left.sortAt) || right.photoId.localeCompare(left.photoId)));
        setCityPhotoCount((current) => current + 1);
      }
      scheduleStatusRemoval(pending.id);
    } catch (error) {
      updateStatus({ state: 'queued', message: uploadErrorMessage(error) });
    } finally {
      inFlight.current.delete(pending.id);
    }
  }, [city?.id, scheduleStatusRemoval, user]);

  const resumePending = useCallback(async () => {
    if (!user || !indexReady) return;
    try {
      await runTwoAtATime(await listPendingPhotos(), processPending);
    } catch (error) {
      setGalleryError(uploadErrorMessage(error));
    }
  }, [indexReady, processPending, user]);

  useEffect(() => {
    if (!user) {
      setIndexReady(false);
      return;
    }
    let active = true;
    setIndexReady(false);
    setGalleryError(null);
    void ensurePhotoIndex(itinerary.cities.map((entry) => entry.id)).then(() => {
      if (active) setIndexReady(true);
    }).catch((error) => {
      if (active) setGalleryError(uploadErrorMessage(error));
    });
    return () => { active = false; };
  }, [user]);

  useEffect(() => { void refreshGallery(); }, [refreshGallery]);

  useEffect(() => {
    setPhotos([]);
    setNextCursor(null);
    setCityPhotoCount(0);
    setSelectedPhoto(null);
  }, [city?.id, user?.uid]);

  useEffect(() => {
    if (!user || city || !indexReady) {
      setPhotoCounts({});
      setLoadingPhotoCounts(false);
      return;
    }

    let active = true;
    setLoadingPhotoCounts(true);
    void Promise.allSettled(itinerary.cities.map(async (entry) => ({
      cityId: entry.id,
      count: await countIndexedCityPhotos(entry.id),
    }))).then((results) => {
      if (!active) return;
      const counts: Record<string, number> = {};
      results.forEach((result) => {
        if (result.status === 'fulfilled') counts[result.value.cityId] = result.value.count;
      });
      setPhotoCounts(counts);
    }).finally(() => {
      if (active) setLoadingPhotoCounts(false);
    });

    return () => { active = false; };
  }, [city, indexReady, user]);

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
    setExportJobId(city ? localStorage.getItem(`shiori:city-export:${city.id}`) : null);
  }, [city]);

  useEffect(() => {
    if (!user || !exportJobId) return;
    return subscribeToCityExport(exportJobId, setExportJob, (error) => setExportError(uploadErrorMessage(error)));
  }, [exportJobId, user]);

  const refreshExportLinks = useCallback(async () => {
    if (!exportJobId) return;
    setLinksRequestedFor(exportJobId);
    setLoadingExportLinks(true);
    setExportError(null);
    try {
      setExportLinks((await getCityExportLinks(exportJobId)).links);
    } catch (error) {
      setExportError(uploadErrorMessage(error));
    } finally {
      setLoadingExportLinks(false);
    }
  }, [exportJobId]);

  useEffect(() => {
    if (exportJob?.status === 'ready' && linksRequestedFor !== exportJobId) void refreshExportLinks();
  }, [exportJob?.status, exportJobId, linksRequestedFor, refreshExportLinks]);

  async function handleStartExport() {
    if (!city || startingExport) return;
    setStartingExport(true);
    setExportError(null);
    setExportLinks([]);
    setLinksRequestedFor(null);
    try {
      const result = await startCityExport(city.id);
      localStorage.setItem(`shiori:city-export:${city.id}`, result.jobId);
      setExportJobId(result.jobId);
    } catch (error) {
      setExportError(uploadErrorMessage(error));
    } finally {
      setStartingExport(false);
    }
  }

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    if (!city || !indexReady) return;
    const files = [...(event.target.files ?? [])];
    event.target.value = '';

    await runTwoAtATime(files, async (file) => {
      const id = `${Date.now()}-${crypto.randomUUID()}`;
      if (!file.type.startsWith('image/')) {
        setStatuses((current) => ({ ...current, [id]: { id, cityId: city.id, fileName: file.name, state: 'error', progress: 0, message: 'El archivo no es una imagen.' } }));
        return;
      }
      if (file.size > MAX_ORIGINAL_BYTES) {
        setStatuses((current) => ({ ...current, [id]: { id, cityId: city.id, fileName: file.name, state: 'error', progress: 0, message: 'La foto supera el máximo de 30 MB.' } }));
        return;
      }
      const createdAt = new Date().toISOString();
      const pending: PendingPhoto = {
        id,
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
      }
    });
  }

  if (cityId && !city) return <NotFound />;
  const cityStatuses = Object.values(statuses).filter((status) => status.cityId === city?.id);

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

    {!city && <div className="photo-city-grid" aria-label="Galerías por ciudad">
      {itinerary.cities.map((entry) => {
        const count = photoCounts[entry.id];
        const summary = !user ? 'Abrir fotos' : !indexReady ? 'Preparando galería…' : count !== undefined
          ? `${count} ${count === 1 ? 'foto' : 'fotos'}`
          : loadingPhotoCounts ? 'Contando fotos…' : 'Cantidad no disponible';
        return <Link to={`/photos/${entry.id}`} key={entry.id}>
          <span>Galería</span><h2>{entry.name}</h2><p>{summary} <b aria-hidden="true">→</b></p>
        </Link>;
      })}
    </div>}

    {city && user && <>
      <nav className="photo-city-nav" aria-label="Cambiar ciudad">
        {itinerary.cities.map((entry) => <Link className={entry.id === city.id ? 'is-current' : ''} to={`/photos/${entry.id}`} key={entry.id}>{entry.name}</Link>)}
      </nav>
      <section className="photo-toolbar">
        <div><h2>Galería</h2><p>{cityPhotoCount ? `${cityPhotoCount} ${cityPhotoCount === 1 ? 'foto guardada' : 'fotos guardadas'}` : 'Todavía no hay fotos guardadas.'}</p></div>
        <div className="photo-toolbar-actions">
          <button className="download-city-button" type="button" disabled={!indexReady || cityPhotoCount === 0 || startingExport || exportJob?.status === 'queued' || exportJob?.status === 'processing'} onClick={() => { void handleStartExport(); }}>
            {startingExport ? 'Iniciando…' : exportJob?.status === 'queued' || exportJob?.status === 'processing' ? 'Preparando ZIP…' : exportJob?.status === 'ready' ? 'Actualizar descarga' : exportJob?.status === 'expired' ? 'Preparar de nuevo' : 'Descargar ciudad'}
          </button>
          <button className="upload-button" type="button" disabled={!indexReady} onClick={() => inputRef.current?.click()}>Agregar fotos</button>
        </div>
        <input ref={inputRef} className="visually-hidden" type="file" accept="image/*" multiple onChange={(event) => { void handleFiles(event); }} />
      </section>

      {(exportJob || exportError) && <section className="city-export" aria-live="polite">
        {exportJob?.status === 'queued' && <p>La descarga está en cola.</p>}
        {exportJob?.status === 'processing' && <p>Preparando archivos ZIP: {exportJob.completedParts} de {exportJob.partCount} listos. Podés cerrar la página y volver después.</p>}
        {exportJob?.status === 'ready' && <>
          <p>Descarga lista en {exportJob.partCount} {exportJob.partCount === 1 ? 'archivo' : 'archivos'}. Los enlaces duran una hora.</p>
          {loadingExportLinks ? <span>Generando enlaces…</span> : <div className="city-export-links">
            {exportLinks.map((link, index) => <a href={link.url} key={link.fileName}>Descargar {exportJob.partCount === 1 ? 'ZIP' : `parte ${index + 1}`} · {formatBytes(link.size)}</a>)}
            <button type="button" onClick={() => { void refreshExportLinks(); }}>Renovar enlaces</button>
          </div>}
        </>}
        {exportJob?.status === 'error' && <p>No se pudo preparar la descarga. Podés crearla nuevamente.</p>}
        {exportJob?.status === 'expired' && <p>La descarga anterior venció. Podés prepararla nuevamente desde el botón.</p>}
        {exportError && <p className="photo-export-error" role="alert">{exportError}</p>}
      </section>}

      {cityStatuses.length > 0 && <div className="upload-list" aria-live="polite">
        {cityStatuses.map((status) => <div className={`upload-row is-${status.state}`} key={status.id}>
          <div><strong>{status.fileName}</strong><span>{status.message}</span></div>
          {status.state === 'uploading' && <progress value={status.progress} max={1}>{Math.round(status.progress * 100)}%</progress>}
          {status.state === 'queued' && <button type="button" onClick={() => { void resumePending(); }}>Reintentar</button>}
        </div>)}
      </div>}

      {galleryError && <p className="gallery-error" role="alert">{galleryError} <button type="button" onClick={() => { void refreshGallery(); }}>Reintentar</button></p>}
      {!indexReady && !galleryError ? <p className="gallery-loading">Preparando galería…</p> : loadingPhotos ? <p className="gallery-loading">Cargando galería…</p> : photos.length > 0 && <>
        <div className="photo-grid">
          {photos.map((photo) => <PhotoThumbnail photo={photo} onSelect={() => setSelectedPhoto(photo)} key={photo.photoId} />)}
        </div>
        {nextCursor && <button className="load-more-photos" type="button" disabled={loadingMore} onClick={() => { void loadMorePhotos(); }}>{loadingMore ? 'Cargando…' : 'Cargar más fotos'}</button>}
      </>}
    </>}

    {selectedPhoto && <PhotoViewer photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} onDelete={async () => {
      await deleteCityPhoto(selectedPhoto);
      await deletePhotoIndex(selectedPhoto);
      setPhotos((current) => current.filter((photo) => photo.photoId !== selectedPhoto.photoId));
      setCityPhotoCount((current) => Math.max(0, current - 1));
      setSelectedPhoto(null);
    }} />}
  </div>;
}

export default function PhotosPage() {
  return <AuthProvider><PhotosContent /></AuthProvider>;
}
