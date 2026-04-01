// wine-analyzer.js — "I Love This Wine" feature
// Free-form wine input with AI descriptor analysis

// Category display config
const CATEGORY_CONFIG = {
  texture:   { label: 'Texture',   color: '#8B6B4E', icon: '🫧' },
  acidity:   { label: 'Acidity',   color: '#5E8B6B', icon: '⚡' },
  fruit:     { label: 'Fruit',     color: '#8B4E6B', icon: '🍒' },
  finish:    { label: 'Finish',    color: '#6B4E8B', icon: '✨' },
  aroma:     { label: 'Aroma',     color: '#8B7A4E', icon: '🌸' },
  body:      { label: 'Body',      color: '#4E6B8B', icon: '⚖️' },
  oak:       { label: 'Oak',       color: '#7A6B4E', icon: '🪵' },
  terroir:   { label: 'Terroir',   color: '#4E8B5E', icon: '🌍' },
  sweetness: { label: 'Sweetness', color: '#8B5E4E', icon: '🍯' },
};

class WineAnalyzer {
  constructor() {
    this.isLoading = false;
  }

  init() {
    this.nameInput     = document.getElementById('wine-name-input');
    this.producerInput = document.getElementById('wine-producer-input');
    this.vintageInput  = document.getElementById('wine-vintage-input');
    this.clearBtn      = document.getElementById('wine-clear-btn');
    this.analyzeBtn    = document.getElementById('wine-analyze-btn');
    this.resultsArea   = document.getElementById('wine-analyzer-results');

    // Enable Analyze when name has content
    this.nameInput.addEventListener('input', () => this.updateAnalyzeBtn());

    this.clearBtn.addEventListener('click', () => this.clearForm());

    this.analyzeBtn.addEventListener('click', () => this.analyzeWine());

    // Allow Enter key in any field to trigger analyze
    [this.nameInput, this.producerInput, this.vintageInput].forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !this.analyzeBtn.disabled) this.analyzeWine();
      });
    });
  }

  updateAnalyzeBtn() {
    const hasName = this.nameInput.value.trim().length > 0;
    this.analyzeBtn.disabled = !hasName;
    this.analyzeBtn.classList.toggle('ready', hasName);
  }

  clearForm() {
    this.nameInput.value     = '';
    this.producerInput.value = '';
    this.vintageInput.value  = '';
    this.updateAnalyzeBtn();
    this.resultsArea.innerHTML = this.defaultResultsHTML();
    this.nameInput.focus();
  }

  defaultResultsHTML() {
    return `
      <div class="analyzer-empty">
        <div class="analyzer-empty-icon">🍷</div>
        <h3>Enter a Wine</h3>
        <p>Type any wine you love — name the bottle, add the producer if you know it, then click Analyze to discover what makes it special.</p>
      </div>
    `;
  }

  async analyzeWine() {
    const name     = this.nameInput.value.trim();
    const producer = this.producerInput.value.trim();
    const vintage  = this.vintageInput.value.trim();

    if (!name || this.isLoading) return;

    this.isLoading = true;
    this.analyzeBtn.disabled = true;
    this.analyzeBtn.textContent = 'Analyzing...';

    const displayName = [vintage, name].filter(Boolean).join(' ');

    this.resultsArea.innerHTML = `
      <div class="analyzer-loading">
        <div class="analyzer-loading-icon">🍷</div>
        <div class="analyzer-loading-text">
          <p>Consulting sommelier sources for <strong>${this.escapeHtml(displayName)}</strong>…</p>
          <div class="analyzer-dots">
            <div class="analyzer-dot"></div>
            <div class="analyzer-dot"></div>
            <div class="analyzer-dot"></div>
          </div>
        </div>
      </div>
    `;

    try {
      const response = await fetch('/api/analyze-wine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wine: { name, producer, vintage } }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Server error');
      }

      const data = await response.json();
      this.renderAnalysis(data, { name, producer, vintage });

    } catch (err) {
      this.resultsArea.innerHTML = `
        <div class="analyzer-error">
          <p><strong>Something went wrong.</strong> ${this.escapeHtml(err.message)}</p>
        </div>
      `;
    } finally {
      this.isLoading = false;
      this.analyzeBtn.disabled = false;
      this.analyzeBtn.textContent = 'Analyze';
      this.updateAnalyzeBtn();
    }
  }

  renderAnalysis(data, wine) {
    const displayName = [wine.vintage, wine.name].filter(Boolean).join(' ');

    const descriptorCards = (data.descriptors || []).map(d => {
      const cat = CATEGORY_CONFIG[d.category] || CATEGORY_CONFIG['texture'];
      return `
        <div class="descriptor-card">
          <div class="descriptor-icon">${cat.icon}</div>
          <div class="descriptor-header">
            <span class="descriptor-category-badge" style="background:${cat.color}22; color:${cat.color}; border-color:${cat.color}44">${cat.label}</span>
            <h4 class="descriptor-name">${this.escapeHtml(d.name)}</h4>
          </div>
          <div class="descriptor-lines">
            <p class="descriptor-line descriptor-line-what">${this.escapeHtml(d.what_it_is)}</p>
            <p class="descriptor-line descriptor-line-feels">${this.escapeHtml(d.how_it_feels)}</p>
            <p class="descriptor-line descriptor-line-wine">${this.escapeHtml(d.in_this_wine)}</p>
          </div>
        </div>
      `;
    }).join('');

    const vintageHTML = this.renderVintages(data);

    this.resultsArea.innerHTML = `
      <div class="analyzer-result">
        <div class="analyzer-result-header">
          <div class="analyzer-result-title">
            <h2>${this.escapeHtml(displayName)}</h2>
            <div class="analyzer-result-meta">
              ${wine.producer ? `<span class="analyzer-producer">${this.escapeHtml(wine.producer)}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="analyzer-intro">
          <p>${data.intro || ''}</p>
        </div>
        <div class="analyzer-section-label">Why you love it</div>
        <div class="descriptors-grid">
          ${descriptorCards}
        </div>
        ${vintageHTML}
      </div>
    `;
  }

  renderVintages(data) {
    const great    = Array.isArray(data.great_vintages)    ? data.great_vintages    : [];
    const notable  = Array.isArray(data.notable_vintages)  ? data.notable_vintages  : [];
    const storage  = data.storage || null;

    if (!great.length && !notable.length && !storage) return '';

    const greatPills   = great.map(y  => `<span class="vintage-pill vintage-pill--great">${y}</span>`).join('');
    const notablePills = notable.map(y => `<span class="vintage-pill vintage-pill--notable">${y}</span>`).join('');

    const storageRow = storage ? `
      <div class="storage-row">
        <span class="storage-icon">⏳</span>
        <span class="storage-window">Drink ${storage.drink_from}–${storage.drink_by}</span>
        <span class="storage-note">${this.escapeHtml(storage.note)}</span>
      </div>
    ` : '';

    return `
      <div class="vintages-section">
        <div class="analyzer-section-label" style="margin-top:28px">Vintages & Storage</div>
        <div class="vintages-grid">
          ${great.length ? `
          <div class="vintage-group">
            <div class="vintage-group-label">⭐ Great Vintages</div>
            <div class="vintage-pills">${greatPills}</div>
          </div>` : ''}
          ${notable.length ? `
          <div class="vintage-group">
            <div class="vintage-group-label">👍 Notable Vintages</div>
            <div class="vintage-pills">${notablePills}</div>
          </div>` : ''}
        </div>
        ${storageRow}
      </div>
    `;
  }

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
