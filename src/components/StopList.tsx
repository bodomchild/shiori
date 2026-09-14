import type { ItineraryStop } from '../types/itinerary';

interface Props {
  stops: ItineraryStop[];
  selectedStopId: string | null;
  onSelect: (id: string) => void;
}

export default function StopList({ stops, selectedStopId, onSelect }: Props) {
  return <ol className="stop-list">
    {stops.map((stop, index) => <li key={stop.id}>
      <button id={`stop-${stop.id}`} className={`stop-card ${selectedStopId === stop.id ? 'is-selected' : ''}`} aria-pressed={selectedStopId === stop.id} onClick={() => onSelect(stop.id)}>
        <span className="stop-number" aria-hidden="true">{index + 1}</span>
        <span className="stop-content">
          <span className="stop-meta">{stop.startTime ? <time>{stop.startTime}</time> : <span>Sin horario</span>}<span>·</span><span>{stop.category}</span>{stop.duration !== undefined && <><span>·</span><span>{stop.duration} min</span></>}</span>
          <span className="stop-name">{stop.name}</span>
          {stop.optional && <span className="optional-badge">Opcional</span>}
          {stop.notes && <span className="stop-note">{stop.notes}</span>}
          {selectedStopId === stop.id && stop.address && <span className="stop-address">{stop.address}</span>}
          {selectedStopId === stop.id && <span className="selected-label">{stop.coordinates ? 'Seleccionada en el mapa ↗' : 'Ubicación por confirmar'}</span>}
        </span>
      </button>
    </li>)}
  </ol>;
}
