// src/components/MapPicker.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// أيقونة افتراضية للماركر (تناسب حِزم Vite)
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

/**
 * MapPicker
 * props:
 *  - lat, lng, radius: قيم حالية (number) — قابلة للتغيير
 *  - onChange({lat, lng, radius})
 *  - height (px) — افتراضي 360
 */
export default function MapPicker({ lat, lng, radius, onChange, height = 360 }) {
  const [pos, setPos] = useState([lat || 21.4858, lng || 39.1925]); // افتراضي جدة
  const [rad, setRad] = useState(radius || 300);

  useEffect(() => { if (typeof lat === 'number' && typeof lng === 'number') setPos([lat, lng]); }, [lat, lng]);
  useEffect(() => { if (typeof radius === 'number') setRad(radius); }, [radius]);

  const DraggableMarker = () => {
    const markerRef = useRef(null);
    useMapEvents({
      click(e) {
        const { latlng } = e;
        setPos([latlng.lat, latlng.lng]);
        onChange?.({ lat: latlng.lat, lng: latlng.lng, radius: rad });
      }
    });
    const eventHandlers = useMemo(() => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const ll = marker.getLatLng();
          setPos([ll.lat, ll.lng]);
          onChange?.({ lat: ll.lat, lng: ll.lng, radius: rad });
        }
      },
    }), [rad, onChange]);

    return (
      <Marker
        draggable
        eventHandlers={eventHandlers}
        position={pos}
        ref={markerRef}
      />
    );
  };

  function handleRadiusInput(v) {
    const val = Number(v);
    if (!Number.isNaN(val) && val > 0) {
      setRad(val);
      onChange?.({ lat: pos[0], lng: pos[1], radius: val });
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) return alert('المتصفح لا يدعم تحديد الموقع');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const { latitude, longitude, accuracy } = p.coords;
        const rr = Math.max(rad, Math.round(accuracy)); // وسّع الدائرة لدقة GPS إن لزم
        setPos([latitude, longitude]);
        setRad(rr);
        onChange?.({ lat: latitude, lng: longitude, radius: rr });
      },
      (err) => alert('تعذر تحديد الموقع: ' + err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  return (
    <div style={{ border: '1px solid #333', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', background: '#121820' }}>
        <div>Lat: <b>{pos[0].toFixed(6)}</b></div>
        <div>Lng: <b>{pos[1].toFixed(6)}</b></div>
        <div style={{ marginLeft: 'auto' }} />
        <label>Radius (m): </label>
        <input
          type="number"
          min={10}
          value={rad}
          onChange={(e) => handleRadiusInput(e.target.value)}
          style={{ width: 120 }}
        />
        <button type="button" onClick={useMyLocation}>استخدام موقعي</button>
      </div>

      <MapContainer
        center={pos}
        zoom={15}
        style={{ width: '100%', height }}
        scrollWheelZoom
      >
        <TileLayer
          // بلا مفاتيح — بلاط مفتوح (OSM)
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DraggableMarker />
        <Circle center={pos} radius={rad} pathOptions={{ color: '#3ba9ff', fillColor: '#3ba9ff', fillOpacity: 0.15 }} />
      </MapContainer>
    </div>
  );
}
