import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth } from '../firebase';
import { AuthContext } from './AuthContext';

function authErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.includes('popup-closed-by-user')) {
    return 'Se cerró la ventana antes de completar el ingreso.';
  }
  return 'No se pudo ingresar con Google. Probá nuevamente.';
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => onAuthStateChanged(auth, (nextUser) => {
    setUser(nextUser);
    setLoading(false);
  }, () => {
    setError('No se pudo comprobar la sesión de Google.');
    setLoading(false);
  }), []);

  const value = useMemo(() => ({
    user,
    loading,
    error,
    async signIn() {
      setError(null);
      try {
        await setPersistence(auth, browserLocalPersistence);
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        await signInWithPopup(auth, provider);
      } catch (nextError) {
        setError(authErrorMessage(nextError));
      }
    },
    async signOut() {
      setError(null);
      try {
        await firebaseSignOut(auth);
      } catch {
        setError('No se pudo cerrar la sesión. Probá nuevamente.');
      }
    },
  }), [error, loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
