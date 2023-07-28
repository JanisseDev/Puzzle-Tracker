const appVersion = '0.0.3';

// Files to cache
const appCacheVersion = 'appCache-'+appVersion;
const appShellFiles = [
    // General
    './app.js',
    './utils.js',
    './style.css',
    // Pages
    './index.html',
    './index.js',
    './puzzlePage.html',
    './puzzlePage.js',
    // Resources
    './img/icon-32.png',
    './img/icon-64.png',
    './img/icon-128.png',
    './img/icon-256.png',
    './img/icon-512.png',
];

// Installing Service Worker
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  e.waitUntil((async () => {
    const cache = await caches.open(appCacheVersion);
    console.log('[Service Worker] Caching all: app shell and content');
    await cache.addAll(appShellFiles);
  })());
});

// Fetching content using Service Worker
self.addEventListener('fetch', (e) => {
    // Cache http and https only, skip unsupported chrome-extension:// and file://...
    if (!(
       e.request.url.startsWith('http:') || e.request.url.startsWith('https:')
    )) {
        return; 
    }

  e.respondWith((async () => {
    const r = await caches.match(e.request);
    console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
    if (r) return r;
    const response = await fetch(e.request);
    const cache = await caches.open(appCacheVersion);
    console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
    cache.put(e.request, response.clone());
    return response;
  })());
});

// Clear old cache
self.addEventListener("activate", (e) => {
    console.log("[Service Worker] Activate")
    e.waitUntil(
      caches.keys().then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key === appCacheVersion) {
              return;
            }
            return caches.delete(key);
          }),
        );
      }),
    );
  });