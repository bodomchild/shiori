import { useEffect, useRef, useState } from 'react';
import { loadPhotoBlob } from '../photos/photoStorage';
import type { PhotoRecord } from '../photos/types';

interface PhotoViewerProps {
  photo: PhotoRecord;
  onClose: () => void;
  onDelete: () => Promise<void>;
}

export default function PhotoViewer({ photo, onClose, onDelete }: PhotoViewerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
    let active = true;
    let objectUrl: string | null = null;
    loadPhotoBlob(photo.originalPath).then((blob) => {
      if (!active) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    }).catch(() => active && setFailed(true));
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photo.originalPath]);

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

  return <dialog className="photo-viewer" ref={dialogRef} onClose={onClose} onCancel={(event) => {
    if (deleting) event.preventDefault();
  }} onClick={(event) => {
    if (event.target === event.currentTarget && !deleting) event.currentTarget.close();
  }}>
    <div className="photo-viewer-content">
      <button className="photo-viewer-close" type="button" aria-label="Cerrar foto" disabled={deleting} onClick={() => dialogRef.current?.close()}>×</button>
      {url ? <img src={url} alt={photo.originalName} /> : <p>{failed ? 'No se pudo abrir el original.' : 'Cargando foto original…'}</p>}
      {!confirmingDelete ? <div className="photo-viewer-actions">
        {url && <a href={url} download={photo.originalName}>Descargar original</a>}
        <button className="photo-delete-button" type="button" onClick={() => setConfirmingDelete(true)}>Eliminar foto</button>
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
