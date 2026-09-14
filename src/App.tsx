import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import TripPage from './pages/TripPage';
import CityPage from './pages/CityPage';
import DayPage from './pages/DayPage';
import NotFound from './components/NotFound';

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return <>
    <a className="skip-link" href="#main-content" onClick={(event) => {
      event.preventDefault();
      document.getElementById('main-content')?.focus();
    }}>Ir al contenido</a>
    <header className="site-header">
      <div className="page-shell flex h-18 items-center justify-between gap-4">
        <Link className="brand" to="/" aria-label="Shiori, inicio">
          <span className="brand-mark" aria-hidden="true">栞</span>
          <span>shiori<span className="brand-caption">NUESTRO VIAJE A JAPÓN</span></span>
        </Link>
        <span className="travelers"><span className="status-dot" /> Lore & Fer</span>
      </div>
    </header>
    <main id="main-content" tabIndex={-1}>
      <Routes>
        <Route path="/" element={<TripPage />} />
        <Route path="/:cityId" element={<CityPage />} />
        <Route path="/:cityId/:dayId" element={<DayPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
    <footer className="page-shell site-footer">
      <span>Hecho para ir sin apuro.</span><span>日本 · 2026</span>
    </footer>
  </>;
}
