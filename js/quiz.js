/**
 * VoteWise — Quiz Module
 *
 * Handles the interactive civic knowledge quiz: question rendering,
 * scoring, results display, and confetti celebrations.
 *
 * @module quiz
 */

import { quizQuestions } from './data.js';
import { saveQuizScore } from './state.js';

/** @type {number} Current question index (0-based). */
let currentQIdx = 0;

/** @type {number} Running score for the current quiz session. */
let currentScore = 0;

/** @type {Function|null} Reference to the confetti.fire() function. */
let _confetti = null;

/** @type {Function} Lucide icon updater. */
let _updateIcons = () => {};

/**
 * Injects external dependencies.
 * @param {Object|null} confettiInstance - The confetti module with a .fire() method.
 * @param {Function} iconUpdater - The lucide icon refresh function.
 */
export function setQuizDeps(confettiInstance, iconUpdater) {
  _confetti = confettiInstance;
  _updateIcons = iconUpdater;
}

/**
 * Renders the current quiz question and its options.
 * Handles answer selection, scoring, and progression.
 */
export function renderQuiz() {
  if (currentQIdx >= quizQuestions.length) {
    showResults();
    return;
  }

  const q = quizQuestions[currentQIdx];
  document.getElementById('quizProgressText').textContent =
    `Question ${currentQIdx + 1} of ${quizQuestions.length}`;
  document.getElementById('quizProgressFill').style.width =
    `${(currentQIdx / quizQuestions.length) * 100}%`;

  document.getElementById('quizQuestion').textContent = q.q;
  const opts = document.getElementById('quizOptions');
  opts.innerHTML = q.options
    .map(
      (opt, idx) => `
    <div class="quiz-option" data-idx="${idx}" role="button" tabindex="0" aria-label="Option: ${opt}">${opt}</div>
  `
    )
    .join('');

  const btnNext = document.getElementById('quizNext');
  btnNext.classList.add('hidden');

  opts.querySelectorAll('.quiz-option').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (!btnNext.classList.contains('hidden')) return;
      const selected = parseInt(e.target.dataset.idx);
      e.target.classList.add('selected');

      if (selected === q.answer) {
        e.target.classList.add('correct');
        currentScore++;
      } else {
        e.target.classList.add('wrong');
        opts.children[q.answer].classList.add('correct');
      }

      btnNext.classList.remove('hidden');
      if (currentQIdx === quizQuestions.length - 1) btnNext.textContent = 'Finish Quiz';
    });
  });
}

/**
 * Displays the quiz results screen with score, feedback message, and badges.
 */
function showResults() {
  document.getElementById('quizActive').classList.add('hidden');
  document.getElementById('quizResults').classList.remove('hidden');

  document.getElementById('resultsScore').textContent = `${currentScore}/${quizQuestions.length}`;

  let msg = 'Keep learning!';
  let icon = 'book-open';
  if (currentScore > 3) {
    msg = 'Good job!';
    icon = 'star';
  }
  if (currentScore === 5) {
    msg = 'Perfect Score! Civic Genius!';
    icon = 'trophy';
    _confetti?.fire();
  }

  document.getElementById('resultsMessage').textContent = msg;
  document.getElementById('resultsIcon').innerHTML =
    `<i data-lucide="${icon}" style="width:64px;height:64px"></i>`;
  _updateIcons();

  saveQuizScore(currentScore);
}

/**
 * Initializes all quiz event listeners: start, next, and retry buttons.
 */
export function initQuiz() {
  document.getElementById('startQuizBtn')?.addEventListener('click', () => {
    document.getElementById('quizStart').classList.add('hidden');
    document.getElementById('quizActive').classList.remove('hidden');
    currentQIdx = 0;
    currentScore = 0;
    renderQuiz();
  });

  document.getElementById('quizNext')?.addEventListener('click', () => {
    currentQIdx++;
    renderQuiz();
  });

  document.getElementById('retryQuiz')?.addEventListener('click', () => {
    document.getElementById('quizResults').classList.add('hidden');
    document.getElementById('quizStart').classList.remove('hidden');
  });
}

/**
 * Returns the current score (for testing or dashboard use).
 * @returns {{ index: number, score: number }}
 */
export function getQuizState() {
  return { index: currentQIdx, score: currentScore };
}
