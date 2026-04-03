/**
 * quiz.js — Interactive quiz engine
 * Computing and AI Ethics, Brendan Shea PhD
 *
 * Supported question types:
 *   mcq      — Multiple choice (one correct answer, immediate feedback)
 *   multiple — Multiple response (select all that apply, submit to score)
 *   matching — Match left items to right items via dropdowns, submit to score
 *
 * Usage:
 *   <div id="quiz-app" data-src="quiz-data/quiz_01.json"></div>
 *   <script src="quiz.js"></script>
 */

'use strict';

(function () {

  /* ── Constants ─────────────────────────────────────────── */
  const STORAGE_PREFIX = 'aie_quiz_';
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

  /* ── Module-level state ────────────────────────────────── */
  let quiz       = null;   // parsed JSON
  let activeQ    = [];     // questions for current session
  let currentIdx = 0;      // index into activeQ
  let answered   = false;  // has current question been committed?
  let sessionAns = {};     // { questionId: answer }
                           //   mcq:      number
                           //   multiple: number[] (sorted)
                           //   matching: number[] where [leftIdx] = chosenRightIdx
  let savedState = null;   // from localStorage

  let container  = null;   // #quiz-app DOM element
  let keyHandler = null;   // active keydown listener (MCQ only)

  /* ── Bootstrap ─────────────────────────────────────────── */
  function init() {
    container = document.getElementById('quiz-app');
    if (!container) return;

    const src = container.dataset.src;
    if (!src) { renderError('Missing data-src attribute on #quiz-app.'); return; }

    fetch(src)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => { quiz = data; savedState = loadState(); renderStart(); })
      .catch(e => renderError('Could not load quiz: ' + e.message));
  }

  /* ── localStorage ──────────────────────────────────────── */
  function storageKey() { return STORAGE_PREFIX + quiz.id; }

  function loadState() {
    try { const r = localStorage.getItem(storageKey()); return r ? JSON.parse(r) : null; }
    catch { return null; }
  }

  function saveState() {
    const merged = Object.assign({}, savedState && savedState.answers, sessionAns);
    const score  = quiz.questions.filter(q => isAnswerCorrect(merged[q.id], q)).length;
    try {
      localStorage.setItem(storageKey(), JSON.stringify({
        savedAt: new Date().toISOString(),
        score,
        total:   quiz.questions.length,
        answers: merged
      }));
    } catch { /* quota exceeded — ignore */ }
    savedState = loadState();
  }

  function clearState() {
    try { localStorage.removeItem(storageKey()); } catch { }
    savedState = null;
  }

  /* ── Correctness (type-aware) ──────────────────────────── */
  function isAnswerCorrect(userAnswer, q) {
    if (userAnswer === undefined || userAnswer === null) return false;
    const type = q.type || 'mcq';

    if (type === 'mcq') {
      return userAnswer === q.correct;
    }
    if (type === 'multiple') {
      if (!Array.isArray(userAnswer) || !Array.isArray(q.correct)) return false;
      const a = [...userAnswer].sort((x, y) => x - y);
      const c = [...q.correct].sort((x, y) => x - y);
      return a.length === c.length && a.every((v, i) => v === c[i]);
    }
    if (type === 'matching') {
      // userAnswer[i] is the chosen right-side original index for left item i.
      // Correct when every left item i is paired with right item i.
      if (!Array.isArray(userAnswer)) return false;
      return q.pairs.every((_, i) => userAnswer[i] === i);
    }
    return false;
  }

  /* ── Start screen ──────────────────────────────────────── */
  function renderStart() {
    detachKeyHandler();

    const hasPrev = savedState !== null;
    const missedN = hasPrev
      ? quiz.questions.filter(q => !isAnswerCorrect(savedState.answers[q.id], q)).length
      : 0;
    // Describe the first question's type for the keyboard tip
    const firstType = quiz.questions[0]?.type || 'mcq';
    const tipText   = firstType === 'mcq'
      ? `Tip: press <kbd>1</kbd>–<kbd>${quiz.questions[0].options.length}</kbd> to choose an answer, <kbd>Enter</kbd> or <kbd>Space</kbd> to advance.`
      : 'Tip: matching and multiple-response questions use a Submit button; multiple-choice questions support keyboard shortcuts.';

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

        <p class="qz-tip">${tipText}</p>
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
    sessionAns = {};
    currentIdx = 0;
    answered   = false;

    if (mode === 'retry' && savedState) {
      activeQ = quiz.questions.filter(q => !isAnswerCorrect(savedState.answers[q.id], q));
      if (activeQ.length === 0) activeQ = [...quiz.questions];
    } else {
      activeQ = [...quiz.questions];
    }
    renderQuestion();
  }

  /* ── Question shell (shared) ────────────────────────────── */
  function renderQuestion() {
    detachKeyHandler();
    answered   = false;
    const q    = activeQ[currentIdx];
    const type = q.type || 'mcq';
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
        ${type !== 'mcq' ? `<span class="qz-type-tag">${typeLabel(type)}</span>` : ''}
        <p class="qz-question">${esc(q.question)}</p>
        <div id="qz-options-area"></div>
        <div class="qz-feedback" id="qz-feedback" aria-live="polite" aria-atomic="true"></div>
      </div>
    `;

    const area = document.getElementById('qz-options-area');
    if      (type === 'matching') renderMatching(q, area);
    else if (type === 'multiple') renderMultiple(q, area);
    else                          renderMCQ(q, area);
  }

  function typeLabel(type) {
    if (type === 'multiple') return 'Select all that apply';
    if (type === 'matching') return 'Matching';
    return '';
  }

  /* ════════════════════════════════════════════════════════
     MCQ
  ════════════════════════════════════════════════════════ */
  function renderMCQ(q, area) {
    area.innerHTML = `
      <ol class="qz-options" aria-label="Answer options">
        ${q.options.map((opt, i) => `
          <li>
            <button class="qz-option" data-idx="${i}"
                    aria-label="Option ${LETTERS[i]}: ${esc(opt)}">
              <span class="qz-letter" aria-hidden="true">${LETTERS[i]}</span>
              <span class="qz-opt-text">${esc(opt)}</span>
            </button>
          </li>`).join('')}
      </ol>
    `;

    area.querySelectorAll('.qz-option').forEach(btn =>
      btn.addEventListener('click', () => commitMCQ(parseInt(btn.dataset.idx)))
    );
    attachKeyHandler(q.options.length);
  }

  function commitMCQ(chosen) {
    if (answered) return;
    answered = true;

    const q       = activeQ[currentIdx];
    const correct = q.correct;
    const isRight = chosen === correct;
    sessionAns[q.id] = chosen;

    document.querySelectorAll('.qz-option').forEach((btn, i) => {
      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
      if (i === correct)              btn.classList.add('qz-correct');
      else if (i === chosen && !isRight) btn.classList.add('qz-incorrect');
    });

    const headerMsg = isRight
      ? 'Correct!'
      : `Not quite — the correct answer is <strong>${LETTERS[correct]}</strong>.`;
    showFeedback(isRight, q, headerMsg);
  }

  /* ════════════════════════════════════════════════════════
     MULTIPLE RESPONSE
  ════════════════════════════════════════════════════════ */
  function renderMultiple(q, area) {
    area.innerHTML = `
      <ul class="qz-checkboxes" aria-label="Answer options — select all that apply">
        ${q.options.map((opt, i) => `
          <li>
            <label class="qz-cb-label">
              <input type="checkbox" class="qz-cb-input" value="${i}"
                     aria-label="${esc(opt)}">
              <span class="qz-cb-box" aria-hidden="true"></span>
              <span class="qz-cb-letter" aria-hidden="true">${LETTERS[i]}</span>
              <span class="qz-cb-text">${esc(opt)}</span>
            </label>
          </li>`).join('')}
      </ul>
      <button class="qz-btn qz-btn-primary qz-submit-btn" id="qz-submit-multi">
        Submit answers
      </button>
    `;

    document.getElementById('qz-submit-multi').addEventListener('click', commitMultiple);
  }

  function commitMultiple() {
    if (answered) return;
    answered = true;

    const q        = activeQ[currentIdx];
    const selected = [];
    document.querySelectorAll('.qz-cb-input:checked')
      .forEach(cb => selected.push(parseInt(cb.value)));
    selected.sort((a, b) => a - b);
    sessionAns[q.id] = selected;

    const isRight    = isAnswerCorrect(selected, q);
    const correctSet = new Set(q.correct);
    const chosenSet  = new Set(selected);

    // Colour each option: hit / missed / wrong / neutral
    document.querySelectorAll('.qz-cb-input').forEach(cb => {
      cb.disabled = true;
      const i     = parseInt(cb.value);
      const label = cb.closest('.qz-cb-label');
      if      ( correctSet.has(i) &&  chosenSet.has(i)) label.classList.add('qz-cb-hit');
      else if ( correctSet.has(i) && !chosenSet.has(i)) label.classList.add('qz-cb-missed');
      else if (!correctSet.has(i) &&  chosenSet.has(i)) label.classList.add('qz-cb-wrong');
      // !correct && !chosen → no highlight (correctly ignored)
    });

    document.getElementById('qz-submit-multi').remove();

    const headerMsg = isRight
      ? 'Correct!'
      : 'Not quite — the highlighting above shows what was required.';
    showFeedback(isRight, q, headerMsg);
  }

  /* ════════════════════════════════════════════════════════
     MATCHING
  ════════════════════════════════════════════════════════ */
  function renderMatching(q, area) {
    // Fisher-Yates shuffle of right-side indices for dropdown display order
    const order = q.pairs.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }

    const optionItems = order
      .map(origIdx => `<option value="${origIdx}">${esc(q.pairs[origIdx].right)}</option>`)
      .join('');

    area.innerHTML = `
      <table class="qz-match-table" aria-label="Matching question">
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Match</th>
          </tr>
        </thead>
        <tbody>
          ${q.pairs.map((pair, i) => `
            <tr id="qz-match-row-${i}">
              <td class="qz-match-left">${esc(pair.left)}</td>
              <td class="qz-match-right">
                <select class="qz-match-select" data-left="${i}"
                        aria-label="Match for: ${esc(pair.left)}">
                  <option value="-1">— select —</option>
                  ${optionItems}
                </select>
                <span class="qz-match-verdict" aria-hidden="true"></span>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
      <button class="qz-btn qz-btn-primary qz-submit-btn" id="qz-submit-match">
        Submit answers
      </button>
    `;

    document.getElementById('qz-submit-match').addEventListener('click', commitMatching);
  }

  function commitMatching() {
    if (answered) return;

    const q       = activeQ[currentIdx];
    const selects = [...document.querySelectorAll('.qz-match-select')];

    // Require all rows to be filled
    if (selects.some(s => parseInt(s.value) === -1)) {
      showMatchHint('Please match all items before submitting.');
      return;
    }

    answered = true;
    const userAnswer = selects.map(s => parseInt(s.value));
    sessionAns[q.id] = userAnswer;

    const isRight = isAnswerCorrect(userAnswer, q);

    // Mark each row correct / incorrect
    selects.forEach((sel, i) => {
      sel.disabled = true;
      const ok      = userAnswer[i] === i;
      const row     = document.getElementById(`qz-match-row-${i}`);
      const verdict = row.querySelector('.qz-match-verdict');
      row.classList.add(ok ? 'qz-row-ok' : 'qz-row-miss');
      if (ok) {
        verdict.textContent = '✓';
        verdict.classList.add('qz-verdict-ok');
      } else {
        verdict.innerHTML =
          `✗ <span class="qz-correct-ans">${esc(q.pairs[i].right)}</span>`;
        verdict.classList.add('qz-verdict-miss');
      }
    });

    document.getElementById('qz-submit-match').remove();

    const headerMsg = isRight
      ? 'Correct — all pairs matched!'
      : 'Not quite — the correct matches are shown above.';
    showFeedback(isRight, q, headerMsg);
  }

  function showMatchHint(msg) {
    let hint = document.getElementById('qz-match-hint');
    if (!hint) {
      hint = document.createElement('p');
      hint.id = 'qz-match-hint';
      hint.className = 'qz-match-hint';
      document.getElementById('qz-submit-match').before(hint);
    }
    hint.textContent = msg;
  }

  /* ════════════════════════════════════════════════════════
     SHARED FEEDBACK & ADVANCE
  ════════════════════════════════════════════════════════ */
  function showFeedback(isRight, q, headerMsg) {
    const reviewLink = q.section
      ? ` <a class="qz-review-link" href="${esc(quiz.chapter_url)}#${esc(q.section)}"
             target="_blank" rel="noopener">Review this section &#8594;</a>`
      : '';

    const fb = document.getElementById('qz-feedback');
    fb.innerHTML = `
      <div class="qz-feedback-header ${isRight ? 'qz-fb-correct' : 'qz-fb-incorrect'}">
        <span class="qz-fb-icon" aria-hidden="true">${isRight ? '✓' : '✗'}</span>
        ${headerMsg}
      </div>
      <p class="qz-explanation">${esc(q.explanation)}${reviewLink}</p>
    `;

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
    if (currentIdx >= activeQ.length) { saveState(); renderResults(); }
    else renderQuestion();
  }

  /* ════════════════════════════════════════════════════════
     RESULTS SCREEN
  ════════════════════════════════════════════════════════ */
  function renderResults() {
    detachKeyHandler();

    const correct = activeQ.filter(q => isAnswerCorrect(sessionAns[q.id], q)).length;
    const total   = activeQ.length;
    const pct     = Math.round((correct / total) * 100);
    const missedN = total - correct;

    const rows = activeQ.map(q => {
      const ok      = isAnswerCorrect(sessionAns[q.id], q);
      const type    = q.type || 'mcq';
      const ans     = sessionAns[q.id];
      let ansCell   = '';

      if (type === 'mcq') {
        ansCell = ok
          ? esc(q.options[q.correct])
          : `<s class="qz-bd-wrong">${esc(q.options[ans])}</s>` +
            `<br><span class="qz-bd-right">${esc(q.options[q.correct])}</span>`;
      } else if (type === 'multiple') {
        ansCell = ok
          ? 'All required options selected'
          : `Required: ${q.correct.map(i => esc(q.options[i])).join('; ')}`;
      } else if (type === 'matching') {
        ansCell = ok
          ? 'All pairs matched correctly'
          : 'One or more pairs mismatched — see feedback above';
      }

      return `
        <tr class="${ok ? 'qz-row-ok' : 'qz-row-miss'}">
          <td class="qz-bd-status">${ok ? '✓' : '✗'}</td>
          <td class="qz-bd-q">${esc(q.question)}</td>
          <td class="qz-bd-ans">${ansCell}</td>
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
            ? `<p class="qz-overall">Overall score: <strong>${savedState.score} / ${savedState.total}</strong></p>`
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

    document.getElementById('qz-restart')
      .addEventListener('click', () => { clearState(); renderStart(); });
    document.getElementById('qz-retry-missed')
      ?.addEventListener('click', () => startSession('retry'));
  }

  /* ════════════════════════════════════════════════════════
     KEYBOARD (MCQ only)
  ════════════════════════════════════════════════════════ */
  function attachKeyHandler(optionCount) {
    keyHandler = function (e) {
      if (!answered) {
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= optionCount) { e.preventDefault(); commitMCQ(n - 1); return; }
      }
      if (answered && (e.key === 'Enter' || e.key === ' ')) {
        const btn = document.getElementById('qz-advance');
        if (btn) { e.preventDefault(); btn.click(); }
      }
    };
    document.addEventListener('keydown', keyHandler);
  }

  function detachKeyHandler() {
    if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
  }

  /* ── Helpers ────────────────────────────────────────────── */
  function scoreMessage(pct) {
    if (pct === 100) return 'Perfect score — excellent work!';
    if (pct >= 80)  return 'Great work!';
    if (pct >= 60)  return 'Good effort — review the missed questions and try again.';
    return 'Keep studying — re-read the chapter and give it another shot.';
  }

  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return ''; }
  }

  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function renderError(msg) {
    if (container) container.innerHTML = `<p class="qz-error" role="alert">${esc(msg)}</p>`;
  }

  /* ── Entry point ────────────────────────────────────────── */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
