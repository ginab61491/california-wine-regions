// dinner-rescue.js — Dinner Rescue: food & wine pairing game
document.addEventListener('DOMContentLoaded', () => {
  let data = null;
  let tab = 'explore';
  let level = 'beginner';
  let scIdx = 0;
  let phase = 'original';
  let expWine = null;
  let selected = null;
  let revealed = false;
  let qScore = 0;
  let qTotal = 0;
  let qOrder = [];
  let qDone = false;
  let initialized = false;

  function shuffle(n) { const a=[...Array(n).keys()]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
  function getScenarios() { return data[level] || data.beginner; }

  function render() {
    const c = document.getElementById('dr-content');
    if (!c || !data) return;
    const scenarios = getScenarios();
    const sc = scenarios[scIdx % scenarios.length];
    const wines = phase === 'original' ? sc.wines : sc.varWines;
    const principle = phase === 'original' ? sc.principle : sc.principleVar;

    if (tab === 'quiz' && qDone) { renderQuizDone(c); return; }

    const curExpl = expWine !== null && tab === 'explore' ? wines[expWine] : null;
    const selWine = selected !== null ? wines[selected] : null;

    c.innerHTML = `
      ${tab === 'quiz' ? `<div class="dr-quiz-bar"><span>Question ${qTotal + 1} of ${scenarios.length * 2}</span><span class="dr-quiz-score">${qScore}/${qTotal} correct</span></div>` : ''}

      <!-- Dish -->
      <div class="dr-dish ${phase === 'variation' ? 'variation' : ''}">
        ${tab === 'explore' ? `<button class="dr-dish-nav" data-nav="-1">&#8249;</button>` : ''}
        <div class="dr-dish-content">
          ${phase === 'variation' ? `<div class="dr-dish-old">${sc.dish}</div><div class="dr-dish-arrow">but now</div>` : ''}
          <div class="dr-dish-phase">${phase === 'original' ? 'On the table' : 'Part 2'}</div>
          <div class="dr-dish-name">${phase === 'original' ? sc.dish : sc.variation}</div>
          ${tab === 'explore' ? `<div class="dr-dish-count">${(scIdx % scenarios.length) + 1} / ${scenarios.length}</div>` : ''}
        </div>
        ${tab === 'explore' ? `<button class="dr-dish-nav" data-nav="1">&#8250;</button>` : ''}
      </div>

      ${tab === 'quiz' ? '<div style="font-family:Montserrat,sans-serif;font-size:0.55rem;color:var(--dr-faint);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px">Pick the best match</div>' : ''}

      <!-- Wine bottles -->
      <div class="dr-wines">
        ${wines.map((w, i) => {
          const isActive = tab === 'explore' ? expWine === i : selected === i;
          const showV = tab === 'quiz' && revealed;
          const cls = showV ? w.match : (isActive ? 'active' : '');
          return `<button class="dr-wine ${cls}" data-wine="${i}" style="border-color:${isActive && !showV ? w.color : showV ? (w.match === 'best' ? 'var(--dr-best)' : w.match === 'avoid' ? 'var(--dr-avoid)' : 'var(--dr-good)') : 'var(--dr-edge)'}">
            <svg width="22" height="52" viewBox="0 0 24 56" fill="none">
              <rect x="8" y="0" width="8" height="12" rx="2" fill="${w.color}" opacity="0.7"/>
              <rect x="7" y="10" width="10" height="3" rx="1" fill="${w.color}" opacity="0.5"/>
              <path d="M7 13 C7 13, 3 20, 3 25 L3 50 C3 53, 5 55, 8 55 L16 55 C19 55, 21 53, 21 50 L21 25 C21 20, 17 13, 17 13 Z" fill="${w.color}"/>
              <rect x="5" y="32" width="14" height="14" rx="1" fill="rgba(255,255,255,0.1)"/>
            </svg>
            <div class="dr-wine-name">${w.name}</div>
            <div class="dr-wine-region">${w.region}</div>
            ${showV ? `<div class="dr-wine-verdict" style="color:${w.match === 'best' ? 'var(--dr-best)' : w.match === 'avoid' ? 'var(--dr-avoid)' : 'var(--dr-good)'}">${w.match === 'best' ? 'Best' : w.match === 'avoid' ? 'Avoid' : 'Works'}</div>` : ''}
          </button>`;
        }).join('')}
      </div>

      <div class="dr-hint">${tab === 'explore' ? (expWine === null ? 'Tap a bottle to explore the pairing' : 'Tap another to compare') : (revealed ? '' : '')}</div>

      <!-- Explanation -->
      ${tab === 'explore' && curExpl ? `<div class="dr-expl ${curExpl.match}">
        <div class="dr-expl-header">
          <div class="dr-expl-dot" style="background:${curExpl.match === 'best' ? 'var(--dr-best)' : curExpl.match === 'avoid' ? 'var(--dr-avoid)' : 'var(--dr-good)'}"></div>
          <span class="dr-expl-label" style="color:${curExpl.match === 'best' ? 'var(--dr-best)' : curExpl.match === 'avoid' ? 'var(--dr-avoid)' : 'var(--dr-good)'}">${curExpl.match === 'best' ? 'This is the one' : curExpl.match === 'avoid' ? 'This would go wrong' : 'This would work, but...'}</span>
        </div>
        <div class="dr-expl-text">${curExpl.explore}</div>
      </div>` : ''}

      ${tab === 'quiz' && revealed && selWine ? `<div class="dr-expl ${selWine.match}">
        <div class="dr-expl-header">
          <div class="dr-expl-dot" style="background:${selWine.match === 'best' ? 'var(--dr-best)' : selWine.match === 'avoid' ? 'var(--dr-avoid)' : 'var(--dr-good)'}"></div>
          <span class="dr-expl-label" style="color:${selWine.match === 'best' ? 'var(--dr-best)' : selWine.match === 'avoid' ? 'var(--dr-avoid)' : 'var(--dr-good)'}">${selWine.match === 'best' ? 'Perfect pairing' : selWine.match === 'avoid' ? 'Not this one' : 'Good, but not the best'}</span>
        </div>
        <div class="dr-expl-text">${selWine.whyBest}</div>
      </div>` : ''}

      ${tab === 'explore' && !curExpl ? `<div style="padding:24px 16px;border-radius:8px;margin-bottom:10px;border:1px dashed var(--dr-edge);text-align:center">
        <div style="font-family:'Playfair Display',serif;font-size:0.82rem;color:var(--dr-faint)">Which wine would you reach for?</div>
      </div>` : ''}

      <!-- Principle -->
      <div class="dr-principle">
        <div class="dr-principle-label">The Principle</div>
        <div class="dr-principle-text">${principle}</div>
      </div>

      ${tab === 'quiz' && !revealed ? `<button class="dr-action dr-action-primary" id="dr-submit" ${selected === null ? 'disabled' : ''}>Choose pairing</button>` : ''}
      ${(tab === 'explore') || (tab === 'quiz' && revealed) ? `<button class="dr-action" id="dr-next">${phase === 'original' ? 'Part 2 — What if the dish changes?' : 'Next dish'}</button>` : ''}
    `;

    // Wire
    c.querySelectorAll('.dr-wine').forEach(b => b.addEventListener('click', () => {
      const i = parseInt(b.dataset.wine);
      if (tab === 'explore') { expWine = i; render(); }
      else if (!revealed) { selected = i; render(); }
      else { selected = i; render(); } // allow exploring after reveal
    }));
    c.querySelectorAll('.dr-dish-nav').forEach(b => b.addEventListener('click', () => {
      const dir = parseInt(b.dataset.nav);
      const scenarios = getScenarios();
      scIdx = (scIdx + dir + scenarios.length) % scenarios.length;
      phase = 'original'; expWine = null; render();
    }));
    const submitBtn = document.getElementById('dr-submit');
    if (submitBtn) submitBtn.addEventListener('click', () => {
      if (selected === null) return;
      revealed = true;
      qTotal++;
      if (wines[selected].match === 'best') qScore++;
      render();
    });
    const nextBtn = document.getElementById('dr-next');
    if (nextBtn) nextBtn.addEventListener('click', () => {
      if (phase === 'original') {
        phase = 'variation'; expWine = null; selected = null; revealed = false; render();
      } else {
        if (tab === 'quiz') {
          const scenarios = getScenarios();
          const ci = qOrder.indexOf(scIdx);
          if (ci >= qOrder.length - 1) { qDone = true; render(); return; }
          scIdx = qOrder[ci + 1];
        } else {
          const scenarios = getScenarios();
          scIdx = (scIdx + 1) % scenarios.length;
        }
        phase = 'original'; selected = null; revealed = false; expWine = null; render();
      }
    });
  }

  function renderQuizDone(c) {
    const pct = qTotal > 0 ? qScore / qTotal : 0;
    c.innerHTML = `<div class="dr-quiz-done">
      <div style="font-size:3rem;margin-bottom:12px">${pct >= 0.8 ? '&#127942;' : pct >= 0.5 ? '&#127863;' : '&#128218;'}</div>
      <div class="dr-quiz-done-score">${qScore} / ${qTotal}</div>
      <div class="dr-quiz-done-msg">${pct >= 0.8 ? 'Excellent palate. The table is safe.' : pct >= 0.5 ? 'Getting there. Keep tasting.' : 'Back to the books. Explore mode awaits.'}</div>
      <button class="dr-action" id="dr-to-explore">Switch to Explore</button>
    </div>`;
    document.getElementById('dr-to-explore').addEventListener('click', () => { tab = 'explore'; qDone = false; scIdx = 0; phase = 'original'; expWine = null; updateToggle(); render(); });
  }

  function updateToggle() {
    document.querySelectorAll('.dr-toggle-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  }

  // Tab toggle
  document.querySelectorAll('.dr-toggle-btn').forEach(b => b.addEventListener('click', () => {
    tab = b.dataset.tab; updateToggle();
    if (tab === 'quiz') {
      const scenarios = getScenarios();
      qOrder = shuffle(scenarios.length); scIdx = qOrder[0] || 0; qScore = 0; qTotal = 0; qDone = false;
    } else { scIdx = 0; }
    selected = null; revealed = false; phase = 'original'; expWine = null; render();
  }));

  // Level buttons
  document.querySelectorAll('.dr-level-btn').forEach(b => b.addEventListener('click', () => {
    level = b.dataset.level;
    document.querySelectorAll('.dr-level-btn').forEach(x => x.classList.toggle('active', x.dataset.level === level));
    scIdx = 0; phase = 'original'; selected = null; revealed = false; expWine = null;
    if (tab === 'quiz') { const scenarios = getScenarios(); qOrder = shuffle(scenarios.length); scIdx = qOrder[0] || 0; qScore = 0; qTotal = 0; qDone = false; }
    render();
  }));

  // Init
  async function init() {
    if (initialized) return; initialized = true;
    try { const res = await fetch('/data/dinner-rescue.json'); data = await res.json(); } catch { return; }
    render();
  }
  const observer = new MutationObserver(() => { const sec = document.getElementById('dinnerrescue-section'); if (sec && sec.classList.contains('active')) init(); });
  const sec = document.getElementById('dinnerrescue-section');
  if (sec) { observer.observe(sec, { attributes: true, attributeFilter: ['class'] }); if (sec.classList.contains('active')) init(); }
});
