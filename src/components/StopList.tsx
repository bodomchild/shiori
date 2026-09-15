import type { ItineraryStop } from '../types/itinerary';

interface Props {
  stops: ItineraryStop[];
  selectedStopId: string | null;
  completedStopIds: Set<string>;
  onSelect: (id: string) => void;
  onToggleCompleted: (id: string) => void;
}

function googleMapsUrl(stop: ItineraryStop) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.coordinates!.join(','))}`;
}

export default function StopList({ stops, selectedStopId, completedStopIds, onSelect, onToggleCompleted }: Props) {
  return <ol className="stop-list">
    {stops.map((stop, index) => {
      const isSelected = selectedStopId === stop.id;
      const isCompleted = completedStopIds.has(stop.id);
      return <li key={stop.id}>
        <div id={`stop-${stop.id}`} className={`stop-card${isSelected ? ' is-selected' : ''}${isCompleted ? ' is-completed' : ''}`}>
          <button type="button" className="stop-select" aria-pressed={isSelected} onClick={() => onSelect(stop.id)}>
            <span className="stop-number" aria-hidden="true">{index + 1}</span>
            <span className="stop-content">
              <span className="stop-meta">{stop.startTime ? <time>{stop.startTime}</time> : <span>Sin horario</span>}<span>·</span><span>{stop.category}</span>{stop.duration !== undefined && <><span>·</span><span>{stop.duration} min</span></>}</span>
              <span className="stop-name">{stop.name}</span>
              {stop.optional && <span className="optional-badge">Opcional</span>}
              {stop.notes && <span className="stop-note">{stop.notes}</span>}
              {isSelected && stop.address && <span className="stop-address">{stop.address}</span>}
              {isSelected && <span className="selected-label">{stop.coordinates ? 'Seleccionada en el mapa ↗' : 'Ubicación por confirmar'}</span>}
            </span>
          </button>
          <div className="stop-actions">
            <label className="complete-toggle">
              <input type="checkbox" checked={isCompleted} onChange={() => onToggleCompleted(stop.id)} />
              <span>{isCompleted ? 'Realizada' : 'Marcar realizada'}</span>
            </label>
            {stop.coordinates && <a className="maps-link" href={googleMapsUrl(stop)} target="_blank" rel="noreferrer" aria-label={`Abrir ${stop.name} en Google Maps`}>Abrir en Google Maps <span aria-hidden="true">↗</span></a>}
          </div>
        </div>
      </li>;
    })}
  </ol>;
}
