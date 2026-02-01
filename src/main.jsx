// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'leaflet/dist/leaflet.css'

// ✅ تسجيل Service Worker بعد تحميل الصفحة
// src/main.jsx (مقتطف التسجيل)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(() => console.log('SW registered'))
      .catch(err => console.error('SW register failed:', err));
  });
}

// ✅ إتاحة beforeinstallprompt على مستوى التطبيق:
window.__deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  // امنع البانر التلقائي وخزّن الحدث للاستعمال عند الضغط على الزر
  e.preventDefault();
  window.__deferredInstallPrompt = e;
  // ابعت إشارة لباقي الواجهة إن الزر بقى مُتاح
  document.dispatchEvent(new Event('pwa:beforeinstallprompt'));
});

// لإخفاء زر التثبيت بعد النجاح
window.addEventListener('appinstalled', () => {
  window.__deferredInstallPrompt = null;
  document.dispatchEvent(new Event('pwa:appinstalled'));
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)