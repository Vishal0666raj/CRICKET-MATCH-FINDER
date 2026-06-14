import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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

// Helper component to update map view dynamically
const MapCenterUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
};

const MapView = ({ center = [12.9716, 77.5946], markers = [], zoom = 12 }) => {
  // Ensure center has valid coordinates
  const validCenter = center && center[0] && center[1] ? center : [12.9716, 77.5946];

  return (
    <div className="w-full h-full min-h-[300px] relative rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
      <MapContainer
        center={validCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCenterUpdater center={validCenter} zoom={zoom} />
        {markers.map((marker, index) => {
          if (!marker.position || !marker.position[0] || !marker.position[1]) return null;
          return (
            <Marker key={index} position={marker.position}>
              {marker.popup && (
                <Popup>
                  <div className="text-slate-800 dark:text-slate-200">
                    {marker.popup}
                  </div>
                </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
