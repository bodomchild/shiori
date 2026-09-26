import { useEffect, useRef, useState, type TouchEvent } from 'react';
import { loadGalleryPhotoBlob } from '../photos/photoCache';
import { loadPhotoBlob } from '../photos/photoStorage';
import type { PhotoRecord } from '../photos/types';

interface PhotoViewerProps {
  photo: PhotoRecord;
  onClose: () => void;
  onDelete: () => Promise<void>;
  onNavigate: (direction: -1 | 1) => void;
  hasPrevious: boolean;
  hasNext: boolean;
  position: number;
  total: number | null;
  navigating: boolean;
  navigationError: string | null;
}

// Cada foto tiene su propia carga: una respuesta tardía no cambia la imagen actual.
function PhotoPreview({ photo }: { photo: PhotoRecord }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    loadGalleryPhotoBlob(photo.previewPath).then((blob) => {
      if (!active) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    }).catch(() => active && setFailed(true));
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photo.previewPath]);

  return url ? <img src={url} alt={photo.originalName} draggable={false} />
    : <p role="status">{failed ? 'No se pudo abrir la foto.' : 'Cargando foto…'}</p>;
}

export default function PhotoViewer({ photo, onClose, onDelete, onNavigate, hasPrevious, hasNext, position, total, navigating, navigationError }: PhotoViewerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<{ x: number; y: number; id: number } | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const navigationBlocked = navigating || confirmingDelete || downloading || deleting;

  useEffect(() => {
    dialogRef.current?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    setDownloadError(null);
    setDeleteError(null);
    touchStart.current = null;
  }, [photo.photoId]);

  function navigate(direction: -1 | 1) {
    if (navigationBlocked || (direction === -1 ? !hasPrevious : !hasNext)) return;
    onNavigate(direction);
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || event.touches.length > 0 || event.changedTouches.length !== 1) return;
    const end = event.changedTouches[0];
    if (end.identifier !== start.id) return;
    const dx = end.clientX - start.x;
    const dy = end.clientY - start.y;
    // Ignorar toques, desplazamientos verticales y gestos con más de un dedo.
    if (Math.abs(dx) >= 60 && Math.abs(dx) > Math.abs(dy) * 1.5) navigate(dx < 0 ? 1 : -1);
  }

  async function handleDownload() {
    setDownloading(true);
    setDownloadError(null);
    try {
      const blob = await loadPhotoBlob(photo.originalPath);
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = photo.originalName;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    } catch {
      setDownloadError('No se pudo descargar el original. Probá nuevamente.');
    } finally {
      setDownloading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await onDelete();
    } catch {
      setDeleteError('No se pudo eliminar la foto. Probá nuevamente.');
      setDeleting(false);
    }
  }

  return <dialog className="photo-viewer" aria-label="Visor de fotos" ref={dialogRef} onClose={onClose} onKeyDown={(event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      navigate(event.key === 'ArrowLeft' ? -1 : 1);
    }
  }} onCancel={(event) => {
    if (deleting) event.preventDefault();
  }} onClick={(event) => {
    if (event.target === event.currentTarget && !deleting) event.currentTarget.close();
  }}>
    <div className="photo-viewer-content">
      <button className="photo-viewer-close" type="button" aria-label="Cerrar foto" disabled={deleting} onClick={() => dialogRef.current?.close()}>×</button>
      <div className="photo-viewer-stage" onTouchStart={(event) => {
        const touch = event.touches[0];
        touchStart.current = !navigationBlocked && event.touches.length === 1
          ? { x: touch.clientX, y: touch.clientY, id: touch.identifier } : null;
      }} onTouchEnd={handleTouchEnd} onTouchCancel={() => { touchStart.current = null; }}>
        <PhotoPreview photo={photo} key={photo.photoId} />
      </div>
      <div className="photo-viewer-navigation" aria-label="Navegación de fotos">
        <button type="button" aria-label="Foto anterior" disabled={!hasPrevious || navigationBlocked} onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="m15 6-6 6 6 6" /></svg>
        </button>
        <span role="status">{navigating ? 'Cargando más fotos…' : `Foto ${position}${total === null ? '' : ` de ${total}`}`}</span>
        <button type="button" aria-label="Foto siguiente" disabled={!hasNext || navigationBlocked} onClick={() => navigate(1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="m9 6 6 6-6 6" /></svg>
        </button>
      </div>
      {navigationError && <p className="photo-viewer-error" role="alert">{navigationError}</p>}
      {!confirmingDelete ? <div className="photo-viewer-actions">
        <button type="button" disabled={downloading || navigating} onClick={() => { void handleDownload(); }}>{downloading ? 'Descargando…' : 'Descargar original'}</button>
        <button className="photo-delete-button" type="button" disabled={downloading || navigating} onClick={() => setConfirmingDelete(true)}>Eliminar foto</button>
        {downloadError && <span className="photo-download-error" role="alert">{downloadError}</span>}
      </div> : <div className="photo-delete-confirm" role="alertdialog" aria-labelledby="delete-photo-title" aria-describedby="delete-photo-description">
        <strong id="delete-photo-title">¿Eliminar esta foto?</strong>
        <p id="delete-photo-description">Se quitará de la galería. Podrá recuperarse desde Cloud Storage durante 30 días.</p>
        {deleteError && <p className="photo-delete-error" role="alert">{deleteError}</p>}
        <div>
          <button type="button" disabled={deleting} onClick={() => { setConfirmingDelete(false); setDeleteError(null); }}>Cancelar</button>
          <button className="photo-delete-confirm-button" type="button" disabled={deleting} onClick={() => { void handleDelete(); }}>{deleting ? 'Eliminando…' : 'Sí, eliminar'}</button>
        </div>
      </div>}
    </div>
  </dialog>;
}
