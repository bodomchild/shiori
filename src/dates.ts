import type { City, Day, Trip } from './types/itinerary';

export interface TripDay {
  city: City;
  date: string;
  day?: Day;
}

// Calendar dates are handled in UTC so the phone's timezone cannot shift a day.
export function formatDate(date: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) {
  return new Intl.DateTimeFormat('es-AR', { ...options, timeZone: 'UTC' })
    .format(new Date(`${date}T12:00:00Z`));
}

export function daySlug(date: string) {
  const [, month, day] = date.split('-');
  return `${day}-${month}`;
}

export function cityDates(city: City): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${city.startDate}T12:00:00Z`);
  const end = new Date(`${city.endDate}T12:00:00Z`);
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

export function tripDays(trip: Trip): TripDay[] {
  return trip.cities.flatMap((city) => cityDates(city).map((date) => ({
    city,
    date,
    day: city.days.find((entry) => entry.date === date),
  })));
}

export function localToday(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function tripDayPath({ city, date }: TripDay) {
  return `/${city.id}/${daySlug(date)}`;
}

export function closestTripDay(trip: Trip, today = localToday()): { tripDay: TripDay; relation: 'before' | 'today' | 'upcoming' | 'after' } {
  const days = tripDays(trip);
  const first = days[0];
  const last = days.at(-1);
  if (!first || !last) throw new Error('El itinerario no tiene días');
  if (today < first.date) return { tripDay: first, relation: 'before' };
  if (today > last.date) return { tripDay: last, relation: 'after' };
  const current = days.find((entry) => entry.date === today);
  if (current) return { tripDay: current, relation: 'today' };
  return { tripDay: days.find((entry) => entry.date > today) ?? last, relation: 'upcoming' };
}
