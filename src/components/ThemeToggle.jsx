// src/components/ThemeToggle.jsx
import { useEffect, useState } from 'react';

const THEMES = [
  { id: 'ocean',   label: 'Ocean'   },
  { id: 'emerald', label: 'Emerald' },
  { id: 'royal',   label: 'Royal'   },
  { id: 'light',   label: 'Light'   }, // اختياري
];

export default function ThemeToggle(){
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'ocean');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <span style={{ color:'var(--muted)', fontSize:13 }}>الثيم:</span>
      <select value={theme} onChange={e=>setTheme(e.target.value)} style={{ padding:'6px 8px' }}>
        {THEMES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
      </select>
    </div>
  );
}