import { useState } from 'react';
import { empApi } from '../api/empClient';
import { saveEmpToken } from '../authEmployee';
import { useNavigate } from 'react-router-dom';

export default function EmployeeLogin(){
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(e){
    e.preventDefault(); setError('');
    try{
      const res = await empApi.post('/auth/login', { email, password });
      saveEmpToken(res.data.access_token);
      nav('/emp');
    }catch(err){
      const msg = err?.response?.data?.message || 'تعذر تسجيل الدخول';
      setError(msg);
    }
  }

  return (
    <div className="container main">
      <div className="card" style={{ margin: '80px auto 0', maxWidth: 420 }}>
        <h2>تسجيل دخول الموظف</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom:10 }}>
            <label>البريد الإلكتروني:</label>
            <input style={{ width:'100%' }} value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div style={{ marginBottom:10 }}>
            <label>كلمة المرور:</label>
            <input type="password" style={{ width:'100%' }} value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          {error && <div style={{ color:'tomato', marginBottom:8 }}>{error}</div>}
          <button className="btn" style={{ width:'100%' }}>دخول</button>
        </form>
      </div>
    </div>
  );
}