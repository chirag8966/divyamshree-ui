import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// The service worker has been REMOVED from this project.
//
// It was the cause of stale frames after every deploy: it pre-cached the frame
// images and served them cache-first, and because /sw.js was served with a long
// max-age the browser never picked up a new worker to replace it.
//
// This block actively UNREGISTERS any previously installed worker and deletes its
// caches, so returning visitors are cleaned up. Without this, anyone who already
// has the old worker would keep seeing stale frames indefinitely.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const cleanupKey = 'divyamshree-sw-cleaned';
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      return Promise.all(registrations.map((registration) => registration.unregister()));
    }).then(() => {
      // A worker remains in control of the current page until its next load.
      if (navigator.serviceWorker.controller && !sessionStorage.getItem(cleanupKey)) {
        sessionStorage.setItem(cleanupKey, '1');
        window.location.reload();
      }
    }).catch(() => {});

    // Drop every Cache Storage entry the old worker created.
    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => caches.delete(key));
      }).catch(() => {});
    }
  });
}

