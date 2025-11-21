'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Service Worker Registration Component
 * Registers the service worker and handles updates
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    // Only register in production and if service workers are supported
    if (
      process.env.NODE_ENV === 'production' &&
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      // Wait for page load to register service worker
      window.addEventListener('load', () => {
        registerServiceWorker();
      });
    }
  }, []);

  // Separate effect for cache warming - after a delay
  useEffect(() => {
    if (
      process.env.NODE_ENV === 'production' &&
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      // Wait 2 seconds after page load to warm cache
      // This gives time for auth to complete
      // Service worker will skip any auth redirects automatically
      const timeoutId = setTimeout(() => {
        navigator.serviceWorker.ready.then(async (registration) => {
          if (registration.active) {
            console.log('🔥 Warming cache...');
            
            // Clear the runtime cache to remove any stale auth redirects
            const cacheNames = await caches.keys();
            const runtimeCacheName = cacheNames.find(name => name.includes('runtime'));
            if (runtimeCacheName) {
              const cache = await caches.open(runtimeCacheName);
              const requests = await cache.keys();
              
              // Delete any dashboard routes from cache to force fresh fetch
              await Promise.all(
                requests
                  .filter(req => req.url.includes('/dashboard'))
                  .map(req => cache.delete(req))
              );
              console.log('🗑️ Cleared dashboard routes from cache');
            }
            
            // Now warm the cache
            // SW will automatically skip any pages that redirect to auth
            warmCache(registration.active);
          }
        });
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });

      console.log('✅ Service Worker registered:', registration.scope);

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New service worker available
              toast.info('App update available', {
                description: 'Click to refresh and get the latest version',
                action: {
                  label: 'Refresh',
                  onClick: () => {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  },
                },
                duration: Infinity,
              });
            }
          });
        }
      });

      // Handle controller change (new service worker activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Service Worker updated');
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('📦 Cache updated');
        }
      });
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  };

  const warmCache = (sw: ServiceWorker) => {
    // Dashboard pages to pre-cache for offline use
    const dashboardPages = [
      '/dashboard',
      '/dashboard/overview',
      '/dashboard/patients',
      '/dashboard/patients/new',
      '/dashboard/doctors',
      '/dashboard/doctors/new',
      '/dashboard/appointments',
      '/dashboard/appointments/new',
      '/dashboard/hospitals',
      '/dashboard/hospitals/new',
      '/dashboard/medical-records',
      '/dashboard/medical-records/new',
      '/dashboard/bills',
      '/dashboard/bills/new',
      '/dashboard/workers',
      '/dashboard/workers/new',
      '/dashboard/facilities',
      '/dashboard/facilities/new',
      '/dashboard/capacity',
      '/dashboard/capacity/new',
      '/dashboard/pharmacies',
      '/dashboard/pharmacies/new',
      '/dashboard/chat',
      '/dashboard/kanban',
      '/dashboard/product',
      '/dashboard/healthstake',
    ];

    console.log('🔥 Warming cache with dashboard pages...');
    sw.postMessage({
      type: 'WARM_CACHE',
      urls: dashboardPages,
    });
  };

  // This component doesn't render anything
  return null;
}

