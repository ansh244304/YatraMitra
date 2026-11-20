import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

function FitMapToLocations({ locations }) {
  const map = useMap();
  useEffect(() => {
    const validLocations = locations.filter(
      (location) => Number.isFinite(location.lat) && Number.isFinite(location.lon)
    );
    if (validLocations.length === 0) return;
    if (validLocations.length === 1) {
      map.setView([validLocations[0].lat, validLocations[0].lon], 13);
      return;
    }
    const bounds = validLocations.map((location) => [location.lat, location.lon]);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
  }, [locations, map]);
  return null;
}

function MapView({
  locations = [],
  routeGeometry = null,
  showConnectionLine = true,
  connectionLineStyle,
}) {
  const validLocations = locations.filter(
    (location) => Number.isFinite(location.lat) && Number.isFinite(location.lon)
  );

  return (
    <div className="map-wrapper">
      <MapContainer
        center={[28.6791, 77.2075]}
        zoom={10}
        scrollWheelZoom={true}
        className="map-container"
      >
        <FitMapToLocations locations={validLocations} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {routeGeometry?.length > 0 ? (
          <Polyline positions={routeGeometry.map(([lon, lat]) => [lat, lon])} />
        ) : (
          showConnectionLine && validLocations.length > 1 && (
            <Polyline positions={validLocations.map((location) => [location.lat, location.lon])} pathOptions={connectionLineStyle || {}} />
          )
        )}
        {validLocations.map((location) => (
          <Marker
            key={`${location.name}-${location.lat}-${location.lon}`}
            position={[location.lat, location.lon]}
          >
            <Popup>
              <strong>{location.role || 'Location'}</strong>
              <br />
              {location.name}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapView;
