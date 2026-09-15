const LAST_DAY_KEY = 'shiori:last-day-v1';
const COMPLETED_STOPS_KEY = 'shiori:completed-stops-v1';

export interface StoredDay {
  cityId: string;
  date: string;
}

function readValue(key: string): unknown {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function writeValue(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The itinerary still works if storage is blocked or full.
  }
}

export function loadLastOpenedDay(): StoredDay | null {
  const value = readValue(LAST_DAY_KEY);
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<StoredDay>;
  return typeof candidate.cityId === 'string' && typeof candidate.date === 'string'
    ? { cityId: candidate.cityId, date: candidate.date }
    : null;
}

export function saveLastOpenedDay(day: StoredDay) {
  writeValue(LAST_DAY_KEY, day);
}

export function loadCompletedStopIds(): Set<string> {
  const value = readValue(COMPLETED_STOPS_KEY);
  return new Set(Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : []);
}

export function saveCompletedStopIds(ids: Set<string>) {
  writeValue(COMPLETED_STOPS_KEY, [...ids]);
}
