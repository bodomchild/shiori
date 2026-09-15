import { useAuth } from '../auth/AuthContext';

export default function AuthButton() {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) return <span className="auth-status">Comprobando sesión…</span>;
  if (!user) return <button className="auth-button" type="button" onClick={signIn}>Ingresar con Google</button>;

  return <button className="auth-button" type="button" onClick={signOut}>Salir</button>;
}
