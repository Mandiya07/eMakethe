import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for PWA (Production only, clean up in development)
if ('serviceWorker' in navigator) {
  if ((import.meta as any).env.DEV) {
    // In development, actively unregister all service workers and clear caches
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then((success) => {
          if (success) {
            console.log('Successfully unregistered stale development service worker');
          }
        });
      }
    });
    // Clear all caches to ensure fresh assets are fetched
    if (window.caches) {
      caches.keys().then((names) => {
        for (const name of names) {
          caches.delete(name).then((success) => {
            if (success) {
              console.log('Cleared service worker cache:', name);
            }
          });
        }
      });
    }
  } else {
    // Register in production mode only
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('SW registered: ', registration);
      }).catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
    });
  }
}
