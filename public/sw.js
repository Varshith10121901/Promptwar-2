// Phase 4: Service Worker using Workbox strategies
// Provides offline support and aggressive caching for the PWA

const CACHE_NAME = 'votewise-v4';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/css/components.css',
  '/js/app.js',
  '/js/constants.js',
  '/js/data.js',
  '/js/state.js',
  '/js/api.js',
  '/js/router.js',
  '/js/confetti.js',
  '/js/chat.js',
  '/js/quiz.js',
  '/js/timeline.js',
  '/js/wizard.js',
  '/js/dashboard.js',
  '/js/faq.js',
  '/js/components.js',
  '/js/firebase.js',
  '/js/analytics.js',
  '/manifest.json',
];

// Install: Cache all static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Fetch: Cache-first for static assets, network-first for API calls
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Network-first for backend API calls (dynamic data)
  if (url.port === '8000' || url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ error: 'Offline — map generation unavailable' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503,
        })
      )
    );
    return;
  }

  // Cache-first for all other requests (fonts, CSS, JS, HTML)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const cloned = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
        return response;
      });
    })
  );
});
