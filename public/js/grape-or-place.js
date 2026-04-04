// grape-or-place.js — Timed wine term classification game

document.addEventListener('DOMContentLoaded', () => {
  let allTerms = [];
  let gameTerms = [];
  let currentIndex = 0;
  let score = 0;
  let streak = 0;
  let bestStreak = 0;
  let mistakes = [];
  let timerRAF = null;
  let timerStart = 0;
  let initialized = false;
  let gameActive = false;
  const ROUND_SIZE = 20;
  const TIME_LIMIT = 8000; // 8 seconds

  const TIERS = [
    { max: 5, label: 'House Wine' },
    { max: 10, label: 'By the Glass' },
    { max: 15, label: 'Reserve List' },
    { max: 18, label: 'Grand Cru' },
    { max: 20, label: 'Master Sommelier' },
  ];

  // ── Elements ──────────────────────────────────────────

  const landing = document.getElementById('gop-landing');
  const playing = document.getElementById('gop-playing');
  const results = document.getElementById('gop-results');
  const playBtn = document.getElementById('gop-play-btn');
  const playAgainBtn = document.getElementById('gop-play-again');
  const howToggle = document.getElementById('gop-how-toggle');
  const howContent = document.getElementById('gop-how-content');

  const termEl = document.getElementById('gop-term');
  const timerBar = document.getElementById('gop-timer-fill');
  const scoreEl = document.getElementById('gop-score');
  const streakEl = document.getElementById('gop-streak');
  const roundEl = document.getElementById('gop-round');
  const feedbackEl = document.getElementById('gop-feedback');
  const feedbackText = document.getElementById('gop-feedback-text');

  const btnGrape = document.getElementById('gop-btn-grape');
  const btnPlace = document.getElementById('gop-btn-place');
  const btnBoth = document.getElementById('gop-btn-both');

  const resScore = document.getElementById('gop-res-score');
  const resTier = document.getElementById('gop-res-tier');
  const resMistakes = document.getElementById('gop-res-mistakes');

  // ── Screen management ─────────────────────────────────

  function showScreen(screen) {
    [landing, playing, results].forEach(s => { if (s) s.style.display = 'none'; });
    if (screen) screen.style.display = '';
  }

  // ── How to play toggle ────────────────────────────────

  if (howToggle && howContent) {
    howToggle.addEventListener('click', () => {
      const open = howContent.style.display !== 'none';
      howContent.style.display = open ? 'none' : 'block';
      howToggle.classList.toggle('open', !open);
    });
  }

  // ── Game logic ────────────────────────────────────────

  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildRound() {
    // Ensure 2-3 "both" answers per round
    const boths = shuffleArray(allTerms.filter(t => t.answer === 'both')).slice(0, 3);
    const others = shuffleArray(allTerms.filter(t => t.answer !== 'both'));
    const pool = shuffleArray([...boths, ...others.slice(0, ROUND_SIZE - boths.length)]);
    return pool.slice(0, ROUND_SIZE);
  }

  function startGame() {
    gameTerms = buildRound();
    currentIndex = 0;
    score = 0;
    streak = 0;
    bestStreak = 0;
    mistakes = [];
    gameActive = true;
    showScreen(playing);
    updateHUD();
    showTerm();
  }

  function showTerm() {
    if (currentIndex >= gameTerms.length) {
      endGame();
      return;
    }

    const term = gameTerms[currentIndex];
    termEl.textContent = term.term;
    termEl.classList.remove('gop-fade-in');
    void termEl.offsetWidth; // force reflow
    termEl.classList.add('gop-fade-in');

    feedbackEl.style.display = 'none';
    enableButtons(true);
    startTimer();
  }

  function startTimer() {
    cancelAnimationFrame(timerRAF);
    timerStart = performance.now();
    timerBar.style.width = '100%';

    function tick(now) {
      const elapsed = now - timerStart;
      const remaining = Math.max(0, 1 - elapsed / TIME_LIMIT);
      timerBar.style.width = (remaining * 100) + '%';

      if (remaining <= 0.3) {
        timerBar.classList.add('gop-timer-urgent');
      } else {
        timerBar.classList.remove('gop-timer-urgent');
      }

      if (elapsed >= TIME_LIMIT) {
        handleAnswer(null); // time's up
        return;
      }
      timerRAF = requestAnimationFrame(tick);
    }
    timerRAF = requestAnimationFrame(tick);
  }

  function stopTimer() {
    cancelAnimationFrame(timerRAF);
  }

  function handleAnswer(answer) {
    if (!gameActive) return;
    stopTimer();
    enableButtons(false);

    const term = gameTerms[currentIndex];
    const correct = answer === term.answer;

    if (correct) {
      score++;
      streak++;
      bestStreak = Math.max(bestStreak, streak);
      showCorrectFeedback();
    } else {
      streak = 0;
      mistakes.push(term);
      showWrongFeedback(term, answer);
    }

    updateHUD();
  }

  function showCorrectFeedback() {
    const card = document.getElementById('gop-card');
    const term = gameTerms[currentIndex];
    card.classList.add('gop-correct-flash');

    // Show explainer with correct styling
    feedbackText.textContent = term.explainer;
    feedbackEl.style.display = '';
    feedbackEl.className = 'gop-feedback gop-feedback-correct';

    setTimeout(() => {
      card.classList.remove('gop-correct-flash');
      feedbackEl.style.display = 'none';
      currentIndex++;
      showTerm();
    }, 2000);
  }

  function showWrongFeedback(term, userAnswer) {
    feedbackText.textContent = term.explainer;
    feedbackEl.style.display = '';
    feedbackEl.className = 'gop-feedback gop-feedback-wrong';

    setTimeout(() => {
      feedbackEl.style.display = 'none';
      currentIndex++;
      showTerm();
    }, 2500);
  }

  function enableButtons(enabled) {
    [btnGrape, btnPlace, btnBoth].forEach(btn => {
      if (btn) btn.disabled = !enabled;
    });
  }

  function updateHUD() {
    if (scoreEl) scoreEl.textContent = score;
    if (streakEl) streakEl.textContent = streak > 1 ? streak : '';
    if (roundEl) roundEl.textContent = `${Math.min(currentIndex + 1, ROUND_SIZE)} / ${ROUND_SIZE}`;
  }

  function endGame() {
    gameActive = false;
    stopTimer();

    // Score
    resScore.textContent = `${score} / ${ROUND_SIZE}`;

    // Tier
    let tier = 'Master Sommelier';
    for (const t of TIERS) {
      if (score <= t.max) { tier = t.label; break; }
    }
    resTier.textContent = tier;

    // Mistakes
    if (mistakes.length > 0) {
      resMistakes.innerHTML = mistakes.map(m =>
        `<div class="gop-mistake">
          <span class="gop-mistake-term">${m.term}</span>
          <span class="gop-mistake-answer">${m.answer.toUpperCase()}</span>
          <p class="gop-mistake-expl">${m.explainer}</p>
        </div>`
      ).join('');
      document.getElementById('gop-mistakes-section').style.display = '';
    } else {
      document.getElementById('gop-mistakes-section').style.display = 'none';
    }

    showScreen(results);
  }

  // ── Button handlers ───────────────────────────────────

  if (btnGrape) btnGrape.addEventListener('click', () => handleAnswer('grape'));
  if (btnPlace) btnPlace.addEventListener('click', () => handleAnswer('place'));
  if (btnBoth) btnBoth.addEventListener('click', () => handleAnswer('both'));
  if (playBtn) playBtn.addEventListener('click', startGame);
  if (playAgainBtn) playAgainBtn.addEventListener('click', startGame);

  // ── Keyboard shortcuts ────────────────────────────────

  document.addEventListener('keydown', (e) => {
    if (!gameActive) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); handleAnswer('grape'); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); handleAnswer('place'); }
    if (e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); handleAnswer('both'); }
  });

  // ── Mobile swipe ──────────────────────────────────────

  let touchStartX = 0;
  let touchStartY = 0;
  const cardEl = document.getElementById('gop-card');

  if (cardEl) {
    cardEl.addEventListener('touchstart', (e) => {
      if (!gameActive) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    cardEl.addEventListener('touchend', (e) => {
      if (!gameActive) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) < 50 && Math.abs(dy) < 50) return; // too small

      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        handleAnswer(dx > 0 ? 'grape' : 'place');
      } else if (dy > 50) {
        // Swipe down = both
        handleAnswer('both');
      }
    }, { passive: true });
  }

  // ── Init ──────────────────────────────────────────────

  async function init() {
    if (initialized) return;
    initialized = true;
    try {
      const res = await fetch('/data/grape-or-place.json');
      allTerms = await res.json();
    } catch { allTerms = []; }
    showScreen(landing);
  }

  // Lazy init
  const observer = new MutationObserver(() => {
    const sec = document.getElementById('grapeorplace-section');
    if (sec && sec.classList.contains('active')) init();
  });
  const sec = document.getElementById('grapeorplace-section');
  if (sec) observer.observe(sec, { attributes: true, attributeFilter: ['class'] });
});
