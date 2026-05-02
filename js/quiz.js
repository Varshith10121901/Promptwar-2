/**
 * VoteWise — Quiz Module
 *
 * Handles the interactive civic knowledge quiz: question rendering,
 * scoring, results display, and confetti celebrations.
 *
 * @module quiz
 * @version 2.1.0
 * @license MIT
 */

import { quizQuestions } from './data.js';
import { saveQuizScore } from './state.js';
import {
  QUIZ_PERFECT_SCORE,
  QUIZ_GOOD_THRESHOLD,
} from './constants.js';

// ─── Constants ────────────────────────────────────────

/** @type {string} CSS class for hiding elements */
const HIDDEN_CLASS = 'hidden';

/** @type {string} Finish button label */
const FINISH_LABEL = 'Finish Quiz';

// ─── Module State ─────────────────────────────────────

/** @type {number} Current question index (0-based). */
let currentQIdx = 0;

/** @type {number} Running score for the current quiz session. */
let currentScore = 0;

/** @type {Object|null} Reference to the confetti instance with .fire() method. */
let _confetti = null;

/** @type {Function} Lucide icon updater callback. */
let _updateIcons = () => {};

// ─── Dependency Injection ─────────────────────────────

/**
 * Injects external dependencies (confetti + icon updater).
 *
 * @param {Object|null} confettiInstance - The confetti module with a .fire() method.
 * @param {Function} iconUpdater - The lucide icon refresh function.
 * @returns {void}
 *
 * @example
 *   setQuizDeps(initConfetti(), () => lucide.createIcons());
 */
export function setQuizDeps(confettiInstance, iconUpdater) {
  _confetti = confettiInstance;
  _updateIcons = typeof iconUpdater === 'function' ? iconUpdater : () => {};
}

// ─── Quiz Rendering ───────────────────────────────────

/**
 * Renders the current quiz question and its answer options.
 * Handles answer selection, scoring, visual feedback, and progression.
 *
 * @returns {void}
 */
export function renderQuiz() {
  if (currentQIdx >= quizQuestions.length) {
    showResults();
    return;
  }

  const q = quizQuestions[currentQIdx];
  const totalQuestions = quizQuestions.length;

  // Update progress indicator
  const progressText = document.getElementById('quizProgressText');
  const progressFill = document.getElementById('quizProgressFill');
  if (progressText) {
    progressText.textContent = `Question ${currentQIdx + 1} of ${totalQuestions}`;
  }
  if (progressFill) {
    progressFill.style.width = `${(currentQIdx / totalQuestions) * 100}%`;
    progressFill.setAttribute('aria-valuenow', String(currentQIdx + 1));
    progressFill.setAttribute('aria-valuemax', String(totalQuestions));
  }

  // Render question and options
  const questionEl = document.getElementById('quizQuestion');
  if (questionEl) {
    questionEl.textContent = q.q;
  }

  const opts = document.getElementById('quizOptions');
  if (!opts) { return; }

  opts.innerHTML = q.options
    .map(
      (opt, idx) => `
    <div class="quiz-option" data-idx="${idx}" role="button" tabindex="0"
         aria-label="Option ${idx + 1}: ${opt}">${opt}</div>
  `
    )
    .join('');

  const btnNext = document.getElementById('quizNext');
  if (btnNext) { btnNext.classList.add(HIDDEN_CLASS); }

  // Attach answer handlers
  opts.querySelectorAll('.quiz-option').forEach((el) => {
    /**
     * Handles option selection via click or keyboard Enter/Space.
     * @param {Event} e - Click or keydown event.
     */
    const handleSelect = (e) => {
      if (btnNext && !btnNext.classList.contains(HIDDEN_CLASS)) { return; }
      const target = /** @type {HTMLElement} */ (e.currentTarget);
      const selected = parseInt(target.dataset.idx, 10);
      target.classList.add('selected');

      if (selected === q.answer) {
        target.classList.add('correct');
        target.setAttribute('aria-label', `Correct: ${q.options[selected]}`);
        currentScore++;
      } else {
        target.classList.add('wrong');
        target.setAttribute('aria-label', `Wrong: ${q.options[selected]}`);
        if (opts.children[q.answer]) {
          opts.children[q.answer].classList.add('correct');
        }
      }

      if (btnNext) {
        btnNext.classList.remove(HIDDEN_CLASS);
        if (currentQIdx === quizQuestions.length - 1) {
          btnNext.textContent = FINISH_LABEL;
        }
        btnNext.focus();
      }
    };

    el.addEventListener('click', handleSelect);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect(e);
      }
    });
  });
}

