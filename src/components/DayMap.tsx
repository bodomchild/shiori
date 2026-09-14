import { useEffect, useState } from 'react';
import { divIcon, latLngBounds } from 'leaflet';
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet';
import type { ItineraryStop } from '../types/itinerary';

interface Props {
  stops: ItineraryStop[];
  selectedStop: ItineraryStop | null;
  onSelect: (id: string) => void;
}

function MapViewport({ stops, selectedStop }: Omit<Props, 'onSelect'>) {
  const map = useMap();
  useEffect(() => {
    if (selectedStop) map.setView(selectedStop.coordinates, Math.max(map.getZoom(), 15), { animate: false });
    else map.fitBounds(latLngBounds(stops.map((entry) => entry.coordinates)), { padding: [38, 38], maxZoom: 15, animate: false });
  }, [map, stops, selectedStop]);

  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize({ animate: false }));
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);

  return <button type="button" className="map-reset" onClick={() => map.fitBounds(latLngBounds(stops.map((stop) => stop.coordinates)), { padding: [38, 38], maxZoom: 15, animate: false })}>Ver todo el día</button>;
}

export default function DayMap({ stops, selectedStop, onSelect }: Props) {
  const [tileError, setTileError] = useState(false);
  return <div id="day-map" className="map-wrapper">
    <MapContainer center={stops[0].coordinates} zoom={13} scrollWheelZoom={false} className="day-map" zoomAnimation={false} markerZoomAnimation={false}>
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' eventHandlers={{ tileerror: () => setTileError(true), tileload: () => setTileError(false) }} />
      <MapViewport stops={stops} selectedStop={selectedStop} />
      {stops.map((stop, index) => <Marker key={stop.id} position={stop.coordinates} title={`${index + 1}. ${stop.name}`} alt={`${index + 1}. ${stop.name}`} zIndexOffset={selectedStop?.id === stop.id ? 1000 : 0} icon={divIcon({
        className: `stop-marker ${selectedStop?.id === stop.id ? 'is-selected' : ''}`,
        html: `<span>${index + 1}</span>`,
        iconSize: [44, 44], iconAnchor: [22, 22], tooltipAnchor: [0, -22],
      })} eventHandlers={{ click: () => onSelect(stop.id) }}><Tooltip direction="top">{stop.name}</Tooltip></Marker>)}
    </MapContainer>
    {tileError && <p role="status" className="map-error">No se pudo cargar parte del mapa. Revisá la conexión; la lista sigue disponible.</p>}
  </div>;
}
