/* Shared navigation/offline status for GitHub Pages and locally opened HTML. */
(function () {
  'use strict';
  const CACHE = 'implant-study-v4';
  const CORE = ['./index.html', './quiz.html', './revision.html', './data/questions.js', './data/revision.js'];
  const PDFS = [
    './pdf/01_Revision_Guide.pdf', './pdf/02_SBA_800_Questions.pdf',
    './pdf/03_SBA_800_Answers_Explanations.pdf',
    './pdf/04_OSCE_58_Stations.pdf', './pdf/05_SOE_51_Cases.pdf'
  ];
  let ready = false, pdfSaved = null;
  function updateStatus() {
    document.querySelectorAll('#offline-status').forEach(el => {
      let label;
      if (location.protocol === 'file:') label = 'Local files · offline HTML works';
      else if (ready) label = navigator.onLine ? 'Offline SBA + notes ready' : 'Offline · SBA + notes ready';
      else if (!navigator.onLine) label = 'Offline · cache not confirmed';
      else label = 'Online · preparing offline study files';
      const dot = el.querySelector('.dot'), span = el.querySelector('span');
      if (span) span.textContent = label; else el.textContent = label;
      if (dot) dot.classList.toggle('ready', ready || location.protocol === 'file:');
    });
    const status = document.getElementById('pdf-cache-status');
    if (status) {
      if (location.protocol === 'file:') status.textContent = 'PDFs are available in the local pdf/ folder.';
      else if (pdfSaved === null) status.textContent = 'Checking offline PDF availability…';
      else status.textContent = `PDFs saved for offline use: ${pdfSaved} of ${PDFS.length}. ${pdfSaved < PDFS.length ? 'Reconnect and retry any missing PDFs.' : 'All five PDF supplements are cached.'}`;
    }
  }
  async function checkCache() {
    if (!('caches' in window)) return;
    try {
      const cache = await caches.open(CACHE);
      const coreFound = await Promise.all(CORE.map(path => cache.match(path).then(Boolean)));
      ready = coreFound.every(Boolean);
      const pdfFound = await Promise.all(PDFS.map(path => cache.match(path).then(Boolean)));
      pdfSaved = pdfFound.filter(Boolean).length;
      updateStatus();
    } catch (error) {updateStatus();}
  }
  function requestPdfs(reg) {
    if (!navigator.onLine) return;
    const sw = navigator.serviceWorker.controller || reg?.active;
    if (sw) sw.postMessage({type: 'CACHE_PDFS'});
  }
  const button = document.getElementById('cachePdfsBtn');
  if (button) button.addEventListener('click', async () => {
    if (!navigator.onLine) { alert('Reconnect to Wi-Fi to save missing PDFs.'); return; }
    button.textContent = 'Saving PDFs…';
    try { const reg = await navigator.serviceWorker.ready; requestPdfs(reg); }
    catch (error) {button.textContent = 'Save PDFs offline / retry';}
  });
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  updateStatus();
  if ('caches' in window) checkCache(); // Works on an offline relaunch even if SW registration cannot fetch its script.
  if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data?.type !== 'PDF_CACHE_STATUS') return;
      pdfSaved = event.data.saved;
      if (button) button.textContent = pdfSaved === PDFS.length ? 'All PDFs saved ✓' : 'Save PDFs offline / retry';
      updateStatus();
    });
    navigator.serviceWorker.register('./sw.js', {scope: './'})
      .then(() => navigator.serviceWorker.ready)
      .then(async reg => {await checkCache(); requestPdfs(reg);})
      .catch(() => updateStatus());
    navigator.serviceWorker.addEventListener('controllerchange', checkCache);
  }
})();
