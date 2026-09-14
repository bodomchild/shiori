import { Link, useParams } from 'react-router-dom';
import { itinerary } from '../data/itinerary';
import { cityDates, daySlug, formatDate } from '../dates';
import NotFound from '../components/NotFound';

export default function CityPage() {
  const { cityId } = useParams();
  const city = itinerary.cities.find((entry) => entry.id === cityId);
  if (!city) return <NotFound />;

  return <div className="page-shell city-page">
    <Link className="back-link" to="/">← Todo el viaje</Link>
    <p className="eyebrow">{formatDate(city.startDate)} — {formatDate(city.endDate)} · 2026</p>
    <h1 className="page-title">Unos días en {city.name}.</h1>
    <p className="page-description">Elegí un día y veamos adónde nos lleva.</p>
    <div className="days-grid">
      {cityDates(city).map((date) => {
        const stops = city.days.find((day) => day.date === date)?.stops ?? [];
        return <Link to={`/${city.id}/${daySlug(date)}`} className="day-card" key={date}>
          <div className="calendar-block"><span>{formatDate(date, { month: 'short' })}</span><strong>{date.slice(8)}</strong></div>
          <div className="min-w-0 flex-1"><h2>{city.days.find((day) => day.date === date)?.title ?? formatDate(date, { weekday: 'long' })}</h2><p>{formatDate(date, { weekday: 'long' })} · {stops.length} actividades</p></div>
          <span className="circle-arrow" aria-hidden="true">→</span>
        </Link>;
      })}
    </div>
  </div>;
}
