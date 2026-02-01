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

// 👇 زر التثبيت القابل لإعادة الاستخدام
import InstallButton from './components/InstallButton';

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

  // معلومات بسيطة لمعاينة حالة الجلسة
  const hasAdmin = !!getToken();
  const hasEmp   = !!getEmpToken();

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

        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: 12
          }}
        >
          <button onClick={() => nav('/login')} style={btnPrimary}>لوحة الإدارة</button>
          <button onClick={() => nav('/emp')} style={btn}>بوابة الموظف</button>
        </div>

        {/* زر/تعليمات تثبيت التطبيق (PWA) */}
        <div style={{ marginTop: 12 }}>
          {/* auto = يظهر زر إن الحدث متاح، وإلا تظهر تلميحات Android/iOS */}
          <InstallButton variant="auto" />
        </div>

        {/* حالة الجلسة الحالية (اختياري) */}
        <div style={{ marginTop: 18, fontSize: 12, color: '#7e8790' }}>
          {hasAdmin ? 'لديك جلسة أدمن فعّالة'
           : hasEmp ? 'لديك جلسة موظف فعّالة'
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