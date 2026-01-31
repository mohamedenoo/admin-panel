// src/pages/EmployeeCheck.jsx
import { useEffect, useState } from 'react';
import { empApi } from '../api/empClient';
import { clearEmpToken } from '../authEmployee';

export default function EmployeeCheck(){
  const [coords, setCoords] = useState(null); // {lat,lng,accuracy}
  const [status, setStatus] = useState('جاهز');
  const [loading, setLoading] = useState(false);
  const [today, setToday] = useState([]);

  // الحصول على الإحداثيات من المتصفح
  function getPosition(){
    return new Promise((resolve, reject)=>{
      if(!navigator.geolocation) return reject(new Error('المتصفح لا يدعم GPS'));
      navigator.geolocation.getCurrentPosition(
        (pos)=>{
          const { latitude, longitude, accuracy } = pos.coords;
          resolve({ lat: latitude, lng: longitude, accuracy });
        },
        (err)=>reject(err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  // جلب سجل اليوم
  async function refreshToday(){
    try {
      const res = await empApi.get('/attendance/today');
      setToday(res.data.records || []);
    } catch {
      // تجاهل مؤقتًا
    }
  }

  // توضيح رسالة الخطأ القادمة من السيرفر
  function explainError(err){
    const data = err?.response?.data;
    // لو السيرفر رجّع كود واضح نعرضه، وإلا الرسالة العربية
    if (data?.code === 'OUTSIDE_GEOFENCE') {
      return 'أنت خارج نطاق الموقع المصرّح به.';
    }
    return data?.message || data?.code || err.message || 'خطأ غير معروف';
  }

  // تسجيل حضور
  async function handleCheckIn(){
    setLoading(true);
    setStatus('جاري تحديد الموقع...');
    try {
      const p = await getPosition();
      setCoords(p);
      setStatus('جاري تسجيل الحضور...');
      await empApi.post('/attendance/check-in', p);
      setStatus('تم تسجيل الحضور ✅');
      await refreshToday();
    } catch (e) {
      setStatus('فشل الحضور: ' + explainError(e));
    }
    setLoading(false);
  }

  // تسجيل انصراف
  async function handleCheckOut(){
    setLoading(true);
    setStatus('جاري تحديد الموقع...');
    try {
      const p = await getPosition();
      setCoords(p);
      setStatus('جاري تسجيل الانصراف...');
      await empApi.post('/attendance/check-out', p);
      setStatus('تم تسجيل الانصراف ✅');
      await refreshToday();
    } catch (e) {
      setStatus('فشل الانصراف: ' + explainError(e));
    }
    setLoading(false);
  }

  useEffect(()=>{ refreshToday(); },[]);

  return (
    <div className="container">
      <div
        className="card"
        style={{
          marginBottom:16,
          display:'flex',
          justifyContent:'space-between',
          alignItems:'center',
          gap:10
        }}
      >
        <div>
          <h2 style={{ margin:'0 0 6px' }}>بوابة الموظف – تسجيل الحضور</h2>
          <div style={{ color:'#9aa4b2' }}>{status}</div>

          {coords && (
            <div style={{ marginTop:6, fontSize:13, color:'#9aa4b2' }}>
              آخر موقع: lat {coords.lat.toFixed(6)}, lng {coords.lng.toFixed(6)} (±{Math.round(coords.accuracy)}m)
            </div>
          )}
        </div>

        <div style={{ display:'flex', gap:8 }}>
          <button className="btn" onClick={handleCheckIn} disabled={loading}>تسجيل حضور</button>
          <button className="btn" onClick={handleCheckOut} disabled={loading}>تسجيل انصراف</button>
          <button
            className="btn btn-danger"
            onClick={()=>{
              clearEmpToken();
              window.location.href='/emp/login';
            }}
          >
            خروج
          </button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop:0 }}>سجل اليوم</h3>
        <table>
          <thead>
            <tr>
              <th>الموقع</th>
              <th>وقت الحضور</th>
              <th>وقت الانصراف</th>
            </tr>
          </thead>
          <tbody>
            {today.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign:'center', color:'#9aa4b2' }}>
                  لا توجد سجلات حتى الآن
                </td>
              </tr>
            )}
            {today.map((r)=> (
              <tr key={r.attendance_id}>
                <td>{r.site_name || '-'}</td>
                <td>{r.check_in_time ? new Date(r.check_in_time).toLocaleTimeString() : '-'}</td>
                <td>{r.check_out_time ? new Date(r.check_out_time).toLocaleTimeString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}