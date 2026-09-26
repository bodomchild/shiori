import { useEffect, useState } from 'react';
import { loadGalleryPhotoBlob } from '../photos/photoCache';
import type { PhotoRecord } from '../photos/types';

export default function PhotoThumbnail({ photo, onSelect }: { photo: PhotoRecord; onSelect: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const photoPath = photo.thumbnailPath ?? photo.previewPath;

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    setFailed(false);
    setUrl(null);
    loadGalleryPhotoBlob(photoPath).then((blob) => {
      if (!active) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    }).catch(() => active && setFailed(true));
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photoPath]);

  return <button className="photo-thumbnail" type="button" onClick={onSelect} disabled={!url} aria-busy={!url && !failed}>
    {url ? <img src={url} alt={photo.originalName} /> : <span className="photo-thumbnail-placeholder">{failed ? 'No se pudo cargar' : 'Cargando…'}</span>}
  </button>;
}
