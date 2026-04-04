// palateiq.js — Premium Palate IQ session flow with Elo engine

document.addEventListener('DOMContentLoaded', () => {
  let allCards = [];
  let initialized = false;
  let activeDomain = 'all';
  let sessionCards = [];
  let sessionIndex = 0;
  let sessionLimit = 10;
  let sessionCorrect = 0;
  let sessionStreak = 0;
  let sessionStreakHigh = 0;
  let sessionStartElo = 0;
  let currentCard = null;
  let answered = false;
  let challengeMode = false;
  let challengeStartElo = 0;

  // ── Stats (localStorage + server sync) ────────────────

  const DEFAULT_STATS = {
    elo: 1000, streak: 0, bestStreak: 0,
    totalCorrect: 0, totalAnswered: 0,
    todayCount: 0, todayDate: new Date().toDateString(),
    seenIds: [], domainElo: {},
    domainCorrect: {}, domainAnswered: {},
    levelUnlocked: 1,
    dailyStreak: 0,          // consecutive days practiced
    lastPracticeDate: '',     // YYYY-MM-DD
    cardHistory: {},          // cardId → { correct: N, lastSeen: timestamp, interval: days }
    masteredCount: 0,
  };

  function getUser() {
    try { return JSON.parse(localStorage.getItem('sommplicity_user')); } catch { return null; }
  }

  function loadStats() {
    try {
      const s = JSON.parse(localStorage.getItem('piq_stats'));
      return s ? { ...DEFAULT_STATS, ...s } : { ...DEFAULT_STATS };
    } catch { return { ...DEFAULT_STATS }; }
  }

  function saveStats(s) {
    localStorage.setItem('piq_stats', JSON.stringify(s));
    // Async server sync for signed-in users
    const user = getUser();
    if (user && user.email) {
      fetch('/api/palateiq/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, stats: s })
      }).catch(() => {}); // silent fail, local is source of truth
    }
  }

  // Load from server on init (merge with local)
  async function syncFromServer() {
    const user = getUser();
    if (!user || !user.email) return;
    try {
      const res = await fetch(`/api/palateiq/stats?email=${encodeURIComponent(user.email)}`);
      if (!res.ok) return;
      const remote = await res.json();
      if (!remote) return;
      const local = loadStats();
      // Use whichever has more answers (more recent)
      if ((remote.totalAnswered || 0) > (local.totalAnswered || 0)) {
        const merged = { ...DEFAULT_STATS, ...remote };
        localStorage.setItem('piq_stats', JSON.stringify(merged));
      }
    } catch {} // offline — use local
  }

  // ── Daily Streak ──────────────────────────────────────

  function updateDailyStreak(stats) {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    if (stats.lastPracticeDate === today) return stats; // already counted today

    if (stats.lastPracticeDate === yesterday) {
      stats.dailyStreak = (stats.dailyStreak || 0) + 1;
    } else if (stats.lastPracticeDate !== today) {
      stats.dailyStreak = 1; // reset quietly
    }
    stats.lastPracticeDate = today;
    return stats;
  }

  // ── Spaced Repetition ─────────────────────────────────

  function updateCardHistory(stats, cardId, correct) {
    if (!stats.cardHistory) stats.cardHistory = {};
    const h = stats.cardHistory[cardId] || { correct: 0, lastSeen: 0, interval: 1 };
    h.lastSeen = Date.now();
    if (correct) {
      h.correct++;
      h.interval = Math.min(30, h.interval * 2); // double interval up to 30 days
    } else {
      h.interval = 1; // reset on incorrect
    }
    stats.cardHistory[cardId] = h;

    // Count mastered (3+ correct at increasing intervals)
    let mastered = 0;
    Object.values(stats.cardHistory).forEach(ch => { if (ch.correct >= 3) mastered++; });
    stats.masteredCount = mastered;

    return stats;
  }

  function getReviewCards(stats) {
    if (!stats.cardHistory) return [];
    const now = Date.now();
    const due = [];
    Object.keys(stats.cardHistory).forEach(id => {
      const h = stats.cardHistory[id];
      const dueAt = h.lastSeen + h.interval * 86400000;
      if (dueAt <= now && h.correct < 3) {
        due.push(id);
      }
    });
    return due;
  }

  // ── Elo Math ──────────────────────────────────────────

  const MAX_LEVEL = 11;
  const THRESHOLDS = [0, 250, 400, 550, 700, 900, 1100, 1300, 1500, 1700, 2000, 2500];

  function eloToLevel(elo) {
    for (let i = THRESHOLDS.length - 1; i >= 0; i--) {
      if (elo >= THRESHOLDS[i]) return Math.min(i + 1, MAX_LEVEL);
    }
    return 1;
  }

  function calcElo(playerElo, cardDiff, won, totalAnswered) {
    const K = totalAnswered < 30 ? 48 : (playerElo < 400 || playerElo > 2000 ? 24 : 32);
    const expected = 1 / (1 + Math.pow(10, (cardDiff - playerElo) / 400));
    return playerElo + K * ((won ? 1 : 0) - expected);
  }

  function spectrumPercent(elo) {
    return Math.max(0, Math.min(100, ((elo - 100) / (2500 - 100)) * 100));
  }

  // ── Domain Labels ─────────────────────────────────────

  const DOMAIN_LABELS = {
    grape_varieties: 'Grapes', regions_appellations: 'Regions',
    tasting_sensory: 'Tasting', winemaking: 'Winemaking',
    food_pairing: 'Food Pairing', history_culture: 'History',
    service_business: 'Service', blind_tasting: 'Blind Tasting',
    producer_knowledge: 'Producers'
  };

  const DOMAIN_COLORS = {
    grape_varieties: '#7B4B94', regions_appellations: '#4A7C6F',
    tasting_sensory: '#8B6B4A', winemaking: '#5B6B8A',
    food_pairing: '#8A6B5B', history_culture: '#6B5B7A',
    service_business: '#5A7B6A', blind_tasting: '#7A5B5B',
    producer_knowledge: '#6A6B5A'
  };

  const DOMAIN_KEYS = [
    'grape_varieties', 'regions_appellations', 'tasting_sensory',
    'winemaking', 'food_pairing', 'history_culture',
    'service_business', 'blind_tasting', 'producer_knowledge'
  ];

  const LEVEL_NAMES = [
    '', // 0 unused
    'That is a red wine!',
    "I'll have the house whatever",
    'I love my Pinot',
    'Wait, Chianti is a place?',
    'Ok this is becoming a hobby',
    'I have opinions about tannin',
    'Malolactic, obviously',
    'My flashcards have flashcards',
    'I blind-tasted that',
    'The vines speak to me',
    'The vines speak to me' // level 11
  ];

  // ── Card Selection ────────────────────────────────────

  function selectCard(stats) {
    let pool = activeDomain === 'all'
      ? allCards : allCards.filter(c => c.domain === activeDomain);
    if (!pool.length) return null;

    const seenSet = new Set(stats.seenIds);
    const unseen = pool.filter(c => !seenSet.has(c.id));
    const source = unseen.length > 5 ? unseen : pool;

    const playerElo = (activeDomain !== 'all' && stats.domainElo[activeDomain])
      ? stats.domainElo[activeDomain] : stats.elo;

    const weighted = source.map(c => ({
      card: c, weight: 1 / (1 + Math.abs(c.difficulty - playerElo) / 200)
    }));
    const total = weighted.reduce((s, w) => s + w.weight, 0);
    let r = Math.random() * total;
    for (const w of weighted) { r -= w.weight; if (r <= 0) return w.card; }
    return weighted[weighted.length - 1].card;
  }

  function buildSessionDeck(stats, count) {
    const deck = [];
    const used = new Set();
    for (let i = 0; i < count; i++) {
      const card = selectCard(stats);
      if (!card) break;
      if (used.has(card.id) && allCards.length > count) { i--; continue; }
      used.add(card.id);
      deck.push(card);
    }
    return deck;
  }

  // ── Screen Management ─────────────────────────────────

  function showScreen(id) {
    document.querySelectorAll('.piq-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('piq-scroll').scrollTop = 0;
  }

  // ── Entry Screen ──────────────────────────────────────

  function updateEntry() {
    const s = loadStats();
    if (s.todayDate !== new Date().toDateString()) {
      s.todayCount = 0; s.todayDate = new Date().toDateString(); saveStats(s);
    }

    const level = eloToLevel(s.elo);
    document.getElementById('piq-hero-level').textContent = `Level ${level}`;
    document.getElementById('piq-hero-name').textContent = LEVEL_NAMES[Math.min(level, 10)] || '';
    document.getElementById('piq-hero-elo').textContent = Math.round(s.elo);
    document.getElementById('piq-m-mastered').textContent = s.masteredCount || 0;
    document.getElementById('piq-m-daily-streak').textContent = s.dailyStreak || 0;
    // Candle glow if streak > 0
    const candle = document.getElementById('piq-candle');
    if (candle) candle.classList.toggle('lit', (s.dailyStreak || 0) > 0);
    document.getElementById('piq-m-accuracy').textContent = s.totalAnswered > 0
      ? Math.round((s.totalCorrect / s.totalAnswered) * 100) + '%' : '--';

    // Review nudge
    const reviewIds = getReviewCards(s);
    const nudge = document.getElementById('piq-review-nudge');
    if (reviewIds.length > 0) {
      nudge.style.display = '';
      document.getElementById('piq-review-text').textContent = `You have ${reviewIds.length} card${reviewIds.length === 1 ? '' : 's'} to review`;
    } else {
      nudge.style.display = 'none';
    }

    // Challenge mode
    const challengeLevel = Math.min(level + 2, MAX_LEVEL);
    const challengeEl = document.getElementById('piq-challenge');
    if (level <= MAX_LEVEL - 2 && s.totalAnswered >= 10) {
      challengeEl.style.display = '';
      document.getElementById('piq-challenge-level').textContent = `Level ${challengeLevel}`;
    } else {
      challengeEl.style.display = 'none';
    }

    updateSpectrumBar(s.elo);
    drawRadar(s);

    // Mobile: auto-scroll spectrum to current level
    const scrollWrap = document.getElementById('piq-spectrum-scroll');
    const activeSeg = scrollWrap.querySelector(`.piq-spectrum-seg[data-lvl="${level}"]`);
    if (activeSeg && scrollWrap.scrollWidth > scrollWrap.clientWidth) {
      activeSeg.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  function updateSpectrumBar(elo) {
    const level = eloToLevel(elo);
    // Highlight active segment
    document.querySelectorAll('.piq-spectrum-seg').forEach(seg => {
      const lvl = parseInt(seg.dataset.lvl);
      seg.classList.toggle('active', lvl === level);
      seg.classList.toggle('passed', lvl < level);
    });

    // Pin position: percentage across the full track
    const pct = spectrumPercent(elo);
    const pin = document.getElementById('piq-spectrum-pin');
    if (pin) pin.style.left = pct + '%';

    // Summary spectrum too
    const sumPin = document.getElementById('piq-sum-spectrum-pin');
    const sumFill = document.getElementById('piq-sum-spectrum-fill');
    if (sumPin) sumPin.style.left = pct + '%';
    if (sumFill) sumFill.style.width = pct + '%';
  }

  // ── Radar Chart (Canvas) ──────────────────────────────

  function drawRadar(stats) {
    const canvas = document.getElementById('piq-radar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = 320;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const maxR = 120;
    const domains = DOMAIN_KEYS;
    const n = domains.length;
    const angleStep = (Math.PI * 2) / n;
    const startAngle = -Math.PI / 2; // top

    ctx.clearRect(0, 0, size, size);

    // Background rings
    const rings = [0.2, 0.4, 0.6, 0.8, 1.0];
    rings.forEach(r => {
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const a = startAngle + i * angleStep;
        const x = cx + Math.cos(a) * maxR * r;
        const y = cy + Math.sin(a) * maxR * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(44,24,16,0.08)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    // Axis lines
    for (let i = 0; i < n; i++) {
      const a = startAngle + i * angleStep;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
      ctx.strokeStyle = 'rgba(44,24,16,0.06)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Target ring (next level boundary) — dashed
    const playerLevel = eloToLevel(stats.elo);
    const nextThreshold = THRESHOLDS[Math.min(playerLevel, THRESHOLDS.length - 1)] || 2500;
    const targetNorm = Math.min(1, nextThreshold / 2500);
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    for (let i = 0; i <= n; i++) {
      const a = startAngle + i * angleStep;
      const x = cx + Math.cos(a) * maxR * targetNorm;
      const y = cy + Math.sin(a) * maxR * targetNorm;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(114,47,55,0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    // Player shape
    const points = [];
    for (let i = 0; i < n; i++) {
      const domain = domains[i];
      const domainElo = (stats.domainElo && stats.domainElo[domain]) || 1000;
      const norm = Math.max(0.05, Math.min(1, domainElo / 2500));
      const a = startAngle + i * angleStep;
      points.push({
        x: cx + Math.cos(a) * maxR * norm,
        y: cy + Math.sin(a) * maxR * norm,
        norm
      });
    }

    // Fill
    ctx.beginPath();
    points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.closePath();
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
    grad.addColorStop(0, 'rgba(114,47,55,0.15)');
    grad.addColorStop(1, 'rgba(114,47,55,0.08)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Stroke
    ctx.beginPath();
    points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.strokeStyle = 'rgba(114,47,55,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Dots at vertices
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#722F37';
      ctx.fill();
    });

    // Labels
    ctx.font = '500 10px Montserrat, sans-serif';
    ctx.fillStyle = '#6B5D52';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < n; i++) {
      const a = startAngle + i * angleStep;
      const labelR = maxR + 22;
      const lx = cx + Math.cos(a) * labelR;
      const ly = cy + Math.sin(a) * labelR;
      const label = DOMAIN_LABELS[domains[i]] || domains[i];
      ctx.fillText(label, lx, ly);
    }
  }

  // Radar click → focus domain
  const radarCanvas = document.getElementById('piq-radar');
  if (radarCanvas) {
    radarCanvas.addEventListener('click', (e) => {
      const rect = radarCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left - 160;
      const y = e.clientY - rect.top - 160;
      const angle = Math.atan2(y, x);
      const normalizedAngle = ((angle + Math.PI / 2) + Math.PI * 2) % (Math.PI * 2);
      const idx = Math.round(normalizedAngle / (Math.PI * 2 / DOMAIN_KEYS.length)) % DOMAIN_KEYS.length;
      const domain = DOMAIN_KEYS[idx];

      // Activate that domain pill and start session
      document.querySelectorAll('.piq-dpill').forEach(p => p.classList.remove('active'));
      const pill = document.querySelector(`.piq-dpill[data-domain="${domain}"]`);
      if (pill) pill.classList.add('active');
      activeDomain = domain;
      startSession(10);
    });
    radarCanvas.style.cursor = 'pointer';
  }

  // ── Session Flow ──────────────────────────────────────

  function startSession(count) {
    const s = loadStats();
    sessionStartElo = s.elo;
    sessionCards = buildSessionDeck(s, count);
    sessionIndex = 0;
    sessionCorrect = 0;
    sessionStreak = 0;
    sessionStreakHigh = 0;
    sessionLimit = sessionCards.length;

    if (sessionCards.length === 0) return;

    showScreen('piq-session');
    showSessionCard();
  }

  function showSessionCard() {
    if (sessionIndex >= sessionCards.length) {
      showSummary();
      return;
    }

    currentCard = sessionCards[sessionIndex];
    answered = false;

    // Top bar
    const label = DOMAIN_LABELS[currentCard.domain] || currentCard.domain;
    document.getElementById('piq-tb-domain').textContent = label;
    document.getElementById('piq-tb-count').textContent = `${sessionIndex + 1} of ${sessionLimit}`;

    // Card front
    document.getElementById('piq-card-dtag').textContent = label;
    document.getElementById('piq-card-dtag').style.background = DOMAIN_COLORS[currentCard.domain] || '#722F37';
    const qEl = document.getElementById('piq-card-q');
    qEl.textContent = currentCard.question;
    qEl.classList.remove('piq-q-scenario');

    // Difficulty dots
    const dotCount = currentCard.level <= 4 ? 1 : currentCard.level <= 7 ? 2 : 3;
    document.getElementById('piq-card-dots').innerHTML =
      '<span class="piq-dot"></span>'.repeat(dotCount);

    // Reset flip
    document.getElementById('piq-card-flipper').classList.remove('flipped');

    // Clear back
    document.getElementById('piq-card-expl').textContent = '';
    document.getElementById('piq-card-src').textContent = '';

    // Hide continue, elo delta
    document.getElementById('piq-continue').classList.remove('visible');
    document.getElementById('piq-elo-delta').className = 'piq-elo-delta';
    document.getElementById('piq-elo-delta').textContent = '';

    // Render by format
    renderCard(currentCard);
  }

  function renderCard(card) {
    const area = document.getElementById('piq-options-area');
    area.innerHTML = '';
    area.className = 'piq-options-area';

    switch (card.format) {
      case 'match_pairs':
        renderMatchPairs(card, area);
        break;
      case 'odd_one_out':
        renderOddOneOut(card, area);
        break;
      case 'scenario':
        renderScenario(card, area);
        break;
      default: // multiple_choice, image_id
        renderMC(card, area);
    }
  }

  // ── Multiple Choice ───────────────────────────────────

  function renderMC(card, area) {
    area.innerHTML = (card.options || []).map((opt, i) =>
      `<button class="piq-opt" data-idx="${i}"><span class="piq-opt-text">${opt}</span></button>`
    ).join('');
    area.querySelectorAll('.piq-opt').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(parseInt(btn.dataset.idx)));
    });
  }

  // ── Scenario (narrative setup) ────────────────────────

  function renderScenario(card, area) {
    // Scenario uses italic serif for the question (already in the card front)
    // Make question italic for scenario feel
    const qEl = document.getElementById('piq-card-q');
    qEl.classList.add('piq-q-scenario');

    // Options are longer — same rendering as MC
    renderMC(card, area);
  }

  // ── Odd One Out (grid of mini-cards) ──────────────────

  function renderOddOneOut(card, area) {
    area.classList.add('piq-ooo-area');
    area.innerHTML = `<div class="piq-ooo-grid">${
      (card.options || []).map((opt, i) =>
        `<button class="piq-ooo-item" data-idx="${i}"><span>${opt}</span></button>`
      ).join('')
    }</div>`;

    let selectedIdx = null;
    area.querySelectorAll('.piq-ooo-item').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return;
        // Toggle selection
        if (selectedIdx === parseInt(btn.dataset.idx)) {
          btn.classList.remove('selected');
          selectedIdx = null;
          return;
        }
        area.querySelectorAll('.piq-ooo-item').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedIdx = parseInt(btn.dataset.idx);

        // Auto-submit on selection (like MC)
        handleAnswer(selectedIdx);
      });
    });
  }

  // ── Match Pairs (tap-to-connect) ──────────────────────

  function renderMatchPairs(card, area) {
    if (!card.pairs) { renderMC(card, area); return; }

    const left = card.pairs.left;
    const right = card.pairs.right;

    // Shuffle right side
    const rightItems = right.map((text, origIdx) => ({ text, origIdx }));
    for (let i = rightItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rightItems[i], rightItems[j]] = [rightItems[j], rightItems[i]];
    }

    area.classList.add('piq-pairs-area');
    area.innerHTML = `
      <div class="piq-mp-container">
        <svg class="piq-mp-lines" id="piq-mp-lines"></svg>
        <div class="piq-mp-cols">
          <div class="piq-mp-left">${left.map((l, i) =>
            `<button class="piq-mp-item piq-mp-l" data-idx="${i}">${l}</button>`
          ).join('')}</div>
          <div class="piq-mp-right">${rightItems.map((r, i) =>
            `<button class="piq-mp-item piq-mp-r" data-orig="${r.origIdx}" data-idx="${i}">${r.text}</button>`
          ).join('')}</div>
        </div>
      </div>
      <button class="piq-mp-check" id="piq-mp-check">Check Matches</button>
    `;

    const matches = {}; // leftIdx → rightOrigIdx
    let selectedLeft = null;

    area.querySelectorAll('.piq-mp-l').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return;
        area.querySelectorAll('.piq-mp-l').forEach(b => b.classList.remove('glow'));
        btn.classList.add('glow');
        selectedLeft = parseInt(btn.dataset.idx);
      });
    });

    area.querySelectorAll('.piq-mp-r').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered || selectedLeft === null) return;
        // Remove any previous match for this left or this right
        Object.keys(matches).forEach(k => {
          if (matches[k] === parseInt(btn.dataset.orig)) delete matches[k];
        });
        matches[selectedLeft] = parseInt(btn.dataset.orig);

        // Visual: dim matched items, draw lines
        updatePairLines(area, matches, left, rightItems);

        area.querySelectorAll('.piq-mp-l').forEach(b => b.classList.remove('glow'));
        selectedLeft = null;

        // Show check button when all matched
        if (Object.keys(matches).length === left.length) {
          document.getElementById('piq-mp-check').classList.add('visible');
        }
      });
    });

    document.getElementById('piq-mp-check').addEventListener('click', () => {
      if (answered) return;
      answered = true;

      const correctArr = card.correct;
      let allCorrect = true;
      for (let i = 0; i < left.length; i++) {
        const isRight = matches[i] === correctArr[i];
        const leftBtn = area.querySelector(`.piq-mp-l[data-idx="${i}"]`);
        leftBtn.classList.add(isRight ? 'correct' : 'incorrect');
        if (!isRight) allCorrect = false;
      }

      finishAnswer(allCorrect);
    });
  }

  function updatePairLines(area, matches, left, rightItems) {
    const svg = area.querySelector('.piq-mp-lines');
    if (!svg) return;
    const container = area.querySelector('.piq-mp-container');
    const rect = container.getBoundingClientRect();
    svg.setAttribute('width', rect.width);
    svg.setAttribute('height', rect.height);
    svg.innerHTML = '';

    Object.keys(matches).forEach(leftIdx => {
      const rightOrig = matches[leftIdx];
      const leftEl = area.querySelector(`.piq-mp-l[data-idx="${leftIdx}"]`);
      const rightEl = area.querySelector(`.piq-mp-r[data-orig="${rightOrig}"]`);
      if (!leftEl || !rightEl) return;

      const lr = leftEl.getBoundingClientRect();
      const rr = rightEl.getBoundingClientRect();
      const x1 = lr.right - rect.left;
      const y1 = lr.top + lr.height / 2 - rect.top;
      const x2 = rr.left - rect.left;
      const y2 = rr.top + rr.height / 2 - rect.top;
      const cpx = (x1 + x2) / 2;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M${x1},${y1} C${cpx},${y1} ${cpx},${y2} ${x2},${y2}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'var(--piq-gold, #B8943E)');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('opacity', '0.6');
      svg.appendChild(path);

      leftEl.classList.add('matched');
      rightEl.classList.add('matched');
    });
  }

  function handleAnswer(idx) {
    if (answered) return;
    answered = true;

    const correctIdx = Array.isArray(currentCard.correct) ? currentCard.correct[0] : currentCard.correct;
    const isCorrect = idx === correctIdx;

    // Works for MC, scenario, and odd-one-out
    const opts = document.querySelectorAll('.piq-opt, .piq-ooo-item');
    const selected = opts[idx];
    if (selected) selected.classList.add('selected');

    setTimeout(() => {
      if (isCorrect) {
        if (selected) selected.classList.add('correct');
      } else {
        if (selected) selected.classList.add('incorrect');
        if (opts[correctIdx]) opts[correctIdx].classList.add('correct');
      }
      finishAnswer(isCorrect);
    }, 150);
  }

  function finishAnswer(isCorrect) {
    if (isCorrect) {
      sessionCorrect++;
      sessionStreak++;
      sessionStreakHigh = Math.max(sessionStreakHigh, sessionStreak);
    } else {
      sessionStreak = 0;
    }

      // Update stats
      const s = loadStats();
      const oldElo = s.elo;
      s.elo = calcElo(s.elo, currentCard.difficulty, isCorrect, s.totalAnswered);
      const delta = s.elo - oldElo;

      if (!s.domainElo[currentCard.domain]) s.domainElo[currentCard.domain] = 1000;
      s.domainElo[currentCard.domain] = calcElo(
        s.domainElo[currentCard.domain], currentCard.difficulty, isCorrect, s.totalAnswered
      );

      // Challenge mode: don't affect main Elo
      if (challengeMode) {
        showEloDelta(delta);
        setTimeout(() => {
          document.getElementById('piq-card-expl').textContent = currentCard.explanation;
          document.getElementById('piq-card-src').textContent = currentCard.sources || '';
          document.getElementById('piq-card-flipper').classList.add('flipped');
          setTimeout(() => { document.getElementById('piq-continue').classList.add('visible'); }, 400);
        }, 600);
        return;
      }

      s.totalAnswered++;
      if (isCorrect) { s.totalCorrect++; s.streak = (s.streak || 0) + 1; }
      else { s.streak = 0; }
      s.bestStreak = Math.max(s.bestStreak || 0, s.streak);
      s.todayCount++;
      if (!s.seenIds.includes(currentCard.id)) s.seenIds.push(currentCard.id);
      if (!s.domainCorrect) s.domainCorrect = {};
      if (!s.domainAnswered) s.domainAnswered = {};
      s.domainCorrect[currentCard.domain] = (s.domainCorrect[currentCard.domain] || 0) + (isCorrect ? 1 : 0);
      s.domainAnswered[currentCard.domain] = (s.domainAnswered[currentCard.domain] || 0) + 1;

      // Spaced repetition tracking
      updateCardHistory(s, currentCard.id, isCorrect);
      // Daily streak
      updateDailyStreak(s);

      const newLevel = eloToLevel(s.elo);
      const oldLevel = eloToLevel(oldElo);
      s.levelUnlocked = Math.max(s.levelUnlocked || 1, newLevel);
      saveStats(s);

      // Elo delta animation
      showEloDelta(delta);

      // Flip card to show explanation
      setTimeout(() => {
        document.getElementById('piq-card-expl').textContent = currentCard.explanation;
        document.getElementById('piq-card-src').textContent = currentCard.sources || '';
        document.getElementById('piq-card-flipper').classList.add('flipped');

        // Show continue
        setTimeout(() => {
          document.getElementById('piq-continue').classList.add('visible');

          // Level up check
          if (newLevel > oldLevel) {
            showLevelUp(newLevel);
          }
        }, 400);
      }, 600);

    }, 150); // pulse delay
  }

  function showEloDelta(delta) {
    const el = document.getElementById('piq-elo-delta');
    const sign = delta >= 0 ? '+' : '';
    el.textContent = sign + Math.round(delta);
    el.className = 'piq-elo-delta ' + (delta >= 0 ? 'positive' : 'negative') + ' animate';
    setTimeout(() => { el.className = 'piq-elo-delta'; }, 900);
  }

  function showLevelUp(level) {
    const overlay = document.getElementById('piq-levelup');
    document.getElementById('piq-levelup-text').textContent = `Level ${level}`;
    overlay.classList.add('active');
    setTimeout(() => {
      overlay.classList.remove('active');
    }, 2400);
  }

  // Continue to next card
  document.getElementById('piq-continue').addEventListener('click', () => {
    sessionIndex++;
    showSessionCard();
  });

  // Close session
  document.getElementById('piq-tb-close').addEventListener('click', () => {
    showSummary();
  });

  // ── Summary Screen ────────────────────────────────────

  function showSummary() {
    const s = loadStats();
    const answered = sessionIndex;
    const accuracy = answered > 0 ? Math.round((sessionCorrect / answered) * 100) : 0;
    const eloDelta = s.elo - sessionStartElo;

    document.getElementById('piq-sum-accuracy').textContent = accuracy + '%';
    document.getElementById('piq-sum-answered').textContent = answered;
    document.getElementById('piq-sum-correct').textContent = sessionCorrect;
    document.getElementById('piq-sum-elo-delta').textContent =
      (eloDelta >= 0 ? '+' : '') + Math.round(eloDelta);
    document.getElementById('piq-sum-elo-delta').style.color =
      eloDelta >= 0 ? 'var(--piq-correct, #6B7F5E)' : 'var(--piq-incorrect, #A0614B)';
    document.getElementById('piq-sum-streak').textContent = sessionStreakHigh;

    // Challenge mode label
    const titleEl = document.querySelector('.piq-summary-title');
    if (titleEl) titleEl.textContent = challengeMode ? 'Challenge Complete' : 'Session Complete';

    // Summary spectrum
    updateSpectrum('piq-sum-spectrum-pin', 'piq-sum-spectrum-fill', s.elo);

    // Show sign-in prompt for unauthenticated users
    const prompt = document.getElementById('piq-signin-prompt');
    if (prompt) prompt.style.display = getUser() ? 'none' : '';

    showScreen('piq-summary');
    challengeMode = false;
  }

  // Summary CTAs
  document.getElementById('piq-again').addEventListener('click', () => {
    startSession(sessionLimit);
  });
  document.getElementById('piq-back-home').addEventListener('click', () => {
    updateEntry();
    showScreen('piq-entry');
  });

  // ── Entry CTAs ────────────────────────────────────────

  document.getElementById('piq-start-10').addEventListener('click', () => { challengeMode = false; startSession(10); });
  document.getElementById('piq-start-deep').addEventListener('click', () => { challengeMode = false; startSession(25); });

  // Review mode
  const reviewBtn = document.getElementById('piq-start-review');
  if (reviewBtn) {
    reviewBtn.addEventListener('click', () => {
      challengeMode = false;
      const s = loadStats();
      const reviewIds = getReviewCards(s);
      const reviewCards = allCards.filter(c => reviewIds.includes(c.id)).slice(0, 15);
      if (reviewCards.length === 0) return;
      sessionStartElo = s.elo;
      sessionCards = reviewCards;
      sessionIndex = 0;
      sessionCorrect = 0;
      sessionStreak = 0;
      sessionStreakHigh = 0;
      sessionLimit = reviewCards.length;
      showScreen('piq-session');
      showSessionCard();
    });
  }

  // Challenge mode
  const challengeBtn = document.getElementById('piq-start-challenge');
  if (challengeBtn) {
    challengeBtn.addEventListener('click', () => {
      const s = loadStats();
      const level = eloToLevel(s.elo);
      const targetLevel = Math.min(level + 2, MAX_LEVEL);
      challengeMode = true;
      challengeStartElo = s.elo;
      // Pick cards from target level
      const pool = allCards.filter(c => c.level >= targetLevel);
      const deck = [];
      const used = new Set();
      for (let i = 0; i < 10 && pool.length > 0; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        if (used.has(pool[idx].id)) { i--; continue; }
        used.add(pool[idx].id);
        deck.push(pool[idx]);
      }
      sessionStartElo = s.elo;
      sessionCards = deck;
      sessionIndex = 0;
      sessionCorrect = 0;
      sessionStreak = 0;
      sessionStreakHigh = 0;
      sessionLimit = deck.length;
      showScreen('piq-session');
      showSessionCard();
    });
  }

  // Sign-in prompt
  const signinBtn = document.getElementById('piq-signin-btn');
  if (signinBtn) {
    signinBtn.addEventListener('click', () => {
      if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.prompt();
      }
    });
  }
  const signinDismiss = document.getElementById('piq-signin-dismiss');
  if (signinDismiss) {
    signinDismiss.addEventListener('click', () => {
      document.getElementById('piq-signin-prompt').style.display = 'none';
    });
  }

  // Domain pills
  document.querySelectorAll('.piq-dpill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.piq-dpill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeDomain = pill.dataset.domain;
    });
  });

  // ── Mobile Swipe ──────────────────────────────────────

  let touchStartX = 0;
  let touchStartY = 0;
  const stage = document.getElementById('piq-card-stage');

  if (stage) {
    stage.addEventListener('touchstart', (e) => {
      if (!answered) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    stage.addEventListener('touchend', (e) => {
      if (!answered) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
      if (Math.abs(dx) > 60 && dy < 100) {
        sessionIndex++;
        showSessionCard();
      }
    }, { passive: true });
  }

  // ── Init ──────────────────────────────────────────────

  async function init() {
    if (initialized) return;
    initialized = true;

    // Sync stats from server if signed in
    await syncFromServer();

    const files = [
      'palateiq-cards-1.json', 'palateiq-cards-2.json', 'palateiq-cards-3.json',
      'palateiq-grape_varieties.json', 'palateiq-regions_appellations.json',
      'palateiq-tasting_sensory.json', 'palateiq-winemaking.json',
      'palateiq-food_pairing.json', 'palateiq-history_culture.json',
      'palateiq-service_business.json', 'palateiq-blind_tasting.json',
      'palateiq-producer_knowledge.json',
    ];

    const results = await Promise.allSettled(
      files.map(f => fetch('/data/' + f).then(r => r.ok ? r.json() : []))
    );
    results.forEach(r => {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) allCards = allCards.concat(r.value);
    });

    // Deduplicate
    const seen = new Set();
    allCards = allCards.filter(c => {
      if (seen.has(c.id)) return false;
      seen.add(c.id); return true;
    });

    updateEntry();
    showScreen('piq-entry');
  }

  // Lazy init
  const observer = new MutationObserver(() => {
    const sec = document.getElementById('palateiq-section');
    if (sec && sec.classList.contains('active')) init();
  });
  const sec = document.getElementById('palateiq-section');
  if (sec) observer.observe(sec, { attributes: true, attributeFilter: ['class'] });
});
