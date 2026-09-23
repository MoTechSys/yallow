/* متجر أبو طارق — Service Worker (offline-first for static assets) */
const CACHE = 'abu-tariq-v3';
const ASSETS = [
  './', './index.html', './assets/css/style.css', './assets/js/main.js', './assets/js/cinema.js', './assets/js/emblem3d.js', './assets/vendor/three.module.js', './assets/vendor/RoomEnvironment.js',
  './assets/img/logo.png', './assets/img/hero.webp', './assets/img/hero-mobile.webp',
  './assets/img/account.webp', './assets/img/uc.webp', './assets/img/xsuit.webp', './assets/img/qr-whatsapp.png'
];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res;
  }).catch(() => hit)));
});
