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

export function japanToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function tripDayPath({ city, date }: TripDay) {
  return `/${city.id}/${daySlug(date)}`;
}

export function closestTripDay(trip: Trip, today = japanToday()): { tripDay: TripDay; relation: 'before' | 'today' | 'after' } {
  const days = tripDays(trip);
  const first = days[0];
  const last = days.at(-1);
  if (!first || !last) throw new Error('El itinerario no tiene días');
  if (today < first.date) return { tripDay: first, relation: 'before' };
  if (today > last.date) return { tripDay: last, relation: 'after' };
  return { tripDay: days.find((entry) => entry.date === today) ?? first, relation: 'today' };
}
