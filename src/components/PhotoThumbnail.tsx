import { useEffect, useState } from 'react';
import { loadPhotoBlob } from '../photos/photoStorage';
import type { PhotoRecord } from '../photos/types';

export default function PhotoThumbnail({ photo, onSelect }: { photo: PhotoRecord; onSelect: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    loadPhotoBlob(photo.previewPath).then((blob) => {
      if (!active) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    }).catch(() => active && setFailed(true));
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photo.previewPath]);

  return <button className="photo-thumbnail" type="button" onClick={onSelect} disabled={!url}>
    {url ? <img src={url} alt={photo.originalName} loading="lazy" /> : <span>{failed ? 'No se pudo cargar' : 'Cargando…'}</span>}
  </button>;
}
