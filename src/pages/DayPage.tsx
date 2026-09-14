import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { itinerary } from '../data/itinerary';
import { cityDates, daySlug, formatDate } from '../dates';
import type { City, Day, ItineraryStop } from '../types/itinerary';
import NotFound from '../components/NotFound';
import DaySelector from '../components/DaySelector';
import DayMap from '../components/DayMap';
import StopList from '../components/StopList';

function DayView({ city, day }: { city: City; day: Day }) {
  const [selectedStop, setSelectedStop] = useState<ItineraryStop | null>(null);
  const selectedStopId = selectedStop?.id ?? null;
  const stops = [...day.stops].sort((a, b) => a.startTime.localeCompare(b.startTime));

  function selectStop(id: string) {
    const stop = stops.find((entry) => entry.id === id);
    // A fresh selection also recenters a stop tapped again after panning the map.
    if (stop) setSelectedStop({ ...stop });
  }

  function selectFromMap(id: string) {
    selectStop(id);
    // Wait for the selected card's address and note to finish expanding.
    requestAnimationFrame(() => {
      document.getElementById(`stop-${id}`)?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    });
  }

  return <div className="page-shell day-page">
    <Link className="back-link" to={`/${city.id}`}>← Días en {city.name}</Link>
    <div className="day-heading"><div><p className="eyebrow">{formatDate(day.date, { weekday: 'long', day: 'numeric', month: 'long' })}</p><h1 className="page-title">Hoy recorremos {city.name}.</h1></div><DaySelector city={city} date={day.date} /></div>
    {stops.length > 0 ? <>
      <div className="day-info"><span><span className="red-dot" /> {stops.length} paradas · Horarios de Japón</span><span className="mock-badge">Día de ejemplo</span></div>
      <div className="day-layout">
        <section className="map-panel" aria-label={`Mapa del ${formatDate(day.date)} en ${city.name}`}>
          <DayMap stops={stops} selectedStop={selectedStop} onSelect={selectFromMap} />
          <div className="map-caption"><span className="red-dot" /><p aria-live="polite">{selectedStop ? selectedStop.name : 'Tocá una parada para ubicarla en el mapa'}</p></div>
        </section>
        <section className="itinerary-panel" aria-labelledby="stops-title">
          <div className="list-heading"><h2 id="stops-title">El plan del día</h2><span className="small-muted">PASO A PASO</span></div>
          <StopList stops={stops} selectedStopId={selectedStopId} onSelect={(id) => {
            selectStop(id);
            if (window.matchMedia('(max-width: 899px)').matches) {
              document.getElementById('day-map')?.scrollIntoView({ block: 'start', behavior: 'instant' });
            }
          }} />
          <p className="list-footnote">Los horarios son aproximados. Siempre hay lugar para cambiar de plan.</p>
        </section>
      </div>
    </> : <section className="empty-day"><span className="empty-symbol" aria-hidden="true">栞</span><h2>Un día por descubrir.</h2><p>Todavía no hay actividades cargadas para esta fecha.</p><p>Podés explorar los días de ejemplo mientras armamos el resto.</p><div className="flex flex-wrap justify-center gap-3 mt-6"><Link className="primary-link" to="/osaka/14-10">Osaka · 14 oct →</Link><Link className="secondary-link" to="/kyoto/18-10">Kioto · 18 oct →</Link></div></section>}
  </div>;
}

export default function DayPage() {
  const { cityId, dayId } = useParams();
  const city = itinerary.cities.find((entry) => entry.id === cityId);
  const date = city && cityDates(city).find((entry) => daySlug(entry) === dayId);
  if (!city || !date) return <NotFound />;
  const day = city.days.find((entry) => entry.date === date) ?? { date, stops: [] };
  // Remount on navigation to reset both selection and Leaflet's viewport.
  return <DayView key={`${city.id}/${date}`} city={city} day={day} />;
}
