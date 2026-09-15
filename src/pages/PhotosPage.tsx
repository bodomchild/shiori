import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import AuthButton from '../components/AuthButton';
import { itinerary } from '../data/itinerary';
import AuthProvider from '../auth/AuthProvider';

function PhotosContent() {
  const { user, loading, error } = useAuth();

  return <div className="page-shell photos-page">
    <Link className="back-link" to="/">← Todo el viaje</Link>
    <p className="eyebrow"><span className="red-dot" /> RECUERDOS DEL VIAJE</p>
    <h1 className="page-title">Fotos por ciudad.</h1>
    <p className="page-description">Las fotos se guardarán en la nube privada de Lore y Fer, agrupadas solamente por ciudad.</p>

    <section className="auth-card" aria-live="polite">
      {loading ? <p>Comprobando la sesión…</p> : user ? <>
        <span className="auth-ready" aria-hidden="true">✓</span>
        <div>
          <h2>Acceso listo</h2>
          <p>Ingresaste como <strong>{user.displayName ?? user.email}</strong>.</p>
          <p className="uid-copy">UID para habilitar esta cuenta: <code>{user.uid}</code></p>
        </div>
      </> : <>
        <span className="auth-symbol" aria-hidden="true">写</span>
        <div>
          <h2>Ingresá para guardar fotos</h2>
          <p>El itinerario sigue siendo público. Solamente la galería necesita una cuenta autorizada.</p>
        </div>
      </>}
      <AuthButton />
      {error && <p className="auth-error" role="alert">{error}</p>}
    </section>

    <div className="photo-city-grid" aria-label="Ciudades de la futura galería">
      {itinerary.cities.map((city) => <article key={city.id}>
        <span>Próximamente</span>
        <h2>{city.name}</h2>
        <p>Fotos de la ciudad</p>
      </article>)}
    </div>
  </div>;
}

export default function PhotosPage() {
  return <AuthProvider><PhotosContent /></AuthProvider>;
}
