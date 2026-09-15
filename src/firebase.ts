import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyA38bi8Op33kSg-SS-x6JGwGdJw293BVyQ',
  authDomain: 'shiori-japan-2026.firebaseapp.com',
  projectId: 'shiori-japan-2026',
  storageBucket: 'shiori-japan-2026.firebasestorage.app',
  messagingSenderId: '836274225500',
  appId: '1:836274225500:web:df3efefa55c1aa42728199',
};

const app = getApps()[0] ?? initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const photoStorage = getStorage(app);
