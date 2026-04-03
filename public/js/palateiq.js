// palateiq.js — Adaptive wine flashcard engine with Elo rating

document.addEventListener('DOMContentLoaded', () => {
  let allCards = [];
  let activeDomain = 'all';
  let currentCard = null;
  let answered = false;
  let initialized = false;

  // Match pairs state
  let pairSelLeft = null;
  let pairMatches = {};
  let pairCorrect = null;

  // Elo + stats from localStorage
  function loadStats() {
    try { return JSON.parse(localStorage.getItem('piq_stats') || 'null'); } catch { return null; }
  }
  function saveStats(s) { localStorage.setItem('piq_stats', JSON.stringify(s)); }
  function getStats() {
    return loadStats() || {
      elo: 1000,
      streak: 0,
      totalCorrect: 0,
      totalAnswered: 0,
      todayCount: 0,
      todayDate: new Date().toDateString(),
      seenIds: [],
      domainElo: {}
    };
  }

  const LEVEL_THRESHOLDS = [0, 300, 500, 700, 900, 1100, 1300, 1500, 1700, 1900, 2500];
  function eloToLevel(elo) {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (elo >= LEVEL_THRESHOLDS[i]) return i + 1;
    }
    return 1;
  }

  function updateStatsDisplay() {
    const s = getStats();
    // Reset today count if new day
    if (s.todayDate !== new Date().toDateString()) {
      s.todayCount = 0;
      s.todayDate = new Date().toDateString();
      saveStats(s);
    }
    document.getElementById('piq-elo').textContent = Math.round(s.elo);
    document.getElementById('piq-streak').textContent = s.streak;
    document.getElementById('piq-today').textContent = s.todayCount;
    document.getElementById('piq-accuracy').textContent = s.totalAnswered > 0
      ? Math.round((s.totalCorrect / s.totalAnswered) * 100) + '%'
      : '--';

    const level = eloToLevel(s.elo);
    document.getElementById('piq-level-num').textContent = level;
    const nextThreshold = LEVEL_THRESHOLDS[level] || 2500;
    const prevThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
    const pct = Math.min(100, ((s.elo - prevThreshold) / (nextThreshold - prevThreshold)) * 100);
    document.getElementById('piq-level-fill').style.width = pct + '%';
    document.getElementById('piq-level-next').textContent = level >= 10
      ? 'Max Level' : `Next: Level ${level + 1}`;
  }

  // Elo calculation
  function calcElo(playerElo, cardDifficulty, won) {
    const K = 32;
    const expected = 1 / (1 + Math.pow(10, (cardDifficulty - playerElo) / 400));
    return playerElo + K * ((won ? 1 : 0) - expected);
  }

  // Pick next card — adaptive: match difficulty to player Elo
  function pickCard() {
    const s = getStats();
    let pool = activeDomain === 'all'
      ? allCards
      : allCards.filter(c => c.domain === activeDomain);

    if (pool.length === 0) return null;

    // Prefer unseen cards, but allow repeats if pool is small
    const unseen = pool.filter(c => !s.seenIds.includes(c.id));
    const source = unseen.length > 10 ? unseen : pool;

    // Weight cards closer to player's Elo
    const playerElo = activeDomain !== 'all' && s.domainElo[activeDomain]
      ? s.domainElo[activeDomain] : s.elo;

    const weighted = source.map(c => {
      const dist = Math.abs(c.difficulty - playerElo);
      const weight = 1 / (1 + dist / 200);
      return { card: c, weight };
    });

    // Weighted random selection
    const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
    let r = Math.random() * totalWeight;
    for (const w of weighted) {
      r -= w.weight;
      if (r <= 0) return w.card;
    }
    return weighted[weighted.length - 1].card;
  }

  const DOMAIN_LABELS = {
    grape_varieties: 'Grapes',
    regions_appellations: 'Regions',
    tasting_sensory: 'Tasting',
    winemaking: 'Winemaking',
    food_pairing: 'Food Pairing',
    history_culture: 'History',
    service_business: 'Service',
    blind_tasting: 'Blind Tasting'
  };

  function showCard(card) {
    if (!card) {
      document.getElementById('piq-card-question').textContent = 'No cards available for this topic.';
      document.getElementById('piq-options').innerHTML = '';
      document.getElementById('piq-pairs').style.display = 'none';
      return;
    }

    currentCard = card;
    answered = false;
    pairSelLeft = null;
    pairMatches = {};
    pairCorrect = null;

    document.getElementById('piq-card-domain').textContent = DOMAIN_LABELS[card.domain] || card.domain;
    document.getElementById('piq-card-level').textContent = 'Lvl ' + card.level;
    document.getElementById('piq-card-question').textContent = card.question;
    document.getElementById('piq-explanation').style.display = 'none';
    document.getElementById('piq-next-btn').style.display = 'none';

    const optionsEl = document.getElementById('piq-options');
    const pairsEl = document.getElementById('piq-pairs');

    if (card.format === 'match_pairs' && card.pairs) {
      optionsEl.style.display = 'none';
      pairsEl.style.display = 'block';
      renderPairs(card);
    } else {
      pairsEl.style.display = 'none';
      optionsEl.style.display = 'flex';
      renderOptions(card);
    }
  }

  function renderOptions(card) {
    const el = document.getElementById('piq-options');
    el.innerHTML = card.options.map((opt, i) =>
      `<button class="piq-option" data-idx="${i}">${opt}</button>`
    ).join('');

    el.querySelectorAll('.piq-option').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const idx = parseInt(btn.dataset.idx);
        const correctIdx = Array.isArray(card.correct) ? card.correct[0] : card.correct;
        const isCorrect = idx === correctIdx;

        btn.classList.add(isCorrect ? 'correct' : 'wrong');
        if (!isCorrect) {
          el.querySelector(`.piq-option[data-idx="${correctIdx}"]`).classList.add('correct');
        }

        recordAnswer(isCorrect);
      });
    });
  }

  function renderPairs(card) {
    const el = document.getElementById('piq-pairs');
    const left = card.pairs.left;
    const right = card.pairs.right;

    // Shuffle right side for display
    const rightShuffled = right.map((r, i) => ({ text: r, origIdx: i }));
    for (let i = rightShuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rightShuffled[i], rightShuffled[j]] = [rightShuffled[j], rightShuffled[i]];
    }

    el.innerHTML = `
      <div class="piq-pairs-cols">
        <div class="piq-pairs-left">
          ${left.map((l, i) => `<button class="piq-pair-btn piq-pair-left" data-idx="${i}">${l}</button>`).join('')}
        </div>
        <div class="piq-pairs-right">
          ${rightShuffled.map((r, i) => `<button class="piq-pair-btn piq-pair-right" data-orig="${r.origIdx}" data-idx="${i}">${r.text}</button>`).join('')}
        </div>
      </div>
      <button class="piq-pairs-submit" id="piq-pairs-submit" style="display:none">Check Matches</button>
    `;

    pairMatches = {};
    pairSelLeft = null;

    el.querySelectorAll('.piq-pair-left').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return;
        el.querySelectorAll('.piq-pair-left').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        pairSelLeft = parseInt(btn.dataset.idx);
      });
    });

    el.querySelectorAll('.piq-pair-right').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered || pairSelLeft === null) return;
        // Remove previous match for this left
        Object.keys(pairMatches).forEach(k => {
          if (parseInt(k) === pairSelLeft) delete pairMatches[k];
        });
        // Remove previous assignment of this right
        Object.keys(pairMatches).forEach(k => {
          if (pairMatches[k] === parseInt(btn.dataset.orig)) delete pairMatches[k];
        });

        pairMatches[pairSelLeft] = parseInt(btn.dataset.orig);

        // Visual feedback
        el.querySelectorAll('.piq-pair-left').forEach(b => b.classList.remove('selected', 'matched'));
        el.querySelectorAll('.piq-pair-right').forEach(b => b.classList.remove('matched'));
        Object.keys(pairMatches).forEach(k => {
          el.querySelector(`.piq-pair-left[data-idx="${k}"]`).classList.add('matched');
          el.querySelector(`.piq-pair-right[data-orig="${pairMatches[k]}"]`).classList.add('matched');
        });

        pairSelLeft = null;

        // Show submit when all matched
        if (Object.keys(pairMatches).length === left.length) {
          document.getElementById('piq-pairs-submit').style.display = 'block';
        }
      });
    });

    const submitBtn = document.getElementById('piq-pairs-submit');
    submitBtn.addEventListener('click', () => {
      if (answered) return;
      answered = true;

      let correctCount = 0;
      const correct = card.correct;
      for (let i = 0; i < left.length; i++) {
        const userMatch = pairMatches[i];
        const isRight = userMatch === correct[i];
        if (isRight) correctCount++;
        const leftBtn = el.querySelector(`.piq-pair-left[data-idx="${i}"]`);
        leftBtn.classList.add(isRight ? 'correct' : 'wrong');
      }
      const isCorrect = correctCount === left.length;
      recordAnswer(isCorrect);
    });
  }

  function recordAnswer(isCorrect) {
    const s = getStats();
    s.elo = calcElo(s.elo, currentCard.difficulty, isCorrect);

    // Domain-specific Elo
    if (!s.domainElo[currentCard.domain]) s.domainElo[currentCard.domain] = 1000;
    s.domainElo[currentCard.domain] = calcElo(s.domainElo[currentCard.domain], currentCard.difficulty, isCorrect);

    s.totalAnswered++;
    if (isCorrect) { s.totalCorrect++; s.streak++; }
    else { s.streak = 0; }
    s.todayCount++;
    if (!s.seenIds.includes(currentCard.id)) s.seenIds.push(currentCard.id);
    saveStats(s);

    // Show explanation
    const explEl = document.getElementById('piq-explanation');
    document.getElementById('piq-explanation-text').textContent = currentCard.explanation;
    document.getElementById('piq-source').textContent = currentCard.sources;
    explEl.style.display = 'block';
    explEl.className = 'piq-explanation ' + (isCorrect ? 'piq-correct' : 'piq-wrong');

    document.getElementById('piq-next-btn').style.display = 'block';
    updateStatsDisplay();
  }

  // Next card
  document.getElementById('piq-next-btn').addEventListener('click', () => {
    showCard(pickCard());
  });

  // Domain filter pills
  document.querySelectorAll('.piq-domain-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.piq-domain-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeDomain = pill.dataset.domain;
      showCard(pickCard());
    });
  });

  // Init
  async function init() {
    if (initialized) return;
    initialized = true;

    try {
      const files = ['palateiq-cards-1.json', 'palateiq-cards-2.json', 'palateiq-cards-3.json'];
      const results = await Promise.allSettled(
        files.map(f => fetch('/data/' + f).then(r => r.ok ? r.json() : []))
      );
      results.forEach(r => {
        if (r.status === 'fulfilled' && Array.isArray(r.value)) {
          allCards = allCards.concat(r.value);
        }
      });
    } catch {
      // Silently continue with whatever loaded
    }

    if (allCards.length === 0) {
      document.getElementById('piq-card-question').textContent = 'Loading cards...';
      return;
    }

    updateStatsDisplay();
    showCard(pickCard());
  }

  // Lazy init when section becomes visible
  const observer = new MutationObserver(() => {
    const sec = document.getElementById('palateiq-section');
    if (sec && sec.classList.contains('active')) init();
  });
  const sec = document.getElementById('palateiq-section');
  if (sec) observer.observe(sec, { attributes: true, attributeFilter: ['class'] });
});
