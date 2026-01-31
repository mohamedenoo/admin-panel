// src/components/Navbar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { clearToken } from '../auth';
import ThemeToggle from './ThemeToggle';

export default function Navbar(){
  const nav = useNavigate();
  const logout = () => { clearToken(); nav('/login'); };
  const linkClass = ({isActive}) => `nav-link${isActive ? ' active' : ''}`;

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <nav className="nav-links">
          <NavLink to="/dashboard" className={linkClass}>لوحة التحكم</NavLink>
          <NavLink to="/sites" className={linkClass}>المواقع</NavLink>
          <NavLink to="/users" className={linkClass}>الموظفين</NavLink>
          <NavLink to="/attendance" className={linkClass}>الحضور</NavLink>
        </nav>

        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <ThemeToggle />
          <button className="btn btn-danger" onClick={logout}>تسجيل الخروج</button>
        </div>
      </div>
    </header>
  );
}