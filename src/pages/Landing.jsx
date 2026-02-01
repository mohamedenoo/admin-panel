// src/pages/Landing.jsx
import { useNavigate } from 'react-router-dom';
export default function Landing() {
  const nav = useNavigate();
  return (
    <div style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#0f1115',color:'#fff'}}>
      <div style={{textAlign:'center'}}>
        <h1 style={{marginBottom:10}}>مرحبًا بك في نظام الحضور</h1>
        <p style={{marginBottom:20,color:'#9aa4b2'}}>اختر نوع البوابة للدخول</p>
        <div style={{display:'flex',gap:12,justifyContent:'center'}}>
          <button onClick={() => nav('/login')} style={{padding:'10px 16px'}}>لوحة الإدارة</button>
          <button onClick={() => nav('/emp')} style={{padding:'10px 16px'}}>بوابة الموظف</button>
        </div>
      </div>
    </div>
  );
}
