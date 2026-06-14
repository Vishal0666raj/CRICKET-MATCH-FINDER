import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React bundles
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

// Helper component to update map center and handle clicks
const MapEventsHandler = ({ position, onChange }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], map.getZoom());
    }
  }, [position, map]);

  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });

  return null;
};

const MapPicker = ({ value, onChange, defaultCenter = { lat: 12.9716, lng: 77.5946 } }) => {
  const position = value || defaultCenter;

  return (
    <div className="w-full h-64 relative overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventsHandler position={value} onChange={onChange} />
        {value && (
          <Marker position={[value.lat, value.lng]}>
          </Marker>
        )}
      </MapContainer>
      <div className="absolute bottom-2 left-2 z-[1000] bg-slate-900/90 px-3 py-1 rounded text-xs text-slate-300 border border-slate-700 font-mono">
        Lat: {position.lat.toFixed(4)}, Lng: {position.lng.toFixed(4)}
      </div>
    </div>
  );
};

export default MapPicker;
