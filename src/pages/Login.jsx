// src/pages/Login.jsx
import { useState } from 'react';
import { api } from '../api/client';
import { saveToken } from '../auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const nav = useNavigate();
  
  console.log('VITE_API_BASE_URL =', import.meta.env.VITE_API_BASE_URL);
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');

  async function handleLogin(e) {
  e.preventDefault();
  setError('');

  try {
    const res = await api.post('/auth/login', { email, password });
    saveToken(res.data.access_token);
    nav('/dashboard');
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'خطأ في تسجيل الدخول';
    setError(msg);
    console.error('LOGIN ERROR:', err?.response?.status, err?.response?.data);
  }
}


  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 20, border: "1px solid #ccc", borderRadius: 10 }}>
      <h2>تسجيل دخول الأدمن</h2>

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 10 }}>
          <label>البريد الإلكتروني:</label>
          <input
            style={{ width: "100%", padding: 8 }}
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>كلمة المرور:</label>
          <input
            type="password"
            style={{ width: "100%", padding: 8 }}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        {error && <div style={{ color: "red" }}>{error}</div>}

        <button style={{ width: "100%", padding: 10 }}>دخول</button>
      </form>
    </div>
  );
}