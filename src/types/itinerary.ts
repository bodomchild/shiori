export interface Trip {
  name: string;
  cities: City[];
}

export interface City {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  days: Day[];
}

export interface Day {
  date: string; // YYYY-MM-DD, fecha local de Japón
  stops: ItineraryStop[];
}

export interface ItineraryStop {
  id: string;
  name: string;
  coordinates: [latitude: number, longitude: number];
  startTime: string; // HH:mm, hora local de Japón
  duration?: number; // minutos
  category: 'visita' | 'comida' | 'traslado' | 'descanso';
  notes?: string;
  optional: boolean;
  address?: string;
}
