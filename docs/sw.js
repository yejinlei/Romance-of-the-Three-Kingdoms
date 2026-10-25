/* sw.js —— 三国本体站离线缓存（仿西游站） */
const CACHE = 'sanguo-kg-v1';
const ASSETS = [
  './',
  'index.html', 'query.html', 'read.html', 'graph.html', 'ontology.html',
  'persons.html', 'factions.html', 'relations.html', 'places.html', 'battles.html',
  'stratagems.html', 'artifacts.html', 'prophecies.html', 'versions.html', 'variants.html',
  'assets/app.css'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Parquet 文件：stale-while-revalidate
  if (url.pathname.endsWith('.parquet') || url.pathname.endsWith('.json')) {
    e.respondWith(
      caches.open(CACHE).then(c =>
        c.match(e.request).then(hit => {
          const fetchp = fetch(e.request).then(res => { c.put(e.request, res.clone()); return res; }).catch(()=>hit);
          return hit || fetchp;
        })
      )
    );
    return;
  }
  // 静态资源：cache-first
  e.respondWith(
    caches.match(e.request).then(h => h || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => { if (res.ok && url.origin === location.origin) c.put(e.request, copy); });
      return res;
    }).catch(() => caches.match('index.html')))
  );
});
