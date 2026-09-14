import { Link } from 'react-router-dom';
import { itinerary } from '../data/itinerary';
import { cityDates, daySlug, formatDate } from '../dates';

const cityCharacters = ['大阪', '京都', '金沢', '河口湖', '箱根', '東京'];

export default function TripPage() {
  const totalDays = itinerary.cities.reduce((total, city) => total + cityDates(city).length, 0);
  return <div className="page-shell">
    <section className="trip-hero">
      <div className="hero-copy">
        <p className="eyebrow"><span className="red-dot" /> OCTUBRE — NOVIEMBRE 2026</p>
        <h1>Japón, <br /><em>a nuestro ritmo.</em></h1>
        <p className="hero-description">Un mes para perdernos un poquito.<br />Todo el viaje, siempre a mano.</p>
        <div className="hero-meta"><span>13 oct — 4 nov</span><span>{totalDays} días</span><span>6 ciudades</span></div>
      </div>
      <div className="japan-art" aria-hidden="true">
        <div className="art-frame"><span className="art-top">旅のしおり</span><div className="sun" /><div className="mountain mountain-back" /><div className="mountain mountain-front" /><div className="art-water" /><span className="art-bottom">JAPAN / A JOURNEY TO REMEMBER</span></div>
      </div>
    </section>
    <section className="pb-8" aria-labelledby="cities-title">
      <div className="section-heading"><div><p className="eyebrow">DE OSAKA A TOKIO</p><h2 id="cities-title">Nuestro recorrido</h2></div><span className="small-muted">06 destinos</span></div>
      <div className="city-grid">
        {itinerary.cities.map((city, index) => <Link className={`city-card city-tone-${index % 3}`} to={`/${city.id}`} key={city.id}>
          <div className="flex items-start justify-between"><span className="city-number">{String(index + 1).padStart(2, '0')}</span><span className="city-character" aria-hidden="true" lang="ja">{cityCharacters[index]}</span></div>
          <div className="city-card-bottom"><div><h3>{city.name}</h3><p>{formatDate(city.startDate)} — {formatDate(city.endDate)} <span>· {cityDates(city).length} días</span></p></div><span className="circle-arrow" aria-hidden="true">↗</span></div>
        </Link>)}
      </div>
    </section>
    <aside className="sample-note"><span className="note-symbol" aria-hidden="true">栞</span><div><strong>El itinerario ya está con nosotros</strong><p>Los 23 días están cargados desde nuestra copia local, con horarios, actividades opcionales y ubicaciones confirmadas en el mapa.</p></div><Link to={`/osaka/${daySlug('2026-10-13')}`} className="text-link">Empezar el viaje <span aria-hidden="true">→</span></Link></aside>
  </div>;
}
