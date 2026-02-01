// src/pages/Sites.jsx
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import MapPicker from '../components/MapPicker';

export default function Sites() {
  const [sites, setSites] = useState([]);
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [radius, setRadius] = useState(200);
  const [useMap, setUseMap] = useState(true); // ← خيار الخريطة افتراضيًا

  async function loadSites() {
    const res = await api.get('/admin/sites');
    setSites(res.data.items || []);
  }

  useEffect(() => { loadSites(); }, []);

  async function addSite(e) {
    e.preventDefault();
    try {
      const payload = {
        name,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        radius_meters: parseInt(radius, 10)
      };

      if (!payload.name || Number.isNaN(payload.latitude) || Number.isNaN(payload.longitude) || Number.isNaN(payload.radius_meters)) {
        return alert('الرجاء إدخال قيمة صحيحة للاسم وLat/Lng و Radius');
      }

      await api.post('/admin/sites', payload);

      // reset
      setName(''); setLat(''); setLng(''); setRadius(200);
      await loadSites();
      alert('✅ تم إضافة الموقع');
    } catch (err) {
      console.error('ADD SITE ERROR:', err?.response?.data || err?.message);
      alert('❌ خطأ في إضافة الموقع');
    }
  }

  function handleMapChange({ lat, lng, radius }) {
    setLat(String(lat));
    setLng(String(lng));
    setRadius(parseInt(radius, 10));
  }

  return (
    <div>
      <h2>إدارة المواقع</h2>

      <form onSubmit={addSite} style={{ marginBottom: 30, padding: 20, border: '1px solid #333', borderRadius: 10 }}>
        <h3>إضافة موقع جديد</h3>

        <div style={{ marginBottom: 10 }}>
          <label>اسم الموقع:</label>
          <input style={{ width: '100%' }} value={name} onChange={e => setName(e.target.value)} required />
        </div>

        {/* تبديل بين الوضعين */}
        <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontWeight: 600 }}>طريقة الإدخال:</label>
          <label><input type="radio" name="mode" checked={!useMap} onChange={() => setUseMap(false)} /> إدخال يدوي</label>
          <label><input type="radio" name="mode" checked={useMap} onChange={() => setUseMap(true)} /> اختيار من الخريطة</label>
        </div>

        {/* وضع الخريطة */}
        {useMap && (
          <div style={{ marginBottom: 10 }}>
            <MapPicker
              lat={lat ? parseFloat(lat) : undefined}
              lng={lng ? parseFloat(lng) : undefined}
              radius={radius ? parseInt(radius, 10) : 200}
              onChange={handleMapChange}
              height={380}
            />
          </div>
        )}

        {/* الوضع اليدوي (يبقى شغال حتى مع الخريطة لو تحب تعدّل رقمياً) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
          <div>
            <label>Latitude:</label>
            <input style={{ width: '100%' }} value={lat} onChange={e => setLat(e.target.value)} required />
          </div>
          <div>
            <label>Longitude:</label>
            <input style={{ width: '100%' }} value={lng} onChange={e => setLng(e.target.value)} required />
          </div>
          <div>
            <label>Radius (m):</label>
            <input type="number" style={{ width: '100%' }} value={radius} onChange={e => setRadius(e.target.value)} min={10} required />
          </div>
        </div>

        <button className="btn" style={{ width: '100%', padding: 10 }}>إضافة الموقع</button>
      </form>

      <h3>قائمة المواقع</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#1c2130' }}>
            <th style={th}>الاسم</th>
            <th style={th}>Latitude</th>
            <th style={th}>Longitude</th>
            <th style={th}>Radius</th>
          </tr>
        </thead>
        <tbody>
          {sites.map(s => (
            <tr key={s.id}>
              <td style={td}>{s.name}</td>
              <td style={td}>{s.latitude}</td>
              <td style={td}>{s.longitude}</td>
              <td style={td}>{s.radius_meters}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = { border: '1px solid #212736', padding: 8, textAlign: 'right' };
const td = { border: '1px solid #212736', padding: 8, textAlign: 'right' };