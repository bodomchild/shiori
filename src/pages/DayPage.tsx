import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { itinerary } from '../data/itinerary';
import { cityDates, daySlug, formatDate, tripDayPath, tripDays } from '../dates';
import type { City, Day, ItineraryStop } from '../types/itinerary';
import NotFound from '../components/NotFound';
import DaySelector from '../components/DaySelector';
import DayMap from '../components/DayMap';
import StopList from '../components/StopList';
import { loadCompletedStopIds, saveCompletedStopIds, saveLastOpenedDay } from '../storage';

function DayView({ city, day }: { city: City; day: Day }) {
  const [selectedStop, setSelectedStop] = useState<ItineraryStop | null>(null);
  const [completedStopIds, setCompletedStopIds] = useState(loadCompletedStopIds);
  const selectedStopId = selectedStop?.id ?? null;
  const stops = day.stops;
  const mappedStops = stops.filter((stop) => stop.coordinates);
  const allDays = tripDays(itinerary);
  const dayIndex = allDays.findIndex((entry) => entry.city.id === city.id && entry.date === day.date);
  const previousDay = allDays[dayIndex - 1];
  const nextDay = allDays[dayIndex + 1];
  const completedOnDay = stops.filter((stop) => completedStopIds.has(stop.id)).length;

  useEffect(() => {
    saveLastOpenedDay({ cityId: city.id, date: day.date });
  }, [city.id, day.date]);

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

  function toggleCompleted(id: string) {
    setCompletedStopIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveCompletedStopIds(next);
      return next;
    });
  }

  function resetDayProgress() {
    setCompletedStopIds((current) => {
      const next = new Set(current);
      stops.forEach((stop) => next.delete(stop.id));
      saveCompletedStopIds(next);
      return next;
    });
  }

  return <div className="page-shell day-page">
    <Link className="back-link" to={`/${city.id}`}>← Días en {city.name}</Link>
    <nav className="day-navigation" aria-label="Navegación entre días del viaje">
      {previousDay ? <Link to={tripDayPath(previousDay)} rel="prev"><span aria-hidden="true">←</span><span><small>Anterior</small><strong>{formatDate(previousDay.date, { day: 'numeric', month: 'short' })}</strong></span></Link> : <span />}
      <span className="day-position">DÍA {dayIndex + 1} DE {allDays.length}</span>
      {nextDay ? <Link to={tripDayPath(nextDay)} rel="next"><span><small>Siguiente</small><strong>{formatDate(nextDay.date, { day: 'numeric', month: 'short' })}</strong></span><span aria-hidden="true">→</span></Link> : <span />}
    </nav>
    <div className="day-heading"><div><p className="eyebrow">{city.name} · {formatDate(day.date, { weekday: 'long', day: 'numeric', month: 'long' })}</p><h1 className="page-title">{day.title}</h1>{day.notes && <p className="day-note">{day.notes}</p>}</div><DaySelector city={city} date={day.date} /></div>
    {stops.length > 0 ? <>
      <div className="day-info"><span><span className="red-dot" /> {stops.length} actividades · Horarios de Japón</span><span className="source-badge">Itinerario real</span></div>
      <div className="day-layout">
        <section className={`map-panel${mappedStops.length ? '' : ' map-panel-static'}`} aria-label={`Mapa del ${formatDate(day.date)} en ${city.name}`}>
          {mappedStops.length ? <DayMap stops={stops} selectedStop={selectedStop} onSelect={selectFromMap} /> : <div id="day-map" className="map-placeholder"><span aria-hidden="true">地図</span><strong>Ubicaciones por confirmar</strong><p>Este día ya tiene actividades, pero la fuente todavía no define lugares concretos para el mapa.</p></div>}
          <div className="map-caption"><span className="red-dot" /><p aria-live="polite">{selectedStop ? selectedStop.coordinates ? selectedStop.name : `${selectedStop.name} · sin ubicación confirmada` : mappedStops.length ? `${mappedStops.length} ubicaciones · tocá una actividad para encontrarla` : 'El cronograma sigue disponible debajo'}</p></div>
        </section>
        <section className="itinerary-panel" aria-labelledby="stops-title">
          <div className="list-heading"><h2 id="stops-title">El plan del día</h2><div className="list-heading-actions"><span className="small-muted">{completedOnDay ? `${completedOnDay} DE ${stops.length} REALIZADAS` : 'PASO A PASO'}</span>{completedOnDay > 0 && <button type="button" className="reset-progress" onClick={resetDayProgress}>Restablecer</button>}</div></div>
          <StopList stops={stops} selectedStopId={selectedStopId} completedStopIds={completedStopIds} onSelect={selectStop} onToggleCompleted={toggleCompleted} />
          <p className="list-footnote">Los horarios son aproximados. Siempre hay lugar para cambiar de plan.</p>
        </section>
      </div>
    </> : <section className="empty-day"><span className="empty-symbol" aria-hidden="true">栞</span><h2>Un día por descubrir.</h2><p>Todavía no hay actividades cargadas para esta fecha.</p></section>}
  </div>;
}

export default function DayPage() {
  const { cityId, dayId } = useParams();
  const city = itinerary.cities.find((entry) => entry.id === cityId);
  const date = city && cityDates(city).find((entry) => daySlug(entry) === dayId);
  if (!city || !date) return <NotFound />;
  const day = city.days.find((entry) => entry.date === date) ?? { date, title: `Día en ${city.name}`, stops: [] };
  // Remount on navigation to reset both selection and Leaflet's viewport.
  return <DayView key={`${city.id}/${date}`} city={city} day={day} />;
}
