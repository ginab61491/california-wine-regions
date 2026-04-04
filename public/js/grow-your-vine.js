// grow-your-vine.js — Interactive viticulture cycle explorer
document.addEventListener('DOMContentLoaded', () => {
  let data = null;
  let tab = 'explore';
  let sv = 0;
  let diff = 'beginner';
  let hemi = 'north';
  let openItem = null;
  let showRegions = false;
  let initialized = false;
  // Quiz
  let qi = 0; let sel = null; let sub = false; let score = 0; let total = 0; let qOrd = [];

  const SC = ['#5A7B6B','#6B8B5A','#5A8B5A','#8B7B5A','#8B5A4A'];

  function getStageIdx(val) { return val <= 10 ? 0 : val <= 30 ? 1 : val <= 55 ? 2 : val <= 80 ? 3 : 4; }
  function shuffle(n) { const a=[...Array(n).keys()]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

  function render() {
    const c = document.getElementById('gv-content');
    if (!c || !data) return;
    if (tab === 'explore') renderExplore(c);
    else renderQuiz(c);
  }

  // ── EXPLORE ──
  function renderExplore(c) {
    const si = getStageIdx(sv);
    const stage = data.stages[si];
    const sc = SC[si];
    const secs = stage.sections[diff];
    const seasonLabel = hemi === 'north' ? stage.seasonN : stage.seasonS;

    c.innerHTML = `
      <!-- Slider -->
      <div class="gv-slider-wrap">
        <div class="gv-slider-track">
          <div class="gv-slider-bg" style="background:linear-gradient(90deg,${SC.map(c=>c+'44').join(',')})"></div>
          <div class="gv-slider-fill" style="width:${sv}%;background:linear-gradient(90deg,${SC[0]}88,${sc}cc)"></div>
          <input type="range" min="0" max="100" value="${sv}" class="gv-slider-input" id="gv-slider">
        </div>
        <div class="gv-slider-labels">
          ${data.stages.map((s, i) => `<span class="gv-slider-label" style="color:${i === si ? SC[i]+'cc' : 'var(--gv-faint)'};font-weight:${i === si ? 600 : 400}">${s.label.split(' & ')[0].split(' ')[0]}</span>`).join('')}
        </div>
      </div>

      <!-- Stage header -->
      <div class="gv-stage-header">
        <div>
          <div class="gv-stage-label" style="color:${sc}">${stage.label}</div>
          <div class="gv-stage-season">${stage.seasonLabel} · ${seasonLabel}</div>
          <div class="gv-hemi-toggle">
            <button class="gv-hemi-btn ${hemi==='north'?'active':''}" data-hemi="north">Northern</button>
            <button class="gv-hemi-btn ${hemi==='south'?'active':''}" data-hemi="south">Southern</button>
          </div>
        </div>
      </div>

      <!-- Overview -->
      <div class="gv-overview">${stage.overviews[diff]}</div>

      <!-- Decisions -->
      ${secs.decisions.length ? `<div class="gv-section">
        <div class="gv-section-title" style="color:${sc}">Key Decisions</div>
        ${secs.decisions.map((d, i) => `<div class="gv-item ${openItem === 'd'+i ? 'open' : ''}" data-item="d${i}">
          <div class="gv-item-title">${d.title} <span class="gv-item-arrow">&#9662;</span></div>
          ${openItem === 'd'+i ? `<div class="gv-item-text">${d.text}</div>` : ''}
        </div>`).join('')}
      </div>` : ''}

      <!-- Risks -->
      ${secs.risks.length ? `<div class="gv-section">
        <div class="gv-section-title" style="color:var(--gv-incorrect)">Risks</div>
        ${secs.risks.map((r, i) => `<div class="gv-item ${openItem === 'r'+i ? 'open' : ''}" data-item="r${i}">
          <div class="gv-item-title">${r.title} <span class="gv-item-arrow">&#9662;</span></div>
          ${openItem === 'r'+i ? `<div class="gv-item-text">${r.text}</div>` : ''}
        </div>`).join('')}
      </div>` : ''}

      <!-- Regional notes -->
      <button class="gv-regions-toggle" id="gv-regions-toggle">
        <span class="gv-regions-label">Regional Notes</span>
        <span class="gv-regions-arrow ${showRegions ? 'open' : ''}">&#8250;</span>
      </button>
      ${showRegions ? stage.regionalNotes.map(r => `<div class="gv-region-note">
        <div class="gv-region-name">${r.region}</div>
        <div class="gv-region-text">${r.note}</div>
      </div>`).join('') : ''}
    `;

    // Wire
    document.getElementById('gv-slider').addEventListener('input', e => { sv = +e.target.value; openItem = null; showRegions = false; render(); });
    c.querySelectorAll('.gv-hemi-btn').forEach(b => b.addEventListener('click', () => { hemi = b.dataset.hemi; render(); }));
    c.querySelectorAll('.gv-item').forEach(el => el.addEventListener('click', () => { openItem = openItem === el.dataset.item ? null : el.dataset.item; render(); }));
    document.getElementById('gv-regions-toggle').addEventListener('click', () => { showRegions = !showRegions; render(); });
  }

  // ── QUIZ ──
  function renderQuiz(c) {
    const qs = data.quiz[diff];
    if (!qOrd.length) qOrd = shuffle(qs.length);
    const curQ = qs[qOrd[qi % qs.length]];
    const isCorrect = sel === curQ.answer;

    c.innerHTML = `
      <div class="gv-quiz-bar">
        <span>Question ${total + 1}</span>
        <span class="gv-quiz-score-val">${score}/${total} correct</span>
      </div>

      <div class="gv-quiz-card">
        <div class="gv-quiz-q">${curQ.q}</div>
        <div class="gv-quiz-season">Season: ${curQ.season}</div>
      </div>

      <div class="gv-quiz-opts">
        ${curQ.options.map((opt, i) => {
          let cls = 'gv-quiz-opt';
          if (sub && i === curQ.answer) cls += ' correct';
          else if (sub && i === sel && !isCorrect) cls += ' wrong';
          else if (!sub && sel === i) cls += ' selected';
          return `<button class="${cls}" data-idx="${i}" ${sub ? 'disabled' : ''}><span class="gv-quiz-opt-letter">${String.fromCharCode(65+i)}</span>${opt}</button>`;
        }).join('')}
      </div>

      ${sub ? `<div class="gv-quiz-expl ${isCorrect ? 'correct' : 'wrong'}">
        <div class="gv-quiz-expl-label" style="color:${isCorrect ? 'var(--gv-correct)' : 'var(--gv-incorrect)'}">${isCorrect ? 'Correct' : 'Incorrect'}</div>
        <div class="gv-quiz-expl-text">${curQ.why}</div>
      </div>` : ''}

      <button class="gv-btn" id="gv-quiz-action" ${!sub && sel === null ? 'disabled' : ''}>${!sub ? 'Check' : 'Next'}</button>
    `;

    if (!sub) {
      c.querySelectorAll('.gv-quiz-opt').forEach(b => b.addEventListener('click', () => { sel = parseInt(b.dataset.idx); render(); }));
    }
    document.getElementById('gv-quiz-action').addEventListener('click', () => {
      if (!sub) { sub = true; total++; if (sel === curQ.answer) score++; }
      else { qi++; sel = null; sub = false; }
      render();
    });
  }

  // ── Toggle + levels ──
  document.querySelectorAll('.gv-toggle-btn').forEach(b => b.addEventListener('click', () => {
    tab = b.dataset.tab;
    document.querySelectorAll('.gv-toggle-btn').forEach(x => x.classList.toggle('active', x.dataset.tab === tab));
    if (tab === 'quiz') { qOrd = shuffle(data.quiz[diff].length); qi = 0; sel = null; sub = false; score = 0; total = 0; }
    openItem = null; showRegions = false; render();
  }));
  document.querySelectorAll('.gv-level-btn').forEach(b => b.addEventListener('click', () => {
    diff = b.dataset.level;
    document.querySelectorAll('.gv-level-btn').forEach(x => x.classList.toggle('active', x.dataset.level === diff));
    openItem = null;
    if (tab === 'quiz') { qOrd = shuffle(data.quiz[diff].length); qi = 0; sel = null; sub = false; score = 0; total = 0; }
    render();
  }));

  // ── Init ──
  async function init() {
    if (initialized) return; initialized = true;
    try { const res = await fetch('/data/grow-your-vine.json'); data = await res.json(); } catch { return; }
    render();
  }
  const observer = new MutationObserver(() => { const sec = document.getElementById('growyourvine-section'); if (sec && sec.classList.contains('active')) init(); });
  const sec = document.getElementById('growyourvine-section');
  if (sec) { observer.observe(sec, { attributes: true, attributeFilter: ['class'] }); if (sec.classList.contains('active')) init(); }
});
