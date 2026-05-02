/**
 * VoteWise — Quiz Module Tests
 *
 * @module quiz.test
 * @version 2.1.0
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock constants
vi.mock('../js/constants.js', () => ({
  QUIZ_PERFECT_SCORE: 5,
  QUIZ_GOOD_THRESHOLD: 3,
}));

// Mock data
vi.mock('../js/data.js', () => ({
  quizQuestions: [
    { q: 'Question 1?', options: ['A', 'B', 'C', 'D'], answer: 0 },
    { q: 'Question 2?', options: ['A', 'B', 'C', 'D'], answer: 1 },
    { q: 'Question 3?', options: ['A', 'B', 'C', 'D'], answer: 2 },
    { q: 'Question 4?', options: ['A', 'B', 'C', 'D'], answer: 3 },
    { q: 'Question 5?', options: ['A', 'B', 'C', 'D'], answer: 0 },
  ],
}));

// Mock state
vi.mock('../js/state.js', () => ({
  saveQuizScore: vi.fn(),
}));

import { setQuizDeps, renderQuiz, initQuiz, getQuizState } from '../js/quiz.js';

describe('Quiz Module', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="quizProgressText"></div>
      <div id="quizProgressFill"></div>
      <div id="quizQuestion"></div>
      <div id="quizOptions"></div>
      <button id="quizNext" class="hidden"></button>
      <div id="quizActive"></div>
      <div id="quizResults" class="hidden"></div>
      <div id="resultsScore"></div>
      <div id="resultsMessage"></div>
      <div id="resultsIcon"></div>
      <div id="quizStart"></div>
      <button id="startQuizBtn"></button>
      <button id="retryQuiz"></button>
      <div id="ariaLive"></div>
    `;
    setQuizDeps(null, () => {});
  });

  describe('getQuizState()', () => {
    it('returns initial state with index 0 and score 0', () => {
      const state = getQuizState();
      expect(state.index).toBe(0);
      expect(state.score).toBe(0);
    });

    it('includes total question count', () => {
      const state = getQuizState();
      expect(state.total).toBe(5);
    });
  });

  describe('setQuizDeps()', () => {
    it('accepts confetti and icon updater without error', () => {
      expect(() => setQuizDeps({ fire: vi.fn() }, vi.fn())).not.toThrow();
    });

    it('handles null confetti gracefully', () => {
      expect(() => setQuizDeps(null, vi.fn())).not.toThrow();
    });

    it('handles non-function iconUpdater gracefully', () => {
      expect(() => setQuizDeps(null, 'not-a-function')).not.toThrow();
    });
  });

  describe('renderQuiz()', () => {
    it('renders the first question text', () => {
      renderQuiz();
      expect(document.getElementById('quizQuestion').textContent).toBe('Question 1?');
    });

    it('renders 4 answer options', () => {
      renderQuiz();
      const options = document.querySelectorAll('.quiz-option');
      expect(options.length).toBe(4);
    });

    it('updates progress text', () => {
      renderQuiz();
      expect(document.getElementById('quizProgressText').textContent).toBe('Question 1 of 5');
    });

    it('sets aria-valuenow on progress fill', () => {
      renderQuiz();
      const fill = document.getElementById('quizProgressFill');
      expect(fill.getAttribute('aria-valuenow')).toBe('1');
    });

    it('hides the next button initially', () => {
      renderQuiz();
      const btn = document.getElementById('quizNext');
      expect(btn.classList.contains('hidden')).toBe(true);
    });

    it('quiz options have role=button and tabindex=0', () => {
      renderQuiz();
      const options = document.querySelectorAll('.quiz-option');
      options.forEach((opt) => {
        expect(opt.getAttribute('role')).toBe('button');
        expect(opt.getAttribute('tabindex')).toBe('0');
      });
    });

    it('quiz options have aria-label with option text', () => {
      renderQuiz();
      const options = document.querySelectorAll('.quiz-option');
      expect(options[0].getAttribute('aria-label')).toContain('A');
    });
  });

  describe('initQuiz()', () => {
    it('attaches start button listener', () => {
      initQuiz();
      const btn = document.getElementById('startQuizBtn');
      expect(btn).not.toBeNull();
    });

    it('start button hides quizStart and shows quizActive', () => {
      initQuiz();
      document.getElementById('startQuizBtn').click();
      expect(document.getElementById('quizStart').classList.contains('hidden')).toBe(true);
      expect(document.getElementById('quizActive').classList.contains('hidden')).toBe(false);
    });

    it('retry button hides results and shows start', () => {
      initQuiz();
      document.getElementById('quizResults').classList.remove('hidden');
      document.getElementById('retryQuiz').click();
      expect(document.getElementById('quizResults').classList.contains('hidden')).toBe(true);
    });
  });
});
