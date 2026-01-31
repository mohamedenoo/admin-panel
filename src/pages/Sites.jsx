// src/pages/Sites.jsx
import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Sites() {
  const [sites, setSites] = useState([]);
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [radius, setRadius] = useState(100);
  const [loading, setLoading] = useState(false);

  async function loadSites() {
    const res = await api.get('/admin/sites');
    setSites(res.data.items);
  }

  async function addSite(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/admin/sites', {
        name,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        radius_meters: parseInt(radius)
      });
      setName('');
      setLat('');
      setLng('');
      setRadius(100);
      await loadSites();
    } catch (err) {
      alert('خطأ في إضافة الموقع');
    }

    setLoading(false);
  }

  useEffect(() => { loadSites(); }, []);

  return (
    <div>
      <h2>إدارة المواقع</h2>

      <form
        onSubmit={addSite}
        style={{ marginBottom: 30, padding: 20, border: '1px solid #333', borderRadius: 10 }}
      >
        <h3>إضافة موقع جديد</h3>

        <div style={{ marginBottom: 10 }}>
          <label>اسم الموقع:</label>
          <input style={{ width: '100%' }} value={name} onChange={e => setName(e.target.value)} required />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Latitude:</label>
          <input style={{ width: '100%' }} value={lat} onChange={e => setLat(e.target.value)} required />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Longitude:</label>
          <input style={{ width: '100%' }} value={lng} onChange={e => setLng(e.target.value)} required />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Radius (meters):</label>
          <input
            type="number"
            style={{ width: '100%' }}
            value={radius}
            onChange={e => setRadius(e.target.value)}
            required
          />
        </div>

        <button className="btn btn-brand" disabled={loading} style={{ width: '100%', padding: 10 }}>
          {loading ? 'جاري الإضافة...' : 'إضافة الموقع'}
        </button>
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

const th = { border: '1px solid #212736', padding: 8 };
const td = { border: '1px solid #212736', padding: 8 };