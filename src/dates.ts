import type { City } from './types/itinerary';

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
