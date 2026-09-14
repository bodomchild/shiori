import type { Trip } from '../types/itinerary';

// Datos MOCK. El año 2026 es provisional. Horarios, notas y coordenadas son
// ejemplos aproximados; no fueron extraídos del documento original.
// "Viaje Japon" es READ-ONLY: nunca escribir, reorganizar ni sincronizarlo.
export const itinerary: Trip = {
  name: 'Japón · Lore & Fer',
  cities: [
    {
      id: 'osaka', name: 'Osaka', startDate: '2026-10-13', endDate: '2026-10-16',
      days: [{
        date: '2026-10-14',
        stops: [
          { id: 'osaka-castle', name: 'Castillo de Osaka', coordinates: [34.6873, 135.5262], startTime: '09:00', duration: 120, category: 'visita', notes: 'Empezar tranquilos por los jardines y recorrer el parque.', optional: false, address: '1-1 Osakajo, Chuo-ku, Osaka' },
          { id: 'kuromon', name: 'Mercado Kuromon', coordinates: [34.6653, 135.5063], startTime: '12:00', duration: 90, category: 'comida', notes: 'Almorzar algo al paso. Dejar lugar para probar un poco de todo.', optional: false, address: '2 Chome Nipponbashi, Chuo-ku, Osaka' },
          { id: 'namba-yasaka', name: 'Namba Yasaka', coordinates: [34.6616, 135.4967], startTime: '14:00', duration: 45, category: 'visita', notes: 'Una parada para conocer el santuario de la cabeza de león.', optional: false },
          { id: 'shinsaibashi', name: 'Paseo por Shinsaibashi', coordinates: [34.673, 135.5012], startTime: '16:00', duration: 60, category: 'visita', notes: 'Si quedan ganas: caminar, mirar tiendas y tomar un café.', optional: true },
          { id: 'dotonbori', name: 'Dotonbori al atardecer', coordinates: [34.6687, 135.5013], startTime: '18:00', duration: 120, category: 'comida', notes: 'Luces sobre el canal, la foto del Glico y algo rico para cenar.', optional: false },
        ],
      }],
    },
    {
      id: 'kyoto', name: 'Kioto', startDate: '2026-10-17', endDate: '2026-10-20',
      days: [{
        date: '2026-10-18',
        stops: [
          { id: 'kiyomizu', name: 'Kiyomizu-dera', coordinates: [34.9949, 135.785], startTime: '08:00', duration: 90, category: 'visita', notes: 'Salir temprano y disfrutar la vista de la ciudad.', optional: false, address: '1-294 Kiyomizu, Higashiyama-ku, Kyoto' },
          { id: 'sannenzaka', name: 'Sannenzaka y Ninenzaka', coordinates: [34.9956, 135.7809], startTime: '10:00', duration: 90, category: 'visita', notes: 'Bajar sin apuro por las calles tradicionales.', optional: false },
          { id: 'higashiyama-lunch', name: 'Almuerzo en Higashiyama', coordinates: [35.0001, 135.778], startTime: '12:00', duration: 60, category: 'comida', notes: 'Punto de encuentro de ejemplo; elegir un lugar en el barrio.', optional: false },
          { id: 'yasaka', name: 'Santuario Yasaka', coordinates: [35.0037, 135.7785], startTime: '14:00', duration: 60, category: 'visita', optional: false },
          { id: 'maruyama', name: 'Una pausa en Maruyama', coordinates: [35.0036, 135.7809], startTime: '15:15', duration: 45, category: 'descanso', notes: 'Un rato de parque si el día acompaña.', optional: true },
          { id: 'gion', name: 'Caminar por Gion', coordinates: [35.0015, 135.775], startTime: '17:00', duration: 90, category: 'visita', notes: 'Terminar el día recorriendo las calles del barrio.', optional: false },
        ],
      }],
    },
    { id: 'kanazawa', name: 'Kanazawa', startDate: '2026-10-21', endDate: '2026-10-22', days: [] },
    { id: 'kawaguchiko', name: 'Kawaguchiko', startDate: '2026-10-23', endDate: '2026-10-24', days: [] },
    { id: 'hakone', name: 'Hakone', startDate: '2026-10-25', endDate: '2026-10-26', days: [] },
    { id: 'tokyo', name: 'Tokio', startDate: '2026-10-27', endDate: '2026-11-04', days: [] },
  ],
};
