export const MAX_ORIGINAL_BYTES = 30 * 1024 * 1024;
export const MAX_PREVIEW_BYTES = 2 * 1024 * 1024;
export const MAX_THUMBNAIL_BYTES = 512 * 1024;

export interface PendingPhoto {
  id: string;
  photoId: string;
  cityId: string;
  original: Blob;
  preview?: Blob;
  thumbnail?: Blob;
  originalName: string;
  contentType: string;
  createdAt: string;
  capturedAt?: string;
}

export interface PhotoRecord {
  photoId: string;
  cityId: string;
  originalPath: string;
  previewPath: string;
  thumbnailPath?: string;
  originalName: string;
  createdAt: string;
  capturedAt?: string;
  sortAt: string;
  uploaderUid: string;
  originalSize: number;
}

export interface PhotoPageCursor {
  sortAt: string;
  photoId: string;
}

export type UploadState = 'preparing' | 'queued' | 'uploading' | 'saved' | 'error';

export interface UploadStatus {
  id: string;
  cityId: string;
  fileName: string;
  state: UploadState;
  progress: number;
  message: string;
}
