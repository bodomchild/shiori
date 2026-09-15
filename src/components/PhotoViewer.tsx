import { useEffect, useRef, useState } from 'react';
import { loadPhotoBlob } from '../photos/photoStorage';
import type { PhotoRecord } from '../photos/types';

export default function PhotoViewer({ photo, onClose }: { photo: PhotoRecord; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

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

  return <dialog className="photo-viewer" ref={dialogRef} onClose={onClose} onClick={(event) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  }}>
    <div className="photo-viewer-content">
      <button className="photo-viewer-close" type="button" aria-label="Cerrar foto" onClick={() => dialogRef.current?.close()}>×</button>
      {url ? <img src={url} alt={photo.originalName} /> : <p>{failed ? 'No se pudo abrir el original.' : 'Cargando foto original…'}</p>}
      {url && <a href={url} download={photo.originalName}>Descargar original</a>}
    </div>
  </dialog>;
}
