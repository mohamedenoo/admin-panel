// src/pages/Attendance.jsx
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import dayjs from 'dayjs';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState('');
  const [from, setFrom] = useState(dayjs().format('YYYY-MM-DD'));
  const [to, setTo] = useState(dayjs().format('YYYY-MM-DD'));

  async function loadUsers(){
    const res = await api.get('/admin/users');
    setUsers(res.data.items || []);
  }

  async function loadData(){
    const qs = new URLSearchParams();
    if (from) qs.append('from', from);
    if (to) qs.append('to', to);
    if (userId) qs.append('user_id', userId);

    const res = await api.get(`/admin/attendance?${qs.toString()}`);
    setRecords(res.data.items || []);
  }

  async function exportCSV(){
    const qs = new URLSearchParams();
    if (from) qs.append('from', from);
    if (to) qs.append('to', to);
    if (userId) qs.append('user_id', userId);

    try {
      const res = await api.get(`/admin/attendance/export?${qs.toString()}`, {
        responseType: 'blob'
      });

      const dispo = res.headers['content-disposition'];
      let filename = `attendance_${Date.now()}.csv`;
      if (dispo && dispo.includes('filename=')) {
        filename = dispo.split('filename=')[1].replace(/\"/g,'').trim();
      }

      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('EXPORT CSV ERROR:', e?.response?.status, e?.response?.data);
      alert('تعذر تحميل الملف. (تحقق من التوكن/الصلاحية)');
    }
  }

  useEffect(() => { loadUsers(); }, []);
  useEffect(() => { loadData(); }, [from, to, userId]);

  return (
    <div>
      <h2>تقرير الحضور (فترة محددة)</h2>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div>
            <label>من تاريخ:</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div>
            <label>إلى تاريخ:</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} />
          </div>
          <div>
            <label>الموظف:</label>
            <select value={userId} onChange={e => setUserId(e.target.value)}>
              <option value="">الكل</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          {/* حاوية الأزرار تستجيب للموبايل وتمنع تمدّد الصفحة */}
          <div className="actions" style={{ alignItems: 'end' }}>
            <button className="btn" onClick={loadData}>بحث</button>
            <button className="btn btn-primary" onClick={exportCSV}>تصدير CSV (Excel)</button>
          </div>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#1c2130' }}>
            <th style={th}>الموظف</th>
            <th style={th}>الموقع</th>
            <th style={th}>وقت الحضور</th>
            <th style={th}>وقت الانصراف</th>
            <th style={th}>المدة (دقائق)</th>
            <th style={th}>دقة GPS (حضور)</th>
            <th style={th}>دقة GPS (انصراف)</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={i}>
              <td style={td}>{r.user_name}</td>
              <td style={td}>{r.site_name}</td>
              <td style={td}>{formatDate(r.check_in_time)}</td>
              <td style={td}>{formatDate(r.check_out_time)}</td>
              <td style={td}>{r.duration_minutes || '-'}</td>
              <td style={td}>{r.check_in_accuracy ?? '-'}</td>
              <td style={td}>{r.check_out_accuracy ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(d) {
  if (!d) return '-';
  try { return new Date(d).toLocaleString(); } catch { return '-'; }
}

const th = { border: '1px solid #212736', padding: 8 };
const td = { border: '1px solid #212736', padding: 8 };