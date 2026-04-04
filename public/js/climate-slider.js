// climate-slider.js — Climate Slider: explore how climate shapes wine

document.addEventListener('DOMContentLoaded', () => {
  let data = null;
  let tab = 'explore';
  let sliderVal = 50;
  let isRed = false;
  let showRegions = false;
  let openTip = null;
  let initialized = false;

  // Quiz state
  let diff = 'beginner';
  let qi = 0;
  let qa = 50;
  let qSub = false;
  let qScore = 0;
  let qTotal = 0;
  let hint = false;
  let qOrder = [];

  function getZone(val) { return val < 33 ? 'cool' : val < 67 ? 'moderate' : 'warm'; }
  function getColor(zone) { return zone === 'cool' ? '#5A7B8B' : zone === 'moderate' ? '#7B8B5A' : '#8B5A4A'; }

  function shuffle(arr) {
    const a = [...Array(arr.length).keys()];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  function render() {
    const c = document.getElementById('cs-content');
    if (!c || !data) return;
    if (tab === 'explore') renderExplore(c);
    else renderQuiz(c);
  }

  // ── EXPLORE ───────────────────────────────────────────

  function renderExplore(c) {
    const zone = getZone(sliderVal);
    const zd = data.zones[zone];
    const zc = getColor(zone);
    const sd = isRed ? zd.reds : zd.whites;
    const attrs = [
      { key: 'fruit', label: 'Fruit', ...sd.fruit, lowLabel: isRed ? 'Red' : 'Citrus', highLabel: isRed ? 'Jammy' : 'Tropical' },
      { key: 'body', label: 'Body', ...sd.body, lowLabel: 'Light', highLabel: 'Full' },
      { key: 'acidity', label: 'Acidity', ...sd.acidity, lowLabel: 'Low', highLabel: 'High' },
      { key: 'alcohol', label: 'Alcohol', ...sd.alcohol, lowLabel: 'Low', highLabel: 'High' },
    ];

    c.innerHTML = `
      <!-- Zone header -->
      <div class="cs-zone-header">
        <svg width="56" height="88" viewBox="0 0 80 120" fill="none" style="flex-shrink:0">
          ${renderGlass(sliderVal / 100, isRed)}
        </svg>
        <div>
          <div class="cs-zone-label" style="color:${zc}">${zd.label}</div>
          <div class="cs-zone-temp">${zd.temp}</div>
          <div class="cs-wine-toggle">
            <button class="cs-wine-toggle-btn ${!isRed ? 'active' : ''}" data-wine="white">White</button>
            <button class="cs-wine-toggle-btn ${isRed ? 'active' : ''}" data-wine="red">Red</button>
          </div>
        </div>
      </div>

      <!-- Main slider -->
      <div class="cs-slider-wrap">
        <div class="cs-slider-track">
          <div class="cs-slider-bg" style="background:linear-gradient(90deg,#5A7B8B44,#7B8B5A44,#8B5A4A44)"></div>
          <div class="cs-slider-fill" style="width:${sliderVal}%;background:linear-gradient(90deg,#5A7B8B99,${zc}cc)"></div>
          <input type="range" min="0" max="100" value="${sliderVal}" class="cs-slider-input" id="cs-main-slider">
        </div>
        <div class="cs-slider-labels">
          ${['Cool', 'Moderate', 'Warm'].map((l, i) => {
            const active = (i === 0 && zone === 'cool') || (i === 1 && zone === 'moderate') || (i === 2 && zone === 'warm');
            return `<span class="cs-slider-label" style="color:${active ? zc : 'var(--cs-faint)'};font-weight:${active ? 600 : 400}">${l}</span>`;
          }).join('')}
        </div>
      </div>

      <!-- Attribute bars -->
      <div class="cs-attrs">
        ${attrs.map(a => `
          <div class="cs-attr" data-attr="${a.key}">
            <div class="cs-attr-header">
              <span class="cs-attr-label">${a.label}</span>
              <span class="cs-attr-val" style="color:${zc}88">${a.val}</span>
            </div>
            <div class="cs-attr-bar">
              <div class="cs-attr-dot" style="left:${a.pos}%;background:${zc};box-shadow:0 0 8px ${zc}44"></div>
            </div>
            <div class="cs-attr-ends">
              <span class="cs-attr-end">${a.lowLabel}</span>
              <span class="cs-attr-end">${a.highLabel}</span>
            </div>
            ${openTip === a.key ? `<div class="cs-tip">${a.tip}</div>` : ''}
          </div>
        `).join('')}
      </div>

      <!-- Regions -->
      <button class="cs-regions-toggle" id="cs-regions-toggle">
        <span class="cs-regions-label">Regions: ${zd.regionNote}</span>
        <span class="cs-regions-arrow ${showRegions ? 'open' : ''}">&#8250;</span>
      </button>
      ${showRegions ? `<div class="cs-regions-list">
        ${zd.regions.map(r => `<span class="cs-region-pill" style="background:${zc}08;border-color:${zc}15;color:${zc}88">${r.name}<span class="cs-region-lat">${r.lat}</span></span>`).join('')}
      </div>` : ''}
    `;

    // Wire
    document.getElementById('cs-main-slider').addEventListener('input', e => { sliderVal = +e.target.value; openTip = null; render(); });
    c.querySelectorAll('.cs-wine-toggle-btn').forEach(b => b.addEventListener('click', () => { isRed = b.dataset.wine === 'red'; render(); }));
    c.querySelectorAll('.cs-attr').forEach(a => a.addEventListener('click', () => { openTip = openTip === a.dataset.attr ? null : a.dataset.attr; render(); }));
    document.getElementById('cs-regions-toggle').addEventListener('click', () => { showRegions = !showRegions; render(); });
  }

  function renderGlass(p, red) {
    const wc = red ? `hsl(${355 - p * 15},${50 + p * 30}%,${35 - p * 10}%)` : `hsl(${50 - p * 15},${30 + p * 30}%,${85 - p * 20}%)`;
    const bw = 28 + p * 12;
    return `
      <rect x="38" y="85" width="4" height="25" rx="1" fill="rgba(44,24,16,0.08)"/>
      <ellipse cx="40" cy="112" rx="15" ry="2.5" fill="rgba(44,24,16,0.04)"/>
      <path d="M${40 - bw},20 Q${40 - bw - 4},${55 + p * 10} 40,88 Q${40 + bw + 4},${55 + p * 10} ${40 + bw},20" fill="none" stroke="rgba(44,24,16,0.06)" stroke-width="1.5"/>
      <path d="M${40 - bw + 4},28 Q${40 - bw},${55 + p * 10} 40,86 Q${40 + bw},${55 + p * 10} ${40 + bw - 4},28 Z" fill="${wc}" opacity="0.4"/>
    `;
  }

  // ── QUIZ ──────────────────────────────────────────────

  function renderQuiz(c) {
    const qs = data.quiz[diff];
    const curQ = qOrder.length ? qs[qOrder[qi % qs.length]] : qs[0];
    const qz = getZone(qa);
    const qOk = qz === curQ.answer;
    const qzc = getColor(qz);

    c.innerHTML = `
      <!-- Difficulty -->
      <div class="cs-quiz-levels">
        ${['beginner', 'intermediate', 'advanced'].map(d => `<button class="cs-quiz-level-btn ${diff === d ? 'active' : ''}" data-diff="${d}">${d}</button>`).join('')}
      </div>

      ${qTotal > 0 ? `<div class="cs-quiz-score"><span class="cs-quiz-score-num">${qScore}</span>/${qTotal}</div>` : ''}

      <!-- Tasting note card -->
      <div class="cs-quiz-card">
        <div class="cs-quiz-note">"${curQ.note}"</div>
        ${!qSub ? `<button class="cs-quiz-hint-btn" id="cs-hint-btn">${hint ? 'Hide hint' : 'Hint'}</button>` : ''}
        ${hint && !qSub ? `<div class="cs-quiz-hint-text">${curQ.whyCorrect.split('.').slice(0, 1).join('.') + '.'}</div>` : ''}
      </div>

      ${!qSub ? '<div class="cs-quiz-prompt">Where does the slider go?</div>' : ''}

      <!-- Quiz slider -->
      <div class="cs-slider-wrap">
        <div class="cs-slider-track">
          <div class="cs-slider-bg" style="background:linear-gradient(90deg,#5A7B8B44,#7B8B5A44,#8B5A4A44)"></div>
          <div class="cs-slider-fill" style="width:${qa}%;background:linear-gradient(90deg,#5A7B8B99,${qzc}cc)"></div>
          <input type="range" min="0" max="100" value="${qa}" class="cs-slider-input" id="cs-quiz-slider" ${qSub ? 'disabled' : ''}>
        </div>
        <div class="cs-slider-labels">
          ${['Cool', 'Moderate', 'Warm'].map((l, i) => {
            const active = (i === 0 && qz === 'cool') || (i === 1 && qz === 'moderate') || (i === 2 && qz === 'warm');
            return `<span class="cs-slider-label" style="color:${active ? qzc : 'var(--cs-faint)'};font-weight:${active ? 600 : 400}">${l}</span>`;
          }).join('')}
        </div>
      </div>

      ${qSub ? `
        <div class="cs-quiz-result ${qOk ? 'correct' : 'incorrect'}">
          <div class="cs-quiz-result-word" style="color:${qOk ? 'var(--cs-correct)' : 'var(--cs-incorrect)'}">${qOk ? 'Correct' : 'Incorrect'}</div>
          ${!qOk ? `<div class="cs-quiz-result-detail">You said ${qz} — answer: ${curQ.answer}</div>` : ''}
        </div>
        <div class="cs-quiz-expl why-correct">
          <div class="cs-quiz-expl-label" style="color:var(--cs-correct)">Why ${curQ.answer}</div>
          <div class="cs-quiz-expl-text">${curQ.whyCorrect}</div>
        </div>
        ${!qOk ? `<div class="cs-quiz-expl why-wrong">
          <div class="cs-quiz-expl-label" style="color:var(--cs-incorrect)">Why not ${qz}</div>
          <div class="cs-quiz-expl-text">${qz === 'cool' ? curQ.whyNotCool : qz === 'moderate' ? curQ.whyNotModerate : curQ.whyNotWarm}</div>
        </div>` : ''}
      ` : ''}

      <button class="cs-btn" id="cs-quiz-action">${!qSub ? 'Check' : 'Next'}</button>
    `;

    // Wire
    c.querySelectorAll('.cs-quiz-level-btn').forEach(b => b.addEventListener('click', () => {
      diff = b.dataset.diff; qScore = 0; qTotal = 0; qOrder = shuffle(data.quiz[diff]); qi = 0; qa = 50; qSub = false; hint = false; render();
    }));
    const slider = document.getElementById('cs-quiz-slider');
    if (slider) slider.addEventListener('input', e => { qa = +e.target.value; render(); });
    const hintBtn = document.getElementById('cs-hint-btn');
    if (hintBtn) hintBtn.addEventListener('click', () => { hint = !hint; render(); });
    document.getElementById('cs-quiz-action').addEventListener('click', () => {
      if (!qSub) { qSub = true; qTotal++; if (qOk) qScore++; }
      else { qi++; qa = 50; qSub = false; hint = false; }
      render();
    });
  }

  // ── Tab toggle ────────────────────────────────────────

  document.querySelectorAll('.cs-toggle-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.cs-toggle-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      tab = b.dataset.tab;
      if (tab === 'quiz' && !qOrder.length) qOrder = shuffle(data.quiz[diff]);
      render();
    });
  });

  // ── Init ──────────────────────────────────────────────

  async function init() {
    if (initialized) return;
    initialized = true;
    try {
      const res = await fetch('/data/climate-slider.json');
      data = await res.json();
    } catch { return; }
    qOrder = shuffle(data.quiz[diff]);
    render();
  }

  const observer = new MutationObserver(() => {
    const sec = document.getElementById('climateslider-section');
    if (sec && sec.classList.contains('active')) init();
  });
  const sec = document.getElementById('climateslider-section');
  if (sec) {
    observer.observe(sec, { attributes: true, attributeFilter: ['class'] });
    if (sec.classList.contains('active')) init();
  }
});
