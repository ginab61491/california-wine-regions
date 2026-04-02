// producers.js — Global wine producer profiles explorer

document.addEventListener('DOMContentLoaded', () => {
  let allProducers = [];
  let filteredProducers = [];
  let currentPage = 1;
  const perPage = 12;
  let selectedGrape = '';
  let selectedRegions = new Set();
  let selectedPrice = '';
  let selectedTiers = new Set();
  let selectedTags = new Set();
  let searchQuery = '';
  let initialized = false;

  async function initProducers() {
    if (initialized) return;
    initialized = true;
    try {
      const res = await fetch('/data/producers.json');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      allProducers = data.producers || [];
    } catch {
      document.getElementById('prod-grid').innerHTML = '<p style="padding:32px;color:var(--ink-xlight)">Producer data loading...</p>';
      return;
    }
    buildGrapeSelect();
    wireFilters();
    applyFilters();
  }

  function buildGrapeSelect() {
    const grapes = new Set();
    allProducers.forEach(p => (p.grapes || []).forEach(g => grapes.add(g)));
    const sorted = [...grapes].sort();
    const sel = document.getElementById('prod-grape-select');
    sorted.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g; opt.textContent = g;
      sel.appendChild(opt);
    });
  }

  function buildRegionPills() {
    const regions = new Set();
    const source = selectedGrape
      ? allProducers.filter(p => (p.grapes || []).includes(selectedGrape))
      : allProducers;
    source.forEach(p => { if (p.region) regions.add(p.region); });
    const sorted = [...regions].sort();
    const container = document.getElementById('prod-region-pills');
    container.innerHTML = '';
    selectedRegions.clear();
    sorted.slice(0, 30).forEach(r => {
      const btn = document.createElement('button');
      btn.className = 'prod-pill';
      btn.textContent = r;
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        if (btn.classList.contains('active')) selectedRegions.add(r);
        else selectedRegions.delete(r);
        applyFilters();
      });
      container.appendChild(btn);
    });
  }

  function wireFilters() {
    // Grape select
    document.getElementById('prod-grape-select').addEventListener('change', (e) => {
      selectedGrape = e.target.value;
      buildRegionPills();
      applyFilters();
    });

    // Price buttons (single select)
    document.querySelectorAll('#prod-price-btns .prod-price-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const wasActive = btn.classList.contains('active');
        document.querySelectorAll('#prod-price-btns .prod-price-btn').forEach(b => b.classList.remove('active'));
        selectedPrice = wasActive ? '' : btn.dataset.price;
        if (!wasActive) btn.classList.add('active');
        applyFilters();
      });
    });

    // Tier pills (multi-select)
    document.querySelectorAll('#prod-tier-pills .prod-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        if (btn.classList.contains('active')) selectedTiers.add(btn.dataset.tier);
        else selectedTiers.delete(btn.dataset.tier);
        applyFilters();
      });
    });

    // Tag pills
    document.querySelectorAll('#prod-tag-pills .prod-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        if (btn.classList.contains('active')) selectedTags.add(btn.dataset.tag);
        else selectedTags.delete(btn.dataset.tag);
        applyFilters();
      });
    });

    // Tags toggle
    const toggle = document.getElementById('prod-tags-toggle');
    const content = document.getElementById('prod-tags-content');
    toggle.addEventListener('click', () => {
      const open = content.style.display !== 'none';
      content.style.display = open ? 'none' : 'block';
      toggle.classList.toggle('expanded', !open);
    });

    // Search
    document.getElementById('prod-search').addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      applyFilters();
    });

    // Clear
    document.getElementById('prod-clear-btn').addEventListener('click', () => {
      selectedGrape = ''; selectedPrice = ''; searchQuery = '';
      selectedRegions.clear(); selectedTiers.clear(); selectedTags.clear();
      document.getElementById('prod-grape-select').value = '';
      document.getElementById('prod-search').value = '';
      document.querySelectorAll('.prod-pill, .prod-price-btn').forEach(b => b.classList.remove('active'));
      buildRegionPills();
      applyFilters();
    });

    buildRegionPills();
  }

  function applyFilters() {
    filteredProducers = allProducers.filter(p => {
      if (selectedGrape && !(p.grapes || []).includes(selectedGrape)) return false;
      if (selectedRegions.size && !selectedRegions.has(p.region)) return false;
      if (selectedPrice && p.price !== selectedPrice) return false;
      if (selectedTiers.size && !selectedTiers.has(p.tier)) return false;
      if (selectedTags.size) {
        const pTags = new Set(p.tags || []);
        for (const t of selectedTags) { if (!pTags.has(t)) return false; }
      }
      if (searchQuery) {
        const hay = `${p.name} ${p.region} ${p.country} ${(p.grapes||[]).join(' ')}`.toLowerCase();
        if (!hay.includes(searchQuery)) return false;
      }
      return true;
    });
    currentPage = 1;
    renderResults();
    // Show clear button
    const hasFilters = selectedGrape || selectedPrice || selectedRegions.size || selectedTiers.size || selectedTags.size || searchQuery;
    document.getElementById('prod-clear-btn').style.display = hasFilters ? 'block' : 'none';
    document.getElementById('prod-result-count').textContent = `Showing ${filteredProducers.length} producer${filteredProducers.length !== 1 ? 's' : ''}`;
  }

  function renderResults() {
    const grid = document.getElementById('prod-grid');
    const totalPages = Math.ceil(filteredProducers.length / perPage);
    const start = (currentPage - 1) * perPage;
    const page = filteredProducers.slice(start, start + perPage);

    if (!page.length) {
      grid.innerHTML = '<p class="prod-empty">No producers match your filters.</p>';
      document.getElementById('prod-pagination').innerHTML = '';
      return;
    }

    const TIER_LABELS = { legendary: 'Legendary', 'highly-acclaimed': 'Highly Acclaimed', 'well-regarded': 'Well-Regarded', emerging: 'Emerging', cult: 'Cult Status' };
    const TAG_LABELS = { 'sommelier-pick': 'Sommelier Pick', 'best-value': 'Best Value', biodynamic: 'Biodynamic', organic: 'Organic', 'natural-wine': 'Natural Wine', 'family-owned': 'Family-Owned', 'historic-estate': 'Historic Estate', 'age-worthy': 'Age-Worthy', 'hard-to-find': 'Hard to Find', 'old-world': 'Old World', 'new-world': 'New World', elegant: 'Elegant', bold: 'Bold', allocated: 'Allocated', 'award-winning': 'Award-Winning', 'small-batch': 'Small-Batch', approachable: 'Approachable' };

    grid.innerHTML = page.map(p => {
      const topTags = (p.tags || []).slice(0, 3).map(t => `<span class="prod-card-tag">${TAG_LABELS[t] || t}</span>`).join('');
      const grapeText = (p.grapes || []).slice(0, 3).join(', ');
      return `<div class="prod-card" data-id="${p.id}">
        <div class="prod-card-header">
          <span class="prod-card-price">${p.price}</span>
          <span class="prod-card-tier" data-tier="${p.tier}">${TIER_LABELS[p.tier] || p.tier}</span>
        </div>
        <div class="prod-card-body">
          <h3 class="prod-card-name">${p.name}</h3>
          <div class="prod-card-loc">${p.region}, ${p.country}</div>
          <div class="prod-card-grapes">${grapeText}</div>
          <p class="prod-card-philo">${(p.philosophy || '').split('.').slice(0, 1).join('.')}.</p>
          <div class="prod-card-tags">${topTags}</div>
        </div>
        <div class="prod-card-foot"><button class="prod-card-cta">View Profile</button></div>
      </div>`;
    }).join('');

    // Wire card clicks
    grid.querySelectorAll('.prod-card').forEach(card => {
      const openDetail = () => {
        const p = allProducers.find(x => x.id === card.dataset.id);
        if (p) showProducerModal(p);
      };
      card.querySelector('.prod-card-cta').addEventListener('click', (e) => { e.stopPropagation(); openDetail(); });
      card.addEventListener('click', openDetail);
    });

    // Pagination
    const pagEl = document.getElementById('prod-pagination');
    if (totalPages <= 1) { pagEl.innerHTML = ''; return; }
    let html = '';
    if (currentPage > 1) html += `<button class="page-btn" data-p="${currentPage - 1}">Previous</button>`;
    for (let i = 1; i <= totalPages; i++) html += `<button class="page-num ${i === currentPage ? 'active' : ''}" data-p="${i}">${i}</button>`;
    if (currentPage < totalPages) html += `<button class="page-btn" data-p="${currentPage + 1}">Next</button>`;
    pagEl.innerHTML = html;
    pagEl.querySelectorAll('[data-p]').forEach(btn => {
      btn.addEventListener('click', () => { currentPage = parseInt(btn.dataset.p); renderResults(); });
    });
  }

  function showProducerModal(p) {
    const modal = document.getElementById('prod-modal');
    const content = document.getElementById('prod-modal-content');
    const TAG_LABELS = { 'sommelier-pick': 'Sommelier Pick', 'best-value': 'Best Value', biodynamic: 'Biodynamic', organic: 'Organic', 'natural-wine': 'Natural Wine', 'family-owned': 'Family-Owned', 'historic-estate': 'Historic Estate', 'age-worthy': 'Age-Worthy', 'hard-to-find': 'Hard to Find', 'old-world': 'Old World', 'new-world': 'New World', elegant: 'Elegant', bold: 'Bold', allocated: 'Allocated', 'award-winning': 'Award-Winning', 'small-batch': 'Small-Batch', approachable: 'Approachable' };
    const TIER_LABELS = { legendary: 'Legendary', 'highly-acclaimed': 'Highly Acclaimed', 'well-regarded': 'Well-Regarded', emerging: 'Emerging', cult: 'Cult Status' };
    const tags = (p.tags || []).map(t => `<span class="prod-modal-tag">${TAG_LABELS[t] || t}</span>`).join('');
    const wines = (p.wines || []).map(w => `<div class="prod-modal-wine">
      <div class="prod-modal-wine-name">${w.name}</div>
      <div class="prod-modal-wine-grape">${w.grape || ''}</div>
      <p class="prod-modal-wine-notes">${w.notes || ''}</p>
    </div>`).join('');

    content.innerHTML = `
      <div class="prod-modal-header">
        <h2>${p.name}</h2>
        <div class="prod-modal-meta">${p.region}, ${p.country}${p.founded ? ` · Est. ${p.founded}` : ''} · ${TIER_LABELS[p.tier] || p.tier}</div>
        <div class="prod-modal-grapes">${(p.grapes || []).join(', ')}</div>
      </div>
      <div class="prod-modal-tags">${tags}</div>
      <div class="prod-modal-section">
        <div class="prod-modal-label">Philosophy</div>
        <p class="prod-modal-philo">${p.philosophy || ''}</p>
      </div>
      ${p.awards ? `<div class="prod-modal-section"><div class="prod-modal-label">Recognition</div><p class="prod-modal-text">${p.awards}</p></div>` : ''}
      <div class="prod-modal-section">
        <div class="prod-modal-label">Signature Wines</div>
        <div class="prod-modal-wines">${wines}</div>
      </div>
      <div class="prod-modal-section">
        <div class="prod-modal-label">Availability</div>
        <p class="prod-modal-text">${(p.availability || '').replace(/-/g, ' ')}</p>
      </div>
      ${p.website ? `<a href="https://${p.website}" target="_blank" rel="noopener" class="prod-modal-link">Visit ${p.website}</a>` : ''}
    `;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.getElementById('prod-modal-close').onclick = () => { modal.style.display = 'none'; document.body.style.overflow = ''; };
    modal.addEventListener('click', (e) => { if (e.target === modal) { modal.style.display = 'none'; document.body.style.overflow = ''; } });
  }

  // Init when section becomes active
  const observer = new MutationObserver(() => {
    const section = document.getElementById('producers-section');
    if (section && section.classList.contains('active')) initProducers();
  });
  const section = document.getElementById('producers-section');
  if (section) observer.observe(section, { attributes: true, attributeFilter: ['class'] });
});
