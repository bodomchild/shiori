export const MAX_ORIGINAL_BYTES = 30 * 1024 * 1024;
export const MAX_PREVIEW_BYTES = 2 * 1024 * 1024;

export interface PendingPhoto {
  id: string;
  photoId: string;
  cityId: string;
  original: Blob;
  preview?: Blob;
  originalName: string;
  contentType: string;
  createdAt: string;
}

export interface PhotoRecord {
  photoId: string;
  cityId: string;
  originalPath: string;
  previewPath: string;
  originalName: string;
  createdAt: string;
  uploaderUid: string;
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
