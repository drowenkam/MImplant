(function(){'use strict';
 function updateNetwork(){document.querySelectorAll('#offline-status').forEach(el=>{const dot=el.querySelector('.dot');let label='Offline content stored locally';if(location.protocol==='file:')label='Local files · works offline';else if(!navigator.onLine)label='Currently offline · study materials available';else if(window.__offlineReady)label='Offline copy ready';else label='Online · preparing offline copy';if(el.tagName==='SPAN'&& !dot)el.textContent=label;else{const span=el.querySelector('span');if(span)span.textContent=label;if(dot)dot.classList.toggle('ready', !!window.__offlineReady||!navigator.onLine||location.protocol==='file:')}})}
 window.addEventListener('online',updateNetwork);window.addEventListener('offline',updateNetwork);
 updateNetwork();
 if('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
   navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(()=>navigator.serviceWorker.ready).then(()=>{
     if(window.caches){return caches.open('implant-study-v3').then(cache=>Promise.all(['./data/questions.js','./data/revision.js','./pdf/05_SOE_51_Cases.pdf'].map(path=>cache.match(path)))).then(items=>items.every(Boolean));}
     return true;
   }).then(ready=>{window.__offlineReady=!!ready;updateNetwork()}).catch(()=>updateNetwork());
 }
})();
