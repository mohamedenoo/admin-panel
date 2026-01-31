// src/pages/Users.jsx
import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);

  // حقول نموذج الإضافة
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [assignedSites, setAssignedSites] = useState([]); // مصفوفة IDs (string)

  async function loadData() {
    const [usersRes, sitesRes] = await Promise.all([
      api.get('/admin/users'),
      api.get('/admin/sites'),
    ]);
    setUsers(usersRes.data.items || []);
    setSites(sitesRes.data.items || []);
  }

  // إضافة موظف جديد + ربطه بالمواقع المختارة
  async function addUser(e) {
    e.preventDefault();
    try {
      // نتأكد إننا بنبعت مصفوفة سترنجات ونشيل أي قيم فاضية
      const site_ids = (assignedSites || [])
        .map(String)
        .map(s => s.trim())
        .filter(Boolean);

      const payload = { name, email, password, role, site_ids };
      console.log('[ADD USER] payload →', payload);

      await api.post('/admin/users', payload);

      // تصفير النموذج
      setName('');
      setEmail('');
      setPassword('');
      setRole('employee');
      setAssignedSites([]);

      await loadData();
      alert('✅ تمت إضافة الموظف بنجاح');
    } catch (err) {
      console.error('ADD USER ERROR:', err?.response?.data || err?.message);
      alert('❌ خطأ في إضافة الموظف');
    }
  }

  // تفعيل/تعطيل مستخدم
  async function toggleActive(id, isActive) {
    try {
      await api.patch(`/admin/users/${id}`, { is_active: !isActive });
      await loadData();
    } catch (err) {
      console.error('TOGGLE ACTIVE ERROR:', err?.response?.data || err?.message);
      alert('❌ خطأ في تغيير الحالة');
    }
  }

  // تعديل مواقع مستخدم (من خلال prompt البسيط الحالي)
  async function updateUserSites(id, site_ids_raw) {
    try {
      const site_ids = String(site_ids_raw || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const payload = { site_ids };
      console.log('[UPDATE SITES] user:', id, 'payload:', payload);

      await api.patch(`/admin/users/${id}`, payload);
      await loadData();
      alert('✅ تم تحديث مواقع المستخدم');
    } catch (err) {
      console.error('UPDATE USER SITES ERROR:', err?.response?.data || err?.message);
      alert('❌ خطأ في تحديث مواقع المستخدم');
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // handler لاختيار المواقع في نموذج الإضافة
  function handleAddFormSitesChange(e) {
    const values = Array.from(e.target.selectedOptions).map(o => String(o.value));
    setAssignedSites(values);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>إدارة الموظفين</h2>

      {/* نموذج الإضافة */}
      <form
        onSubmit={addUser}
        style={{ marginBottom: 30, padding: 20, border: '1px solid #ccc', borderRadius: 10 }}
      >
        <h3>إضافة موظف جديد</h3>

        <div style={{ marginBottom: 10 }}>
          <label>الاسم:</label>
          <input style={{ width: '100%' }} value={name} onChange={e => setName(e.target.value)} required />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>البريد الإلكتروني:</label>
          <input style={{ width: '100%' }} value={email} onChange={e => setEmail(e.target.value)} required />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>كلمة المرور:</label>
          <input
            type="password"
            style={{ width: '100%' }}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>الوظيفة:</label>
          <select style={{ width: '100%' }} value={role} onChange={e => setRole(e.target.value)}>
            <option value="employee">موظف</option>
            <option value="admin">أدمن</option>
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>المواقع المسموح بها:</label>
          <select
            multiple
            style={{ width: '100%', height: 120 }}
            value={assignedSites}
            onChange={handleAddFormSitesChange}
          >
            {sites.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <div style={{ color: '#777', fontSize: 12, marginTop: 6 }}>
            اختر موقعًا واحدًا أو أكثر (Ctrl/⌘ + Click للتحديد المتعدد)
          </div>
        </div>

        <button style={{ padding: 10, width: '100%' }}>إضافة الموظف</button>
      </form>

      {/* جدول المستخدمين */}
      <h3>قائمة الموظفين</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
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
                <ul style={{ margin: 0, paddingInlineStart: 18 }}>
                  {(u.sites || []).map(s => (
                    <li key={s.id}>{s.name}</li>
                  ))}
                  {(u.sites || []).length === 0 && <li style={{ color: '#999' }}>— لا مواقع —</li>}
                </ul>
              </td>

              <td style={td}>
                <button onClick={() => toggleActive(u.id, u.is_active)}>
                  {u.is_active ? 'تعطيل' : 'تفعيل'}
                </button>

                <br />
                <br />

                <button
                  onClick={() =>
                    updateUserSites(
                      u.id,
                      prompt(
                        'أدخل IDs المواقع مفصولة بفواصل',
                        (u.sites || []).map(s => s.id).join(',')
                      )
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

const th = { border: '1px solid #ccc', padding: 8, textAlign: 'right' };
const td = { border: '1px solid #ccc', padding: 8, verticalAlign: 'top', textAlign: 'right' };