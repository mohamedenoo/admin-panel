// src/pages/Users.jsx
import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [assignedSites, setAssignedSites] = useState([]);

  async function loadData() {
    const usersRes = await api.get('/admin/users');
    const sitesRes = await api.get('/admin/sites');

    setUsers(usersRes.data.items);
    setSites(sitesRes.data.items);
  }

  async function addUser(e) {
    e.preventDefault();
    try {
      await api.post('/admin/users', {
        name,
        email,
        password,
        role,
        site_ids: assignedSites
      });

      setName('');
      setEmail('');
      setPassword('');
      setRole('employee');
      setAssignedSites([]);

      await loadData();
    } catch (err) {
      alert('خطأ في إضافة الموظف');
    }
  }

  async function toggleActive(id, isActive) {
    await api.patch(`/admin/users/${id}`, { is_active: !isActive });
    await loadData();
  }

  async function updateUserSites(id, site_ids_raw) {
    if (!site_ids_raw) return;
    const site_ids = site_ids_raw.split(',').map(s => s.trim());
    await api.patch(`/admin/users/${id}`, { site_ids });
    await loadData();
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>إدارة الموظفين</h2>

      {/* form */}
      <form onSubmit={addUser} style={{ marginBottom: 30, padding: 20, border: "1px solid #ccc", borderRadius: 10 }}>
        <h3>إضافة موظف جديد</h3>

        <div style={{ marginBottom: 10 }}>
          <label>الاسم:</label>
          <input style={{ width: "100%" }} value={name} onChange={e => setName(e.target.value)} required />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>البريد الإلكتروني:</label>
          <input style={{ width: "100%" }} value={email} onChange={e => setEmail(e.target.value)} required />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>كلمة المرور:</label>
          <input type="password" style={{ width: "100%" }} value={password} onChange={e => setPassword(e.target.value)} required />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>الوظيفة:</label>
          <select style={{ width: "100%" }} value={role} onChange={e => setRole(e.target.value)}>
            <option value="employee">موظف</option>
            <option value="admin">أدمن</option>
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>المواقع المسموح بها:</label>
          <select
            multiple
            style={{ width: "100%", height: 100 }}
            value={assignedSites}
            onChange={e =>
              setAssignedSites([...e.target.selectedOptions].map(o => o.value))
            }
          >
            {sites.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <button style={{ padding: 10, width: "100%" }}>إضافة الموظف</button>
      </form>

      {/* USERS TABLE */}
      <h3>قائمة الموظفين</h3>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#eee" }}>
            <th style={th}>الاسم</th>
            <th style={th}>البريد</th>
            <th style={th}>الصلاحية</th>
            <th style={th}>الحالة</th>
            <th style={th}>المواقع</th>
            <th style={th}>تحكم</th>
          </tr>
        </thead>

        <tbody>
          {users.map(u => (
            <tr key={u.id}>

              <td style={td}>{u.name}</td>
              <td style={td}>{u.email}</td>
              <td style={td}>{u.role}</td>
              <td style={td}>{u.is_active ? 'فعال' : 'معطّل'}</td>

              <td style={td}>
                <ul>
                  {(u.sites || []).map(s => (
                    <li key={s.id}>{s.name}</li>
                  ))}
                </ul>
              </td>

              <td style={td}>
                <button onClick={() => toggleActive(u.id, u.is_active)}>
                  {u.is_active ? 'تعطيل' : 'تفعيل'}
                </button>

                <br /><br />

                <button
                  onClick={() =>
                    updateUserSites(
                      u.id,
                      prompt("أدخل IDs المواقع مفصولة بفواصل", (u.sites || []).map(s => s.id).join(','))
                    )
                  }
                >
                  تعديل مواقع
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = { border: "1px solid #ccc", padding: 8 };
const td = { border: "1px solid #ccc", padding: 8 };
``