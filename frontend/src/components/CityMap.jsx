import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix default Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;

const createColorIcon = (color) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12z" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="#ffffff"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'custom-leaflet-marker',
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    popupAnchor: [0, -38]
  });
};

const CATEGORY_COLORS = {
  ROAD_DAMAGE: '#ef4444',      // Red
  WATER_LEAKAGE: '#0284c7',    // Sky Blue
  STREET_LIGHT: '#f59e0b',     // Amber
  GARBAGE_WASTE: '#10b981',    // Emerald
  DRAINAGE_OVERFLOW: '#8b5cf6',// Purple
  OTHER: '#64748b'             // Slate
};

function LocationPickerEvents({ onSelectLocation }) {
  useMapEvents({
    click(e) {
      if (onSelectLocation) {
        onSelectLocation(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);
  return null;
}

export default function CityMap({
  complaints = [],
  selectedComplaint = null,
  onSelectComplaint = null,
  isPicker = false,
  pickerLocation = null,
  onSelectLocation = null,
  height = '420px',
  zoom = 13
}) {
  const defaultCenter = [17.4375, 78.4482]; // Ameerpet, Hyderabad center
  const center = pickerLocation 
    ? [pickerLocation.lat, pickerLocation.lng]
    : (selectedComplaint ? [selectedComplaint.latitude, selectedComplaint.longitude] : defaultCenter);

  return (
    <div className="map-box" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ChangeView center={center} zoom={zoom} />

        {isPicker && (
          <>
            <LocationPickerEvents onSelectLocation={onSelectLocation} />
            {pickerLocation && (
              <Marker
                position={[pickerLocation.lat, pickerLocation.lng]}
                icon={createColorIcon('#6366f1')}
              >
                <Popup>
                  <strong>Selected Location</strong>
                  <br />
                  Lat: {pickerLocation.lat.toFixed(4)}, Lng: {pickerLocation.lng.toFixed(4)}
                </Popup>
              </Marker>
            )}
          </>
        )}

        {!isPicker && complaints.map((c) => {
          if (!c.latitude || !c.longitude) return null;
          const color = CATEGORY_COLORS[c.category] || '#64748b';
          const icon = createColorIcon(color);

          return (
            <Marker
              key={c.id}
              position={[c.latitude, c.longitude]}
              icon={icon}
            >
              <Popup>
                <div style={{ minWidth: '180px', color: '#111827' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color }}>
                    #{c.id} • {c.category?.replace('_', ' ')}
                  </div>
                  <strong style={{ fontSize: '0.9rem', display: 'block', margin: '4px 0' }}>
                    {c.title}
                  </strong>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '8px' }}>
                    Status: <strong>{c.status}</strong> | Priority: <strong>{c.priority}</strong>
                  </div>
                  {onSelectComplaint && (
                    <button
                      onClick={() => onSelectComplaint(c)}
                      style={{
                        background: '#6366f1',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        width: '100%'
                      }}
                    >
                      View Complaint Details →
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
