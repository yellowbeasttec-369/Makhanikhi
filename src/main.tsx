import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress and handle benign MetaMask / browser extension errors inside iframes
if (typeof window !== 'undefined') {
  const handleExtensionError = (errorMsg: string, source: string) => {
    return (
      errorMsg.includes('MetaMask') || 
      errorMsg.includes('inpage.js') || 
      errorMsg.includes('extension') || 
      source.includes('inpage') || 
      source.includes('extension')
    );
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (reason) {
      const reasonStr = String(reason);
      const reasonMsg = reason.message ? String(reason.message) : '';
      const reasonStack = reason.stack ? String(reason.stack) : '';
      
      if (handleExtensionError(reasonStr, reasonStack) || handleExtensionError(reasonMsg, reasonStack)) {
        console.warn('⚡ [Makhanikhi Shield] Suppressed unhandled browser extension rejection:', reason);
        event.preventDefault(); // Suppresses red error logs in browser console
      }
    }
  });

  window.addEventListener('error', (event) => {
    const filename = event.filename || '';
    const message = event.message || '';
    if (handleExtensionError(message, filename)) {
      console.warn('⚡ [Makhanikhi Shield] Suppressed unhandled browser extension error:', message);
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

