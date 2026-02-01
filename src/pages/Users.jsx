// src/pages/Users.jsx
import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);

  // ————— نموذج الإضافة —————
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [assignedSites, setAssignedSites] = useState([]); // IDs كمصفوفة

  // ————— مودال تعديل "البيانات" —————
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState('employee');

  // ————— مودال تعديل "المواقع" —————
  const [editSitesOpen, setEditSitesOpen] = useState(false);
  const [editSitesTarget, setEditSitesTarget] = useState(null);
  const [editSitesSelected, setEditSitesSelected] = useState([]); // IDs

  async function loadData() {
    const [usersRes, sitesRes] = await Promise.all([
      api.get('/admin/users'),
      api.get('/admin/sites'),
    ]);
    setUsers(usersRes.data.items || []);
    setSites(sitesRes.data.items || []);
  }

  useEffect(() => { loadData(); }, []);

  // ========== إضافة موظف ==========
  async function addUser(e) {
    e.preventDefault();
    try {
      const site_ids = (assignedSites || [])
        .map(String).map(s => s.trim()).filter(Boolean);

      await api.post('/admin/users', { name, email, password, role, site_ids });

      setName(''); setEmail(''); setPassword('');
      setRole('employee'); setAssignedSites([]);
      await loadData();
      alert('✅ تمت إضافة الموظف');
    } catch (err) {
      console.error('ADD USER ERROR:', err?.response?.data || err?.message);
      alert('❌ خطأ في إضافة الموظف');
    }
  }

  function handleAddFormSitesChange(e) {
    const values = Array.from(e.target.selectedOptions).map(o => String(o.value));
    setAssignedSites(values);
  }

  // ========== تعطيل/تفعيل ==========
  async function toggleActive(id, isActive) {
    try {
      await api.patch(`/admin/users/${id}`, { is_active: !isActive });
      await loadData();
    } catch (err) {
      console.error('TOGGLE ACTIVE ERROR:', err?.response?.data || err?.message);
      alert('❌ خطأ في تغيير الحالة');
    }
  }

  // ========== تعديل بيانات (Modal) ==========
  function openEdit(u) {
    setEditTarget(u);
    setEditName(u.name || '');
    setEditEmail(u.email || '');
    setEditPassword('');
    setEditRole(u.role || 'employee');
    setEditOpen(true);
  }
  function closeEdit() { setEditOpen(false); setEditTarget(null); }

  async function saveEdit(e) {
    e.preventDefault();
    try {
      if (!editTarget) return;
      const payload = { name: editName, email: editEmail, role: editRole };
      if (editPassword && editPassword.trim()) payload.password = editPassword.trim();

      await api.patch(`/admin/users/${editTarget.id}`, payload);
      await loadData();
      closeEdit();
      alert('✅ تم تعديل بيانات الموظف');
    } catch (err) {
      console.error('SAVE EDIT ERROR:', err?.response?.data || err?.message);
      alert('❌ خطأ في تعديل بيانات الموظف');
    }
  }

  // ========== تعديل مواقع (Modal) ==========
  function openEditSites(u) {
    setEditSitesTarget(u);
    setEditSitesSelected((u.sites || []).map(s => s.id)); // تعبئة مبدئية
    setEditSitesOpen(true);
  }

  async function saveEditSites(e) {
    e.preventDefault();
    try {
      await api.patch(`/admin/users/${editSitesTarget.id}`, { site_ids: editSitesSelected });
      await loadData();
      setEditSitesOpen(false);
      alert('✅ تم تحديث المواقع');
    } catch (err) {
      console.error('UPDATE SITES ERROR:', err?.response?.data || err?.message);
      alert('❌ خطأ في تحديث المواقع');
    }
  }

  // ========== حذف نهائي (مخفي للأدمن) ==========
  async function deleteUser(id, nameOrEmail, role) {
    if (role === 'admin') return alert('لا يمكن حذف حساب أدمن من الواجهة. عطّل بدلًا من الحذف.');
    const ok = confirm(`هل أنت متأكد من الحذف النهائي؟\n${nameOrEmail}\nلا يمكن التراجع.`);
    if (!ok) return;

    try {
      await api.delete(`/admin/users/${id}`);
      await loadData();
      alert('✅ تم حذف المستخدم');
    } catch (err) {
      console.error('DELETE USER ERROR:', err?.response?.data || err?.message);
      alert('❌ تعذر حذف المستخدم');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>إدارة الموظفين</h2>

      {/* ——— نموذج الإضافة ——— */}
      <form onSubmit={addUser} style={{ marginBottom: 30, padding: 20, border: '1px solid #ccc', borderRadius: 10 }}>
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
          <input type="password" style={{ width: '100%' }} value={password} onChange={e => setPassword(e.target.value)} required />
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
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <div style={{ color: '#777', fontSize: 12, marginTop: 6 }}>
            اختر موقعًا واحدًا أو أكثر (Ctrl/⌘ + Click للتحديد المتعدد)
          </div>
        </div>

        <button style={{ padding: 10, width: '100%' }}>إضافة الموظف</button>
      </form>

      {/* ——— جدول المستخدمين ——— */}
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
                  {(u.sites || []).map(s => <li key={s.id}>{s.name}</li>)}
                  {(u.sites || []).length === 0 && <li style={{ color: '#999' }}>— لا مواقع —</li>}
                </ul>
              </td>
              <td style={td}>
                <button onClick={() => toggleActive(u.id, u.is_active)}>
                  {u.is_active ? 'تعطيل' : 'تفعيل'}
                </button>
                <br /><br />
                <button onClick={() => openEditSites(u)}>تعديل مواقع</button>
                <br /><br />
                <button onClick={() => openEdit(u)}>تعديل بيانات</button>
                <br /><br />
                {u.role !== 'admin' && (
                  <button
                    style={{ background: '#7a0b0b', color: '#fff' }}
                    onClick={() => deleteUser(u.id, u.email || u.name, u.role)}
                  >
                    حذف نهائي
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ——— مودال تعديل البيانات ——— */}
      {editOpen && (
        <div style={modalBackdrop}>
          <div style={modalBox}>
            <h3 style={{ marginTop: 0 }}>تعديل بيانات الموظف</h3>
            <form onSubmit={saveEdit}>
              <div style={{ marginBottom: 10 }}>
                <label>الاسم:</label>
                <input style={{ width: '100%' }} value={editName} onChange={e => setEditName(e.target.value)} required />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label>البريد:</label>
                <input style={{ width: '100%' }} value={editEmail} onChange={e => setEditEmail(e.target.value)} required />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label>كلمة المرور (اتركها فارغة إن لم تُرِد تغييرها):</label>
                <input type="password" style={{ width: '100%' }} value={editPassword} onChange={e => setEditPassword(e.target.value)} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label>الصلاحية:</label>
                <select style={{ width: '100%' }} value={editRole} onChange={e => setEditRole(e.target.value)}>
                  <option value="employee">موظف</option>
                  <option value="admin">أدمن</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={closeEdit}>إلغاء</button>
                <button type="submit">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ——— مودال تعديل المواقع ——— */}
      {editSitesOpen && (
        <div style={modalBackdrop}>
          <div style={modalBox}>
            <h3 style={{ marginTop: 0 }}>تعديل مواقع المستخدم</h3>
            <form onSubmit={saveEditSites}>
              <div style={{ marginBottom: 10 }}>
                <label>المواقع المسموح بها:</label>
                <select
                  multiple
                  style={{ width: '100%', height: 150 }}
                  value={editSitesSelected}
                  onChange={e => setEditSitesSelected(
                    Array.from(e.target.selectedOptions).map(o => o.value)
                  )}
                >
                  {sites.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setEditSitesOpen(false)}>إلغاء</button>
                <button type="submit">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ——— أنماط بسيطة ———
const th = { border: '1px solid #ccc', padding: 8, textAlign: 'right' };
const td = { border: '1px solid #ccc', padding: 8, verticalAlign: 'top', textAlign: 'right' };

const modalBackdrop = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};
const modalBox = {
  width: 420, background: '#101418', color: '#fff',
  border: '1px solid #222', borderRadius: 10, padding: 16
};
