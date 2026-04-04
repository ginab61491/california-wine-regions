// label-school.js — Interactive Wine Label Reading Tool + Quiz

document.addEventListener('DOMContentLoaded', () => {
  let data = null;
  let selectedLabel = 'chablis';
  let activeRole = null;
  let mode = 'school';
  let initialized = false;

  // Quiz state
  let quizLevel = 1;
  let quizIndex = 0;
  let quizScore = 0;
  let quizStarted = false;
  let quizComplete = false;
  let selectedAnswer = null;
  let showResult = false;

  function getLabel(id) { return data.labels.find(l => l.id === id); }
  function getQuestions(level) { return data.quizQuestions.filter(q => q.level === level); }
  function isOldWorld(label) { return ['France','Italy','Spain','Germany'].includes(label.country); }

  // ── Render ────────────────────────────────────────────

  function render() {
    if (!data) return;
    const container = document.getElementById('ls-content');
    if (!container) return;

    if (mode === 'school') renderSchool(container);
    else if (mode === 'quiz' && !quizStarted) renderQuizMenu(container);
    else if (mode === 'quiz' && quizStarted && !quizComplete) renderQuizCard(container);
    else if (mode === 'quiz' && quizComplete) renderQuizResults(container);
  }

  // ── SCHOOL MODE ───────────────────────────────────────

  function renderSchool(container) {
    const label = getLabel(selectedLabel);
    const oldWorld = isOldWorld(label);

    container.innerHTML = `
      <!-- Label selector pills (scrollable) -->
      <div class="ls-pill-scroll">
        ${data.labels.map(l => `
          <button class="ls-pill ${l.id === selectedLabel ? 'active' : ''}" data-label="${l.id}" style="${l.id === selectedLabel ? `border-color:${l.color};background:${l.color}10` : ''}">
            <span class="ls-pill-region">${l.region}</span>
            <span class="ls-pill-country">${l.country}</span>
          </button>
        `).join('')}
      </div>

      <!-- Old/New World badge -->
      <div style="text-align:center;margin-bottom:16px">
        <span class="ls-world-badge" style="color:${label.color};background:${label.color}10;border-color:${label.color}25">
          ${oldWorld ? 'Old World' : 'New World'} · ${label.type}
        </span>
      </div>

      <!-- Interactive label -->
      <div class="ls-wine-label">
        <div class="ls-label-surface">
          <div class="ls-label-border-inner"></div>
          <div class="ls-label-accent" style="background:${label.color}"></div>
          ${label.lines.map((line, i) => {
            const isActive = activeRole === line.role;
            const sz = line.size;
            const fontSize = sz === 'xl' ? '1.6rem' : sz === 'lg' ? '1.25rem' : sz === 'md' ? '0.88rem' : sz === 'md-i' ? '0.88rem' : sz === 'sm' ? '0.68rem' : '0.55rem';
            const fontFamily = sz === 'xs' ? "'Montserrat',sans-serif" : "'Cormorant Garamond',serif";
            const fontWeight = sz === 'xl' ? '700' : sz === 'lg' ? '500' : '400';
            const fontStyle = sz === 'md-i' ? 'italic' : 'normal';
            const letterSpacing = sz === 'xl' ? '0.18em' : sz === 'sm' ? '0.15em' : sz === 'xs' ? '0.05em' : '0.04em';
            const textTransform = (sz === 'xl' || sz === 'sm') ? 'uppercase' : 'none';
            const color = sz === 'xs' ? '#8B7F6F' : sz === 'sm' ? '#6B5F4F' : '#2C1E12';
            return `
              <div class="ls-zone ${isActive ? 'active' : ''}" data-zone="${line.role}" style="margin-bottom:${sz === 'xl' ? '6' : sz === 'lg' ? '10' : sz === 'xs' ? '4' : '8'}px;${i === 0 ? '' : sz === 'xl' ? 'margin-top:8px;' : ''}">
                ${isActive ? `<span class="ls-zone-label" style="color:${label.color}">${label.teachings[line.role]?.title || line.role}</span>` : ''}
                <div style="font-size:${fontSize};font-family:${fontFamily};font-weight:${fontWeight};font-style:${fontStyle};letter-spacing:${letterSpacing};text-transform:${textTransform};color:${color};line-height:1.3;text-align:center">
                  ${line.text}
                </div>
              </div>
            `;
          }).join('')}
          <!-- Decorative divider -->
          <div class="ls-label-ornament-line">
            <span class="ls-label-ornament-dot" style="border-color:${label.color}"></span>
          </div>
        </div>
        <div class="ls-tap-hint">Tap any element to learn what it means</div>
      </div>

      <!-- Teaching panel -->
      <div id="ls-teaching"></div>

      <!-- Core rule -->
      <div class="ls-core-rule">
        <div class="ls-core-rule-label">The Core Rule</div>
        <div class="ls-core-rule-text">
          <strong>Old World</strong> labels name the <em>place</em>.
          <strong>New World</strong> labels name the <em>grape</em>.
        </div>
        <div class="ls-core-rule-footnote">This single distinction unlocks every wine label in the world.</div>
      </div>
    `;

    // Wire pills
    container.querySelectorAll('.ls-pill').forEach(btn => {
      btn.addEventListener('click', () => { selectedLabel = btn.dataset.label; activeRole = null; render(); });
    });

    // Wire zones
    container.querySelectorAll('[data-zone]').forEach(el => {
      el.addEventListener('click', () => {
        activeRole = activeRole === el.dataset.zone ? null : el.dataset.zone;
        renderTeaching(label);
        container.querySelectorAll('[data-zone]').forEach(z => z.classList.toggle('active', z.dataset.zone === activeRole));
        // Show/hide zone labels
        container.querySelectorAll('.ls-zone-label').forEach(l => l.remove());
        if (activeRole) {
          const activeEl = container.querySelector(`[data-zone="${activeRole}"]`);
          if (activeEl && label.teachings[activeRole]) {
            const lbl = document.createElement('span');
            lbl.className = 'ls-zone-label';
            lbl.style.color = label.color;
            lbl.textContent = label.teachings[activeRole].title;
            activeEl.prepend(lbl);
          }
        }
      });
    });

    renderTeaching(label);
  }

  function renderTeaching(label) {
    const el = document.getElementById('ls-teaching');
    if (!el || !activeRole || !label.teachings[activeRole]) { if (el) el.innerHTML = ''; return; }

    const t = label.teachings[activeRole];
    const levelLabel = t.level === 1 ? 'WSET 2' : t.level === 2 ? 'WSET 3' : 'WSET 4+';
    el.innerHTML = `
      <div class="ls-explanation">
        <div class="ls-expl-header">
          <div class="ls-expl-bar" style="background:${label.color}"></div>
          <div class="ls-expl-label" style="color:${label.color}">${t.title}</div>
          <span class="ls-expl-level" style="color:${label.color};border-color:${label.color}44">${levelLabel}</span>
        </div>
        <div class="ls-expl-text">${t.text}</div>
      </div>
    `;
  }

  // ── QUIZ MENU ─────────────────────────────────────────

  function renderQuizMenu(container) {
    const levels = [
      { level: 1, title: 'Beginner', sub: 'Old World vs New World basics, grape identification, ABV clues', color: '#6B9E7B' },
      { level: 2, title: 'Intermediate', sub: 'Riserva/Reserva, DOCG/DOCa hierarchies, legal aging terms', color: '#C4A265' },
      { level: 3, title: 'Advanced', sub: 'Pradikat levels, vineyard naming, bottling statements, appellations', color: '#9E6B6B' },
    ];

    container.innerHTML = `
      <div style="text-align:center;margin-bottom:28px">
        <div class="ls-quiz-icon">&#127991;</div>
        <div class="ls-quiz-heading">Test Your Label Literacy</div>
        <div class="ls-quiz-sub">Can you decode what a wine label is really telling you?</div>
      </div>
      ${levels.map(lv => {
        const count = getQuestions(lv.level).length;
        return `<button class="ls-quiz-level-btn" data-level="${lv.level}" style="border-color:${lv.color}30">
          <div class="ls-quiz-level-accent" style="background:${lv.color}"></div>
          <div class="ls-quiz-level-info">
            <div class="ls-quiz-level-title">${lv.title}</div>
            <div class="ls-quiz-level-sub">${lv.sub}</div>
          </div>
          <span class="ls-quiz-level-count" style="color:${lv.color}">${count} Q</span>
        </button>`;
      }).join('')}
    `;

    container.querySelectorAll('.ls-quiz-level-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        quizLevel = parseInt(btn.dataset.level);
        quizIndex = 0; quizScore = 0; quizStarted = true; quizComplete = false;
        selectedAnswer = null; showResult = false;
        render();
      });
    });
  }

  // ── QUIZ CARD ─────────────────────────────────────────

  function renderQuizCard(container) {
    const questions = getQuestions(quizLevel);
    const q = questions[quizIndex];
    const label = getLabel(q.labelId);

    container.innerHTML = `
      <!-- Progress -->
      <div class="ls-quiz-progress">
        <div class="ls-quiz-progress-bar"><div class="ls-quiz-progress-fill" style="width:${((quizIndex+1)/questions.length)*100}%;background:${label.color}"></div></div>
        <span class="ls-quiz-progress-num">${quizIndex+1}/${questions.length}</span>
        <span class="ls-quiz-progress-score" style="color:${label.color}">${quizScore} pts</span>
      </div>

      <!-- Mini label with highlight -->
      <div class="ls-wine-label ls-wine-label--mini">
        <div class="ls-label-surface ls-label-surface--mini">
          <div class="ls-label-border-inner"></div>
          ${label.lines.map(line => {
            const isHL = line.role === q.highlight;
            const sz = line.size;
            const fontSize = sz === 'xl' ? '1.2rem' : sz === 'lg' ? '1rem' : sz === 'md' ? '0.75rem' : sz === 'md-i' ? '0.75rem' : sz === 'sm' ? '0.6rem' : '0.5rem';
            const fontFamily = sz === 'xs' ? "'Montserrat',sans-serif" : "'Cormorant Garamond',serif";
            const fontWeight = sz === 'xl' ? '700' : sz === 'lg' ? '500' : '400';
            const fontStyle = sz === 'md-i' ? 'italic' : 'normal';
            const textTransform = (sz === 'xl' || sz === 'sm') ? 'uppercase' : 'none';
            const color = sz === 'xs' ? '#8B7F6F' : sz === 'sm' ? '#6B5F4F' : '#2C1E12';
            return `<div style="text-align:center;padding:3px 4px;margin-bottom:3px;border-radius:3px;${isHL ? `background:${label.color}18;outline:2px solid ${label.color};outline-offset:2px` : ''}">
              <div style="font-size:${fontSize};font-family:${fontFamily};font-weight:${fontWeight};font-style:${fontStyle};text-transform:${textTransform};color:${color};line-height:1.2;letter-spacing:0.04em">${line.text}</div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <!-- Question -->
      <div class="ls-quiz-question">${q.question}</div>

      <!-- Options -->
      <div class="ls-quiz-options">
        ${q.options.map((opt, i) => {
          let cls = 'ls-quiz-opt';
          if (showResult && i === q.answer) cls += ' correct';
          else if (showResult && i === selectedAnswer && i !== q.answer) cls += ' incorrect';
          else if (!showResult && selectedAnswer === i) cls += ' selected';
          return `<button class="${cls}" data-idx="${i}" ${showResult ? 'disabled' : ''}>
            <span class="ls-quiz-opt-letter">${String.fromCharCode(65+i)}</span>
            <span>${opt}</span>
            ${showResult && i === q.answer ? '<span class="ls-quiz-check">&#10003;</span>' : ''}
            ${showResult && i === selectedAnswer && i !== q.answer ? '<span class="ls-quiz-check">&#10007;</span>' : ''}
          </button>`;
        }).join('')}
      </div>

      <!-- Explanation -->
      ${showResult ? `<div class="ls-quiz-explanation ${selectedAnswer === q.answer ? 'correct' : 'incorrect'}">
        <div class="ls-quiz-expl-status">${selectedAnswer === q.answer ? 'Correct' : 'Not quite'}</div>
        <div class="ls-quiz-expl-text">${q.explanation}</div>
      </div>` : ''}

      <!-- Action -->
      <div style="margin-top:16px">
        ${!showResult ?
          `<button class="ls-quiz-action" id="ls-quiz-confirm" ${selectedAnswer === null ? 'disabled' : ''} style="border-color:${selectedAnswer !== null ? label.color : 'var(--ls-card-edge)'};${selectedAnswer !== null ? `background:${label.color}10` : ''}">Confirm Answer</button>` :
          `<button class="ls-quiz-action ls-quiz-action--next" id="ls-quiz-next" style="border-color:${label.color};background:${label.color}10">${quizIndex + 1 >= questions.length ? 'See Results' : 'Next Question'}</button>`
        }
      </div>
    `;

    // Wire options
    if (!showResult) {
      container.querySelectorAll('.ls-quiz-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          selectedAnswer = parseInt(btn.dataset.idx);
          render();
        });
      });
    }

    // Confirm
    const confirmBtn = document.getElementById('ls-quiz-confirm');
    if (confirmBtn) confirmBtn.addEventListener('click', () => {
      showResult = true;
      if (selectedAnswer === q.answer) quizScore++;
      render();
    });

    // Next
    const nextBtn = document.getElementById('ls-quiz-next');
    if (nextBtn) nextBtn.addEventListener('click', () => {
      if (quizIndex + 1 >= questions.length) { quizComplete = true; }
      else { quizIndex++; selectedAnswer = null; showResult = false; }
      render();
    });
  }

  // ── QUIZ RESULTS ──────────────────────────────────────

  function renderQuizResults(container) {
    const questions = getQuestions(quizLevel);
    const total = questions.length;
    const pct = quizScore / total;
    const levelName = quizLevel === 1 ? 'Beginner' : quizLevel === 2 ? 'Intermediate' : 'Advanced';
    const icon = pct === 1 ? '&#127942;' : pct >= 0.7 ? '&#127919;' : '&#128218;';
    const color = pct >= 0.7 ? '#6B7F5E' : pct >= 0.4 ? '#B8943E' : '#A0614B';
    const msg = pct === 1 ? 'Perfect. You can read a label like a sommelier.' :
                pct >= 0.7 ? 'Strong showing. The labels are talking and you\'re listening.' :
                'Keep studying. Every label is a lesson.';

    container.innerHTML = `
      <div style="text-align:center;padding-top:20px">
        <div style="font-size:3rem;margin-bottom:12px">${icon}</div>
        <div class="ls-quiz-result-level">${levelName} Complete</div>
        <div class="ls-quiz-result-score" style="color:${color}">${quizScore}/${total}</div>
        <div class="ls-quiz-result-msg">${msg}</div>
        <div class="ls-quiz-result-ctas">
          <button class="ls-quiz-action" id="ls-retry" style="border-color:var(--ls-gold);background:rgba(184,148,62,0.06)">Retry ${levelName}</button>
          ${quizLevel < 3 ? `<button class="ls-quiz-action ls-quiz-action--secondary" id="ls-next-level">Try ${quizLevel === 1 ? 'Intermediate' : 'Advanced'}</button>` : ''}
          <button class="ls-quiz-action ls-quiz-action--tertiary" id="ls-back-levels">Back to Levels</button>
        </div>
      </div>
    `;

    document.getElementById('ls-retry')?.addEventListener('click', () => {
      quizIndex = 0; quizScore = 0; quizComplete = false; selectedAnswer = null; showResult = false; render();
    });
    document.getElementById('ls-next-level')?.addEventListener('click', () => {
      quizLevel++; quizIndex = 0; quizScore = 0; quizComplete = false; selectedAnswer = null; showResult = false; render();
    });
    document.getElementById('ls-back-levels')?.addEventListener('click', () => {
      quizStarted = false; quizComplete = false; render();
    });
  }

  // ── Mode toggle ───────────────────────────────────────

  document.querySelectorAll('.ls-toggle-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ls-toggle-opt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      mode = btn.dataset.mode;
      // Slide the toggle
      const bar = document.querySelector('.ls-toggle-bar');
      if (bar) bar.classList.toggle('quiz-active', mode === 'quiz');
      activeRole = null;
      if (mode === 'quiz') { quizStarted = false; quizComplete = false; }
      render();
    });
  });

  // ── Init ──────────────────────────────────────────────

  async function init() {
    if (initialized) return;
    initialized = true;
    try {
      const res = await fetch('/data/label-school.json');
      data = await res.json();
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