// ─── Results Display ──────────────────────────────────

/**
 * Displays the quiz results screen with score, feedback, icon, and confetti.
 *
 * Score thresholds (from constants.js):
 *   - Perfect (5/5): "Civic Genius!" + confetti
 *   - Good (4+): "Good job!" + star icon
 *   - Default: "Keep learning!" + book icon
 *
 * @returns {void}
 */
function showResults() {
  const quizActive = document.getElementById('quizActive');
  const quizResults = document.getElementById('quizResults');
  if (quizActive) { quizActive.classList.add(HIDDEN_CLASS); }
  if (quizResults) { quizResults.classList.remove(HIDDEN_CLASS); }

  const scoreEl = document.getElementById('resultsScore');
  if (scoreEl) {
    scoreEl.textContent = `${currentScore}/${quizQuestions.length}`;
  }

  let msg = 'Keep learning!';
  let icon = 'book-open';

  if (currentScore > QUIZ_GOOD_THRESHOLD) {
    msg = 'Good job!';
    icon = 'star';
  }
  if (currentScore >= QUIZ_PERFECT_SCORE) {
    msg = 'Perfect Score! Civic Genius!';
    icon = 'trophy';
    _confetti?.fire();
  }

  const msgEl = document.getElementById('resultsMessage');
  if (msgEl) { msgEl.textContent = msg; }

  const iconEl = document.getElementById('resultsIcon');
  if (iconEl) {
    iconEl.innerHTML = `<i data-lucide="${icon}" style="width:64px;height:64px"></i>`;
  }
  _updateIcons();

  // Announce result to screen readers
  const ariaLive = document.getElementById('ariaLive');
  if (ariaLive) {
    ariaLive.textContent = `Quiz complete. Score: ${currentScore} out of ${quizQuestions.length}. ${msg}`;
  }

  saveQuizScore(currentScore);
}

// ─── Initialization ───────────────────────────────────

/**
 * Initializes all quiz event listeners: start, next, and retry buttons.
 *
 * @returns {void}
 */
export function initQuiz() {
  document.getElementById('startQuizBtn')?.addEventListener('click', () => {
    const quizStart = document.getElementById('quizStart');
    const quizActive = document.getElementById('quizActive');
    if (quizStart) { quizStart.classList.add(HIDDEN_CLASS); }
    if (quizActive) { quizActive.classList.remove(HIDDEN_CLASS); }
    currentQIdx = 0;
    currentScore = 0;
    renderQuiz();
  });

  document.getElementById('quizNext')?.addEventListener('click', () => {
    currentQIdx++;
    renderQuiz();
  });

  document.getElementById('retryQuiz')?.addEventListener('click', () => {
    const quizResults = document.getElementById('quizResults');
    const quizStart = document.getElementById('quizStart');
    if (quizResults) { quizResults.classList.add(HIDDEN_CLASS); }
    if (quizStart) { quizStart.classList.remove(HIDDEN_CLASS); }
  });
}

// ─── Public Getters ───────────────────────────────────

/**
 * Returns the current quiz state (for testing or dashboard use).
 *
 * @returns {{ index: number, score: number, total: number }}
 *
 * @example
 *   const { score, total } = getQuizState();
 *   console.log(`${score}/${total}`);
 */
export function getQuizState() {
  return { index: currentQIdx, score: currentScore, total: quizQuestions.length };
}
