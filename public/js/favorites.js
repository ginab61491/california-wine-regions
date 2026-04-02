// favorites.js — My Favorites hub: grapes, regions, producers + AI palate analysis

document.addEventListener('DOMContentLoaded', () => {
  // Favorites stored in localStorage
  function getFavs(key) { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } }
  function setFavs(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  // ── Public API for other pages to add favorites ──
  window.sommplicityFavorites = {
    addGrape(name) { const favs = getFavs('somm_fav_grapes'); if (!favs.includes(name)) { favs.push(name); setFavs('somm_fav_grapes', favs); } },
    removeGrape(name) { setFavs('somm_fav_grapes', getFavs('somm_fav_grapes').filter(f => f !== name)); },
    hasGrape(name) { return getFavs('somm_fav_grapes').includes(name); },

    addRegion(name) { const favs = getFavs('somm_fav_regions'); if (!favs.includes(name)) { favs.push(name); setFavs('somm_fav_regions', favs); } },
    removeRegion(name) { setFavs('somm_fav_regions', getFavs('somm_fav_regions').filter(f => f !== name)); },
    hasRegion(name) { return getFavs('somm_fav_regions').includes(name); },

    addProducer(name) { const favs = getFavs('somm_fav_producers'); if (!favs.includes(name)) { favs.push(name); setFavs('somm_fav_producers', favs); } },
    removeProducer(name) { setFavs('somm_fav_producers', getFavs('somm_fav_producers').filter(f => f !== name)); },
    hasProducer(name) { return getFavs('somm_fav_producers').includes(name); },
  };

  // ── Render favorites page ──
  function renderFavorites() {
    const grapes = getFavs('somm_fav_grapes');
    const regions = getFavs('somm_fav_regions');
    const producers = getFavs('somm_fav_producers');

    // Grapes
    const grapesList = document.getElementById('fav-grapes-list');
    const grapesCount = document.getElementById('fav-grapes-count');
    if (grapesList) {
      grapesCount.textContent = `${grapes.length} saved`;
      if (grapes.length) {
        grapesList.innerHTML = grapes.map(g => `<div class="fav-item"><span class="fav-item-name">${g}</span><button class="fav-item-remove" data-type="grapes" data-name="${g}">&times;</button></div>`).join('');
      } else {
        grapesList.innerHTML = '<p class="fav-empty">No favorite grapes yet. Explore the <a data-section="grapes" class="fav-link">Grape Explorer</a> and click the heart to save.</p>';
      }
    }

    // Regions
    const regionsList = document.getElementById('fav-regions-list');
    const regionsCount = document.getElementById('fav-regions-count');
    if (regionsList) {
      regionsCount.textContent = `${regions.length} saved`;
      if (regions.length) {
        regionsList.innerHTML = regions.map(r => `<div class="fav-item"><span class="fav-item-name">${r}</span><button class="fav-item-remove" data-type="regions" data-name="${r}">&times;</button></div>`).join('');
      } else {
        regionsList.innerHTML = '<p class="fav-empty">No favorite regions yet. Browse <a data-section="regions" class="fav-link">Wine Regions</a> to add.</p>';
      }
    }

    // Producers
    const producersList = document.getElementById('fav-producers-list');
    const producersCount = document.getElementById('fav-producers-count');
    if (producersList) {
      producersCount.textContent = `${producers.length} saved`;
      if (producers.length) {
        producersList.innerHTML = producers.map(p => `<div class="fav-item"><span class="fav-item-name">${p}</span><button class="fav-item-remove" data-type="producers" data-name="${p}">&times;</button></div>`).join('');
      } else {
        producersList.innerHTML = '<p class="fav-empty">No favorite producers yet. Explore <a data-section="producers" class="fav-link">Producer Profiles</a> to save.</p>';
      }
    }

    // Wire remove buttons
    document.querySelectorAll('.fav-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = 'somm_fav_' + btn.dataset.type;
        setFavs(key, getFavs(key).filter(f => f !== btn.dataset.name));
        renderFavorites();
      });
    });

    // Wire section links
    document.querySelectorAll('.fav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const nav = document.querySelector(`[data-section="${link.dataset.section}"]`);
        if (nav) nav.click();
      });
    });
  }

  // ── AI Palate Analysis ──
  const palateBtn = document.getElementById('fav-palate-btn');
  if (palateBtn) {
    palateBtn.addEventListener('click', async () => {
      const grapes = getFavs('somm_fav_grapes');
      const regions = getFavs('somm_fav_regions');
      const producers = getFavs('somm_fav_producers');
      const total = grapes.length + regions.length + producers.length;

      if (total < 3) {
        document.getElementById('fav-palate-output').innerHTML = '<p class="fav-palate-hint">Save at least 3 favorites (grapes, regions, or producers) to get a palate analysis.</p>';
        return;
      }

      palateBtn.disabled = true;
      palateBtn.textContent = 'Analyzing...';
      const output = document.getElementById('fav-palate-output');
      output.innerHTML = '<p class="fav-palate-loading">Building your palate profile...</p>';

      const info = [];
      if (grapes.length) info.push(`Favorite grapes: ${grapes.join(', ')}`);
      if (regions.length) info.push(`Favorite regions: ${regions.join(', ')}`);
      if (producers.length) info.push(`Favorite producers: ${producers.join(', ')}`);

      try {
        const res = await fetch('/api/study/podcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: 'grape',
            topic: `Palate analysis for a wine enthusiast. ${info.join('. ')}. Describe their palate in sommelier terms: what flavors and textures they gravitate toward, what style of wine defines them (Old World vs New World, fruit-forward vs terroir-driven, bold vs elegant), give them vocabulary to describe their taste to a sommelier or wine shop, and suggest 3 new things to try.`,
            duration: 3,
            style: 'lecture'
          }),
        });
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        const paragraphs = data.script.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('');
        output.innerHTML = `<div class="fav-palate-card"><div class="fav-palate-title">Your Palate Profile</div>${paragraphs}</div>`;
      } catch {
        output.innerHTML = '<p class="fav-palate-hint">Could not generate analysis. Please try again.</p>';
      }
      palateBtn.disabled = false;
      palateBtn.textContent = 'Analyze My Palate';
    });
  }

  // Render palate page favorites summary
  function renderPalateSummary() {
    const el = document.getElementById('palate-fav-summary');
    if (!el) return;
    const grapes = getFavs('somm_fav_grapes');
    const regions = getFavs('somm_fav_regions');
    const producers = getFavs('somm_fav_producers');
    const total = grapes.length + regions.length + producers.length;

    if (total === 0) {
      el.innerHTML = '<p class="palate-empty">No favorites saved yet. Visit <a data-section="grapes" class="fav-link">Wine Grapes</a>, <a data-section="producers" class="fav-link">Producer Profiles</a>, or <a data-section="analyzer" class="fav-link">My Favorites</a> to start saving.</p>';
    } else {
      let html = '<div class="palate-fav-pills">';
      if (grapes.length) html += `<div class="palate-fav-group"><span class="palate-fav-label">Grapes:</span> ${grapes.map(g => `<span class="palate-fav-pill">${g}</span>`).join('')}</div>`;
      if (regions.length) html += `<div class="palate-fav-group"><span class="palate-fav-label">Regions:</span> ${regions.map(r => `<span class="palate-fav-pill">${r}</span>`).join('')}</div>`;
      if (producers.length) html += `<div class="palate-fav-group"><span class="palate-fav-label">Producers:</span> ${producers.map(p => `<span class="palate-fav-pill">${p}</span>`).join('')}</div>`;
      html += '</div>';
      el.innerHTML = html;
    }
    // Wire links
    el.querySelectorAll('.fav-link').forEach(link => {
      link.addEventListener('click', (e) => { e.preventDefault(); const nav = document.querySelector(`[data-section="${link.dataset.section}"]`); if (nav) nav.click(); });
    });
  }

  // Init on section visible
  const observer = new MutationObserver(() => {
    const favSection = document.getElementById('analyzer-section');
    if (favSection && favSection.classList.contains('active')) renderFavorites();
    const palateSection = document.getElementById('palate-section');
    if (palateSection && palateSection.classList.contains('active')) renderPalateSummary();
  });
  const favSection = document.getElementById('analyzer-section');
  if (favSection) observer.observe(favSection, { attributes: true, attributeFilter: ['class'] });
  const palateSection = document.getElementById('palate-section');
  if (palateSection) observer.observe(palateSection, { attributes: true, attributeFilter: ['class'] });
});
