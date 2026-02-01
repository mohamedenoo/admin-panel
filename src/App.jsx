// src/App.jsx
import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Login from './pages/Login';
import Sites from './pages/Sites';
import Users from './pages/Users';
import Attendance from './pages/Attendance';
import Dashboard from './pages/Dashboard';

import Navbar from './components/Navbar';
import { isAuthed, getToken } from './auth';

import EmployeeLogin from './pages/EmployeeLogin';
import EmployeeCheck from './pages/EmployeeCheck';
import { isEmpAuthed, getEmpToken } from './authEmployee';

/* =============================
   حمايات الدخول
   ============================= */
function Private({ children }) {
  return isAuthed() ? children : <Navigate to="/login" />;
}
function PrivateEmp({ children }) {
  return isEmpAuthed() ? children : <Navigate to="/emp/login" />;
}

/* =============================
   تخطيط عام لصفحات الأدمن
   ============================= */
function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="container main">
        {children}
      </main>
    </>
  );
}

/* =============================
   صفحة ترحيب + زر تثبيت PWA
   تظهر عند الجذر "/"
   - زر التثبيت يظهر على Android (Chrome) فقط عند توفر beforeinstallprompt
   - على iOS تظهر تلميحة "Share → Add to Home Screen"
   ============================= */
function Landing() {
  const nav = useNavigate();
  const [canInstall, setCanInstall] = useState(false);
  const deferredPromptRef = useRef(null);

  useEffect(() => {
    function onBeforeInstallPrompt(e) {
      // منع البانر التلقائي، وخزن الحدث لاستدعائه عند الضغط على الزر
      e.preventDefault();
      deferredPromptRef.current = e;
      setCanInstall(true);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  async function handleInstall() {
    try {
      const promptEvent = deferredPromptRef.current;
      if (!promptEvent) return;
      promptEvent.prompt();
      await promptEvent.userChoice; // { outcome: 'accepted' | 'dismissed' }
      deferredPromptRef.current = null;
      setCanInstall(false);
    } catch (err) {
      console.error('PWA install prompt failed:', err);
    }
  }

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandaloneIOS = window.navigator.standalone === true;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#0f1115',
        color: '#fff',
        padding: 16
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 560 }}>
        <h1 style={{ margin: '0 0 8px' }}>مرحبًا بك في نظام الحضور</h1>
        <p style={{ margin: '0 0 20px', color: '#9aa4b2' }}>
          اختر نوع البوابة للدخول
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
          <button onClick={() => nav('/login')} style={btnPrimary}>لوحة الإدارة</button>
          <button onClick={() => nav('/emp')} style={btn}>بوابة الموظف</button>
        </div>

        {/* زر تثبيت لأندرويد (Chrome) */}
        {canInstall && !isIOS && (
          <div style={{ marginTop: 12 }}>
            <button onClick={handleInstall} style={{ ...btn, background: '#10b981', borderColor: '#10b981' }}>
              تثبيت التطبيق على الهاتف
            </button>
          </div>
        )}

        {/* تلميحة iOS: لا يوجد beforeinstallprompt */}
        {isIOS && !isStandaloneIOS && (
          <div style={{ color: '#9aa4b2', fontSize: 13, marginTop: 12 }}>
            على iPhone: افتح <b>Safari</b> → اضغط <b>Share</b> → <b>Add to Home Screen</b>
          </div>
        )}

        {/* حالة الجلسة الحالية (اختياري) */}
        <div style={{ marginTop: 18, fontSize: 12, color: '#7e8790' }}>
          {getToken() ? 'لديك جلسة أدمن فعّالة'
           : getEmpToken() ? 'لديك جلسة موظف فعّالة'
           : 'لا توجد جلسة فعّالة'}
        </div>
      </div>
    </div>
  );
}

/* =============================
   تحويل ذكي (اختياري)
   - لو فيه توكن أدمن → /dashboard
   - لو فيه توكن موظف → /emp
   - غير كده → /login
   استبدل Landing به إن أحببت.
   ============================= */
// function RootRedirect() {
//   const admin = getToken();
//   const emp = getEmpToken();
//   if (admin) return <Navigate to="/dashboard" replace />;
//   if (emp) return <Navigate to="/emp" replace />;
//   return <Navigate to="/login" replace />;
// }

/* =============================
   أنماط أزرار بسيطة
   ============================= */
const btn = {
  padding: '10px 16px',
  border: '1px solid #2a2f3a',
  borderRadius: 8,
  background: '#1b2230',
  color: '#fff',
  cursor: 'pointer'
};
const btnPrimary = {
  ...btn,
  background: '#2563eb',
  borderColor: '#2563eb'
};

/* =============================
   تعريف الراوتر
   ============================= */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* الجذر: صفحة الترحيب */}
        <Route path="/" element={<Landing />} />
        {/* بديل التحويل الذكي: */}
        {/* <Route path="/" element={<RootRedirect />} /> */}

        {/* لوحة الأدمن */}
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <Private>
              <Layout><Dashboard /></Layout>
            </Private>
          }
        />
        <Route
          path="/sites"
          element={
            <Private>
              <Layout><Sites /></Layout>
            </Private>
          }
        />
        <Route
          path="/users"
          element={
            <Private>
              <Layout><Users /></Layout>
            </Private>
          }
        />
        <Route
          path="/attendance"
          element={
            <Private>
              <Layout><Attendance /></Layout>
            </Private>
          }
        />

        {/* بوابة الموظف */}
        <Route path="/emp/login" element={<EmployeeLogin />} />
        <Route
          path="/emp"
          element={
            <PrivateEmp>
              <main className="container main">
                <EmployeeCheck />
              </main>
            </PrivateEmp>
          }
        />

        {/* أي مسار خطأ → Dashboard أو Emp أو Login وفقًا للتوكنات */}
        <Route
          path="*"
          element={
            getToken()
              ? <Navigate to="/dashboard" />
              : (getEmpToken() ? <Navigate to="/emp" /> : <Navigate to="/login" />)
          }
        />
      </Routes>
    </BrowserRouter>
  );
}