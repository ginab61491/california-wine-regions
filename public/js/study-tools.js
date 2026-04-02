// study-tools.js — Flashcards, quizzes, and podcast generator for wine exam prep

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.study-tool-tab');
  const panels = {
    flashcards: document.getElementById('study-panel-flashcards'),
    quiz: document.getElementById('study-panel-quiz'),
    podcast: document.getElementById('study-panel-podcast'),
  };
  if (!tabs.length) return;

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

  // Preset buttons fill in topic
  document.querySelectorAll('.study-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('study-category').value = btn.dataset.cat;
      document.getElementById('study-topic').value = btn.dataset.topic;
    });
  });

  function getStudyParams() {
    return {
      category: document.getElementById('study-category').value,
      topic: document.getElementById('study-topic').value.trim(),
    };
  }

  // ── Flashcards ──
  let currentCards = [];
  let cardIndex = 0;
  let showingBack = false;

  document.getElementById('generate-flashcards').addEventListener('click', async () => {
    const { category, topic } = getStudyParams();
    if (!topic) { alert('Enter a topic first.'); return; }
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
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
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
    if (!currentCards.length) {
      output.innerHTML = '<div class="study-output-empty">No cards generated.</div>';
      return;
    }
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
    document.getElementById('fc-flip').addEventListener('click', () => {
      showingBack = !showingBack;
      renderFlashcard(output);
    });
    document.getElementById('fc-prev').addEventListener('click', () => {
      if (cardIndex > 0) { cardIndex--; showingBack = false; renderFlashcard(output); }
    });
    document.getElementById('fc-next').addEventListener('click', () => {
      if (cardIndex < currentCards.length - 1) { cardIndex++; showingBack = false; renderFlashcard(output); }
    });
    // Click card to flip
    document.getElementById('flashcard-active').addEventListener('click', () => {
      showingBack = !showingBack;
      renderFlashcard(output);
    });
  }

  // ── Quiz ──
  let quizQuestions = [];
  let quizAnswers = {};
  let quizSubmitted = false;

  document.getElementById('generate-quiz').addEventListener('click', async () => {
    const { category, topic } = getStudyParams();
    if (!topic) { alert('Enter a topic first.'); return; }
    const btn = document.getElementById('generate-quiz');
    const output = document.getElementById('quiz-output');
    btn.disabled = true;
    btn.textContent = 'Generating...';
    output.innerHTML = '<div class="study-loading">Creating quiz questions from trusted sources...</div>';

    try {
      const res = await fetch('/api/study/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, topic }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
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
    if (!quizQuestions.length) {
      output.innerHTML = '<div class="study-output-empty">No questions generated.</div>';
      return;
    }
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
          // Highlight selected
          btn.closest('.quiz-options').querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        });
      });
      const submitBtn = document.getElementById('quiz-submit');
      if (submitBtn) {
        submitBtn.addEventListener('click', () => {
          quizSubmitted = true;
          renderQuiz(output);
        });
      }
    }
  }

  // ── Podcast ──
  document.getElementById('generate-podcast').addEventListener('click', async () => {
    const { category, topic } = getStudyParams();
    if (!topic) { alert('Enter a topic first.'); return; }
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
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
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
          <span class="podcast-meta">${data.duration} min &middot; ${data.style}</span>
        </div>
        <div class="podcast-player">
          <button class="podcast-play-btn" id="podcast-play">Listen</button>
          <button class="podcast-stop-btn" id="podcast-stop" style="display:none">Stop</button>
        </div>
        <div class="podcast-script">${paragraphs}</div>
      </div>`;

    // Browser speech synthesis for listening
    const playBtn = document.getElementById('podcast-play');
    const stopBtn = document.getElementById('podcast-stop');
    if ('speechSynthesis' in window) {
      playBtn.addEventListener('click', () => {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(data.script);
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.onend = () => { playBtn.style.display = ''; stopBtn.style.display = 'none'; };
        speechSynthesis.speak(utterance);
        playBtn.style.display = 'none';
        stopBtn.style.display = '';
      });
      stopBtn.addEventListener('click', () => {
        speechSynthesis.cancel();
        playBtn.style.display = '';
        stopBtn.style.display = 'none';
      });
    } else {
      playBtn.style.display = 'none';
    }
  }
});
