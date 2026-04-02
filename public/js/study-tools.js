// study-tools.js — Flashcards, quizzes, and podcast generator for wine exam prep

document.addEventListener('DOMContentLoaded', () => {
  // ── Master Flashcard Deck (500 pre-built cards) ──
  let masterCards = [];
  let filteredCards = [];
  let deckIndex = 0;
  let deckShowBack = false;
  let deckKnown = new Set();   // card indices user marked "Got It"
  let deckReview = new Set();  // card indices user marked "Review Again"
  let deckFilter = 'all';
  let deckInitialized = false;

  // Load saved progress from localStorage
  try {
    const saved = JSON.parse(localStorage.getItem('sommplicity_deck_progress') || '{}');
    if (saved.known) deckKnown = new Set(saved.known);
    if (saved.review) deckReview = new Set(saved.review);
  } catch {}

  function saveDeckProgress() {
    localStorage.setItem('sommplicity_deck_progress', JSON.stringify({
      known: [...deckKnown],
      review: [...deckReview],
    }));
  }

  async function initMasterDeck() {
    if (deckInitialized) return;
    deckInitialized = true;

    try {
      const res = await fetch('/data/cms-flashcards.json');
      if (!res.ok) throw new Error('Could not load flashcards');
      const data = await res.json();
      masterCards = data.cards || [];
    } catch (err) {
      document.getElementById('deck-card-text').textContent = 'Failed to load flashcards. Please refresh.';
      return;
    }

    filterDeck('all');

    // Difficulty filter buttons
    document.querySelectorAll('.deck-diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.deck-diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterDeck(btn.dataset.diff);
      });
    });

    // Flip
    document.getElementById('deck-flip').addEventListener('click', () => { deckShowBack = !deckShowBack; renderDeckCard(); });
    document.getElementById('deck-card').addEventListener('click', () => { deckShowBack = !deckShowBack; renderDeckCard(); });

    // Nav
    document.getElementById('deck-prev').addEventListener('click', () => { if (deckIndex > 0) { deckIndex--; deckShowBack = false; renderDeckCard(); } });
    document.getElementById('deck-next').addEventListener('click', () => { if (deckIndex < filteredCards.length - 1) { deckIndex++; deckShowBack = false; renderDeckCard(); } });
    document.getElementById('deck-shuffle').addEventListener('click', () => {
      for (let i = filteredCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredCards[i], filteredCards[j]] = [filteredCards[j], filteredCards[i]];
      }
      deckIndex = 0;
      deckShowBack = false;
      renderDeckCard();
    });

    // Mark known / review
    document.getElementById('deck-mark-known').addEventListener('click', () => {
      const card = filteredCards[deckIndex];
      if (!card) return;
      const idx = masterCards.indexOf(card);
      deckKnown.add(idx);
      deckReview.delete(idx);
      saveDeckProgress();
      updateDeckProgress();
      // Auto-advance
      if (deckIndex < filteredCards.length - 1) { deckIndex++; deckShowBack = false; renderDeckCard(); }
    });

    document.getElementById('deck-mark-review').addEventListener('click', () => {
      const card = filteredCards[deckIndex];
      if (!card) return;
      const idx = masterCards.indexOf(card);
      deckReview.add(idx);
      deckKnown.delete(idx);
      saveDeckProgress();
      updateDeckProgress();
      // Auto-advance
      if (deckIndex < filteredCards.length - 1) { deckIndex++; deckShowBack = false; renderDeckCard(); }
    });
  }

  function filterDeck(diff) {
    deckFilter = diff;
    if (diff === 'all') filteredCards = [...masterCards];
    else filteredCards = masterCards.filter(c => c.diff === diff);
    deckIndex = 0;
    deckShowBack = false;
    renderDeckCard();
    updateDeckProgress();
  }

  function renderDeckCard() {
    if (!filteredCards.length) {
      document.getElementById('deck-card-text').textContent = 'No cards match this filter.';
      document.getElementById('deck-counter').textContent = '0 / 0';
      return;
    }
    const card = filteredCards[deckIndex];
    const globalIdx = masterCards.indexOf(card);
    document.getElementById('deck-counter').textContent = `${deckIndex + 1} / ${filteredCards.length}`;
    const face = document.getElementById('deck-card-face');
    const label = face.querySelector('.deck-card-side-label');
    const text = document.getElementById('deck-card-text');
    const diffEl = document.getElementById('deck-card-diff');

    label.textContent = deckShowBack ? 'Answer' : 'Question';
    text.textContent = deckShowBack ? card.back : card.front;
    face.className = 'deck-card-face' + (deckShowBack ? ' is-back' : '');
    diffEl.textContent = card.diff;
    diffEl.setAttribute('data-d', card.diff);
    document.getElementById('deck-flip').textContent = deckShowBack ? 'Show Question' : 'Flip';

    // Show known/review state on card border
    const cardEl = document.getElementById('deck-card');
    cardEl.style.borderLeftWidth = '3px';
    if (deckKnown.has(globalIdx)) cardEl.style.borderLeftColor = '#4a8a50';
    else if (deckReview.has(globalIdx)) cardEl.style.borderLeftColor = 'var(--maroon)';
    else cardEl.style.borderLeftColor = 'var(--border-ink)';
  }

  function updateDeckProgress() {
    document.getElementById('deck-known-count').textContent = deckKnown.size;
    document.getElementById('deck-review-count').textContent = deckReview.size;
    document.getElementById('deck-total-count').textContent = masterCards.length;
  }

  // Only init when the cmsprep section becomes active
  let initialized = false;

  function initStudyTools() {
    if (initialized) return;
    const tabs = document.querySelectorAll('.study-tool-tab');
    const categorySelect = document.getElementById('study-category');
    const topicInput = document.getElementById('study-topic');
    if (!tabs.length || !categorySelect || !topicInput) return;
    initialized = true;

    const panels = {
      flashcards: document.getElementById('study-panel-flashcards'),
      quiz: document.getElementById('study-panel-quiz'),
      podcast: document.getElementById('study-panel-podcast'),
    };

    // Tab switching
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        Object.values(panels).forEach(p => { if (p) p.style.display = 'none'; });
        const panel = panels[tab.dataset.tool];
        if (panel) panel.style.display = 'block';
      });
    });

    // Category change → show matching preset group
    categorySelect.addEventListener('change', () => {
      document.querySelectorAll('.study-presets[data-for]').forEach(g => {
        g.style.display = g.dataset.for === categorySelect.value ? 'flex' : 'none';
      });
      topicInput.value = '';
    });

    // Preset buttons → fill topic input and highlight
    document.querySelectorAll('.study-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // Set category + topic
        categorySelect.value = btn.dataset.cat;
        categorySelect.dispatchEvent(new Event('change'));
        topicInput.value = btn.dataset.topic;
        // Highlight active preset
        document.querySelectorAll('.study-preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    function getParams() {
      return {
        category: categorySelect.value,
        topic: topicInput.value.trim(),
      };
    }

    // ── Flashcards ──
    let currentCards = [];
    let cardIndex = 0;
    let showingBack = false;

    document.getElementById('generate-flashcards').addEventListener('click', async () => {
      const { category, topic } = getParams();
      if (!topic) { alert('Pick or type a topic first.'); return; }
      const btn = document.getElementById('generate-flashcards');
      const output = document.getElementById('flashcard-output');
      btn.disabled = true;
      btn.textContent = 'Generating...';
      output.innerHTML = '<div class="study-loading">Creating flashcards from trusted sources...</div>';

      try {
        const res = await fetch('/api/study/flashcards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category, topic }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
          throw new Error(err.error || 'Failed');
        }
        const data = await res.json();
        currentCards = data.cards || [];
        cardIndex = 0;
        showingBack = false;
        renderFlashcard(output);
      } catch (err) {
        output.innerHTML = `<div class="study-error">Error: ${err.message}</div>`;
      }
      btn.disabled = false;
      btn.textContent = 'Generate Flashcards';
    });

    function renderFlashcard(output) {
      if (!currentCards.length) { output.innerHTML = '<div class="study-output-empty">No cards generated.</div>'; return; }
      const card = currentCards[cardIndex];
      output.innerHTML = `
        <div class="flashcard-container">
          <div class="flashcard-counter">${cardIndex + 1} / ${currentCards.length}</div>
          <div class="flashcard" id="flashcard-active">
            <div class="flashcard-face ${showingBack ? 'flashcard-back' : 'flashcard-front'}">
              <span class="flashcard-side-label">${showingBack ? 'Answer' : 'Question'}</span>
              <p>${showingBack ? card.back : card.front}</p>
            </div>
          </div>
          <div class="flashcard-controls">
            <button class="flashcard-btn" id="fc-prev" ${cardIndex === 0 ? 'disabled' : ''}>Previous</button>
            <button class="flashcard-btn flashcard-btn-flip" id="fc-flip">${showingBack ? 'Show Question' : 'Show Answer'}</button>
            <button class="flashcard-btn" id="fc-next" ${cardIndex >= currentCards.length - 1 ? 'disabled' : ''}>Next</button>
          </div>
        </div>`;
      document.getElementById('fc-flip').addEventListener('click', () => { showingBack = !showingBack; renderFlashcard(output); });
      document.getElementById('fc-prev').addEventListener('click', () => { if (cardIndex > 0) { cardIndex--; showingBack = false; renderFlashcard(output); } });
      document.getElementById('fc-next').addEventListener('click', () => { if (cardIndex < currentCards.length - 1) { cardIndex++; showingBack = false; renderFlashcard(output); } });
      document.getElementById('flashcard-active').addEventListener('click', () => { showingBack = !showingBack; renderFlashcard(output); });
    }

    // ── Quiz ──
    let quizQuestions = [];
    let quizAnswers = {};
    let quizSubmitted = false;

    document.getElementById('generate-quiz').addEventListener('click', async () => {
      const { category, topic } = getParams();
      if (!topic) { alert('Pick or type a topic first.'); return; }
      const btn = document.getElementById('generate-quiz');
      const output = document.getElementById('quiz-output');
      btn.disabled = true;
      btn.textContent = 'Generating...';
      output.innerHTML = '<div class="study-loading">Creating quiz from trusted sources...</div>';

      try {
        const res = await fetch('/api/study/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category, topic }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
          throw new Error(err.error || 'Failed');
        }
        const data = await res.json();
        quizQuestions = data.questions || [];
        quizAnswers = {};
        quizSubmitted = false;
        renderQuiz(output);
      } catch (err) {
        output.innerHTML = `<div class="study-error">Error: ${err.message}</div>`;
      }
      btn.disabled = false;
      btn.textContent = 'Generate Quiz';
    });

    function renderQuiz(output) {
      if (!quizQuestions.length) { output.innerHTML = '<div class="study-output-empty">No questions generated.</div>'; return; }
      output.innerHTML = `
        <div class="quiz-container">
          ${quizQuestions.map((q, qi) => `
            <div class="quiz-question">
              <div class="quiz-q-num">${qi + 1}.</div>
              <div class="quiz-q-text">${q.question}</div>
              <div class="quiz-options">
                ${q.options.map((opt, oi) => {
                  const selected = quizAnswers[qi] === oi;
                  const isCorrect = q.correct === oi;
                  let cls = 'quiz-option';
                  if (quizSubmitted && selected && isCorrect) cls += ' correct';
                  else if (quizSubmitted && selected && !isCorrect) cls += ' wrong';
                  else if (quizSubmitted && isCorrect) cls += ' correct-reveal';
                  if (selected && !quizSubmitted) cls += ' selected';
                  return `<button class="${cls}" data-qi="${qi}" data-oi="${oi}" ${quizSubmitted ? 'disabled' : ''}>${opt}</button>`;
                }).join('')}
              </div>
              ${quizSubmitted && q.explanation ? `<div class="quiz-explanation">${q.explanation}</div>` : ''}
            </div>
          `).join('')}
          ${!quizSubmitted ? `<button class="study-generate-btn quiz-submit-btn" id="quiz-submit">Check Answers</button>` : `<div class="quiz-score">Score: ${Object.keys(quizAnswers).filter(qi => quizAnswers[qi] === quizQuestions[qi].correct).length} / ${quizQuestions.length}</div>`}
        </div>`;

      if (!quizSubmitted) {
        output.querySelectorAll('.quiz-option').forEach(btn => {
          btn.addEventListener('click', () => {
            const qi = parseInt(btn.dataset.qi);
            quizAnswers[qi] = parseInt(btn.dataset.oi);
            btn.closest('.quiz-options').querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
          });
        });
        const submitBtn = document.getElementById('quiz-submit');
        if (submitBtn) submitBtn.addEventListener('click', () => { quizSubmitted = true; renderQuiz(output); });
      }
    }

    // ── Podcast ──
    document.getElementById('generate-podcast').addEventListener('click', async () => {
      const { category, topic } = getParams();
      if (!topic) { alert('Pick or type a topic first.'); return; }
      const duration = document.getElementById('podcast-duration').value;
      const style = document.getElementById('podcast-style').value;
      const btn = document.getElementById('generate-podcast');
      const output = document.getElementById('podcast-output');
      btn.disabled = true;
      btn.textContent = 'Generating...';
      output.innerHTML = `<div class="study-loading">Writing a ${duration}-minute podcast script...</div>`;

      try {
        const res = await fetch('/api/study/podcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category, topic, duration: parseInt(duration), style }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
          throw new Error(err.error || 'Failed');
        }
        const data = await res.json();
        renderPodcast(output, data);
      } catch (err) {
        output.innerHTML = `<div class="study-error">Error: ${err.message}</div>`;
      }
      btn.disabled = false;
      btn.textContent = 'Generate Podcast';
    });

    function renderPodcast(output, data) {
      const paragraphs = data.script.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('');
      output.innerHTML = `
        <div class="podcast-container">
          <div class="podcast-header">
            <h3 class="podcast-title">${data.topic}</h3>
            <span class="podcast-meta">${data.duration} min · ${data.style}</span>
          </div>
          <div class="podcast-player">
            <button class="podcast-play-btn" id="podcast-play">Listen</button>
            <button class="podcast-stop-btn" id="podcast-stop" style="display:none">Stop</button>
          </div>
          <div class="podcast-script">${paragraphs}</div>
        </div>`;
      if ('speechSynthesis' in window) {
        document.getElementById('podcast-play').addEventListener('click', () => {
          speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(data.script);
          u.rate = 0.95;
          u.onend = () => { document.getElementById('podcast-play').style.display = ''; document.getElementById('podcast-stop').style.display = 'none'; };
          speechSynthesis.speak(u);
          document.getElementById('podcast-play').style.display = 'none';
          document.getElementById('podcast-stop').style.display = '';
        });
        document.getElementById('podcast-stop').addEventListener('click', () => {
          speechSynthesis.cancel();
          document.getElementById('podcast-play').style.display = '';
          document.getElementById('podcast-stop').style.display = 'none';
        });
      }
    }
  }

  // Init when cmsprep tab becomes visible
  const observer = new MutationObserver(() => {
    const section = document.getElementById('cmsprep-section');
    if (section && section.classList.contains('active')) { initMasterDeck(); initStudyTools(); }
  });
  const section = document.getElementById('cmsprep-section');
  if (section) observer.observe(section, { attributes: true, attributeFilter: ['class'] });

  // Also handle "Certified Exam Prep" links from study page
  document.querySelectorAll('.study-go-to-prep').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const navItem = document.querySelector('[data-section="cmsprep"]');
      if (navItem) navItem.click();
    });
  });
});
