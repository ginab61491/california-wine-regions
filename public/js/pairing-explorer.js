// pairing-explorer.js — Food & Wine Pairing Explorer

document.addEventListener('DOMContentLoaded', () => {
  const foodInput = document.getElementById('pairing-food-input');
  const wineInput = document.getElementById('pairing-wine-input');
  const foodBtn = document.getElementById('pairing-food-btn');
  const wineBtn = document.getElementById('pairing-wine-btn');
  const resultsEl = document.getElementById('pairing-results');
  if (!foodBtn || !wineBtn) return;

  const recipeInput = document.getElementById('pairing-recipe-input');

  // Food → Wine
  foodBtn.addEventListener('click', async () => {
    const food = foodInput.value.trim();
    const recipe = recipeInput ? recipeInput.value.trim() : '';
    if (!food && !recipe) { foodInput.focus(); return; }
    let query = food;
    if (recipe) query += (food ? '. Recipe link: ' : 'Recipe: ') + recipe;
    await fetchPairings('food-to-wine', query);
  });
  foodInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') foodBtn.click(); });
  if (recipeInput) recipeInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') foodBtn.click(); });

  // Wine → Food
  wineBtn.addEventListener('click', async () => {
    const query = wineInput.value.trim();
    if (!query) { wineInput.focus(); return; }
    await fetchPairings('wine-to-food', query);
  });
  wineInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') wineBtn.click(); });

  async function fetchPairings(type, query) {
    foodBtn.disabled = true; wineBtn.disabled = true;
    const activeBtn = type === 'food-to-wine' ? foodBtn : wineBtn;
    activeBtn.textContent = 'Finding pairings...';
    resultsEl.innerHTML = '<div class="pairing-loading">Generating sommelier recommendations...</div>';

    try {
      const res = await fetch('/api/pairing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, query }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed');
      const data = await res.json();
      renderResults(data);
    } catch (err) {
      resultsEl.innerHTML = `<div class="pairing-error">Error: ${err.message}</div>`;
    }

    foodBtn.disabled = false; wineBtn.disabled = false;
    foodBtn.textContent = 'Find Wine Pairings';
    wineBtn.textContent = 'Find Food Pairings';
  }

  function renderResults(data) {
    const recs = data.recommendations || [];
    if (!recs.length) {
      resultsEl.innerHTML = '<div class="pairing-error">No pairings found. Try a different search.</div>';
      return;
    }

    const direction = data.type === 'wine-to-food' ? 'Food' : 'Wine';

    resultsEl.innerHTML = `
      <div class="pairing-results-header">
        <h2>${direction} Pairings for "${data.input}"</h2>
        <button class="pairing-new-search" id="pairing-new-search">New Search</button>
      </div>
      <div class="pairing-results-grid">
        ${recs.map(r => `
          <div class="pairing-card">
            <span class="pairing-card-label">${r.label}</span>
            <h3 class="pairing-card-name">${r.name}</h3>
            ${r.region ? `<span class="pairing-card-region">${r.region}</span>` : ''}
            ${r.price ? `<span class="pairing-card-price">${r.price}</span>` : ''}
            <p class="pairing-card-why">${r.why}</p>
            <div class="pairing-card-principles">
              ${(r.principles || []).map(p => `<span class="pairing-principle-tag">${p}</span>`).join('')}
            </div>
            ${r.tips ? `<p class="pairing-card-tip"><strong>Tip:</strong> ${r.tips}</p>` : ''}
          </div>
        `).join('')}
      </div>
    `;

    document.getElementById('pairing-new-search').addEventListener('click', () => {
      resultsEl.innerHTML = '<div class="pairing-placeholder"><p>Enter a dish or wine above to get sommelier-curated pairing recommendations.</p></div>';
      foodInput.value = '';
      wineInput.value = '';
      if (recipeInput) recipeInput.value = '';
    });
  }
});
