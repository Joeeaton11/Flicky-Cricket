// Flicky Cricket service worker (v4, Nov 7): network-first for the page so updates always show,
// cache-first for art/sounds so grounds load instantly on the second visit
const CACHE = 'flicky-v4';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const page = r.mode === 'navigate' || /\.html?(\?|$)|\/$/.test(new URL(r.url).pathname);
  if (page) {
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put(r, c)); return res; }).catch(() => caches.match(r)));
    return;
  }
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => {
    if (res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(r, c)); }
    return res;
  })));
});
