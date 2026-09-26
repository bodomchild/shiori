import { useEffect, useRef, useState } from 'react';
import { loadGalleryPhotoBlob } from '../photos/photoCache';
import type { PhotoRecord } from '../photos/types';

export default function PhotoThumbnail({ photo, onSelect }: { photo: PhotoRecord; onSelect: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const photoPath = photo.thumbnailPath ?? photo.previewPath;

  useEffect(() => {
    const element = buttonRef.current;
    if (!element || !('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setShouldLoad(true);
        observer.disconnect();
      }
    }, { rootMargin: '160px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, [photoPath]);

  useEffect(() => {
    if (!shouldLoad) return;
    let active = true;
    let objectUrl: string | null = null;
    setFailed(false);
    loadGalleryPhotoBlob(photoPath).then((blob) => {
      if (!active) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    }).catch(() => active && setFailed(true));
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photoPath, shouldLoad]);

  return <button ref={buttonRef} className="photo-thumbnail" type="button" onClick={onSelect} disabled={!url} aria-busy={shouldLoad && !url && !failed}>
    {url ? <img src={url} alt={photo.originalName} /> : <span className="photo-thumbnail-placeholder">{failed ? 'No se pudo cargar' : shouldLoad ? 'Cargando…' : 'Vista previa'}</span>}
  </button>;
}
