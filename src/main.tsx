import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept and ignore noisy errors from browser extensions (e.g., MetaMask, injected web3 scripts)
if (typeof window !== 'undefined') {
  const isExtensionError = (msg: string) => {
    const s = (msg || '').toLowerCase();
    return s.includes('metamask') || s.includes('failed to connect to metamask') || s.includes('ethereum') || s.includes('chrome-extension://');
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || String(event.reason || '');
    if (isExtensionError(reason)) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || event.error?.message || '';
    if (isExtensionError(msg)) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
