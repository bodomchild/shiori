import { doc, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { photoDatabase, photoFunctions } from '../firebase';

export interface CityExportJob {
  id: string;
  status: 'queued' | 'processing' | 'ready' | 'error' | 'expired';
  scope: string;
  photoCount: number;
  partCount: number;
  completedParts: number;
  error?: string;
}

export interface CityExportLink {
  fileName: string;
  size: number;
  url: string;
}

const startExportCallable = httpsCallable<{ scope: string }, { jobId: string; partCount: number }>(photoFunctions, 'startCityExport');
const getLinksCallable = httpsCallable<{ jobId: string }, { links: CityExportLink[]; expiresAt: string }>(photoFunctions, 'getCityExportLinks');

export async function startCityExport(scope: string) {
  return (await startExportCallable({ scope })).data;
}

export async function getCityExportLinks(jobId: string) {
  return (await getLinksCallable({ jobId })).data;
}

export function subscribeToCityExport(jobId: string, onChange: (job: CityExportJob) => void, onError: (error: Error) => void) {
  return onSnapshot(doc(photoDatabase, `trips/japan-2026/exports/${jobId}`), (snapshot) => {
    if (!snapshot.exists()) {
      onError(new Error('La exportación ya no está disponible.'));
      return;
    }
    const data = snapshot.data();
    const expired = data.expiresAt?.toMillis?.() <= Date.now();
    onChange({
      id: snapshot.id,
      status: data.status === 'ready' && expired ? 'expired' : data.status,
      scope: String(data.scope || data.cityId || ''),
      photoCount: Number(data.photoCount || 0),
      partCount: Number(data.partCount || 0),
      completedParts: Number(data.completedParts || 0),
      ...(data.error ? { error: String(data.error) } : {}),
    });
  }, (error) => onError(error));
}
