// grape-explorer.js — Interactive wine grape varietal explorer

document.addEventListener('DOMContentLoaded', () => {
  let allGrapes = [];
  let filtered = [];
  let compareList = [];
  let selectedType = 'all';
  let selectedWorld = 'both';
  let sliderAromatic = 0;
  let sliderAcidity = 0;
  let sliderTannin = 0;
  let initialized = false;

  async function init() {
    if (initialized) return;
    initialized = true;
    try {
      const res = await fetch('/data/grapes.json');
      const data = await res.json();
      allGrapes = data.grapes || [];
    } catch { return; }
    wireFilters();
    applyFilters();
  }

  function wireFilters() {
    // Type buttons
    document.querySelectorAll('#grape-type-btns .grape-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#grape-type-btns .grape-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedType = btn.dataset.type;
        applyFilters();
      });
    });
    // World buttons
    document.querySelectorAll('#grape-world-btns .grape-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#grape-world-btns .grape-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedWorld = btn.dataset.world;
        applyFilters();
      });
    });
    // Sliders
    const labels = { 0: 'Any', 1: 'Low', 2: 'Low-Med', 3: 'Medium', 4: 'Med-High', 5: 'High' };
    document.getElementById('grape-aromatic').addEventListener('input', (e) => {
      sliderAromatic = parseInt(e.target.value);
      document.getElementById('aromatic-val').textContent = labels[sliderAromatic];
      applyFilters();
    });
    document.getElementById('grape-acidity').addEventListener('input', (e) => {
      sliderAcidity = parseInt(e.target.value);
      document.getElementById('acidity-val').textContent = labels[sliderAcidity];
      applyFilters();
    });
    document.getElementById('grape-tannin').addEventListener('input', (e) => {
      sliderTannin = parseInt(e.target.value);
      document.getElementById('tannin-val').textContent = labels[sliderTannin];
      applyFilters();
    });
    // Comparison board
    const clearCompare = document.getElementById('grape-compare-clear');
    if (clearCompare) clearCompare.addEventListener('click', () => { compareList = []; renderCompare(); });
  }

  function applyFilters() {
    filtered = allGrapes.filter(g => {
      if (selectedType !== 'all' && g.type !== selectedType) return false;
      if (selectedWorld !== 'both' && g.world !== 'both' && g.world !== selectedWorld) return false;
      if (sliderAromatic > 0 && Math.abs(g.aromatic - sliderAromatic) > 1) return false;
      if (sliderAcidity > 0 && Math.abs(g.acidity - sliderAcidity) > 1) return false;
      if (sliderTannin > 0 && Math.abs(g.tannin - sliderTannin) > 1) return false;
      return true;
    });
    document.getElementById('grape-count').textContent = `Showing ${filtered.length} grape${filtered.length !== 1 ? 's' : ''}`;
    renderBubbles();
  }

  function renderBubbles() {
    const space = document.getElementById('grape-space');
    const W = space.offsetWidth;
    const H = Math.max(500, space.offsetHeight || 500);

    // Position grapes based on characteristics
    const bubbles = filtered.map((g, i) => {
      // X = aromatic (left=low, right=high)
      const xBase = (g.aromatic / 5) * 0.7 + 0.15;
      // Y = acidity (top=high, bottom=low)
      const yBase = 1 - ((g.acidity / 5) * 0.7 + 0.15);
      // Size by popularity
      const sizes = { 5: 110, 4: 90, 3: 75, 2: 65, 1: 55 };
      const size = sizes[g.popularity] || 70;
      // Jitter to prevent overlap
      const jx = (Math.sin(i * 2.3) * 0.05);
      const jy = (Math.cos(i * 3.1) * 0.05);
      const x = Math.max(0.05, Math.min(0.95, xBase + jx));
      const y = Math.max(0.05, Math.min(0.95, yBase + jy));

      return { grape: g, x, y, size };
    });

    space.innerHTML = bubbles.map((b, i) => {
      const g = b.grape;
      const borderColor = g.type === 'red' ? 'var(--maroon)' : 'var(--gold)';
      const left = b.x * 100;
      const top = b.y * 100;
      const delay = i * 40;
      return `<div class="grape-bubble" data-id="${g.id}" style="left:${left}%;top:${top}%;width:${b.size}px;height:${b.size}px;border-color:${borderColor};animation-delay:${delay}ms" tabindex="0" role="button" aria-label="${g.name}, ${g.type} grape, acidity ${g.acidity}/5, tannin ${g.tannin}/5">
        <span class="grape-bubble-name">${g.name}</span>
      </div>`;
    }).join('');

    // Wire clicks
    space.querySelectorAll('.grape-bubble').forEach(el => {
      const open = () => {
        const g = allGrapes.find(x => x.id === el.dataset.id);
        if (g) showGrapeModal(g);
      };
      el.addEventListener('click', open);
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });
    });
  }

  function showGrapeModal(g) {
    const modal = document.getElementById('grape-modal');
    const content = document.getElementById('grape-modal-content');
    const dots = (val, max) => Array.from({ length: max }, (_, i) => `<span class="grape-dot ${i < val ? 'filled' : ''}">${i < val ? '●' : '○'}</span>`).join('');
    const flavors = (g.flavors || []).map(f => `<span class="grape-flavor-tag">${f}</span>`).join('');
    const regions = (g.regions || []).join(' · ');
    const foods = (g.food || []).map(f => `<li>${f}</li>`).join('');
    const similar = (g.similar || []).map(id => {
      const s = allGrapes.find(x => x.id === id);
      return s ? `<button class="grape-similar-btn" data-id="${id}">${s.name}</button>` : '';
    }).join('');

    content.innerHTML = `
      <div class="grape-modal-header">
        <h2>${g.name}</h2>
        <span class="grape-modal-type">${g.type === 'red' ? 'Red' : 'White'} · ${g.alcohol}% ABV</span>
        <span class="grape-modal-regions">${regions}</span>
      </div>

      <div class="grape-modal-chars">
        <div class="grape-char"><span class="grape-char-label">Aromatic</span><span class="grape-char-dots">${dots(g.aromatic, 5)}</span></div>
        <div class="grape-char"><span class="grape-char-label">Acidity</span><span class="grape-char-dots">${dots(g.acidity, 5)}</span></div>
        <div class="grape-char"><span class="grape-char-label">Tannin</span><span class="grape-char-dots">${dots(g.tannin, 5)}</span></div>
        <div class="grape-char"><span class="grape-char-label">Body</span><span class="grape-char-dots">${dots(g.body, 5)}</span></div>
      </div>

      <div class="grape-modal-flavors">${flavors}</div>

      <div class="grape-modal-section">
        <p class="grape-modal-desc">${g.description}</p>
      </div>

      <div class="grape-modal-section">
        <div class="grape-modal-label">Pairs With</div>
        <ul class="grape-modal-food">${foods}</ul>
      </div>

      <div class="grape-modal-section">
        <div class="grape-modal-label">Aging Potential</div>
        <p class="grape-modal-text">${g.aging || ''}</p>
      </div>

      ${similar ? `<div class="grape-modal-section">
        <div class="grape-modal-label">Similar Grapes</div>
        <div class="grape-similar-list">${similar}</div>
      </div>` : ''}

      <div class="grape-modal-actions">
        <button class="grape-modal-compare-btn" id="grape-add-compare">${compareList.some(c => c.id === g.id) ? 'In Comparison' : 'Add to Compare'}</button>
      </div>
    `;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    const close = () => { modal.style.display = 'none'; document.body.style.overflow = ''; };
    document.getElementById('grape-modal-close').onclick = close;
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    // Add to compare
    const addBtn = document.getElementById('grape-add-compare');
    if (compareList.some(c => c.id === g.id)) addBtn.disabled = true;
    addBtn.addEventListener('click', () => {
      if (compareList.length >= 6 || compareList.some(c => c.id === g.id)) return;
      compareList.push(g);
      addBtn.textContent = 'In Comparison';
      addBtn.disabled = true;
      renderCompare();
    });

    // Similar grape navigation
    content.querySelectorAll('.grape-similar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sg = allGrapes.find(x => x.id === btn.dataset.id);
        if (sg) showGrapeModal(sg);
      });
    });
  }

  // ── Comparison Board ──
  function renderCompare() {
    const panel = document.getElementById('grape-compare');
    const table = document.getElementById('grape-compare-table');
    const analysis = document.getElementById('grape-compare-analysis');
    if (!compareList.length) { panel.style.display = 'none'; return; }
    panel.style.display = 'block';
    const d = (v) => '●'.repeat(v) + '○'.repeat(5 - v);
    table.innerHTML = `<table class="compare-table">
      <thead><tr><th></th>${compareList.map(g => `<th>${g.name}<button class="compare-remove" data-id="${g.id}">&times;</button></th>`).join('')}</tr></thead>
      <tbody>
        <tr><td>Type</td>${compareList.map(g => `<td>${g.type}</td>`).join('')}</tr>
        <tr><td>Acidity</td>${compareList.map(g => `<td>${d(g.acidity)}</td>`).join('')}</tr>
        <tr><td>Tannin</td>${compareList.map(g => `<td>${d(g.tannin)}</td>`).join('')}</tr>
        <tr><td>Aromatic</td>${compareList.map(g => `<td>${d(g.aromatic)}</td>`).join('')}</tr>
        <tr><td>Body</td>${compareList.map(g => `<td>${d(g.body)}</td>`).join('')}</tr>
        <tr><td>Alcohol</td>${compareList.map(g => `<td>${g.alcohol}%</td>`).join('')}</tr>
        <tr><td>Flavors</td>${compareList.map(g => `<td>${(g.flavors||[]).slice(0,3).join(', ')}</td>`).join('')}</tr>
        <tr><td>Regions</td>${compareList.map(g => `<td>${(g.regions||[]).slice(0,2).join(', ')}</td>`).join('')}</tr>
      </tbody></table>`;
    table.querySelectorAll('.compare-remove').forEach(btn => {
      btn.addEventListener('click', () => { compareList = compareList.filter(g => g.id !== btn.dataset.id); renderCompare(); });
    });
    // Analysis
    if (compareList.length >= 2) {
      const range = (k) => { const v = compareList.map(g => g[k]||0); return { min: Math.min(...v), max: Math.max(...v) }; };
      const LABELS = { 0:'Any',1:'Low',2:'Low-Med',3:'Medium',4:'Med-High',5:'High' };
      let sims = [], diffs = [];
      if (range('acidity').max - range('acidity').min <= 1) sims.push('similar acidity levels');
      if (range('tannin').max - range('tannin').min <= 1) sims.push('similar tannin structure');
      if (range('aromatic').max - range('aromatic').min <= 1) sims.push('similar aromatic intensity');
      if (compareList.every(g => g.type === 'red')) sims.push('all red grapes');
      if (compareList.every(g => g.type === 'white')) sims.push('all white grapes');
      if (range('acidity').max - range('acidity').min >= 3) diffs.push(`acidity ranges from ${LABELS[range('acidity').min]} to ${LABELS[range('acidity').max]}`);
      if (range('tannin').max - range('tannin').min >= 3) diffs.push('tannin levels differ significantly');
      if (range('body').max - range('body').min >= 3) diffs.push('body ranges from light to full');
      let html = '';
      if (sims.length) html += `<p class="compare-analysis-text"><strong>In common:</strong> ${sims.join(', ')}.</p>`;
      if (diffs.length) html += `<p class="compare-analysis-text"><strong>Key differences:</strong> ${diffs.join('; ')}.</p>`;
      if (!html) html = '<p class="compare-analysis-text">These grapes have a mix of shared and differing characteristics.</p>';
      analysis.innerHTML = html;
    } else { analysis.innerHTML = ''; }
  }

  // Init when section becomes active
  const observer = new MutationObserver(() => {
    const section = document.getElementById('grapes-section');
    if (section && section.classList.contains('active')) init();
  });
  const section = document.getElementById('grapes-section');
  if (section) observer.observe(section, { attributes: true, attributeFilter: ['class'] });
});
