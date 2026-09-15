import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import AuthProvider from '../auth/AuthProvider';
import { useAuth } from '../auth/AuthContext';
import AuthButton from '../components/AuthButton';
import NotFound from '../components/NotFound';
import PhotoThumbnail from '../components/PhotoThumbnail';
import PhotoViewer from '../components/PhotoViewer';
import { itinerary } from '../data/itinerary';
import { createPhotoPreview } from '../photos/createPreview';
import { deletePendingPhoto, listPendingPhotos, savePendingPhoto } from '../photos/pendingUploads';
import { deleteCityPhoto, listCityPhotos, uploadPendingPhoto } from '../photos/photoStorage';
import { MAX_ORIGINAL_BYTES, type PendingPhoto, type PhotoRecord, type UploadStatus } from '../photos/types';

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

function PhotosContent() {
  const { cityId } = useParams();
  const city = cityId ? itinerary.cities.find((entry) => entry.id === cityId) : undefined;
  const { user, loading, error: authError } = useAuth();
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, UploadStatus>>({});
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoRecord | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inFlight = useRef(new Set<string>());

  const refreshGallery = useCallback(async () => {
    if (!user || !city) return;
    setLoadingPhotos(true);
    setGalleryError(null);
    try {
      setPhotos(await listCityPhotos(city.id));
    } catch (error) {
      setGalleryError(uploadErrorMessage(error));
    } finally {
      setLoadingPhotos(false);
    }
  }, [city, user]);

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
      if (!prepared.preview) {
        updateStatus({ state: 'preparing', message: 'Preparando vista previa…' });
        prepared = { ...prepared, preview: await createPhotoPreview(prepared.original) };
        await savePendingPhoto(prepared);
      }
      if (!navigator.onLine) {
        updateStatus({ state: 'queued', message: 'Guardada en el teléfono; esperando conexión.' });
        return;
      }
      updateStatus({ state: 'uploading', message: 'Subiendo a la nube…' });
      await uploadPendingPhoto(prepared, user.uid, (progress) => {
        updateStatus({ state: 'uploading', progress, message: `Subiendo… ${Math.round(progress * 100)}%` });
      });
      await deletePendingPhoto(prepared.id);
      updateStatus({ state: 'saved', progress: 1, message: 'Guardada en la nube.' });
      if (prepared.cityId === city?.id) await refreshGallery();
    } catch (error) {
      updateStatus({ state: 'queued', message: uploadErrorMessage(error) });
    } finally {
      inFlight.current.delete(pending.id);
    }
  }, [city?.id, refreshGallery, user]);

  const resumePending = useCallback(async () => {
    if (!user) return;
    try {
      await runTwoAtATime(await listPendingPhotos(), processPending);
    } catch (error) {
      setGalleryError(uploadErrorMessage(error));
    }
  }, [processPending, user]);

  useEffect(() => { void refreshGallery(); }, [refreshGallery]);

  useEffect(() => {
    void resumePending();
    const handleOnline = () => { void resumePending(); };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [resumePending]);

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    if (!city) return;
    const files = [...(event.target.files ?? [])];
    event.target.value = '';
    const pendingPhotos: PendingPhoto[] = [];

    for (const file of files) {
      const id = `${Date.now()}-${crypto.randomUUID()}`;
      if (!file.type.startsWith('image/')) {
        setStatuses((current) => ({ ...current, [id]: { id, cityId: city.id, fileName: file.name, state: 'error', progress: 0, message: 'El archivo no es una imagen.' } }));
        continue;
      }
      if (file.size > MAX_ORIGINAL_BYTES) {
        setStatuses((current) => ({ ...current, [id]: { id, cityId: city.id, fileName: file.name, state: 'error', progress: 0, message: 'La foto supera el máximo de 30 MB.' } }));
        continue;
      }
      const pending: PendingPhoto = {
        id,
        photoId: id,
        cityId: city.id,
        original: file,
        originalName: file.name || `foto-${id}`,
        contentType: file.type,
        createdAt: new Date().toISOString(),
      };
      try {
        await savePendingPhoto(pending);
        pendingPhotos.push(pending);
      } catch {
        setStatuses((current) => ({ ...current, [id]: { id, cityId: city.id, fileName: file.name, state: 'error', progress: 0, message: 'No hubo espacio para guardar la copia temporal.' } }));
      }
    }

    await runTwoAtATime(pendingPhotos, processPending);
  }

  if (cityId && !city) return <NotFound />;
  const cityStatuses = Object.values(statuses).filter((status) => status.cityId === city?.id);

  return <div className="page-shell photos-page">
    <Link className="back-link" to={city ? '/photos' : '/'}>{city ? '← Todas las ciudades' : '← Todo el viaje'}</Link>
    <p className="eyebrow"><span className="red-dot" /> RECUERDOS DEL VIAJE</p>
    <h1 className="page-title">{city ? `Fotos de ${city.name}.` : 'Fotos por ciudad.'}</h1>
    <p className="page-description">{city ? 'Originales protegidos en la nube y una vista previa liviana para recorrerlos.' : 'Las fotos se guardan en la nube privada de Lore y Fer, agrupadas solamente por ciudad.'}</p>

    <section className="auth-card" aria-live="polite">
      {loading ? <p>Comprobando la sesión…</p> : user ? <>
        <span className="auth-ready" aria-hidden="true">✓</span>
        <div><h2>Acceso listo</h2><p>Ingresaste como <strong>{user.displayName ?? user.email}</strong>.</p><p className="uid-copy">UID: <code>{user.uid}</code></p></div>
      </> : <>
        <span className="auth-symbol" aria-hidden="true">写</span>
        <div><h2>Ingresá para guardar fotos</h2><p>El itinerario es público. Solamente la galería necesita una cuenta autorizada.</p></div>
      </>}
      <AuthButton />
      {authError && <p className="auth-error" role="alert">{authError}</p>}
    </section>

    {!city && <div className="photo-city-grid" aria-label="Galerías por ciudad">
      {itinerary.cities.map((entry) => <Link to={`/photos/${entry.id}`} key={entry.id}>
        <span>Galería</span><h2>{entry.name}</h2><p>Abrir fotos <b aria-hidden="true">→</b></p>
      </Link>)}
    </div>}

    {city && user && <>
      <nav className="photo-city-nav" aria-label="Cambiar ciudad">
        {itinerary.cities.map((entry) => <Link className={entry.id === city.id ? 'is-current' : ''} to={`/photos/${entry.id}`} key={entry.id}>{entry.name}</Link>)}
      </nav>
      <section className="photo-toolbar">
        <div><h2>Galería</h2><p>{photos.length ? `${photos.length} ${photos.length === 1 ? 'foto guardada' : 'fotos guardadas'}` : 'Todavía no hay fotos guardadas.'}</p></div>
        <button className="upload-button" type="button" onClick={() => inputRef.current?.click()}>Agregar fotos</button>
        <input ref={inputRef} className="visually-hidden" type="file" accept="image/*" multiple onChange={(event) => { void handleFiles(event); }} />
      </section>

      {cityStatuses.length > 0 && <div className="upload-list" aria-live="polite">
        {cityStatuses.map((status) => <div className={`upload-row is-${status.state}`} key={status.id}>
          <div><strong>{status.fileName}</strong><span>{status.message}</span></div>
          {status.state === 'uploading' && <progress value={status.progress} max={1}>{Math.round(status.progress * 100)}%</progress>}
          {status.state === 'queued' && <button type="button" onClick={() => { void resumePending(); }}>Reintentar</button>}
        </div>)}
      </div>}

      {galleryError && <p className="gallery-error" role="alert">{galleryError} <button type="button" onClick={() => { void refreshGallery(); }}>Reintentar</button></p>}
      {loadingPhotos ? <p className="gallery-loading">Cargando galería…</p> : photos.length > 0 && <div className="photo-grid">
        {photos.map((photo) => <PhotoThumbnail photo={photo} onSelect={() => setSelectedPhoto(photo)} key={photo.photoId} />)}
      </div>}
    </>}

    {selectedPhoto && <PhotoViewer photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} onDelete={async () => {
      await deleteCityPhoto(selectedPhoto);
      setPhotos((current) => current.filter((photo) => photo.photoId !== selectedPhoto.photoId));
      setSelectedPhoto(null);
    }} />}
  </div>;
}

export default function PhotosPage() {
  return <AuthProvider><PhotosContent /></AuthProvider>;
}
