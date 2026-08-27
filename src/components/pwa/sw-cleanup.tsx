'use client';

import { useEffect } from 'react';

export function SwCleanup() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // In development mode, unregister old stale service workers to prevent cache loops
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().catch(() => {});
        }
      });
    }

    // Clean up stale cache storage from earlier iterations
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (const name of names) {
          if (name.includes('fleetmind-v1')) {
            caches.delete(name).catch(() => {});
          }
        }
      });
    }
  }, []);

  return null;
}
