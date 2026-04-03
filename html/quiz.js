/**
 * quiz.js — Interactive multiple-choice quiz engine
 * Computing and AI Ethics, Brendan Shea PhD
 *
 * Usage:
 *   <div id="quiz-app" data-src="quiz-data/quiz_01.json"></div>
 *   <script src="quiz.js"></script>
 *
 * Features:
 *   - Loads question data from a JSON file
 *   - One question at a time with immediate per-answer feedback
 *   - Keyboard shortcuts: 1–4 to select, Enter/Space to advance
 *   - Progress saved to localStorage (keyed by quiz id)
 *   - Retry-missed-questions mode
 *   - Score summary with per-question breakdown
 */

'use strict';

(function () {

  /* ── Constants ─────────────────────────────────────────── */
  const STORAGE_PREFIX = 'aie_quiz_';
  const LETTERS = ['A', 'B', 'C', 'D', 'E'];

  /* ── Module-level state ────────────────────────────────── */
  let quiz        = null;   // parsed JSON data
  let activeQ     = [];     // question objects for current session
  let currentIdx  = 0;      // index into activeQ
  let answered    = false;  // has current question been answered?
  let sessionAns  = {};     // { questionId: selectedOptionIndex }
  let savedState  = null;   // from localStorage

  let container   = null;   // #quiz-app element
  let keyHandler  = null;   // current keyboard listener reference

  /* ── Bootstrap ─────────────────────────────────────────── */
  function init() {
    container = document.getElementById('quiz-app');
    if (!container) return;

    const src = container.dataset.src;
    if (!src) { renderError('Missing data-src attribute on #quiz-app.'); return; }

    fetch(src)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => {
        quiz = data;
        savedState = loadState();
        renderStart();
      })
      .catch(e => renderError('Could not load quiz: ' + e.message));
  }

  /* ── localStorage ──────────────────────────────────────── */
  function storageKey()  { return STORAGE_PREFIX + quiz.id; }

  function loadState() {
    try {
      const raw = localStorage.getItem(storageKey());
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function saveState() {
    // Merge session answers into any existing saved answers.
    const merged = Object.assign({}, savedState && savedState.answers, sessionAns);
    const score  = quiz.questions.filter(q => merged[q.id] === q.correct).length;
    try {
      localStorage.setItem(storageKey(), JSON.stringify({
        savedAt: new Date().toISOString(),
        score,
        total:   quiz.questions.length,
        answers: merged
      }));
    } catch { /* storage quota exceeded — silently ignore */ }
    savedState = loadState();
  }

  function clearState() {
    try { localStorage.removeItem(storageKey()); } catch { }
    savedState = null;
  }

  /* ── Start screen ──────────────────────────────────────── */
  function renderStart() {
    detachKeyHandler();

    const hasPrev  = savedState !== null;
    const missedN  = hasPrev
      ? quiz.questions.filter(q => savedState.answers[q.id] !== q.correct).length
      : 0;

    container.innerHTML = `
      <div class="qz-start">
        <p class="qz-meta">${esc(quiz.chapter ? 'Chapter ' + quiz.chapter : '')}</p>
        <h1 class="qz-title">${esc(quiz.title)}</h1>
        <p class="qz-description">${esc(quiz.description)}</p>

        ${hasPrev ? `
          <div class="qz-prev-result" aria-label="Previous attempt summary">
            <span class="qz-prev-score">${savedState.score} / ${savedState.total}</span>
            <span class="qz-prev-label">on your last attempt &ensp;&middot;&ensp; ${fmtDate(savedState.savedAt)}</span>
          </div>` : ''}

        <div class="qz-start-actions">
          <button class="qz-btn qz-btn-primary" id="qz-start-all">
            Start quiz &ensp;<span class="qz-badge">${quiz.questions.length} questions</span>
          </button>
          ${hasPrev && missedN > 0 ? `
          <button class="qz-btn qz-btn-secondary" id="qz-start-retry">
            Retry missed &ensp;<span class="qz-badge">${missedN} question${missedN === 1 ? '' : 's'}</span>
          </button>` : ''}
          ${hasPrev ? `
          <button class="qz-btn qz-btn-ghost" id="qz-clear-progress">Reset progress</button>` : ''}
        </div>

        <p class="qz-tip">Tip: press <kbd>1</kbd>–<kbd>${Math.min(4, quiz.questions[0]?.options.length || 4)}</kbd> to choose, <kbd>Enter</kbd> or <kbd>Space</kbd> to continue.</p>
      </div>
    `;

    document.getElementById('qz-start-all')
      .addEventListener('click', () => startSession('all'));
    document.getElementById('qz-start-retry')
      ?.addEventListener('click', () => startSession('retry'));
    document.getElementById('qz-clear-progress')
      ?.addEventListener('click', () => { clearState(); renderStart(); });
  }

  /* ── Session management ────────────────────────────────── */
  function startSession(mode) {
    sessionAns  = {};
    currentIdx  = 0;
    answered    = false;

    if (mode === 'retry' && savedState) {
      activeQ = quiz.questions.filter(q => savedState.answers[q.id] !== q.correct);
      if (activeQ.length === 0) activeQ = [...quiz.questions]; // safety fallback
    } else {
      activeQ = [...quiz.questions];
    }

    renderQuestion();
  }

  /* ── Question rendering ────────────────────────────────── */
  function renderQuestion() {
    detachKeyHandler();
    answered   = false;
    const q    = activeQ[currentIdx];
    const pct  = Math.round((currentIdx / activeQ.length) * 100);
    const num  = currentIdx + 1;

    container.innerHTML = `
      <div class="qz-progress" role="progressbar"
           aria-valuenow="${num}" aria-valuemax="${activeQ.length}"
           aria-label="Question ${num} of ${activeQ.length}">
        <div class="qz-progress-fill" style="width:${pct}%"></div>
        <span class="qz-progress-label">${num} / ${activeQ.length}</span>
      </div>

      <div class="qz-card" id="qz-card">
        <p class="qz-question">${esc(q.question)}</p>

        <ol class="qz-options" id="qz-options" aria-label="Answer options">
          ${q.options.map((opt, i) => `
            <li>
              <button class="qz-option" data-idx="${i}"
                      aria-label="Option ${LETTERS[i]}: ${esc(opt)}">
                <span class="qz-letter" aria-hidden="true">${LETTERS[i]}</span>
                <span class="qz-opt-text">${esc(opt)}</span>
              </button>
            </li>`).join('')}
        </ol>

        <div class="qz-feedback" id="qz-feedback" aria-live="polite" aria-atomic="true"></div>
      </div>
    `;

    document.querySelectorAll('.qz-option').forEach(btn =>
      btn.addEventListener('click', () => selectAnswer(parseInt(btn.dataset.idx)))
    );

    attachKeyHandler(q.options.length);
  }

  /* ── Answer handling ───────────────────────────────────── */
  function selectAnswer(chosen) {
    if (answered) return;
    answered = true;

    const q         = activeQ[currentIdx];
    const correct   = q.correct;
    const isRight   = chosen === correct;
    sessionAns[q.id] = chosen;

    // Mark options
    document.querySelectorAll('.qz-option').forEach((btn, i) => {
      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
      if (i === correct)               btn.classList.add('qz-correct');
      else if (i === chosen && !isRight) btn.classList.add('qz-incorrect');
    });

    // Build section review link (same directory as quiz page)
    const reviewLink = q.section
      ? ` <a class="qz-review-link" href="${esc(quiz.chapter_url)}#${esc(q.section)}"
             target="_blank" rel="noopener">Review this section &#8594;</a>`
      : '';

    // Render feedback
    const fb = document.getElementById('qz-feedback');
    fb.innerHTML = `
      <div class="qz-feedback-header ${isRight ? 'qz-fb-correct' : 'qz-fb-incorrect'}">
        <span class="qz-fb-icon" aria-hidden="true">${isRight ? '✓' : '✗'}</span>
        ${isRight ? 'Correct!' : `Not quite — the correct answer is <strong>${LETTERS[correct]}</strong>.`}
      </div>
      <p class="qz-explanation">${esc(q.explanation)}${reviewLink}</p>
    `;

    // Advance button
    const isLast = currentIdx === activeQ.length - 1;
    const advBtn = document.createElement('button');
    advBtn.className   = 'qz-btn qz-btn-primary qz-advance';
    advBtn.id          = 'qz-advance';
    advBtn.textContent = isLast ? 'See results' : 'Next question →';
    fb.after(advBtn);
    advBtn.focus();

    advBtn.addEventListener('click', advance);
  }

  function advance() {
    detachKeyHandler();
    currentIdx++;
    if (currentIdx >= activeQ.length) {
      saveState();
      renderResults();
    } else {
      renderQuestion();
    }
  }

  /* ── Results screen ─────────────────────────────────────── */
  function renderResults() {
    detachKeyHandler();

    const correct   = activeQ.filter(q => sessionAns[q.id] === q.correct).length;
    const total     = activeQ.length;
    const pct       = Math.round((correct / total) * 100);
    const missedN   = total - correct;

    const rows = activeQ.map(q => {
      const ok = sessionAns[q.id] === q.correct;
      const chosen = sessionAns[q.id];
      return `
        <tr class="${ok ? 'qz-row-ok' : 'qz-row-miss'}">
          <td class="qz-bd-status" aria-label="${ok ? 'Correct' : 'Incorrect'}">${ok ? '✓' : '✗'}</td>
          <td class="qz-bd-q">${esc(q.question)}</td>
          <td class="qz-bd-ans">
            ${ok
              ? esc(q.options[q.correct])
              : `<s class="qz-bd-wrong">${esc(q.options[chosen])}</s><br><span class="qz-bd-right">${esc(q.options[q.correct])}</span>`
            }
          </td>
        </tr>`;
    }).join('');

    container.innerHTML = `
      <div class="qz-results">
        <div class="qz-score-wrap">
          <div class="qz-score-circle ${pct >= 80 ? 'qz-sc-great' : pct >= 60 ? 'qz-sc-ok' : 'qz-sc-low'}"
               aria-label="Score: ${correct} out of ${total}">
            <span class="qz-sc-num">${correct}</span>
            <span class="qz-sc-denom">/ ${total}</span>
          </div>
          <p class="qz-score-msg">${scoreMessage(pct)}</p>
          ${savedState && activeQ.length < quiz.questions.length
            ? `<p class="qz-overall">Overall score across all questions:
               <strong>${savedState.score} / ${savedState.total}</strong></p>`
            : ''}
        </div>

        <div class="qz-breakdown-wrap">
          <h2 class="qz-breakdown-heading">Question breakdown</h2>
          <table class="qz-breakdown" aria-label="Results breakdown">
            <thead>
              <tr>
                <th scope="col"></th>
                <th scope="col">Question</th>
                <th scope="col">Answer</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>

        <div class="qz-result-actions">
          <button class="qz-btn qz-btn-primary" id="qz-restart">Start over</button>
          ${missedN > 0
            ? `<button class="qz-btn qz-btn-secondary" id="qz-retry-missed">
                 Retry ${missedN} missed question${missedN === 1 ? '' : 's'}
               </button>`
            : ''}
          <a class="qz-btn qz-btn-ghost" href="${esc(quiz.chapter_url)}">
            Back to chapter &#8594;
          </a>
        </div>
      </div>
    `;

    document.getElementById('qz-restart').addEventListener('click', () => {
      clearState();
      renderStart();
    });
    document.getElementById('qz-retry-missed')?.addEventListener('click', () => {
      // After a retry session, update savedState so retry uses freshest answers
      startSession('retry');
    });
  }

  /* ── Keyboard support ──────────────────────────────────── */
  function attachKeyHandler(optionCount) {
    keyHandler = function (e) {
      // Number keys 1–4 to select an option
      if (!answered) {
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= optionCount) {
          e.preventDefault();
          selectAnswer(n - 1);
          return;
        }
      }
      // Enter or Space to advance once answered
      if (answered && (e.key === 'Enter' || e.key === ' ')) {
        const btn = document.getElementById('qz-advance');
        if (btn) { e.preventDefault(); btn.click(); }
      }
    };
    document.addEventListener('keydown', keyHandler);
  }

  function detachKeyHandler() {
    if (keyHandler) {
      document.removeEventListener('keydown', keyHandler);
      keyHandler = null;
    }
  }

  /* ── Helpers ────────────────────────────────────────────── */
  function scoreMessage(pct) {
    if (pct === 100) return 'Perfect score — excellent work!';
    if (pct >= 80)  return 'Great work!';
    if (pct >= 60)  return 'Good effort — review the missed questions and try again.';
    return 'Keep studying — re-read the chapter and give it another shot.';
  }

  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString(undefined,
        { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return ''; }
  }

  // Escape HTML special characters to prevent XSS
  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderError(msg) {
    if (container) {
      container.innerHTML = `<p class="qz-error" role="alert">${esc(msg)}</p>`;
    }
  }

  /* ── Entry point ────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
