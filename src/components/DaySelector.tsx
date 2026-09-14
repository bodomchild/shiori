import { useNavigate } from 'react-router-dom';
import { itinerary } from '../data/itinerary';
import { cityDates, daySlug, formatDate } from '../dates';
import type { City } from '../types/itinerary';

export default function DaySelector({ city, date }: { city: City; date: string }) {
  const navigate = useNavigate();
  return <div className="day-selectors">
    <label><span>Ciudad</span><select value={city.id} onChange={(event) => {
      const next = itinerary.cities.find((entry) => entry.id === event.target.value)!;
      navigate(`/${next.id}/${daySlug(next.days[0]?.date ?? next.startDate)}`);
    }}>{itinerary.cities.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select></label>
    <label><span>Día</span><select value={date} onChange={(event) => navigate(`/${city.id}/${daySlug(event.target.value)}`)}>
      {cityDates(city).map((entry) => <option key={entry} value={entry}>{formatDate(entry, { weekday: 'short', day: 'numeric', month: 'short' })}</option>)}
    </select></label>
  </div>;
}
