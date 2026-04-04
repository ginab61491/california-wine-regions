// label-school.js — Interactive Wine Label Reading Tool

document.addEventListener('DOMContentLoaded', () => {
  let labelData = null;
  let selectedLabel = 'chablis';
  let activeZone = null;
  let mode = 'explore';
  let uploadImage = null;
  let uploadActiveZone = null;
  let initialized = false;

  // ── Render ────────────────────────────────────────────

  function render() {
    if (!labelData) return;
    const container = document.getElementById('ls-content');
    if (!container) return;

    if (mode === 'explore') {
      renderExplore(container);
    } else {
      renderUpload(container);
    }
  }

  function renderExplore(container) {
    const data = labelData.labels[selectedLabel];
    const labels = labelData.labels;
    const isOldWorld = data.missingGrape;

    // Get classification text
    const classZone = data.zones.find(z => z.id === 'vineyard' || z.id === 'riserva' || z.id === 'reserva');
    let classText = '';
    if (classZone) {
      if (classZone.id === 'vineyard') classText = 'Fourchaume';
      else if (classZone.id === 'riserva') classText = 'Riserva';
      else if (classZone.id === 'reserva') classText = 'Reserva';
    }

    container.innerHTML = `
      <!-- Label selector -->
      <div class="ls-label-grid">
        ${Object.keys(labels).map(key => {
          const l = labels[key];
          return `<button class="ls-label-card ${key === selectedLabel ? 'active' : ''}" data-label="${key}">
            <div class="ls-label-region">${l.region}</div>
            <div class="ls-label-title">${l.title}</div>
            <div class="ls-label-meta">${l.vintage} · ${l.producer}</div>
          </button>`;
        }).join('')}
      </div>

      <!-- Old/New World indicator -->
      <div class="ls-world-indicator">
        <span class="ls-world-pill ${isOldWorld ? 'active' : ''}">Old World</span>
        <span class="ls-world-dot">·</span>
        <span class="ls-world-pill ${!isOldWorld ? 'active' : ''}">New World</span>
      </div>

      <!-- Interactive label -->
      <div class="ls-wine-label">
        <div class="ls-label-surface">
          <div class="ls-label-border-inner"></div>

          <div class="ls-zone ${activeZone === 'producer' ? 'active' : ''}" data-zone="producer" style="margin-bottom:16px">
            <div class="ls-label-producer">${data.producer}</div>
          </div>

          <div class="ls-label-divider"></div>

          <div class="ls-zone ${activeZone === 'appellation' || activeZone === 'grape' ? 'active' : ''}" data-zone="${data.zones.find(z => z.id === 'appellation') ? 'appellation' : 'grape'}" style="margin-bottom:8px">
            <div class="ls-label-main-title">${data.title}</div>
            <div class="ls-label-main-sub">${data.subtitle}</div>
          </div>

          ${classZone ? `<div class="ls-zone ${activeZone === classZone.id ? 'active' : ''}" data-zone="${classZone.id}" style="margin-bottom:12px">
            <div class="ls-label-classification">${classText}</div>
          </div>` : ''}

          ${data.zones.find(z => z.id === 'region') ? `<div class="ls-zone ${activeZone === 'region' ? 'active' : ''}" data-zone="region" style="margin-bottom:12px">
            <div style="font-family:'Cormorant Garamond',serif;font-size:0.75rem;letter-spacing:0.15em;color:#8B7355;text-transform:uppercase">${data.appellation}</div>
          </div>` : ''}

          <div class="ls-label-ornament">&#10022;</div>

          <div class="ls-zone ${activeZone === 'vintage' ? 'active' : ''}" data-zone="vintage" style="margin-bottom:16px">
            <div class="ls-label-vintage">${data.vintage}</div>
          </div>

          ${isOldWorld ? `<div class="ls-missing-grape ${activeZone === 'missing_grape' ? 'active' : ''}" data-zone="missing_grape">
            <div class="ls-missing-grape-title">Where's the grape?</div>
            <div class="ls-missing-grape-hint">Tap to find out</div>
          </div>` : ''}

          <div class="ls-label-bottom">
            <div class="ls-label-divider" style="width:40px;margin-bottom:12px"></div>
            <div class="ls-zone ${activeZone === 'volume' || activeZone === 'abv' ? 'active' : ''}" data-zone="volume">
              <span class="ls-label-bottom-text">${data.volume} · ${data.abv} vol</span>
            </div>
            <div class="ls-zone ${activeZone === 'country' ? 'active' : ''}" data-zone="country" style="margin-top:4px">
              <span class="ls-label-bottom-text">${data.country}</span>
            </div>
          </div>
        </div>
        <div class="ls-tap-hint">Tap any element on the label to learn what it means</div>
      </div>

      <!-- Explanation panel -->
      <div id="ls-explanation"></div>

      <!-- Core rule -->
      <div class="ls-core-rule">
        <div class="ls-core-rule-label">The Core Rule</div>
        <div class="ls-core-rule-text">
          <strong>Old World</strong> labels name the <em>place</em>. The grape is implied by law.<br>
          <strong>New World</strong> labels name the <em>grape</em>. The place is secondary.
        </div>
        <div class="ls-core-rule-footnote">This single insight unlocks every wine label in the world.</div>
      </div>
    `;

    // Wire label selectors
    container.querySelectorAll('.ls-label-card').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedLabel = btn.dataset.label;
        activeZone = null;
        render();
      });
    });

    // Wire tappable zones
    container.querySelectorAll('[data-zone]').forEach(el => {
      el.addEventListener('click', () => {
        const zone = el.dataset.zone;
        activeZone = activeZone === zone ? null : zone;
        renderExplanation();
        // Update active states
        container.querySelectorAll('[data-zone]').forEach(z => {
          z.classList.toggle('active', z.dataset.zone === activeZone);
        });
      });
    });

    renderExplanation();
  }

  function renderExplanation() {
    const el = document.getElementById('ls-explanation');
    if (!el) return;
    if (!activeZone) { el.innerHTML = ''; return; }

    const data = labelData.labels[selectedLabel];
    let info;
    if (activeZone === 'missing_grape') {
      info = { label: 'Missing Grape Variety', explanation: data.missingGrapeNote, wset: 'WSET 2 Core Rule: Old World labels name the PLACE. New World labels name the GRAPE. Master this.' };
    } else {
      info = data.zones.find(z => z.id === activeZone);
    }
    if (!info) { el.innerHTML = ''; return; }

    el.innerHTML = `
      <div class="ls-explanation">
        <div class="ls-expl-header">
          <div class="ls-expl-bar"></div>
          <div class="ls-expl-label">${info.label}</div>
        </div>
        <div class="ls-expl-text">${info.explanation}</div>
        ${info.wset ? `<div class="ls-wset-box">
          <div class="ls-wset-label">WSET Note</div>
          <div class="ls-wset-text">${info.wset}</div>
        </div>` : ''}
      </div>
    `;
  }

  function renderUpload(container) {
    const zones = labelData.uploadZones;

    if (!uploadImage) {
      container.innerHTML = `
        <div class="ls-upload-drop" id="ls-upload-area">
          <input type="file" id="ls-file-input" accept="image/*" style="display:none">
          <div class="ls-upload-icon">&#128247;</div>
          <div class="ls-upload-title">Upload a wine label</div>
          <div class="ls-upload-hint">Take a photo or choose from your library</div>
          <div class="ls-upload-hint" style="margin-top:2px">JPG, PNG, HEIC supported</div>
        </div>

        <div class="ls-upload-zones">
          <div class="ls-upload-zones-title">What to look for on any label</div>
          ${zones.map(z => `
            <div class="ls-upload-zone ${uploadActiveZone === z.id ? 'active' : ''}" data-uzone="${z.id}">
              <div class="ls-upload-zone-header">
                <div class="ls-upload-zone-dot" style="background:${z.color}"></div>
                <div class="ls-upload-zone-name">${z.label}</div>
              </div>
              ${uploadActiveZone === z.id ? `<div class="ls-upload-zone-expl">${z.explanation}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <div class="ls-quick-decode">
          <div class="ls-quick-decode-title">Quick Label Decode</div>
          <div class="ls-quick-decode-text">
            <strong>Old World</strong> (France, Italy, Spain, Germany): The biggest word is usually a <em>place</em>. The grape is implied by appellation law.<br><br>
            <strong>New World</strong> (USA, Australia, NZ, Chile, Argentina, South Africa): The biggest word is usually the <em>grape variety</em>. The region is secondary.
          </div>
        </div>
      `;

      // Wire upload
      const area = document.getElementById('ls-upload-area');
      const input = document.getElementById('ls-file-input');
      if (area) area.addEventListener('click', () => input.click());
      if (input) input.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => { uploadImage = ev.target.result; render(); };
          reader.readAsDataURL(file);
        }
      });

      // Wire zone toggles
      container.querySelectorAll('[data-uzone]').forEach(el => {
        el.addEventListener('click', () => {
          uploadActiveZone = uploadActiveZone === el.dataset.uzone ? null : el.dataset.uzone;
          render();
        });
      });
    } else {
      // Image uploaded — show with overlay zones
      container.innerHTML = `
        <div class="ls-uploaded-wrap">
          <img src="${uploadImage}" alt="Uploaded wine label" class="ls-uploaded-img">
          <button class="ls-uploaded-reset" id="ls-reset-upload">New label</button>
          ${zones.map(z => `
            <div class="ls-uploaded-overlay ${uploadActiveZone === z.id ? 'active' : ''}" data-uzone="${z.id}"
              style="top:${z.y}%;height:${z.h}%;color:${z.color};${uploadActiveZone === z.id ? `background:${z.color}22;border-color:${z.color}` : ''}">
              ${uploadActiveZone === z.id ? `<span class="ls-uploaded-overlay-tag" style="background:${z.color}">${z.label}</span>` : ''}
            </div>
          `).join('')}
        </div>

        <div class="ls-tap-hint" style="margin-bottom:12px">Tap different areas of the label to learn what each section contains</div>

        ${uploadActiveZone ? (() => {
          const z = zones.find(z => z.id === uploadActiveZone);
          return z ? `<div class="ls-explanation">
            <div class="ls-expl-header">
              <div class="ls-upload-zone-dot" style="background:${z.color};width:8px;height:8px;border-radius:50%"></div>
              <div class="ls-expl-label">${z.label}</div>
            </div>
            <div class="ls-expl-text">${z.explanation}</div>
          </div>` : '';
        })() : ''}

        <div class="ls-quick-decode">
          <div class="ls-quick-decode-title">Quick Label Decode</div>
          <div class="ls-quick-decode-text">
            <strong>Old World</strong> (France, Italy, Spain, Germany): The biggest word is usually a <em>place</em>. The grape is implied by appellation law.<br><br>
            <strong>New World</strong> (USA, Australia, NZ, Chile, Argentina, South Africa): The biggest word is usually the <em>grape variety</em>. The region is secondary.
          </div>
        </div>
      `;

      document.getElementById('ls-reset-upload')?.addEventListener('click', () => {
        uploadImage = null; uploadActiveZone = null; render();
      });

      container.querySelectorAll('[data-uzone]').forEach(el => {
        el.addEventListener('click', () => {
          uploadActiveZone = uploadActiveZone === el.dataset.uzone ? null : el.dataset.uzone;
          render();
        });
      });
    }
  }

  // ── Mode toggle ───────────────────────────────────────

  document.querySelectorAll('.ls-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ls-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      mode = btn.dataset.mode;
      activeZone = null;
      uploadActiveZone = null;
      render();
    });
  });

  // ── Init ──────────────────────────────────────────────

  async function init() {
    if (initialized) return;
    initialized = true;
    try {
      const res = await fetch('/data/label-school.json');
      labelData = await res.json();
    } catch { return; }
    render();
  }

  const observer = new MutationObserver(() => {
    const sec = document.getElementById('labelschool-section');
    if (sec && sec.classList.contains('active')) init();
  });
  const sec = document.getElementById('labelschool-section');
  if (sec) observer.observe(sec, { attributes: true, attributeFilter: ['class'] });
});
