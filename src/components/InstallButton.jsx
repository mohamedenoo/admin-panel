// src/components/InstallButton.jsx
import { useEffect, useState } from 'react';

export default function InstallButton({ style = {}, variant = 'auto' }) {
  const [available, setAvailable] = useState(!!window.__deferredInstallPrompt);
  const isIOS   = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandaloneIOS = window.navigator.standalone === true;

  useEffect(() => {
    const onAvail = () => setAvailable(!!window.__deferredInstallPrompt);
    const onInstalled = () => setAvailable(false);
    document.addEventListener('pwa:beforeinstallprompt', onAvail);
    document.addEventListener('pwa:appinstalled', onInstalled);
    return () => {
      document.removeEventListener('pwa:beforeinstallprompt', onAvail);
      document.removeEventListener('pwa:appinstalled', onInstalled);
    };
  }, []);

  async function handleInstall() {
    const evt = window.__deferredInstallPrompt;
    if (!evt) return;
    try {
      evt.prompt();
      await evt.userChoice; // { outcome: 'accepted' | 'dismissed' }
      window.__deferredInstallPrompt = null;
      setAvailable(false);
    } catch (e) {
      console.error('Install prompt error:', e);
    }
  }

  // variant:
  //  - 'button'   : دائماً زر
  //  - 'hint'     : دائماً تعليمات
  //  - 'auto'     : زر إن متاح، وإلا تعليمات
  const wantButton = variant === 'button' || (variant === 'auto' && available && !isIOS);
  const wantHint   = variant === 'hint'   || (variant === 'auto' && (!available || isIOS));

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      {wantButton && (
        <button onClick={handleInstall}
                style={{ padding: '8px 12px', borderRadius: 8, background: '#10b981',
                         border: '1px solid #10b981', color: '#fff', cursor: 'pointer', ...style }}>
          تثبيت التطبيق
        </button>
      )}
      {wantHint && !isStandaloneIOS && (
        <span style={{ color: '#9aa4b2', fontSize: 12 }}>
          {isIOS
            ? <>على iPhone: افتح <b>Safari</b> → <b>Share</b> → <b>Add to Home Screen</b></>
            : <>على Android: من قائمة <b>⋮</b> اختر <b>Install app</b></>
          }
        </span>
      )}
    </div>
  );
}