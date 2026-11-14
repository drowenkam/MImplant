(()=>{'use strict';
const $=id=>document.getElementById(id), DATA=window.IMPLANT_QUIZ_DATA, REV=window.IMPLANT_REVISION_DATA, CASE=window.IMPLANT_CASE_DATA;
const sections=['home','dashboard','notes','practice','osce','soe','resources'];
const STORE='mimpdent-study-progress-v1', CASESTORE='implant-practical-read-v3', NOTEPAGES='implant-notes-page-v3', NOTEBOOKMARKS='implant-notes-bookmarks-v3';
const fmt=x=>Number(x||0).toLocaleString('en-GB');
function read(key,fallback){try{const o=JSON.parse(localStorage.getItem(key));return o===null?fallback:o}catch{return fallback}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
let practical=read(CASESTORE,{osce:[],soe:[],lastOsce:1,lastSoe:1});
for(const c of ['osce','soe'])if(!Array.isArray(practical[c]))practical[c]=[];
const topicByPage=new Map();for(const s of REV.sections)for(const p of s.pages)topicByPage.set(p.sourcePage,{section:s,text:p.text});
function route(){let hash=decodeURIComponent(location.hash.replace(/^#/,''))||'home';if(!sections.includes(hash))hash='home';
for(const p of sections){$('page-'+p).hidden=p!==hash;const link=document.querySelector(`[data-nav="${p}"]`);if(link){if(p===hash)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current')}}
if(hash==='dashboard'||hash==='home')renderDashboard();if(hash==='notes')showNote(page,false);if(hash==='osce')renderCases('osce');if(hash==='soe')renderCases('soe');if(hash==='resources')checkOffline();
window.scrollTo({top:0,behavior:'instant'});}
window.addEventListener('hashchange',route);window.addEventListener('implant-progress-updated',()=>{renderDashboard()});window.addEventListener('storage',renderDashboard);
function renderDashboard(){
const progress=read(STORE,{});const records=progress.records||{};
let done=0,first=0,latest=0;for(const q of DATA.questions){const r=records[q.id];if(!r?.checked||!r.selected)continue;done++;if(r.firstSelected===q.answer)first++;if(r.selected===q.answer)latest++}
const pct=(n,d)=>d?Math.round(n*100/d)+'%':'—';
$('dashCompleted').textContent=`${done} / 800`;$('dashRemaining').textContent=800-done;$('dashBar').style.width=(done/8)+'%';$('dashFirst').textContent=pct(first,done);$('dashLatest').textContent=pct(latest,done);
const st=progress.session;$('dashSessionStatus').textContent=st?.ids?.length?`Saved ${st.timed?'timed':'untimed'} session: ${st.ids.filter(id=>st.answers?.[id]?.checked).length} of ${st.ids.length} checked. Open SBA practice to resume.`:'No unfinished session. Start a new 10–90 question set or choose a particular topic.';
$('homeProgressSummary').textContent=done?`${done} of 800 SBA questions checked · ${pct(first,done)} first-attempt accuracy.`:'Start the SBA bank or read the revision notebook. Your progress will appear here.';
const rows=$('dashTopics');rows.replaceChildren();for(const b of DATA.blocks){const n=b.end-b.start+1;let d=0,c=0;for(let i=b.start;i<=b.end;i++){const r=records[i];if(r?.checked&&r.selected){d++;if(r.selected===DATA.questions[i-1].answer)c++;}}
const div=document.createElement('div');div.className='topic-progress';const a=document.createElement('a');a.href=`?block=${b.letter}#practice`;a.textContent=`${b.letter} · ${b.title}`;const meta=document.createElement('small');meta.textContent=`${d}/${n} completed · ${d?`${Math.round(c*100/d)}% latest accuracy`:'Not started'}`;const bar=document.createElement('div');bar.className='progress-track';const fill=document.createElement('b');fill.style.width=(100*d/n)+'%';bar.append(fill);div.append(a,meta,bar);rows.append(div)}
for(const type of ['osce','soe']){const total=type==='osce'?58:51;const d=new Set(practical[type]).size;$('dash'+(type==='osce'?'Osce':'Soe')).textContent=`${d} / ${total}`;$('dash'+(type==='osce'?'OsceBar':'SoeBar')).style.width=(100*d/total)+'%'}
}
// Exact-page reader: original PDF images are lazily loaded from 7 chunks.
let page=Number(read(NOTEPAGES,21))||21,pageBookmarks=read(NOTEBOOKMARKS,[]);if(!Array.isArray(pageBookmarks))pageBookmarks=[];
page=Math.min(82,Math.max(1,page));
let bookJob=new Map(),pageMode='original';
function chapterFor(n){const f=REV.sections.find(s=>s.pages.some(p=>p.sourcePage===n));return f||REV.sections.find(s=>s.start<=n&&s.end>=n)||REV.sections[0]}
function loadPageImage(n){if(window.IMPLANT_PAGE_IMAGES?.[n])return Promise.resolve(window.IMPLANT_PAGE_IMAGES[n]);const group=Math.floor((n-1)/12);if(!bookJob.has(group)){const job=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=`assets/page-${String(group).padStart(2,'0')}.js`;s.async=true;s.onload=resolve;s.onerror=()=>reject(Error('Could not load formatted page bundle '+group));document.head.append(s)});bookJob.set(group,job)}return bookJob.get(group).then(()=>{if(!window.IMPLANT_PAGE_IMAGES?.[n])throw Error('Page image missing');return window.IMPLANT_PAGE_IMAGES[n]})}
function savePage(){write(NOTEPAGES,page)}
function showNote(n,scroll=true){n=Number(n);if(!Number.isInteger(n)||n<1||n>82)return;page=n;savePage();const sec=chapterFor(n);$('notesTitle').textContent=`Page ${n} · ${sec.title}`;$('notesPage').value=n;
$('notesPrev').disabled=$('notesPrevBottom').disabled=n===1;$('notesNext').disabled=$('notesNextBottom').disabled=n===82;
$('notesBookmark').textContent=pageBookmarks.includes(n)?'★ Bookmarked':'☆ Bookmark';$('notesPdfLink').href=`pdf/01_Revision_Guide.pdf#page=${n}`;
for(const b of document.querySelectorAll('#noteChapters button'))b.classList.toggle('active',b.dataset.section===sec.id);
const txt=topicByPage.get(n)?.text || 'This page is available in the original formatted document. Open the PDF using the Source PDF button.';
$('notesText').textContent=txt;
const orig=pageMode==='original';$('notesFrame').hidden=!orig;$('notesText').hidden=orig;
$('notesImage').style.width=$('notesZoom').value+'%';
if(orig){const requested=n;$('notesStatus').textContent='Loading the exact original notebook page…';$('notesImage').removeAttribute('src');
loadPageImage(n).then(data=>{if(requested!==page)return;$('notesImage').src=data;$('notesStatus').textContent=`Original PDF page ${n} of 82 · page formatting, diagrams and tables preserved`;}).catch(e=>{if(requested===page){$('notesStatus').textContent=`${e.message}. Try the searchable text view or original PDF.`;$('notesText').hidden=false;$('notesFrame').hidden=true}})
}else $('notesStatus').textContent=`Searchable text transcribed from page ${n}. Use “Original page” to see the source layout.`;
if(scroll&&location.hash==='#notes')$('notesTitle').scrollIntoView({block:'start',behavior:'smooth'});
}
function initNotes(){const c=$('noteChapters');for(const s of REV.sections){const b=document.createElement('button');b.className='chapter-link';b.type='button';b.dataset.section=s.id;b.textContent=s.title;b.onclick=()=>showNote(s.start);c.append(b)}
function bookmarks(){const box=$('noteBookmarks');box.replaceChildren();for(const n of [...pageBookmarks].sort((a,b)=>a-b)){const btn=document.createElement('button');btn.className='btn smallbtn';btn.textContent='Page '+n;btn.onclick=()=>showNote(n);box.append(btn)}if(!pageBookmarks.length)box.textContent='No bookmarked pages yet.'}
bookmarks();$('notesBookmark').onclick=()=>{pageBookmarks=pageBookmarks.includes(page)?pageBookmarks.filter(x=>x!==page):[...pageBookmarks,page];write(NOTEBOOKMARKS,pageBookmarks);bookmarks();showNote(page,false)};
$('notesPrev').onclick=$('notesPrevBottom').onclick=()=>showNote(page-1);$('notesNext').onclick=$('notesNextBottom').onclick=()=>showNote(page+1);$('notesPage').onchange=e=>showNote(e.target.value);
$('notesMode').onchange=e=>{pageMode=e.target.value;showNote(page,false)};$('notesZoom').onchange=()=>{$('notesImage').style.width=$('notesZoom').value+'%'};
$('notesImage').onclick=()=>{$('notesZoom').value=$('notesZoom').value==='100'?'175':'100';$('notesZoom').onchange()};
let debounce=null;$('notesSearch').oninput=()=>{clearTimeout(debounce);debounce=setTimeout(searchNotes,150)};$('notesSearchBtn').onclick=searchNotes;$('notesClear').onclick=()=>{$('notesSearch').value='';searchNotes()};
function searchNotes(){const raw=$('notesSearch').value.trim().toLowerCase();const terms=raw.split(/\s+/).filter(Boolean);const box=$('notesSearchResults');box.replaceChildren();box.hidden=!terms.length;if(!terms.length){$('notesSearchStatus').textContent='';return}const matches=[];
for(const s of REV.sections)for(const p of s.pages){const txt=p.text.toLowerCase();if(terms.every(x=>txt.includes(x)))matches.push({section:s,page:p.sourcePage,text:p.text})}
$('notesSearchStatus').textContent=`${matches.length} matching source pages`;
for(const r of matches.slice(0,70)){const b=document.createElement('button');b.className='search-hit';b.type='button';const title=document.createElement('strong');title.textContent=`Page ${r.page} · ${r.section.title}`;const small=document.createElement('small');const pos=r.text.toLowerCase().indexOf(terms[0]);small.textContent=r.text.slice(Math.max(0,pos-55),Math.min(r.text.length,pos+150)).replace(/\s+/g,' ');b.append(title,small);b.onclick=()=>{showNote(r.page);box.hidden=true};box.append(b)}if(matches.length>70){const p=document.createElement('p');p.className='small';p.textContent='First 70 results shown. Narrow your search for more detail.';box.append(p)}}
}
// Clinical-case readers expose the exact authored text; source PDF kept for charts and tables.
const caseUi={};
function readerMarkup(type){const group=type==='osce'?CASE.osce:CASE.soe,total=group.length,label=type==='osce'?'OSCE':'SOE';return `<div class="case-layout"><aside class="panel case-sidebar"><div class="field"><label for="${type}-filter">Search ${label} topics</label><input type="search" class="input" id="${type}-filter" placeholder="Search cases and procedures"></div><div class="case-tip" id="${type}-count">${total} source cases</div><div class="case-index" id="${type}-index"></div></aside><div class="case-body"><div class="panel"><div class="page-meta"><h2 id="${type}-title">${label} source</h2><div class="actions"><button class="btn smallbtn" id="${type}-studied">Mark studied</button><a class="btn smallbtn" id="${type}-pdf" target="_blank" rel="noopener">Original PDF</a></div></div><div class="case-tip" id="${type}-meta"></div><div class="case-controls" style="margin-top:16px"><button class="btn smallbtn" id="${type}-prev">← Previous</button><button class="btn smallbtn" id="${type}-intro">Exam guidance</button><button class="btn smallbtn" id="${type}-next">Next →</button></div></div><div class="panel"><div class="case-source" id="${type}-text"></div></div><div class="case-controls"><button class="btn" id="${type}-prev2">← Previous</button><button class="btn" id="${type}-next2">Next →</button></div></div></div>`}
function buildCase(type){$(type+'Reader').innerHTML=readerMarkup(type);caseUi[type]={selected:Math.max(1,Math.min(type==='osce'?58:51,practical[type==='osce'?'lastOsce':'lastSoe']||1)),intro:false};
const ns=id=>$(type+'-'+id);ns('prev').onclick=ns('prev2').onclick=()=>selectCase(type,caseUi[type].selected-1);ns('next').onclick=ns('next2').onclick=()=>selectCase(type,caseUi[type].selected+1);ns('intro').onclick=()=>{caseUi[type].intro=!caseUi[type].intro;renderCases(type)};ns('studied').onclick=()=>{const n=caseUi[type].selected;if(caseUi[type].intro)return;practical[type]=practical[type].includes(n)?practical[type].filter(x=>x!==n):[...practical[type],n];write(CASESTORE,practical);renderCases(type);renderDashboard()};ns('filter').oninput=()=>renderCaseIndex(type)}
function selectCase(type,n){const total=type==='osce'?58:51;if(n<1||n>total)return;caseUi[type].selected=n;caseUi[type].intro=false;practical[type==='osce'?'lastOsce':'lastSoe']=n;write(CASESTORE,practical);renderCases(type);if(window.innerWidth<1001&&location.hash==='#'+type)$(type+'-title').scrollIntoView({behavior:'smooth',block:'start'})}
function renderCaseIndex(type){const group=CASE[type],query=$(type+'-filter').value.toLowerCase().trim(),list=$(type+'-index');list.replaceChildren();let n=0;
for(const c of group){if(query&&!(`${c.id} ${c.title} ${c.text}`.toLowerCase().includes(query)))continue;n++;const b=document.createElement('button');b.type='button';b.textContent=`${type==='osce'?'OSCE':'Case'} ${c.id} · ${c.title}`;if(practical[type].includes(c.id))b.classList.add('studied');if(!caseUi[type].intro&&c.id===caseUi[type].selected)b.classList.add('active');b.onclick=()=>selectCase(type,c.id);list.append(b)}
$(type+'-count').textContent=`${new Set(practical[type]).size} of ${group.length} studied · ${n} match the search`;
if(!n){const el=document.createElement('p');el.className='small';el.textContent='No matching cases. Clear the search to see all topics.';list.append(el)}}
function renderCases(type){const u=caseUi[type],items=CASE[type],c=items[u.selected-1],intro=u.intro,source=type==='osce'?'pdf/04_OSCE_58_Stations.pdf':'pdf/05_SOE_51_Cases.pdf';if(!u)return;
$(type+'-title').textContent=intro?'Exam format & preparation':`${type==='osce'?'OSCE':'SOE Case'} ${c.id} · ${c.title}`;
$(type+'-meta').textContent=intro?'Read the original introduction and preparation guidance before practising.':`Original ${type.toUpperCase()} PDF pages ${c.start}–${c.end}. For source diagrams or exact table layout, open the PDF.`;
$(type+'-pdf').href=source+'#page='+(intro?1:c.start);
$(type+'-text').textContent=intro?CASE[type+'Intro']:c.text;
$(type+'-studied').hidden=intro;$(type+'-studied').textContent=practical[type].includes(c.id)?'✓ Studied · undo':'☆ Mark as studied';
$(type+'-intro').textContent=intro?'Back to station':'Exam guidance';
for(const suffix of ['prev','prev2'])$(type+'-'+suffix).disabled=intro||u.selected===1;for(const suffix of ['next','next2'])$(type+'-'+suffix).disabled=intro||u.selected===items.length;
renderCaseIndex(type)}
// Offline status and cache are independent from optional 18 MB PDFs.
let offlineStatus='';function updateOffline(x){offlineStatus=x;const el=$('offlineStatus');if(el)el.textContent=x}
const pageChunks=Array.from({length:7},(_,i)=>`./assets/page-${String(i).padStart(2,'0')}.js`);
const PDFs=['./pdf/01_Revision_Guide.pdf','./pdf/02_SBA_800_Questions.pdf','./pdf/03_SBA_800_Answers_Explanations.pdf','./pdf/04_OSCE_58_Stations.pdf','./pdf/05_SOE_51_Cases.pdf'];
async function checkOffline(){if(!('caches' in window)){updateOffline('This browser does not expose offline cache storage.');return}try{const cachesNames=await caches.keys(),c=await caches.open('implant-fpros-style-v3');const core=['./index.html','./quiz-app.js','./data/questions.js','./data/revision.js','./data/cases.js'];const has=await Promise.all(core.map(x=>c.match(x)));const pages=await Promise.all(pageChunks.map(x=>c.match(x)));const pdf=await Promise.all(PDFs.map(x=>c.match(x)));
const ncore=has.filter(Boolean).length,npage=pages.filter(Boolean).length,npdf=pdf.filter(Boolean).length;
updateOffline(`Offline essentials: ${ncore}/${core.length} · formatted notebook: ${npage}/7 groups · original PDFs: ${npdf}/5.`);
$('offlineDetails').textContent=ncore===core.length?'All core readers and SBA data are cached on this device.':'Open the website while online and reload to finish caching the core content.';
const home=$('homeOfflineStatus');home.textContent=ncore===core.length?'Core study offline-ready':'Offline files still loading';home.title=offlineStatus;
}catch(e){updateOffline('Offline readiness check failed: '+e.message)}}
async function cacheSequence(items,label){if(location.protocol!=='https:'&&location.hostname!=='localhost'){updateOffline('Offline caching requires the published HTTPS GitHub Pages website.');return}
if(!('caches' in window)){updateOffline('This browser does not support cache storage.');return}
const c=await caches.open('implant-fpros-style-v3');let good=0;for(const path of items){try{if(!await c.match(path)){const r=await fetch(path,{cache:'reload'});if(!r.ok)throw Error('HTTP '+r.status);await c.put(path,r.clone())}good++}catch(e){updateOffline(`Saved ${good} of ${items.length} ${label}. ${path} failed (${e.message}). Retry on Wi-Fi.`);return}updateOffline(`Saving ${label}: ${good} of ${items.length}…`)}await checkOffline();updateOffline(`Saved ${items.length} of ${items.length} ${label}. `+offlineStatus)}
function initOffline(){const p=$('savePagesOffline'),d=$('savePdfsOffline');p.onclick=async()=>{p.disabled=true;try{await cacheSequence(pageChunks,'notebook page groups')}finally{p.disabled=false}};d.onclick=async()=>{d.disabled=true;try{await cacheSequence(PDFs,'PDFs')}finally{d.disabled=false}};$('checkOffline').onclick=checkOffline;
if('serviceWorker' in navigator&&/^https?:/.test(location.protocol))navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(()=>navigator.serviceWorker.ready).then(checkOffline).catch(()=>checkOffline());else if('caches' in window)checkOffline();
}
function init(){initNotes();buildCase('osce');buildCase('soe');initOffline();route()}
init();
})();
