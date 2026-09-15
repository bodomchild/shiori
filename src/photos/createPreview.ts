import { MAX_PREVIEW_BYTES } from './types';

interface ImageSource {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
}

async function loadImageSource(file: Blob): Promise<ImageSource> {
  if ('createImageBitmap' in window) {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
  }

  const url = URL.createObjectURL(file);
  const image = new Image();
  image.src = url;
  await image.decode();
  return {
    source: image,
    width: image.naturalWidth,
    height: image.naturalHeight,
    release: () => URL.revokeObjectURL(url),
  };
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('No se pudo crear la vista previa.')), 'image/jpeg', quality);
  });
}

export async function createPhotoPreview(file: Blob) {
  const image = await loadImageSource(file);
  const attempts = [
    { maxDimension: 1600, quality: 0.82 },
    { maxDimension: 1280, quality: 0.75 },
    { maxDimension: 1024, quality: 0.7 },
    { maxDimension: 800, quality: 0.65 },
  ];

  try {
    for (const attempt of attempts) {
      const scale = Math.min(1, attempt.maxDimension / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('El navegador no permite preparar imágenes.');
      context.drawImage(image.source, 0, 0, canvas.width, canvas.height);
      const preview = await canvasBlob(canvas, attempt.quality);
      if (preview.size <= MAX_PREVIEW_BYTES) return preview;
    }
  } finally {
    image.release();
  }

  throw new Error('No se pudo reducir la foto a un tamaño adecuado.');
}
