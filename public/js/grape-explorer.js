// grape-explorer.js — Interactive wine grape varietal explorer

document.addEventListener('DOMContentLoaded', () => {
  let allGrapes = [], filtered = [], compareList = [], favorites = [];
  let selectedType = '', selectedWorld = '', selectedLevel = '', selectedCountry = '', selectedSubregion = '';
  let selectedAroma = '', selectedSubAroma = '';
  let sliders = { aromatic: 0, acidity: 0, tannin: 0, alcohol: 0, ageworthy: 0, sugar: 0 };
  let initialized = false;

  // Country → subregion mapping
  const COUNTRY_REGIONS = {
    'France': ['Bordeaux','Burgundy','Rhône Valley','Loire Valley','Alsace','Champagne','Languedoc','Provence'],
    'Italy': ['Piedmont','Tuscany','Veneto','Sicily','Alto Adige','Sardinia'],
    'Spain': ['Rioja','Ribera del Duero','Priorat','Rias Baixas','Sherry'],
    'Germany': ['Mosel','Rheingau','Pfalz','Baden'],
    'USA': ['Napa Valley','Sonoma','Willamette Valley','Washington State','Paso Robles','Finger Lakes'],
    'Australia': ['Barossa Valley','McLaren Vale','Clare Valley','Hunter Valley','Margaret River','Adelaide Hills'],
    'Argentina': ['Mendoza','Salta','Patagonia'],
    'New Zealand': ['Marlborough','Central Otago','Hawke\'s Bay'],
    'South Africa': ['Stellenbosch','Swartland','Walker Bay'],
  };

  // Load favorites from localStorage
  try { favorites = JSON.parse(localStorage.getItem('sommplicity_grape_favs') || '[]'); } catch {}

  // Sub-aroma data
  const SUB_AROMAS = {
    fruit: ['cherry', 'raspberry', 'blackberry', 'plum', 'citrus', 'peach', 'apple', 'tropical', 'fig'],
    floral: ['rose', 'violet', 'elderflower', 'blossom', 'honeysuckle', 'jasmine'],
    earth: ['mineral', 'mushroom', 'truffle', 'leather', 'tobacco', 'herbs', 'smoke'],
    oak: ['vanilla', 'cedar', 'toast', 'chocolate', 'butter', 'coconut'],
    spice: ['pepper', 'clove', 'cinnamon', 'ginger', 'anise'],
  };

  const SLIDER_LABELS = { 0: 'Any', 1: 'Low', 2: 'Low-Med', 3: 'Medium', 4: 'Med-High', 5: 'High' };

  async function init() {
    if (initialized) return;
    initialized = true;
    try { const r = await fetch('/data/grapes.json'); allGrapes = (await r.json()).grapes || []; } catch { return; }
    wireFilters();
    applyFilters();
  }

  function wireFilters() {
    // Reset all
    document.getElementById('grape-reset-all').addEventListener('click', () => {
      selectedType = ''; selectedWorld = ''; selectedLevel = ''; selectedCountry = ''; selectedSubregion = ''; selectedAroma = ''; selectedSubAroma = '';
      Object.keys(sliders).forEach(k => sliders[k] = 0);
      document.getElementById('grape-subregion-area').style.display = 'none';
      document.querySelectorAll('.grape-type-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.grape-slider').forEach(s => { s.value = 0; });
      document.querySelectorAll('.grape-slider-val').forEach(s => s.textContent = 'Any');
      document.querySelectorAll('.grape-slider-clear').forEach(b => b.style.display = 'none');
      document.getElementById('grape-aroma-select').value = '';
      document.getElementById('grape-subaroma-select').style.display = 'none';
      applyFilters();
    });

    // Level, type, world buttons (toggle — click again to deselect)
    ['grape-level-btns', 'grape-type-btns', 'grape-world-btns'].forEach(groupId => {
      document.querySelectorAll(`#${groupId} .grape-type-btn`).forEach(btn => {
        btn.addEventListener('click', () => {
          const wasActive = btn.classList.contains('active');
          document.querySelectorAll(`#${groupId} .grape-type-btn`).forEach(b => b.classList.remove('active'));
          if (!wasActive) btn.classList.add('active');
          if (groupId === 'grape-level-btns') selectedLevel = wasActive ? '' : btn.dataset.level;
          if (groupId === 'grape-type-btns') selectedType = wasActive ? '' : btn.dataset.type;
          if (groupId === 'grape-world-btns') selectedWorld = wasActive ? '' : btn.dataset.world;
          applyFilters();
        });
      });
    });

    // Country toggles
    document.querySelectorAll('#grape-country-btns .grape-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const wasActive = btn.classList.contains('active');
        document.querySelectorAll('#grape-country-btns .grape-type-btn').forEach(b => b.classList.remove('active'));
        const subArea = document.getElementById('grape-subregion-area');
        const subBtns = document.getElementById('grape-subregion-btns');
        selectedSubregion = '';
        if (wasActive) {
          selectedCountry = '';
          subArea.style.display = 'none';
        } else {
          btn.classList.add('active');
          selectedCountry = btn.dataset.country;
          // Show subregions
          const regions = COUNTRY_REGIONS[selectedCountry] || [];
          if (regions.length) {
            subBtns.innerHTML = regions.map(r => `<button class="grape-type-btn" data-subregion="${r}">${r}</button>`).join('');
            subArea.style.display = 'block';
            subBtns.querySelectorAll('.grape-type-btn').forEach(sb => {
              sb.addEventListener('click', () => {
                const wasSubActive = sb.classList.contains('active');
                subBtns.querySelectorAll('.grape-type-btn').forEach(x => x.classList.remove('active'));
                if (!wasSubActive) { sb.classList.add('active'); selectedSubregion = sb.dataset.subregion; }
                else { selectedSubregion = ''; }
                applyFilters();
              });
            });
          } else { subArea.style.display = 'none'; }
        }
        applyFilters();
      });
    });

    // Show Grapes button
    document.getElementById('grape-apply-btn').addEventListener('click', () => applyFilters());

    // Aroma → sub-aroma cascade
    document.getElementById('grape-aroma-select').addEventListener('change', (e) => {
      selectedAroma = e.target.value;
      selectedSubAroma = '';
      const subSel = document.getElementById('grape-subaroma-select');
      if (selectedAroma && SUB_AROMAS[selectedAroma]) {
        subSel.innerHTML = '<option value="">Sub-aroma</option>' + SUB_AROMAS[selectedAroma].map(s => `<option value="${s}">${s}</option>`).join('');
        subSel.style.display = 'inline-block';
      } else { subSel.style.display = 'none'; }
      applyFilters();
    });
    document.getElementById('grape-subaroma-select').addEventListener('change', (e) => {
      selectedSubAroma = e.target.value;
      applyFilters();
    });

    // All sliders
    document.querySelectorAll('.grape-slider').forEach(slider => {
      const key = slider.id.replace('grape-', '');
      const valEl = document.getElementById(`${key}-val`);
      const clearBtn = slider.parentElement.querySelector('.grape-slider-clear');
      slider.addEventListener('input', () => {
        const val = parseInt(slider.value);
        sliders[key] = val;
        valEl.textContent = SLIDER_LABELS[val];
        valEl.classList.toggle('active', val > 0);
        slider.classList.toggle('active', val > 0);
        if (clearBtn) clearBtn.style.display = val > 0 ? 'inline' : 'none';
        applyFilters();
      });
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          slider.value = 0; sliders[key] = 0;
          valEl.textContent = 'Any'; valEl.classList.remove('active');
          slider.classList.remove('active');
          clearBtn.style.display = 'none';
          applyFilters();
        });
      }
    });

    // Compare clear
    document.getElementById('grape-compare-clear').addEventListener('click', () => { compareList = []; renderCompare(); renderBubbles(); });
    // Sommelier
    document.getElementById('grape-somm-btn').addEventListener('click', getSommInsights);
  }

  function matchesAroma(g) {
    if (!selectedAroma) return true;
    const ad = g.aromas_detailed || {};
    const catAromas = ad[selectedAroma] || [];
    if (!catAromas.length) return false;
    if (selectedSubAroma) return catAromas.some(a => a.toLowerCase().includes(selectedSubAroma));
    return true;
  }

  // Old World countries for the world filter
  const OLD_WORLD = ['France','Italy','Spain','Portugal','Germany','Austria','Greece','Switzerland'];
  const NEW_WORLD = ['USA','Australia','New Zealand','Argentina','Chile','South Africa'];

  function applyFilters() {
    filtered = allGrapes.filter(g => {
      // Type: red/white
      if (selectedType && g.type !== selectedType) return false;

      // World: check if grape's countries include old/new world countries
      if (selectedWorld === 'old') {
        if (!(g.countries || []).some(c => OLD_WORLD.includes(c))) return false;
      }
      if (selectedWorld === 'new') {
        if (!(g.countries || []).some(c => NEW_WORLD.includes(c))) return false;
      }

      // Level
      if (selectedLevel === 'wset3' && !g.wset3) return false;
      if (selectedLevel === 'intro' && !g.intro) return false;

      // Country: check the countries array directly
      if (selectedCountry) {
        if (!(g.countries || []).includes(selectedCountry)) return false;
      }

      // Subregion: check against regions list
      if (selectedSubregion) {
        const gRegions = (g.regions || []).map(r => r.toLowerCase());
        if (!gRegions.some(r => r.includes(selectedSubregion.toLowerCase()))) return false;
      }

      // Aroma
      if (!matchesAroma(g)) return false;

      // Sliders (tolerance of 1)
      if (sliders.aromatic > 0 && Math.abs(g.aromatic - sliders.aromatic) > 1) return false;
      if (sliders.acidity > 0 && Math.abs(g.acidity - sliders.acidity) > 1) return false;
      if (sliders.tannin > 0 && Math.abs(g.tannin - sliders.tannin) > 1) return false;
      if (sliders.alcohol > 0 && Math.abs((g.alcohol_num||3) - sliders.alcohol) > 1) return false;
      if (sliders.ageworthy > 0 && Math.abs((g.ageworthy||3) - sliders.ageworthy) > 1) return false;
      if (sliders.sugar > 0 && Math.abs((g.sugar||0) - sliders.sugar) > 1) return false;
      return true;
    });
    document.getElementById('grape-count').textContent = `Showing ${filtered.length} grape${filtered.length !== 1 ? 's' : ''}`;
    renderBubbles();
  }

  function renderBubbles() {
    const space = document.getElementById('grape-space');
    const bubbles = filtered.map((g, i) => {
      const x = Math.max(0.06, Math.min(0.94, (g.aromatic / 5) * 0.7 + 0.15 + Math.sin(i * 2.3) * 0.04));
      const y = Math.max(0.06, Math.min(0.94, 1 - ((g.acidity / 5) * 0.7 + 0.15) + Math.cos(i * 3.1) * 0.04));
      const sizes = { 5: 100, 4: 84, 3: 70, 2: 60, 1: 50 };
      return { grape: g, x, y, size: sizes[g.popularity] || 65 };
    });

    space.innerHTML = bubbles.map((b, i) => {
      const g = b.grape;
      const borderColor = g.type === 'red' ? 'var(--maroon)' : 'var(--gold)';
      const inCompare = compareList.some(c => c.id === g.id);
      const isFav = favorites.includes(g.id);
      return `<div class="grape-bubble ${inCompare ? 'in-compare' : ''}" data-id="${g.id}" style="left:${b.x*100}%;top:${b.y*100}%;width:${b.size}px;height:${b.size}px;border-color:${borderColor};animation-delay:${i*30}ms" tabindex="0" role="button" aria-label="${g.name}">
        <span class="grape-bubble-name">${g.name}</span>
        ${g.wset3 ? '<span class="grape-badge">WSET</span>' : ''}
      </div>
      <div class="grape-bubble-info" style="left:${b.x*100}%;top:calc(${b.y*100}% + ${b.size/2+4}px)">
        <span class="grape-info-chars">A:${g.acidity} T:${g.tannin} Ar:${g.aromatic}</span>
        <span class="grape-info-flavors">${(g.flavors||[]).slice(0,2).join(' · ')}</span>
      </div>`;
    }).join('');

    space.querySelectorAll('.grape-bubble').forEach(el => {
      const open = () => { const g = allGrapes.find(x => x.id === el.dataset.id); if (g) showGrapeModal(g); };
      el.addEventListener('click', open);
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });
    });
  }

  function showGrapeModal(g) {
    const modal = document.getElementById('grape-modal');
    const content = document.getElementById('grape-modal-content');
    const dots = (val, max) => Array.from({ length: max }, (_, i) => `<span class="grape-dot ${i < val ? 'filled' : ''}">${i < val ? '●' : '○'}</span>`).join('');
    const rangeDots = (val, max, label) => {
      // For ranges like "medium to full", show a range indicator
      return `<div class="grape-char"><span class="grape-char-label">${label}</span><span class="grape-char-dots">${dots(val, max)}</span></div>`;
    };
    const flavors = (g.flavors || []).map(f => `<span class="grape-flavor-tag">${f}</span>`).join('');
    const regions = (g.regions || []).join(' · ');
    const foods = (g.food || []).map(f => `<li>${f}</li>`).join('');
    const similar = (g.similar || []).map(id => { const s = allGrapes.find(x => x.id === id); return s ? `<button class="grape-similar-btn" data-id="${id}">${s.name}</button>` : ''; }).join('');
    const inCompare = compareList.some(c => c.id === g.id);
    const isFav = favorites.includes(g.id);

    // Build detailed aroma display
    const ad = g.aromas_detailed || {};
    let aromaHtml = '';
    for (const [cat, aromas] of Object.entries(ad)) {
      if (aromas.length) aromaHtml += `<div class="grape-aroma-cat"><span class="grape-aroma-cat-label">${cat}</span><span class="grape-aroma-cat-items">${aromas.join(', ')}</span></div>`;
    }

    content.innerHTML = `
      <div class="grape-modal-header">
        <h2>${g.name}</h2>
        <span class="grape-modal-type">${g.type === 'red' ? 'Red' : 'White'} · ${g.alcohol}% ABV${g.wset3 ? ' · WSET 3' : ''}</span>
        <span class="grape-modal-regions">${regions}</span>
      </div>

      <div class="grape-modal-section">
        <div class="grape-modal-label">Tasting Grid</div>
        <div class="grape-modal-chars">
          ${rangeDots(g.aromatic, 5, 'Nose Intensity')}
          ${rangeDots(g.acidity, 5, 'Acidity')}
          ${rangeDots(g.tannin, 5, 'Tannin')}
          ${rangeDots(g.body, 5, 'Body')}
          ${rangeDots(g.alcohol_num || 3, 5, 'Alcohol')}
          ${rangeDots(g.ageworthy || 3, 5, 'Age-Worthy')}
          ${rangeDots(g.sugar || 0, 5, 'Sweetness')}
        </div>
        <div class="grape-tasting-details">
          ${g.color ? `<span class="grape-tasting-item"><strong>Color:</strong> ${g.color}</span>` : ''}
          ${g.palate_sweetness ? `<span class="grape-tasting-item"><strong>Sweetness:</strong> ${g.palate_sweetness}</span>` : ''}
          ${g.palate_finish ? `<span class="grape-tasting-item"><strong>Finish:</strong> ${g.palate_finish}</span>` : ''}
          ${g.nose_intensity ? `<span class="grape-tasting-item"><strong>Nose:</strong> ${g.nose_intensity}</span>` : ''}
          ${g.palate_body ? `<span class="grape-tasting-item"><strong>Body:</strong> ${g.palate_body}</span>` : ''}
        </div>
      </div>

      <div class="grape-modal-section">
        <div class="grape-modal-label">Aroma Profile</div>
        ${aromaHtml || '<p class="grape-modal-text">No detailed aroma data available.</p>'}
      </div>

      <div class="grape-modal-flavors">${flavors}</div>
      <div class="grape-modal-section"><p class="grape-modal-desc">${g.description}</p></div>
      <div class="grape-modal-section"><div class="grape-modal-label">Pairs With</div><ul class="grape-modal-food">${foods}</ul></div>
      <div class="grape-modal-section"><div class="grape-modal-label">Aging Potential</div><p class="grape-modal-text">${g.aging || ''}</p></div>
      ${similar ? `<div class="grape-modal-section"><div class="grape-modal-label">Similar Grapes</div><div class="grape-similar-list">${similar}</div></div>` : ''}

      <div class="grape-modal-actions">
        <button class="grape-modal-compare-btn" id="grape-add-compare" ${inCompare ? 'disabled' : ''}>${inCompare ? 'In Comparison' : 'Add to Compare'}</button>
        <button class="grape-modal-fav-btn ${isFav ? 'is-fav' : ''}" id="grape-add-fav">${isFav ? 'Favorited' : 'Add to Favorites'}</button>
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
      renderCompare(); renderBubbles();
    });

    // Favorites (requires sign-in)
    document.getElementById('grape-add-fav').addEventListener('click', () => {
      const user = JSON.parse(localStorage.getItem('sommplicity_user') || 'null');
      if (!user) {
        if (confirm('Sign in to save favorites. Go to My Account?')) {
          close();
          const nav = document.querySelector('[data-section="preferences"]');
          if (nav) nav.click();
        }
        return;
      }
      if (favorites.includes(g.id)) {
        favorites = favorites.filter(f => f !== g.id);
        document.getElementById('grape-add-fav').textContent = 'Add to Favorites';
        document.getElementById('grape-add-fav').classList.remove('is-fav');
      } else {
        favorites.push(g.id);
        document.getElementById('grape-add-fav').textContent = 'Favorited';
        document.getElementById('grape-add-fav').classList.add('is-fav');
      }
      localStorage.setItem('sommplicity_grape_favs', JSON.stringify(favorites));
    });

    // Similar grape nav
    content.querySelectorAll('.grape-similar-btn').forEach(btn => {
      btn.addEventListener('click', () => { const sg = allGrapes.find(x => x.id === btn.dataset.id); if (sg) showGrapeModal(sg); });
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
        <tr><td>Age-Worthy</td>${compareList.map(g => `<td>${d(g.ageworthy||0)}</td>`).join('')}</tr>
        <tr><td>Flavors</td>${compareList.map(g => `<td>${(g.flavors||[]).slice(0,3).join(', ')}</td>`).join('')}</tr>
        <tr><td>Regions</td>${compareList.map(g => `<td>${(g.regions||[]).slice(0,2).join(', ')}</td>`).join('')}</tr>
      </tbody></table>`;

    table.querySelectorAll('.compare-remove').forEach(btn => {
      btn.addEventListener('click', () => { compareList = compareList.filter(g => g.id !== btn.dataset.id); renderCompare(); renderBubbles(); });
    });

    // Analysis: similarities and differences
    if (compareList.length >= 2) {
      const avg = (key) => compareList.reduce((s, g) => s + (g[key]||0), 0) / compareList.length;
      const range = (key) => { const vals = compareList.map(g => g[key]||0); return { min: Math.min(...vals), max: Math.max(...vals) }; };
      let sims = [], diffs = [];
      // Similarities
      if (range('acidity').max - range('acidity').min <= 1) sims.push('similar acidity levels');
      if (range('tannin').max - range('tannin').min <= 1) sims.push('similar tannin structure');
      if (range('aromatic').max - range('aromatic').min <= 1) sims.push('similar aromatic intensity');
      if (compareList.every(g => g.type === 'red')) sims.push('all red grapes');
      if (compareList.every(g => g.type === 'white')) sims.push('all white grapes');
      // Differences
      if (range('acidity').max - range('acidity').min >= 3) diffs.push(`acidity varies widely (${SLIDER_LABELS[range('acidity').min]} to ${SLIDER_LABELS[range('acidity').max]})`);
      if (range('tannin').max - range('tannin').min >= 3) diffs.push(`tannin levels differ significantly`);
      if (range('body').max - range('body').min >= 3) diffs.push(`body ranges from light to full`);
      if (range('ageworthy').max - range('ageworthy').min >= 3) diffs.push(`aging potential varies`);

      let html = '';
      if (sims.length) html += `<p class="compare-analysis-text"><strong>In common:</strong> ${sims.join(', ')}.</p>`;
      if (diffs.length) html += `<p class="compare-analysis-text"><strong>Key differences:</strong> ${diffs.join('; ')}.</p>`;
      if (!html) html = '<p class="compare-analysis-text">These grapes have a mix of shared and different characteristics.</p>';
      analysis.innerHTML = html;
    } else {
      analysis.innerHTML = '<p class="compare-analysis-text">Add 2+ grapes to see analysis.</p>';
    }
  }

  // ── Sommelier Insights ──
  async function getSommInsights() {
    if (compareList.length < 2) { alert('Add at least 2 grapes to compare.'); return; }
    const btn = document.getElementById('grape-somm-btn');
    const output = document.getElementById('grape-somm-output');
    btn.disabled = true; btn.textContent = 'Analyzing...';
    output.innerHTML = '<p class="grape-somm-loading">Getting sommelier insights...</p>';
    const info = compareList.map(g => `${g.name} (${g.type}, acidity:${g.acidity}/5, tannin:${g.tannin}/5, aromatic:${g.aromatic}/5, body:${g.body}/5, regions: ${(g.regions||[]).join(', ')})`).join('; ');
    try {
      const r = await fetch('/api/study/podcast', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category: 'grape', topic: `Sommelier analysis of user favorites: ${info}. Pattern, palate profile, 3 grapes to explore, 2 regions, 1 food exercise.`, duration: 3, style: 'lecture' }) });
      if (!r.ok) throw new Error('Failed');
      const d = await r.json();
      output.innerHTML = `<div class="grape-somm-card"><div class="grape-somm-title">Your Sommelier's Observations</div>${d.script.split('\n').filter(p=>p.trim()).map(p=>`<p>${p}</p>`).join('')}</div>`;
    } catch { output.innerHTML = '<p class="grape-somm-error">Could not generate insights. Try again.</p>'; }
    btn.disabled = false; btn.textContent = 'Get Sommelier Insights';
  }

  // Init when section becomes active
  const obs = new MutationObserver(() => { const s = document.getElementById('grapes-section'); if (s && s.classList.contains('active')) init(); });
  const s = document.getElementById('grapes-section');
  if (s) obs.observe(s, { attributes: true, attributeFilter: ['class'] });
});
