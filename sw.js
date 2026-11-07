/* Offline-first service worker. All files, including the five source PDFs, are saved during installation. */
const CACHE='implant-study-v3';
const ASSETS=[
'./','./index.html','./revision.html','./quiz.html','./styles.css','./app.js','./revision-app.js','./quiz-app.js',
'./data/questions.js','./data/revision.js','./data/questions.json','./data/revision.json',
'./manifest.webmanifest','./assets/icon.svg','./assets/icon-180.png','./assets/icon-192.png','./assets/icon-512.png',
'./pdf/01_Revision_Guide.pdf','./pdf/02_SBA_800_Questions.pdf',
'./pdf/03_SBA_800_Answers_Explanations.pdf','./pdf/04_OSCE_58_Stations.pdf','./pdf/05_SOE_51_Cases.pdf'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('implant-study-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;
 if(!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
 event.respondWith(caches.match(event.request,{ignoreSearch:true}).then(hit=>hit||fetch(event.request).then(res=>{if(res.ok){const clone=res.clone();caches.open(CACHE).then(cache=>cache.put(event.request,clone)).catch(()=>{})}return res}).catch(()=>caches.match('./index.html'))));
});
