// grape-climate.js — Same Grape, Different Climates explorer

document.addEventListener('DOMContentLoaded', () => {
  let data = [];
  let selected = null;
  let openDive = -1;
  let initialized = false;

  const KEYS = ['body','acidity','tannin','fruit','alcohol'];
  const LABELS = ['Body','Acidity','Tannin','Fruit','Alcohol'];
  const ICONS = { castle:'\u{1F3F0}', tree:'\u{1F332}', mountain:'\u26F0\uFE0F', fog:'\u{1F32B}\uFE0F', snow:'\u2744\uFE0F', sun:'\u2600\uFE0F', wave:'\u{1F30A}' };

  function render() {
    const container = document.getElementById('gc-content');
    if (!container || !data.length) return;
    if (!selected) renderList(container);
    else renderDetail(container);
  }

  // ── LIST VIEW ─────────────────────────────────────────

  function renderList(c) {
    c.innerHTML = `
      <div class="gc-hero-pair">
        <div class="gc-hero-img-wrap">
          <img class="gc-hero-img" src="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=280&fit=crop" alt="Foggy coastal vineyard" loading="lazy">
          <span class="gc-hero-label">Cool Climate</span>
        </div>
        <div class="gc-hero-img-wrap">
          <img class="gc-hero-img" src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=280&fit=crop" alt="Sun-drenched vineyard in warm climate" loading="lazy">
          <span class="gc-hero-label">Warm Climate</span>
        </div>
      </div>
      <div class="gc-header-crumb">Learn</div>
      <h1 class="gc-header-title">Same Grape,<br><em>Different Climates</em></h1>
      ${data.map(g => `
        <button class="gc-grape-btn" data-grape="${g.id}">
          <div class="gc-grape-accent" style="background:linear-gradient(180deg,${g.color},${g.color}33)"></div>
          <div class="gc-grape-info">
            <div class="gc-grape-name-row">
              <span class="gc-grape-name">${g.name}</span>
              <span class="gc-grape-type">${g.type}</span>
            </div>
            <div class="gc-grape-chips">
              ${g.regions.map(r => `<span class="gc-grape-chip">${r.r} <span class="gc-grape-chip-snap" style="color:${g.color}">${(r.snap || '').split('·')[0].trim()}</span></span>`).join('')}
            </div>
          </div>
          <div class="gc-grape-arrow">&rarr;</div>
        </button>
      `).join('')}
    `;
    c.querySelectorAll('.gc-grape-btn').forEach(btn => {
      btn.addEventListener('click', () => { selected = btn.dataset.grape; openDive = -1; render(); });
    });
  }

  // ── DETAIL VIEW ───────────────────────────────────────

  function renderDetail(c) {
    const g = data.find(x => x.id === selected);
    if (!g) return;
    const rs = g.regions;

    // Analysis
    const diffs = [], sames = [];
    KEYS.forEach((k, ki) => {
      const vals = rs.map(r => r.radar[ki]);
      if (vals.every(v => v === 0)) return;
      const mn = Math.min(...vals), mx = Math.max(...vals), rng = mx - mn;
      const mnR = rs[vals.indexOf(mn)].r, mxR = rs[vals.indexOf(mx)].r;
      if (rng >= 2) diffs.push({ label: LABELS[ki], min: mn, max: mx, minR: mnR, maxR: mxR, range: rng, key: k, ki });
      else if (rng <= 0.5) sames.push({ label: LABELS[ki], val: mn, key: k, ki });
    });
    diffs.sort((a, b) => b.range - a.range);

    function analysisText(d) {
      if (d.key === 'body') return `${d.maxR}'s warm climate ripens fruit fully, creating a heavier, more viscous wine. ${d.minR}'s cooler conditions produce a lighter, more transparent style.`;
      if (d.key === 'acidity') return `${d.maxR}'s cooler climate preserves more natural acidity. ${d.minR}'s warmth burns through acid during ripening.`;
      if (d.key === 'tannin') return `${d.maxR}'s conditions produce firmer, more structured tannins. ${d.minR} shows softer, rounder tannins.`;
      if (d.key === 'fruit') return `${d.maxR}'s climate pushes fruit expression to the forefront. ${d.minR} shows more restraint, letting earth and structure lead.`;
      if (d.key === 'alcohol') return `${d.maxR}'s warmth converts more grape sugar to alcohol. ${d.minR}'s cooler climate keeps alcohol moderate${d.min <= 2 ? ' or retains residual sugar instead' : ''}.`;
      return '';
    }

    function sameText() {
      const labels = sames.map(s => s.label).join(' and ');
      const reason = sames.some(s => s.key === 'acidity') ? 'this grape naturally maintains its acidity structure wherever it grows' :
        sames.some(s => s.key === 'tannin') ? "the grape's tannin profile is more about its skin thickness than where it's planted" :
        "this is an intrinsic characteristic of the grape variety itself";
      return `${labels} ${sames.length === 1 ? 'remains' : 'remain'} consistent regardless of climate: ${reason}.`;
    }

    function metricLabel(v) { return v <= 2 ? 'Low' : v <= 3 ? 'Med' : v <= 4 ? 'High' : 'Very High'; }

    c.innerHTML = `
      <button class="gc-back" id="gc-back">&larr; All Grapes</button>

      <div class="gc-hop">
        ${data.map(x => `<button class="gc-hop-pill ${x.id === selected ? 'active' : ''}" data-grape="${x.id}" style="${x.id === selected ? `border-color:${x.color};background:${x.color}08` : ''}">${x.name.length > 10 ? x.name.split(/[\s/]/)[0] : x.name}</button>`).join('')}
      </div>

      <div class="gc-animate" id="gc-detail">
        <div class="gc-detail-name">
          <div class="gc-detail-accent" style="background:${g.color}"></div>
          <h2 class="gc-detail-title">${g.name}</h2>
        </div>

        <!-- Region columns -->
        <div class="gc-regions-row">
          ${rs.map(r => `<div class="gc-region-col">
            <div class="gc-region-icon">${ICONS[r.icon] || ''}</div>
            <div class="gc-region-name">${r.r}</div>
            <div class="gc-region-meta">${r.flag} ${r.cl}</div>
          </div>`).join('')}
        </div>

        <div class="gc-snaps-row">
          ${rs.map(r => `<div class="gc-snap-col" style="color:${g.color}">${r.snap || ''}</div>`).join('')}
        </div>

        <!-- Scale bars -->
        <div class="gc-scales">
          ${KEYS.map((k, ki) => {
            const vals = rs.map(r => r.radar[ki]);
            if (vals.every(v => v === 0)) return '';
            return `<div class="gc-scale-row">
              <div class="gc-scale-label">${LABELS[ki]}</div>
              <div class="gc-scale-cols">
                ${rs.map(r => `<div class="gc-scale-col"><div class="gc-scale-bars">
                  ${[1,2,3,4,5].map(lv => `<div class="gc-scale-bar" style="height:${lv*20}%;background:${lv <= r.radar[ki] ? g.color + 'CC' : 'rgba(44,24,16,0.04)'}"></div>`).join('')}
                </div></div>`).join('')}
              </div>
            </div>`;
          }).join('')}
        </div>

        <!-- Analysis -->
        ${diffs.length || sames.length ? `<div class="gc-analysis">
          <div class="gc-analysis-title" style="color:${g.color}">What Climate Changes</div>
          ${diffs.map(d => `<div class="gc-analysis-item">
            <div class="gc-analysis-item-title">${d.label} <span class="gc-analysis-item-shift" style="color:${g.color}">shifts dramatically</span></div>
            <div class="gc-analysis-item-text">${analysisText(d)}</div>
          </div>`).join('')}
          ${sames.length ? `<div style="margin-top:14px">
            <div class="gc-analysis-same-title">What Stays Constant</div>
            <div class="gc-analysis-same-text">${sameText()}</div>
          </div>` : ''}
        </div>` : ''}

        <!-- Deep dives -->
        <div style="margin-bottom:20px">
          <div class="gc-dives-title">Deep Dive: Each Expression</div>
          ${rs.map((r, i) => `<div class="gc-dive ${openDive === i ? 'open' : ''}" data-dive="${i}" ${openDive === i ? `style="background:${g.color}04;border-color:${g.color}18"` : ''}>
            <div class="gc-dive-header" data-dive-toggle="${i}">
              <span class="gc-dive-icon">${ICONS[r.icon] || ''}</span>
              <span class="gc-dive-name">${r.r}</span>
              <span class="gc-dive-meta">${r.flag} ${r.cl}</span>
              <span class="gc-dive-arrow" ${openDive === i ? `style="color:${g.color}"` : ''}>&#9662;</span>
            </div>
            ${openDive === i ? `<div class="gc-dive-body gc-animate">
              <div class="gc-dive-sep"></div>
              <div class="gc-dive-note" style="border-left-color:${g.color}25">${r.note}</div>
              <div class="gc-dive-metrics">
                ${KEYS.map((k, ki) => r.radar[ki] === 0 ? '' : `<span class="gc-dive-metric">${LABELS[ki]}: <span class="gc-dive-metric-val" style="color:${g.color}">${metricLabel(r.radar[ki])}</span></span>`).join('')}
              </div>
              <div><span class="gc-dive-price" style="background:${g.color}0A;border:1px solid ${g.color}18;color:${g.color}">${r.price}</span></div>
              ${r.prod && r.prod.length ? `<div class="gc-dive-prod-label">Producers</div>
              <div class="gc-dive-prods">${r.prod.map(p => `<span class="gc-dive-prod">${p}</span>`).join('')}</div>` : ''}
            </div>` : ''}
          </div>`).join('')}
        </div>

        <div class="gc-closing">
          <div class="gc-closing-text">The grape is the instrument.<br><em style="color:${g.color}">Terroir writes the music.</em></div>
        </div>
      </div>
    `;

    // Wire
    document.getElementById('gc-back').addEventListener('click', () => { selected = null; render(); });
    c.querySelectorAll('.gc-hop-pill').forEach(p => {
      p.addEventListener('click', () => { selected = p.dataset.grape; openDive = -1; render(); });
    });
    c.querySelectorAll('[data-dive-toggle]').forEach(h => {
      h.addEventListener('click', () => {
        const i = parseInt(h.dataset.diveToggle);
        openDive = openDive === i ? -1 : i;
        render();
      });
    });
  }

  // ── Init ──────────────────────────────────────────────

  async function init() {
    if (initialized) return;
    initialized = true;
    try {
      const res = await fetch('/data/grape-climate.json');
      data = await res.json();
    } catch { return; }
    render();
  }

  const observer = new MutationObserver(() => {
    const sec = document.getElementById('grapeclimate-section');
    if (sec && sec.classList.contains('active')) init();
  });
  const sec = document.getElementById('grapeclimate-section');
  if (sec) {
    observer.observe(sec, { attributes: true, attributeFilter: ['class'] });
    // Check immediately in case section is already active (deep link)
    if (sec.classList.contains('active')) init();
  }
});
