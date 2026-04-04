// wine-lineup.js — The Lineup: wine sorting game

document.addEventListener('DOMContentLoaded', () => {
  let data = null;
  let category = null;
  let wines = [];
  let correctOrder = [];
  let submitted = false;
  let score = null;
  let selectedIdx = null;
  let dragIndex = null;
  let totalPairs = 0;
  let totalRounds = 0;
  let view = 'home';
  let initialized = false;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickRandom(arr, n) {
    const shuffled = shuffle(arr);
    const selected = [shuffled[0]];
    for (let i = 1; i < shuffled.length && selected.length < n; i++) {
      if (!selected.some(s => Math.abs(s.rank - shuffled[i].rank) <= 1)) selected.push(shuffled[i]);
    }
    while (selected.length < n) {
      const remaining = shuffled.filter(w => !selected.includes(w));
      if (!remaining.length) break;
      selected.push(remaining[0]);
    }
    return selected.sort((a, b) => a.rank - b.rank);
  }

  function buildExplanations(order) {
    return order.map((wine, idx) => {
      const prev = idx > 0 ? order[idx - 1] : null;
      const next = idx < order.length - 1 ? order[idx + 1] : null;
      let text = wine.compare || wine.reveal;
      if (prev) text = text.replace('{prev}', prev.name);
      if (next) text = text.replace('{next}', next.name);
      return text;
    });
  }

  function render() {
    const c = document.getElementById('lu-content');
    if (!c || !data) return;
    if (view === 'home') renderHome(c);
    else renderGame(c);
  }

  // ── HOME ──────────────────────────────────────────────

  function renderHome(c) {
    const cats = Object.entries(data.categories).sort((a, b) => a[1].order - b[1].order);
    c.innerHTML = `
      <div class="lu-hero">
        <img class="lu-hero-img" src="https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=800&h=300&fit=crop&crop=center" alt="A lineup of wine bottles" loading="lazy">
      </div>
      <div class="lu-crumb">Learn</div>
      <h1 class="lu-title">The Lineup</h1>
      <p class="lu-subtitle">Three wines. One spectrum. Put them in order.</p>
      ${totalRounds > 0 ? `<div class="lu-stats">
        <div><div class="lu-stat-num">${totalPairs}</div><div class="lu-stat-label">Pairs correct</div></div>
        <div><div class="lu-stat-num">${totalRounds}</div><div class="lu-stat-label">Rounds</div></div>
      </div>` : ''}
      ${cats.map(([key, val]) => `
        <button class="lu-cat-btn" data-cat="${key}">
          <div class="lu-cat-top">
            <div>
              <div class="lu-cat-name">${val.label}</div>
              <div class="lu-cat-desc">${val.description}</div>
            </div>
            <div class="lu-cat-arrow">&rarr;</div>
          </div>
          <div class="lu-cat-scale">
            <span class="lu-cat-scale-label" style="color:${val.color}88">${val.low}</span>
            <div class="lu-cat-scale-bar" style="background:linear-gradient(90deg,${val.color}20,${val.color}80)"></div>
            <span class="lu-cat-scale-label" style="color:${val.color}88;text-align:right">${val.high}</span>
          </div>
        </button>
      `).join('')}
    `;
    c.querySelectorAll('.lu-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => startGame(btn.dataset.cat));
    });
  }

  // ── START GAME ────────────────────────────────────────

  function startGame(cat) {
    category = cat;
    const catData = data.categories[cat];
    const sel = pickRandom(catData.wines, 3);
    correctOrder = [...sel];
    wines = shuffle(sel);
    submitted = false;
    score = null;
    selectedIdx = null;
    dragIndex = null;
    view = 'game';
    render();
  }

  // ── GAME ──────────────────────────────────────────────

  function renderGame(c) {
    const catData = data.categories[category];
    const isAlcohol = category === 'alcohol';
    const explanations = buildExplanations(correctOrder);

    c.innerHTML = `
      <button class="lu-back" id="lu-back">&larr; Back</button>
      <h2 class="lu-game-title">${catData.label}</h2>
      <p class="lu-game-hint">${submitted ? '' : 'Drag to reorder. Tap two cards to swap.'}</p>

      <div class="lu-endpoint" style="margin-bottom:8px">
        <div class="lu-endpoint-pill" style="background:${catData.color}10;border:1px solid ${catData.color}20;color:${catData.color}aa">${catData.low}</div>
        <div class="lu-endpoint-line" style="background:linear-gradient(90deg,${catData.color}30,transparent)"></div>
      </div>

      <div class="lu-wines-area">
        <div class="lu-gradient-track">
          <div class="lu-gradient-bar" style="background:linear-gradient(to bottom,${catData.color}25,${catData.color}60)">
            <div class="lu-gradient-arrow" style="border-top:6px solid ${catData.color}55"></div>
          </div>
        </div>
        <div class="lu-wines-list" id="lu-wines-list">
          ${wines.map((wine, idx) => {
            const ci = correctOrder.findIndex(w => w.name === wine.name);
            const isCorrect = submitted && ci === idx;
            const cls = submitted ? (isCorrect ? 'correct' : 'incorrect') : (selectedIdx === idx ? 'selected' : '');
            return `<div class="lu-wine-card ${cls}" data-idx="${idx}" draggable="${!submitted}">
              ${!submitted ? `<div class="lu-wine-grip"><div class="lu-wine-grip-row"><div class="lu-wine-grip-dot"></div><div class="lu-wine-grip-dot"></div></div><div class="lu-wine-grip-row"><div class="lu-wine-grip-dot"></div><div class="lu-wine-grip-dot"></div></div><div class="lu-wine-grip-row"><div class="lu-wine-grip-dot"></div><div class="lu-wine-grip-dot"></div></div></div>` : ''}
              <div class="lu-wine-info">
                <div style="display:flex;align-items:baseline;gap:6px">
                  <span class="lu-wine-name">${wine.name}</span>
                  ${submitted && isAlcohol && wine.abv ? `<span class="lu-wine-abv" style="color:${catData.color}bb;background:${catData.color}12">${wine.abv}</span>` : ''}
                </div>
                <div class="lu-wine-meta">${wine.region} · ${wine.grape}</div>
                <div class="lu-wine-hint">${submitted ? wine.reveal : wine.hint}</div>
              </div>
              <div class="lu-wine-num">${submitted ? (isCorrect ? '&#10003;' : '&#10007;') : idx + 1}</div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="lu-endpoint" style="margin-top:8px">
        <div class="lu-endpoint-pill" style="background:${catData.color}10;border:1px solid ${catData.color}20;color:${catData.color}aa">${catData.high}</div>
        <div class="lu-endpoint-line" style="background:linear-gradient(90deg,${catData.color}30,transparent)"></div>
      </div>

      ${submitted && score ? `
        <div style="margin-top:24px">
          <div class="lu-result-banner ${score.isCorrect ? 'correct' : 'incorrect'}">
            <div class="lu-result-word" style="color:${score.isCorrect ? 'var(--lu-correct)' : 'var(--lu-incorrect)'}">${score.isCorrect ? 'Correct' : 'Incorrect'}</div>
            <div class="lu-result-pairs">${score.pairsCorrect} of ${score.pairsTotal} pairs correct</div>
          </div>
          <div class="lu-correct-order-label">${score.isCorrect ? 'Why this order' : catData.low + ' to ' + catData.high}</div>
          ${correctOrder.map((wine, idx) => `
            <div class="lu-correct-card">
              <div class="lu-correct-num">${idx + 1}</div>
              <div style="flex:1;display:flex;align-items:baseline;gap:6px">
                <span class="lu-correct-name">${wine.name}</span>
                ${isAlcohol && wine.abv ? `<span class="lu-wine-abv" style="color:${catData.color}bb;background:${catData.color}12">${wine.abv}</span>` : ''}
              </div>
              <span class="lu-correct-region">${wine.region}</span>
            </div>
            <div class="lu-correct-expl">${explanations[idx]}</div>
          `).join('')}
        </div>
      ` : ''}

      <div class="lu-actions">
        ${!submitted ? `<button class="lu-btn-primary" id="lu-submit">Check Order</button>` : `
          <button class="lu-btn-primary" id="lu-new-round">New Round</button>
          <button class="lu-btn-secondary" id="lu-categories">Categories</button>
        `}
      </div>
    `;

    // Wire
    document.getElementById('lu-back').addEventListener('click', () => { view = 'home'; render(); });
    const submitBtn = document.getElementById('lu-submit');
    if (submitBtn) submitBtn.addEventListener('click', handleSubmit);
    const newBtn = document.getElementById('lu-new-round');
    if (newBtn) newBtn.addEventListener('click', () => startGame(category));
    const catBtn = document.getElementById('lu-categories');
    if (catBtn) catBtn.addEventListener('click', () => { view = 'home'; render(); });

    // Drag and tap
    if (!submitted) {
      const cards = c.querySelectorAll('.lu-wine-card');
      cards.forEach(card => {
        const idx = parseInt(card.dataset.idx);
        card.addEventListener('dragstart', (e) => { dragIndex = idx; e.dataTransfer.effectAllowed = 'move'; card.classList.add('dragging'); });
        card.addEventListener('dragover', (e) => { e.preventDefault(); if (dragIndex !== null && dragIndex !== idx) { moveWine(dragIndex, idx); dragIndex = idx; } });
        card.addEventListener('dragend', () => { dragIndex = null; render(); });
        card.addEventListener('click', () => {
          if (submitted) return;
          if (selectedIdx === null) { selectedIdx = idx; render(); }
          else { if (selectedIdx !== idx) moveWine(selectedIdx, idx); selectedIdx = null; render(); }
        });
      });
    }
  }

  function moveWine(from, to) {
    if (from === to) return;
    const [moved] = wines.splice(from, 1);
    wines.splice(to, 0, moved);
  }

  function handleSubmit() {
    const allCorrect = wines.every((w, i) => w.name === correctOrder[i].name);
    let pc = 0;
    for (let i = 0; i < correctOrder.length; i++) {
      for (let j = i + 1; j < correctOrder.length; j++) {
        const ui = wines.findIndex(w => w.name === correctOrder[i].name);
        const uj = wines.findIndex(w => w.name === correctOrder[j].name);
        if (ui < uj) pc++;
      }
    }
    score = { isCorrect: allCorrect, pairsCorrect: pc, pairsTotal: 3 };
    submitted = true;
    totalRounds++;
    totalPairs += pc;
    render();
  }

  // ── Init ──────────────────────────────────────────────

  async function init() {
    if (initialized) return;
    initialized = true;
    try {
      const res = await fetch('/data/wine-lineup.json');
      data = await res.json();
    } catch { return; }
    render();
  }

  const observer = new MutationObserver(() => {
    const sec = document.getElementById('lineup-section');
    if (sec && sec.classList.contains('active')) init();
  });
  const sec = document.getElementById('lineup-section');
  if (sec) {
    observer.observe(sec, { attributes: true, attributeFilter: ['class'] });
    if (sec.classList.contains('active')) init();
  }
});
