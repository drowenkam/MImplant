(function(){'use strict';
const data=window.IMPLANT_REVISION_DATA;if(!data)return;
const topics=document.getElementById('topics'),article=document.getElementById('article'),search=document.getElementById('noteSearch'),fontButton=document.getElementById('readerFont');
let savedSize=false;try{savedSize=localStorage.getItem('implant-revision-large')==='1'}catch(_){}
let active=new URLSearchParams(location.search).get('s')||data.sections[2].id, term='', large=savedSize;
function esc(t){return String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function highlight(t){const safe=esc(t);if(!term)return safe;const re=new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi');return safe.replace(re,m=>`<mark>${m}</mark>`);}
function setFont(){article.classList.toggle('read-plus',large);fontButton.textContent=large?'A− text':'A+ text'}
function getSection(id){return data.sections.find(s=>s.id===id)||data.sections[0]}
function nav(){topics.innerHTML='';data.sections.forEach(s=>{const b=document.createElement('button');b.className='nav-section'+(s.id===active?' active':'');b.textContent=s.title;b.onclick=()=>select(s.id);topics.appendChild(b)})}
function select(id){active=id;try{history.replaceState(null,'','?s='+encodeURIComponent(id))}catch(_){}render();if(window.innerWidth<761)window.scrollTo({top:0,behavior:'smooth'});}
function render(){nav();setFont();const s=getSection(active);const query=term.toLowerCase();article.innerHTML='';const top=document.createElement('div');top.className='article-header';top.innerHTML=`<div class="eyebrow">Revision notebook · source pages ${s.start}–${s.end}</div><h2>${esc(s.title)}</h2><p class="small">${s.pages.length} PDF pages · exact source text transcribed into a searchable mobile reader. Tables may read best in the formatted PDF.</p>`;article.appendChild(top);
let matched=0;
s.pages.forEach(p=>{if(query && !p.text.toLowerCase().includes(query))return;matched++;const card=document.createElement('section');card.className='article-page';card.id='page-'+p.sourcePage;const h=document.createElement('h3');h.innerHTML=`Source PDF page ${p.sourcePage} · <a class="source-link" target="_blank" rel="noopener" href="pdf/01_Revision_Guide.pdf#page=${p.sourcePage}">Original page ↗</a>`;card.appendChild(h);p.text.split(/\n\n+/).forEach(block=>{if(!block.trim())return;const el=document.createElement('p');el.className='note-block'+(/^(?:§\s*\d+|\d+\.\d+\s|PART \d|APPENDIX|How to|The four|Quick)/i.test(block.trim())&&block.length<155?' heading':'');el.innerHTML=highlight(block);card.appendChild(el)});article.appendChild(card)});
if(!matched){
  const e=document.createElement('div');e.className='empty';
  e.innerHTML=`No matches for <strong>${esc(term)}</strong> in this topic. You can clear the search or open another matching topic.`;
  const actions=document.createElement('div');actions.className='flex empty-actions';
  const clear=document.createElement('button');clear.type='button';clear.className='btn secondary sm';clear.textContent='Clear search';
  clear.onclick=()=>{search.value='';term='';render();};actions.appendChild(clear);
  const others=data.sections.filter(x=>x.id!==s.id&&x.pages.some(p=>p.text.toLowerCase().includes(query))).slice(0,6);
  for(const other of others){const go=document.createElement('button');go.type='button';go.className='btn secondary sm';go.textContent=other.title;go.onclick=()=>select(other.id);actions.appendChild(go);}
  e.appendChild(actions);article.appendChild(e);
}
}
fontButton.addEventListener('click',()=>{large=!large;try{localStorage.setItem('implant-revision-large',large?'1':'0')}catch(_){}setFont()});
let timer;search.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{term=search.value.trim();render()},150)});
if(!data.sections.some(x=>x.id===active))active='assessment';render();
})();
