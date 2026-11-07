/* Offline-first, versioned cache. Critical study files are independent of optional large PDF downloads. */
const CACHE = 'implant-study-v4';
const CORE = [
  './', './index.html', './revision.html', './quiz.html', './styles.css',
  './app.js', './revision-app.js', './quiz-app.js',
  './data/questions.js', './data/revision.js',
  './manifest.webmanifest', './assets/icon.svg',
  './assets/icon-180.png', './assets/icon-192.png', './assets/icon-512.png'
];
const PDFS = [
  './pdf/01_Revision_Guide.pdf', './pdf/02_SBA_800_Questions.pdf',
  './pdf/03_SBA_800_Answers_Explanations.pdf',
  './pdf/04_OSCE_58_Stations.pdf', './pdf/05_SOE_51_Cases.pdf'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('implant-study-') && key !== CACHE).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

let pdfJob = null;
async function notifyClients() {
  const cache = await caches.open(CACHE);
  const found = await Promise.all(PDFS.map(path => cache.match(path).then(Boolean)));
  const clients = await self.clients.matchAll({type: 'window', includeUncontrolled: true});
  for (const client of clients) client.postMessage({type: 'PDF_CACHE_STATUS', saved: found.filter(Boolean).length, total: PDFS.length});
}
async function cachePdfs() {
  if (pdfJob) return pdfJob;
  pdfJob = (async () => {
    const cache = await caches.open(CACHE);
    for (const path of PDFS) {
      try {
        if (!await cache.match(path)) {
          const response = await fetch(new Request(path, {cache: 'reload'}));
          if (!response.ok || response.status !== 200) throw Error('HTTP ' + response.status);
          await cache.put(path, response);
        }
      } catch (error) {
        // iOS cache quota, connectivity or a missing file must never break the core app.
        console.warn('Optional offline PDF not saved:', path, String(error));
      }
      await notifyClients();
    }
  })().finally(() => { pdfJob = null; });
  return pdfJob;
}
self.addEventListener('message', event => {
  if (event.data?.type === 'CACHE_PDFS') event.waitUntil(cachePdfs());
  if (event.data?.type === 'CHECK_PDFS') event.waitUntil(notifyClients());
});

async function rangedPdf(cached, header) {
  const match = /^bytes=(\d*)-(\d*)$/i.exec(header || '');
  if (!match || (!match[1] && !match[2])) return cached;
  const blob = await cached.blob();
  const size = blob.size;
  let start, end;
  if (match[1]) {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : size - 1;
  } else {
    const suffix = Number(match[2]);
    start = Math.max(0, size - suffix); end = size - 1;
  }
  if (!Number.isInteger(start) || !Number.isInteger(end) || start >= size || end < start) {
    return new Response(null, {status: 416, headers: {'Content-Range': `bytes */${size}`}});
  }
  end = Math.min(size - 1, end);
  const part = blob.slice(start, end + 1, 'application/pdf');
  return new Response(part, {status: 206, headers: {
    'Content-Type': 'application/pdf', 'Content-Range': `bytes ${start}-${end}/${size}`,
    'Content-Length': String(part.size), 'Accept-Ranges': 'bytes'
  }});
}
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url), scope = new URL(self.registration.scope);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(event.request, {ignoreSearch: true});
    if (cached) {
      if (url.pathname.toLowerCase().endsWith('.pdf') && event.request.headers.has('range')) {
        return rangedPdf(cached, event.request.headers.get('range'));
      }
      return cached;
    }
    try {
      const response = await fetch(event.request);
      if (response.ok && response.status === 200) {
        try { await cache.put(event.request, response.clone()); } catch (_) { /* storage quota */ }
      }
      return response;
    } catch (error) {
      if (event.request.mode === 'navigate') {
        return (await cache.match('./index.html')) || new Response('Offline: this page is not available.', {status: 503});
      }
      return new Response('This resource is not cached. Reconnect to the internet and retry.',
        {status: 503, headers: {'Content-Type': 'text/plain; charset=utf-8'}});
    }
  })());
});
