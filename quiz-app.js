/* M Imp Dent RCSEd SBA player — progress/scoring audit revision. No external dependencies. */
(function () {
  'use strict';
  const data = window.IMPLANT_QUIZ_DATA;
  const $ = (id) => document.getElementById(id);
  const KEY = 'mimpdent-study-progress-v1'; // Keep old key to preserve users' existing progress.
  const FORMAT = 'mimpdent-study-progress-v2';
  const LETTERS = ['A', 'B', 'C', 'D', 'E'];
  const isLetter = (value) => typeof value === 'string' && LETTERS.includes(value);
  const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
  const percent = (num, den) => den ? Math.round(100 * num / den) + '%' : '—';
  const views = ['setupView', 'sessionView', 'resultsView', 'browseView'];
  let storageWorks = true;

  if (!data || !Array.isArray(data.questions) || data.questions.length !== 800 ||
      new Set(data.questions.map(q => q.id)).size !== 800 ||
      data.questions.some(q => !Number.isInteger(q.id) || q.id < 1 || q.id > 800 ||
        !isLetter(q.answer) || LETTERS.some(letter => !q.options || !q.options[letter]))) {
    document.body.insertAdjacentHTML('beforeend', '<p role="alert">Question data failed validation. Reload this page or reinstall the offline copy.</p>');
    return;
  }
  const questions = data.questions;
  const byId = new Map(questions.map(q => [q.id, q]));

  function cleanRecords(raw) {
    const records = {};
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return records;
    for (const q of questions) {
      const source = raw[String(q.id)];
      if (!source || typeof source !== 'object' || Array.isArray(source)) continue;
      const selected = isLetter(source.selected) ? source.selected : null;
      const checked = Boolean(source.checked && selected);
      const bookmarked = Boolean(source.bookmarked);
      const attempts = checked ? (Number.isInteger(source.attempts) && source.attempts > 0 ? Math.min(source.attempts, 100000) : 1) : 0;
      const firstSelected = checked ? (isLetter(source.firstSelected) ? source.firstSelected : selected) : null;
      const correctAttempts = checked ? (Number.isInteger(source.correctAttempts) && source.correctAttempts >= 0 ?
        Math.min(source.correctAttempts, attempts) : Number(selected === q.answer)) : 0;
      if (checked || bookmarked) records[q.id] = {
        bookmarked, checked, selected, attempts, firstSelected, correctAttempts,
        answeredAt: typeof source.answeredAt === 'string' ? source.answeredAt : null
      };
    }
    return records;
  }
  function cleanSession(raw, importMode = false) {
    if (!raw || typeof raw !== 'object' || !Array.isArray(raw.ids)) return null;
    const ids = raw.ids.map(Number);
    if (!ids.length || ids.length > 800 || ids.some(id => !byId.has(id)) || new Set(ids).size !== ids.length) return null;
    const answers = {};
    for (const id of ids) {
      const a = raw.answers && raw.answers[id];
      const selected = a && isLetter(a.selected) ? a.selected : null;
      answers[id] = {selected, checked: Boolean(a && a.checked && selected)};
    }
    const timed = Boolean(raw.timed);
    const lengthMs = ids.length * 80000;
    const deadline = Number.isFinite(raw.deadline) && raw.deadline > 0 ? raw.deadline : null;
    let remainingMs = Number.isFinite(raw.remainingMs) ? Math.max(0, Math.min(raw.remainingMs, lengthMs)) :
      (deadline ? Math.max(0, Math.min(lengthMs, deadline - Date.now())) : lengthMs);
    const paused = Boolean(importMode || raw.paused);
    // Imported timers are always paused to avoid being consumed in transit.
    return {
      ids,
      index: Number.isInteger(raw.index) ? Math.max(0, Math.min(ids.length - 1, raw.index)) : 0,
      answers,
      label: typeof raw.label === 'string' ? raw.label.slice(0, 100) : 'Saved practice',
      timed,
      created: Number.isFinite(raw.created) ? raw.created : Date.now(),
      paused,
      remainingMs: timed ? remainingMs : null,
      deadline: timed && !paused ? (deadline || Date.now() + remainingMs) : null
    };
  }
  function cleanResult(raw) {
    if (!raw || !Array.isArray(raw.ids) || raw.ids.some(id => !byId.has(id))) return null;
    const ids = [...new Set(raw.ids)].slice(0, 800);
    if (!ids.length) return null;
    const correct = Math.max(0, Math.min(ids.length, Number(raw.correct) || 0));
    const checked = Math.max(correct, Math.min(ids.length, Number(raw.checked) || 0));
    const wrongIds = Array.isArray(raw.wrongIds) ? raw.wrongIds.filter(id => ids.includes(id)) : [];
    const unansweredIds = Array.isArray(raw.unansweredIds) ? raw.unansweredIds.filter(id => ids.includes(id)) : [];
    return {label: String(raw.label || 'Session results').slice(0, 110), ids, correct, checked,
      wrongIds: [...new Set(wrongIds)], unansweredIds: [...new Set(unansweredIds)],
      finishedAt: typeof raw.finishedAt === 'string' ? raw.finishedAt : null};
  }
  function read() {
    try {
      const value = localStorage.getItem(KEY);
      return value ? JSON.parse(value) : {};
    } catch (error) {
      storageWorks = false;
      return {};
    }
  }
  const loaded = read();
  const store = {
    records: cleanRecords(loaded.records),
    lastResult: cleanResult(loaded.lastResult)
  };
  let session = cleanSession(loaded.session);
  let browseShown = 75;
  let browseMatches = [];

  function showStorageWarning() {
    $('storageWarning').classList.toggle('hidden', storageWorks);
    if (!storageWorks) $('storageWarning').textContent =
      'This browser is preventing progress from being saved. Answers work for now but may disappear when you close the page. Export your progress and allow website storage before continuing.';
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({...store, session}));
      // Safari private browsing and restricted storage can throw on write.
    } catch (error) { storageWorks = false; }
    showStorageWarning();
  }
  function record(id) { return store.records[String(id)] || {}; }
  function isAnswered(id) { const r = record(id); return Boolean(r.checked && isLetter(r.selected)); }
  function tally() {
    let answered = 0, latestCorrect = 0, firstCorrect = 0, bookmarked = 0, attempts = 0;
    for (const q of questions) {
      const r = record(q.id);
      if (r.bookmarked) bookmarked++;
      if (isAnswered(q.id)) {
        answered++; attempts += r.attempts || 1;
        if (r.selected === q.answer) latestCorrect++;
        if (r.firstSelected === q.answer) firstCorrect++;
      }
    }
    $('answeredCount').textContent = answered + ' / 800';
    $('accuracyCount').textContent = percent(latestCorrect, answered);
    $('firstAccuracyCount').textContent = percent(firstCorrect, answered);
    $('bookmarkedCount').textContent = bookmarked;
    $('progressDetails').textContent = `${answered} checked · ${800 - answered} remaining · ${latestCorrect} currently correct`;
    $('globalProgress').style.width = `${answered / 8}%`;
    $('globalProgressBar').setAttribute('aria-valuenow', String(answered));
    $('attemptsInfo').textContent = `${attempts} marked attempt${attempts === 1 ? '' : 's'} across ${answered} unique questions. Retakes change latest accuracy; first-attempt accuracy stays fixed.`;
    const rows = $('blockProgressRows'); rows.innerHTML = '';
    for (const b of data.blocks) {
      let done = 0, correct = 0;
      for (let i = b.start; i <= b.end; i++) {
        if (!isAnswered(i)) continue;
        done++; if (record(i).selected === byId.get(i).answer) correct++;
      }
      const total = b.end - b.start + 1;
      const tr = document.createElement('tr');
      for (const value of [`${b.letter} · ${b.title}`, `${done} / ${total}`, `${correct} / ${done}`, percent(done, total)]) {
        const td = document.createElement('td'); td.textContent = value; tr.appendChild(td);
      }
      rows.appendChild(tr);
    }
  }
  function view(name) {
    views.forEach(id => $(id).classList.toggle('hidden', id !== name));
    if (name === 'setupView') {
      tally();
      $('resumeBtn').classList.toggle('hidden', !session);
      $('resumeBtn').textContent = session ? `Resume ${session.timed ? 'timed ' : ''}session (${session.ids.length} questions)` : 'Resume session';
      $('viewLastResultBtn').classList.toggle('hidden', !store.lastResult);
    }
    window.scrollTo({top: 0, behavior: 'instant'});
  }
  function populate() {
    const sel = $('blockFilter'), browse = $('browseTopic');
    for (const [value, label] of [['ALL', 'All 800 questions'], ['NEW', 'Not yet checked'],
      ['WRONG', 'Incorrect on latest attempt'], ['BOOKMARKED', 'Bookmarked questions']]) sel.add(new Option(label, value));
    for (const b of data.blocks) {
      const label = `Block ${b.letter} · Q${b.start}–${b.end}: ${b.title}`;
      sel.add(new Option(label, b.letter)); browse.add(new Option(label, b.letter));
    }
    const block = new URLSearchParams(location.search).get('block');
    if (block && [...sel.options].some(x => x.value === block)) sel.value = block;
  }
  function poolFor(filter) {
    if (filter === 'ALL') return questions;
    if (filter === 'NEW') return questions.filter(q => !isAnswered(q.id));
    if (filter === 'WRONG') return questions.filter(q => isAnswered(q.id) && record(q.id).selected !== q.answer);
    if (filter === 'BOOKMARKED') return questions.filter(q => record(q.id).bookmarked);
    return questions.filter(q => q.block === filter);
  }
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function start(ids, label, timed) {
    if (!ids.length) {
      $('setupInfo').textContent = 'No matching questions. Try another topic, or check your completed/incorrect filters.';
      return false;
    }
    if (session && !confirm('An unfinished session is saved. Start a new session and replace it? Previously checked answers remain in overall progress.')) return false;
    session = cleanSession({ids, index: 0, answers: {}, label, timed, created: Date.now(),
      paused: false, remainingMs: timed ? ids.length * 80000 : null,
      deadline: timed ? Date.now() + ids.length * 80000 : null});
    save(); view('sessionView'); renderQuestion(true); return true;
  }
  function runSetup() {
    const filter = $('blockFilter').value;
    const arr = poolFor(filter).map(q => q.id);
    if ($('shuffleCheck').checked) shuffle(arr);
    const size = $('sizeSelect').value;
    const n = size === 'all' ? arr.length : Math.min(Number(size), arr.length);
    const label = ({ALL: 'All topics', NEW: 'Not yet checked', WRONG: 'Retry incorrect', BOOKMARKED: 'Bookmarked'}[filter]) || `Block ${filter}`;
    start(arr.slice(0, n), label, $('timedCheck').checked);
  }
  function current() { return session ? byId.get(session.ids[session.index]) : null; }
  function attempt(id) {
    if (!hasOwn(session.answers, id)) session.answers[id] = {selected: null, checked: false};
    return session.answers[id];
  }
  function checkedInSession() { return session.ids.filter(id => session.answers[id] && session.answers[id].checked).length; }
  function remaining() { return Math.max(0, session.deadline - Date.now()); }
  function checkDeadline() {
    if (!session || !session.timed || session.paused) return false;
    if (remaining() > 0) return false;
    finish('Time expired', true);
    return true;
  }
  function displayTime() {
    if (!session) return;
    if (!session.timed) { $('sessionTime').textContent = 'Untimed'; return; }
    const remain = Math.ceil((session.paused ? session.remainingMs : remaining()) / 1000);
    $('sessionTime').textContent = `⏱ ${Math.floor(remain / 60)}:${String(remain % 60).padStart(2, '0')} remaining`;
  }
  function buildJump() {
    const sel = $('jumpSelect'); sel.innerHTML = '';
    for (let i = 0; i < session.ids.length; i++) {
      const id = session.ids[i], a = session.answers[id];
      const state = a && a.checked ? (a.selected === byId.get(id).answer ? '✓' : '✕') : '○';
      sel.add(new Option(`${i + 1}. Q${id} ${state}`, String(i)));
    }
    sel.value = String(session.index);
  }
  function renderQuestion(rebuildJump = false) {
    if (!session || checkDeadline()) return;
    const q = current();
    if (!q) { session = null; save(); view('setupView'); return; }
    const a = attempt(q.id);
    $('sessionTitle').textContent = session.label;
    $('questionPosition').textContent = `Question ${session.index + 1} of ${session.ids.length}`;
    const checked = checkedInSession();
    $('checkedPosition').textContent = `${checked} / ${session.ids.length} checked`;
    $('sessionProgress').style.width = `${100 * checked / session.ids.length}%`;
    displayTime();
    $('qBlock').textContent = `Block ${q.block} · ${q.topic}`;
    $('qNumber').textContent = `Question ${q.id}`;
    $('qStem').textContent = q.stem;
    $('bookmarkBtn').textContent = record(q.id).bookmarked ? '★ Bookmarked' : '☆ Bookmark';
    $('bookmarkBtn').setAttribute('aria-pressed', record(q.id).bookmarked ? 'true' : 'false');
    $('previousBtn').disabled = session.index === 0;
    $('nextBtn').textContent = session.index === session.ids.length - 1 ? 'Finish & score →' : 'Next →';
    $('nextUnansweredBtn').disabled = checked === session.ids.length;
    const options = $('qOptions'); options.innerHTML = '';
    for (const letter of LETTERS) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'option';
      button.setAttribute('aria-pressed', a.selected === letter ? 'true' : 'false');
      if (a.selected === letter) button.classList.add('selected');
      if (a.checked && letter === q.answer) button.classList.add('correct');
      if (a.checked && a.selected === letter && letter !== q.answer) button.classList.add('incorrect');
      button.disabled = a.checked;
      const chip = document.createElement('span'), text = document.createElement('span');
      chip.className = 'letter'; chip.textContent = letter; text.textContent = q.options[letter];
      button.append(chip, text);
      button.onclick = () => { const attemptNow = attempt(q.id); if (attemptNow.checked) return;
        attemptNow.selected = letter; save(); renderQuestion(); };
      options.appendChild(button);
    }
    $('answerPanel').classList.toggle('hidden', !a.checked);
    $('answerTitle').textContent = a.checked ? `${a.selected === q.answer ? 'Correct ✓' : 'Incorrect ✕'} · Answer ${q.answer}: ${q.options[q.answer]}` : '';
    $('answerText').textContent = a.checked ? q.explanation : '';
    $('sourcePages').textContent = `Source: question on original PDF page ${q.question_page}; explanation on page ${q.answer_page}.`;
    $('revealBtn').textContent = a.checked ? 'Answer checked ✓' : 'Check answer & explain';
    $('revealBtn').disabled = a.checked || !a.selected;
    $('qFeedback').textContent = a.checked ? `Marked ${a.selected === q.answer ? 'correct' : 'incorrect'} · ${checked} of ${session.ids.length} questions checked.` :
      (a.selected ? `Option ${a.selected} selected. Select “Check answer & explain” to record a mark.` : 'Select A–E to answer, or navigate on without checking. Unchecked questions are not scored as correct.');
    if (rebuildJump) buildJump(); else {
      const jump = $('jumpSelect');
      jump.value = String(session.index);
      const option = jump.options[session.index];
      if (option) option.textContent = `${session.index + 1}. Q${q.id} ${a.checked ? (a.selected === q.answer ? '✓' : '✕') : '○'}`;
    }
    save();
  }
  function reveal() {
    if (!session || checkDeadline()) return;
    const q = current(), a = attempt(q.id);
    if (!a.selected || a.checked) return; // Never mark a blank answer as a graded attempt.
    a.checked = true;
    const old = record(q.id), wasAnswered = isAnswered(q.id);
    store.records[q.id] = {
      ...old,
      checked: true,
      selected: a.selected,
      bookmarked: Boolean(old.bookmarked),
      firstSelected: wasAnswered ? old.firstSelected : a.selected,
      attempts: (wasAnswered ? old.attempts || 1 : 0) + 1,
      correctAttempts: (wasAnswered ? old.correctAttempts || 0 : 0) + Number(a.selected === q.answer),
      answeredAt: new Date().toISOString()
    };
    save(); renderQuestion();
    $('answerPanel').scrollIntoView({behavior: 'smooth', block: 'nearest'});
  }
  function moveTo(index) {
    if (!session || checkDeadline()) return;
    session.index = Math.max(0, Math.min(session.ids.length - 1, index));
    save(); renderQuestion(); window.scrollTo({top: 65, behavior: 'smooth'});
  }
  function move(delta) { moveTo(session.index + delta); }
  function nextUnchecked() {
    if (!session || checkDeadline()) return;
    for (let offset = 1; offset <= session.ids.length; offset++) {
      const index = (session.index + offset) % session.ids.length;
      if (!session.answers[session.ids[index]]?.checked) { moveTo(index); return; }
    }
    $('qFeedback').textContent = 'Every question in this session is checked. Select Finish & score.';
  }
  function bookmark() {
    if (!session) return;
    const q = current(), old = record(q.id);
    store.records[q.id] = {...old, bookmarked: !old.bookmarked};
    save(); renderQuestion();
  }
  function pauseAndExit() {
    if (!session) return;
    if (session.timed && !session.paused) {
      session.remainingMs = remaining(); session.deadline = null; session.paused = true;
    }
    save(); view('setupView');
  }
  function resume() {
    if (!session) return;
    if (session.timed && session.paused) {
      session.deadline = Date.now() + session.remainingMs;
      session.paused = false;
    }
    save(); view('sessionView'); renderQuestion(true);
  }
  function finish(label = 'Session complete', forced = false) {
    if (!session) return;
    const ids = [...session.ids];
    const checked = checkedInSession();
    if (!forced && checked < ids.length && !confirm(`${ids.length - checked} question(s) are not checked. Finish anyway? They count as zero in the session score.`)) return;
    let correct = 0;
    const wrongIds = [], unansweredIds = [];
    for (const id of ids) {
      const a = session.answers[id];
      if (!a || !a.checked || !a.selected) { unansweredIds.push(id); continue; }
      if (a.selected === byId.get(id).answer) correct++; else wrongIds.push(id);
    }
    const result = {label, ids, correct, checked, wrongIds, unansweredIds, finishedAt: new Date().toISOString()};
    store.lastResult = result;
    session = null; save(); showResult(result);
  }
  function showResult(result) {
    $('resultsTitle').textContent = result.label;
    $('resultCorrect').textContent = result.correct;
    $('resultAttempted').textContent = `${result.checked} / ${result.ids.length}`;
    $('resultScore').textContent = percent(result.correct, result.ids.length);
    $('resultAccuracy').textContent = percent(result.correct, result.checked);
    $('resultsBreakdown').textContent = `${result.wrongIds.length} incorrect, ${result.unansweredIds.length} unchecked. Score uses all ${result.ids.length} assigned questions as the denominator; checked-only accuracy uses ${result.checked}.`;
    $('reviewWrongBtn').disabled = !result.wrongIds.length;
    $('reviewWrongBtn').textContent = result.wrongIds.length ? `Retry ${result.wrongIds.length} incorrect` : 'No incorrect answers';
    $('reviewUnansweredBtn').disabled = !result.unansweredIds.length;
    $('reviewUnansweredBtn').textContent = result.unansweredIds.length ? `Complete ${result.unansweredIds.length} unchecked` : 'No unchecked questions';
    view('resultsView');
  }
  function browse() { view('browseView'); browseShown = 75; renderBrowse(); }
  function renderBrowse() {
    const search = $('browseSearch').value.trim().toLowerCase(), block = $('browseTopic').value;
    browseMatches = questions.filter(q => (block === 'ALL' || block === q.block) &&
      (!search || (`${q.id} ${q.stem} ${Object.values(q.options).join(' ')} ${q.topic}`).toLowerCase().includes(search)));
    $('browseCount').textContent = `${browseMatches.length} matching question${browseMatches.length === 1 ? '' : 's'}`;
    const box = $('browseResults'); box.innerHTML = '';
    for (const q of browseMatches.slice(0, browseShown)) {
      const button = document.createElement('button'); button.className = 'browser-row';
      const left = document.createElement('span'), title = document.createElement('span'), meta = document.createElement('span');
      left.style.minWidth = '0'; title.className = 'qtitle'; meta.className = 'qmeta';
      title.textContent = `Q${q.id} · ${q.stem.length > 175 ? q.stem.slice(0, 175) + '…' : q.stem}`;
      meta.textContent = `Block ${q.block} · ${q.topic}`;
      left.append(title, meta);
      const r = record(q.id), state = document.createElement('span'); state.className = 'tag';
      state.textContent = isAnswered(q.id) ? (r.selected === q.answer ? `Correct · ${r.attempts || 1} try` : `Incorrect · ${r.attempts || 1} try`) : (r.bookmarked ? '★ Bookmark' : 'Open →');
      button.append(left, state); button.onclick = () => start([q.id], `Question ${q.id}`, false); box.append(button);
    }
    $('loadMoreBtn').classList.toggle('hidden', browseMatches.length <= browseShown);
  }
  function exportData() {
    const sessionExport = session ? {...session,
      paused: Boolean(session.timed),
      remainingMs: session.timed ? (session.paused ? session.remainingMs : remaining()) : null,
      deadline: null} : null;
    const payload = {format: FORMAT, exportedAt: new Date().toISOString(),
      records: store.records, session: sessionExport, lastResult: store.lastResult};
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob), anchor = document.createElement('a');
    anchor.href = url; anchor.download = `MImpDent_SBA_progress_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }
  async function importData(file) {
    try {
      const body = JSON.parse(await file.text());
      if (!['mimpdent-study-progress-v1', FORMAT].includes(body.format) ||
        !body.records || typeof body.records !== 'object' || Array.isArray(body.records)) throw Error('Not a compatible progress file');
      const records = cleanRecords(body.records);
      const incomingSession = body.format === FORMAT ? cleanSession(body.session, true) : null;
      const incomingResult = body.format === FORMAT ? cleanResult(body.lastResult) : null;
      if (!confirm('Replace ALL existing answers, bookmarks and any unfinished session with the imported progress?')) return;
      store.records = records; store.lastResult = incomingResult; session = incomingSession;
      save(); view('setupView'); $('setupInfo').textContent = 'Progress imported. Check the completed-question and topic totals above.';
    } catch (error) { alert('Could not import progress: ' + error.message); }
  }
  function reset() {
    if (!confirm('Erase ALL saved SBA answers, attempt history, bookmarks, results and the unfinished session on this device? This cannot be undone.')) return;
    store.records = {}; store.lastResult = null; session = null;
    save(); view('setupView'); $('setupInfo').textContent = 'Progress has been reset on this device.';
  }
  function bind() {
    populate(); tally(); showStorageWarning();
    $('startBtn').onclick = runSetup;
    $('resumeBtn').onclick = resume;
    $('viewLastResultBtn').onclick = () => {if (store.lastResult) showResult(store.lastResult);};
    $('browseBtn').onclick = browse; $('browseBack').onclick = () => view('setupView');
    $('exitSession').onclick = pauseAndExit;
    $('revealBtn').onclick = reveal; $('bookmarkBtn').onclick = bookmark;
    $('previousBtn').onclick = () => move(-1);
    $('nextBtn').onclick = () => { if (!session) return; if (session.index === session.ids.length - 1) finish(); else move(1); };
    $('nextUnansweredBtn').onclick = nextUnchecked;
    $('jumpSelect').onchange = () => moveTo(Number($('jumpSelect').value));
    $('finishBtn').onclick = () => finish();
    $('newSessionBtn').onclick = () => view('setupView');
    $('reviewWrongBtn').onclick = () => { if (store.lastResult?.wrongIds.length) start([...store.lastResult.wrongIds], 'Retry incorrect', false); };
    $('reviewUnansweredBtn').onclick = () => { if (store.lastResult?.unansweredIds.length) start([...store.lastResult.unansweredIds], 'Complete unchecked', false); };
    $('browseSearch').addEventListener('input', () => {browseShown = 75; renderBrowse();});
    $('browseTopic').onchange = () => {browseShown = 75; renderBrowse();};
    $('loadMoreBtn').onclick = () => {browseShown += 75; renderBrowse();};
    $('exportBtn').onclick = exportData;
    $('importBtn').onclick = () => $('importFile').click();
    $('importFile').onchange = e => { if (e.target.files?.[0]) importData(e.target.files[0]); e.target.value = ''; };
    $('clearBtn').onclick = reset;
    document.addEventListener('keydown', e => {
      if ($('sessionView').classList.contains('hidden') || /^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(document.activeElement?.tagName) ||
        e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowLeft') {e.preventDefault(); move(-1);}
      if (e.key === 'ArrowRight') {e.preventDefault(); if (session.index !== session.ids.length - 1) move(1);}
    });
    setInterval(() => {
      if (session && !$('sessionView').classList.contains('hidden')) {
        if (!checkDeadline()) displayTime();
      }
    }, 1000);
    view('setupView');
  }
  bind();
})();
