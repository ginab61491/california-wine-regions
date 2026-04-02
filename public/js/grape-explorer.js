// grape-explorer.js — Interactive wine grape varietal explorer with comparison & sommelier

document.addEventListener('DOMContentLoaded', () => {
  let allGrapes = [], filtered = [], compareList = [];
  let selectedType = 'all', selectedWorld = 'both', selectedLevel = 'all', selectedFood = '';
  let sliderAromatic = 0, sliderAcidity = 0, sliderTannin = 0;
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
    // Level buttons
    document.querySelectorAll('#grape-level-btns .grape-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#grape-level-btns .grape-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedLevel = btn.dataset.level;
        applyFilters();
      });
    });
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
    // Food select
    document.getElementById('grape-food-select').addEventListener('change', (e) => {
      selectedFood = e.target.value;
      applyFilters();
    });
    // Sliders
    const labels = { 0: 'Any', 1: 'Low', 2: 'Low-Med', 3: 'Medium', 4: 'Med-High', 5: 'High' };
    ['aromatic', 'acidity', 'tannin'].forEach(id => {
      document.getElementById(`grape-${id}`).addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        if (id === 'aromatic') sliderAromatic = val;
        if (id === 'acidity') sliderAcidity = val;
        if (id === 'tannin') sliderTannin = val;
        document.getElementById(`${id}-val`).textContent = labels[val];
        applyFilters();
      });
    });

    // Comparison board clear
    document.getElementById('grape-compare-clear').addEventListener('click', () => {
      compareList = [];
      renderCompare();
    });

    // Sommelier insights
    document.getElementById('grape-somm-btn').addEventListener('click', getSommInsights);
  }

  function applyFilters() {
    filtered = allGrapes.filter(g => {
      if (selectedType !== 'all' && g.type !== selectedType) return false;
      if (selectedWorld !== 'both' && g.world !== 'both' && g.world !== selectedWorld) return false;
      if (selectedLevel === 'wset3' && !g.wset3) return false;
      if (selectedLevel === 'intro' && !g.intro) return false;
      if (selectedFood && !(g.foodCats || []).includes(selectedFood)) return false;
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
    const bubbles = filtered.map((g, i) => {
      const xBase = (g.aromatic / 5) * 0.7 + 0.15;
      const yBase = 1 - ((g.acidity / 5) * 0.7 + 0.15);
      const sizes = { 5: 105, 4: 88, 3: 72, 2: 62, 1: 52 };
      const size = sizes[g.popularity] || 68;
      const jx = Math.sin(i * 2.3) * 0.04;
      const jy = Math.cos(i * 3.1) * 0.04;
      const x = Math.max(0.06, Math.min(0.94, xBase + jx));
      const y = Math.max(0.06, Math.min(0.94, yBase + jy));
      return { grape: g, x, y, size };
    });

    space.innerHTML = bubbles.map((b, i) => {
      const g = b.grape;
      const borderColor = g.type === 'red' ? 'var(--maroon)' : 'var(--gold)';
      const inCompare = compareList.some(c => c.id === g.id);
      const levelBadge = g.wset3 ? '<span class="grape-badge">WSET</span>' : '';
      return `<div class="grape-bubble ${inCompare ? 'in-compare' : ''}" data-id="${g.id}" style="left:${b.x*100}%;top:${b.y*100}%;width:${b.size}px;height:${b.size}px;border-color:${borderColor};animation-delay:${i*30}ms" tabindex="0" role="button" aria-label="${g.name}">
        <span class="grape-bubble-name">${g.name}</span>
        ${levelBadge}
      </div>
      <div class="grape-bubble-info" style="left:${b.x*100}%;top:calc(${b.y*100}% + ${b.size/2 + 4}px)">
        <span class="grape-info-chars">A:${g.acidity} T:${g.tannin} Ar:${g.aromatic}</span>
        <span class="grape-info-flavors">${(g.flavors||[]).slice(0,2).join(' · ')}</span>
      </div>`;
    }).join('');

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
    const inCompare = compareList.some(c => c.id === g.id);

    content.innerHTML = `
      <div class="grape-modal-header">
        <h2>${g.name}</h2>
        <span class="grape-modal-type">${g.type === 'red' ? 'Red' : 'White'} · ${g.alcohol}% ABV${g.wset3 ? ' · WSET 3' : ''}${g.intro ? ' · Introductory' : ''}</span>
        <span class="grape-modal-regions">${regions}</span>
      </div>
      <div class="grape-modal-chars">
        <div class="grape-char"><span class="grape-char-label">Aromatic</span><span class="grape-char-dots">${dots(g.aromatic, 5)}</span></div>
        <div class="grape-char"><span class="grape-char-label">Acidity</span><span class="grape-char-dots">${dots(g.acidity, 5)}</span></div>
        <div class="grape-char"><span class="grape-char-label">Tannin</span><span class="grape-char-dots">${dots(g.tannin, 5)}</span></div>
        <div class="grape-char"><span class="grape-char-label">Body</span><span class="grape-char-dots">${dots(g.body, 5)}</span></div>
      </div>
      <div class="grape-modal-flavors">${flavors}</div>
      <div class="grape-modal-section"><p class="grape-modal-desc">${g.description}</p></div>
      <div class="grape-modal-section"><div class="grape-modal-label">Pairs With</div><ul class="grape-modal-food">${foods}</ul></div>
      <div class="grape-modal-section"><div class="grape-modal-label">Aging Potential</div><p class="grape-modal-text">${g.aging || ''}</p></div>
      ${similar ? `<div class="grape-modal-section"><div class="grape-modal-label">Similar Grapes</div><div class="grape-similar-list">${similar}</div></div>` : ''}
      <div class="grape-modal-actions">
        <button class="grape-modal-compare-btn" id="grape-add-compare" ${inCompare ? 'disabled' : ''}>${inCompare ? 'In Comparison' : 'Add to Compare'}</button>
        <a class="grape-modal-explore-btn" data-section="producers">Explore Producers</a>
      </div>`;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    const close = () => { modal.style.display = 'none'; document.body.style.overflow = ''; };
    document.getElementById('grape-modal-close').onclick = close;
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    // Add to compare
    document.getElementById('grape-add-compare').addEventListener('click', () => {
      if (compareList.length >= 6 || compareList.some(c => c.id === g.id)) return;
      compareList.push(g);
      document.getElementById('grape-add-compare').textContent = 'In Comparison';
      document.getElementById('grape-add-compare').disabled = true;
      renderCompare();
      renderBubbles(); // Update bubble highlight
    });

    // Similar grape nav
    content.querySelectorAll('.grape-similar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sg = allGrapes.find(x => x.id === btn.dataset.id);
        if (sg) showGrapeModal(sg);
      });
    });

    // Explore producers link
    content.querySelector('[data-section="producers"]')?.addEventListener('click', (e) => {
      e.preventDefault();
      close();
      const nav = document.querySelector('[data-section="producers"]');
      if (nav) nav.click();
    });
  }

  // ── Comparison Board ──
  function renderCompare() {
    const panel = document.getElementById('grape-compare');
    const table = document.getElementById('grape-compare-table');
    const analysis = document.getElementById('grape-compare-analysis');

    if (!compareList.length) {
      panel.style.display = 'none';
      return;
    }
    panel.style.display = 'block';

    const dots = (v) => '●'.repeat(v) + '○'.repeat(5 - v);
    table.innerHTML = `<table class="compare-table">
      <thead><tr><th></th>${compareList.map(g => `<th>${g.name}<button class="compare-remove" data-id="${g.id}">&times;</button></th>`).join('')}</tr></thead>
      <tbody>
        <tr><td>Type</td>${compareList.map(g => `<td>${g.type}</td>`).join('')}</tr>
        <tr><td>Acidity</td>${compareList.map(g => `<td>${dots(g.acidity)}</td>`).join('')}</tr>
        <tr><td>Tannin</td>${compareList.map(g => `<td>${dots(g.tannin)}</td>`).join('')}</tr>
        <tr><td>Aromatic</td>${compareList.map(g => `<td>${dots(g.aromatic)}</td>`).join('')}</tr>
        <tr><td>Body</td>${compareList.map(g => `<td>${dots(g.body)}</td>`).join('')}</tr>
        <tr><td>Alcohol</td>${compareList.map(g => `<td>${g.alcohol}%</td>`).join('')}</tr>
        <tr><td>Key Flavors</td>${compareList.map(g => `<td>${(g.flavors||[]).slice(0,3).join(', ')}</td>`).join('')}</tr>
        <tr><td>Regions</td>${compareList.map(g => `<td>${(g.regions||[]).slice(0,2).join(', ')}</td>`).join('')}</tr>
      </tbody>
    </table>`;

    // Remove buttons
    table.querySelectorAll('.compare-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        compareList = compareList.filter(g => g.id !== btn.dataset.id);
        renderCompare();
        renderBubbles();
      });
    });

    // Auto-analysis
    if (compareList.length >= 2) {
      const avgAcid = compareList.reduce((s, g) => s + g.acidity, 0) / compareList.length;
      const avgTannin = compareList.reduce((s, g) => s + g.tannin, 0) / compareList.length;
      const avgAroma = compareList.reduce((s, g) => s + g.aromatic, 0) / compareList.length;
      const allRed = compareList.every(g => g.type === 'red');
      const allWhite = compareList.every(g => g.type === 'white');
      let obs = [];
      if (allRed) obs.push('All selected grapes are red varietals.');
      if (allWhite) obs.push('All selected grapes are white varietals.');
      if (avgAcid >= 4) obs.push('These grapes share high acidity — excellent food wines.');
      if (avgTannin >= 4) obs.push('High tannin levels across the selection — age-worthy wines.');
      if (avgAroma >= 4) obs.push('Aromatic intensity is a common thread — expressive, perfumed wines.');
      if (avgAcid <= 2) obs.push('Low acidity across the board — softer, rounder wines.');
      const commonFoods = {};
      compareList.forEach(g => (g.foodCats || []).forEach(f => { commonFoods[f] = (commonFoods[f] || 0) + 1; }));
      const shared = Object.entries(commonFoods).filter(([, c]) => c === compareList.length).map(([f]) => f);
      if (shared.length) obs.push(`Shared food pairing: ${shared.join(', ')}.`);
      analysis.innerHTML = obs.length ? `<p class="compare-analysis-text">${obs.join(' ')}</p>` : '';
    } else {
      analysis.innerHTML = '<p class="compare-analysis-text">Add 2+ grapes to see analysis.</p>';
    }
  }

  // ── Sommelier Insights ──
  async function getSommInsights() {
    if (compareList.length < 2) { alert('Add at least 2 grapes to compare first.'); return; }
    const btn = document.getElementById('grape-somm-btn');
    const output = document.getElementById('grape-somm-output');
    btn.disabled = true;
    btn.textContent = 'Analyzing...';
    output.innerHTML = '<p class="grape-somm-loading">Getting sommelier insights...</p>';

    const grapeInfo = compareList.map(g => `${g.name} (${g.type}, acidity:${g.acidity}/5, tannin:${g.tannin}/5, aromatic:${g.aromatic}/5, regions: ${(g.regions||[]).join(', ')})`).join('; ');

    try {
      const res = await fetch('/api/study/podcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'grape',
          topic: `Sommelier analysis of these user-selected favorite grapes: ${grapeInfo}. Explain the pattern in their preferences, what it reveals about their palate, suggest 3 other grapes to explore, 2 regions to focus on, and 1 food pairing exercise.`,
          duration: 3,
          style: 'lecture'
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const paragraphs = data.script.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('');
      output.innerHTML = `<div class="grape-somm-card"><div class="grape-somm-title">Your Sommelier's Observations</div>${paragraphs}</div>`;
    } catch (err) {
      output.innerHTML = `<p class="grape-somm-error">Could not generate insights. Please try again.</p>`;
    }
    btn.disabled = false;
    btn.textContent = 'Get Sommelier Insights';
  }

  // Init when section becomes active
  const observer = new MutationObserver(() => {
    const section = document.getElementById('grapes-section');
    if (section && section.classList.contains('active')) init();
  });
  const section = document.getElementById('grapes-section');
  if (section) observer.observe(section, { attributes: true, attributeFilter: ['class'] });
});
