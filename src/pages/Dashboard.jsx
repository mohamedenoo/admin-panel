// src/pages/Dashboard.jsx
import { Link } from 'react-router-dom';

export default function Dashboard(){
  return (
    <div>
      <h1 style={{ margin: 0, marginBottom: 8 }}>لوحة التحكم</h1>
      <p style={{ color: '#9aa4b2', marginTop: 0 }}>
        أهلاً بك في نظام الحضور والانصراف.
      </p>

      <div className="grid" style={{ marginTop: 20 }}>
        <ActionCard title="إدارة المواقع" to="/sites" />
        <ActionCard title="إدارة الموظفين" to="/users" />
        <ActionCard title="تقرير الحضور" to="/attendance" />
      </div>
    </div>
  );
}

function ActionCard({ title, to }){
  return (
    <Link
      to={to}
      className="card"
      style={{ textDecoration:'none', color:'inherit' }}
    >
      <h3 style={{ marginTop:0 }}>{title}</h3>
      <p style={{ color:'#9aa4b2', marginBottom:0 }}>اذهب إلى {title}</p>
    </Link>
  );
}
``