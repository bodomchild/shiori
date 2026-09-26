import { MAX_PREVIEW_BYTES, MAX_THUMBNAIL_BYTES } from './types';

interface ImageSource {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
}

interface RenderAttempt {
  maxDimension: number;
  quality: number;
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
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('No se pudo preparar la imagen.')), 'image/jpeg', quality);
  });
}

async function renderImage(image: ImageSource, attempts: RenderAttempt[], maximumBytes: number) {
  for (const attempt of attempts) {
    const scale = Math.min(1, attempt.maxDimension / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('El navegador no permite preparar imágenes.');
    context.drawImage(image.source, 0, 0, canvas.width, canvas.height);
    const blob = await canvasBlob(canvas, attempt.quality);
    if (blob.size <= maximumBytes) return blob;
  }
  throw new Error('No se pudo reducir la foto a un tamaño adecuado.');
}

export async function createPhotoAssets(file: Blob) {
  const image = await loadImageSource(file);
  try {
    const preview = await renderImage(image, [
      { maxDimension: 1600, quality: 0.82 },
      { maxDimension: 1280, quality: 0.75 },
      { maxDimension: 1024, quality: 0.7 },
      { maxDimension: 800, quality: 0.65 },
    ], MAX_PREVIEW_BYTES);
    const thumbnail = await renderImage(image, [
      { maxDimension: 480, quality: 0.74 },
      { maxDimension: 400, quality: 0.68 },
      { maxDimension: 320, quality: 0.62 },
    ], MAX_THUMBNAIL_BYTES);
    return { preview, thumbnail };
  } finally {
    image.release();
  }
}
