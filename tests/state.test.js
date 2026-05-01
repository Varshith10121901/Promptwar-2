/**
 * @vitest-environment jsdom
 * Frontend State Module Tests
 */
import { describe, it, expect, beforeEach } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Import after mocking localStorage
import { state, setUser, setRegion, toggleWizardStep, saveQuizScore } from '../js/state.js';

describe('State Module', () => {
  beforeEach(() => {
    localStorage.clear();
    state.user = null;
    state.region = 'india';
    state.wizardProgress = {};
    state.quizScore = 0;
  });

  describe('setUser()', () => {
    it('saves user to state and localStorage', () => {
      const user = { name: 'Varshith', email: 'v@test.com', location: 'Hubli' };
      setUser(user);
      expect(state.user).toEqual(user);
      expect(JSON.parse(localStorage.getItem('vw_user'))).toEqual(user);
    });

    it('clears user on setUser(null)', () => {
      setUser(null);
      expect(state.user).toBeNull();
      expect(localStorage.getItem('vw_user')).toBeNull();
    });
  });

  describe('setRegion()', () => {
    it('updates region in state and persists it', () => {
      setRegion('us');
      expect(state.region).toBe('us');
      expect(localStorage.getItem('vw_region')).toBe('us');
    });

    it('supports all four regions', () => {
      for (const region of ['india', 'us', 'uk', 'eu']) {
        setRegion(region);
        expect(state.region).toBe(region);
      }
    });
  });

  describe('toggleWizardStep()', () => {
    it('marks a step as complete on first toggle', () => {
      toggleWizardStep('india_step1');
      expect(state.wizardProgress['india_step1']).toBe(true);
    });

    it('marks a step as incomplete on second toggle', () => {
      toggleWizardStep('india_step1');
      toggleWizardStep('india_step1');
      expect(state.wizardProgress['india_step1']).toBe(false);
    });

    it('persists progress to localStorage', () => {
      toggleWizardStep('us_step2');
      const stored = JSON.parse(localStorage.getItem('vw_wizard'));
      expect(stored['us_step2']).toBe(true);
    });
  });

  describe('saveQuizScore()', () => {
    it('saves a higher score', () => {
      state.quizScore = 5;
      saveQuizScore(8);
      expect(state.quizScore).toBe(8);
    });

    it('does not overwrite a higher existing score', () => {
      state.quizScore = 9;
      saveQuizScore(7);
      expect(state.quizScore).toBe(9);
    });
  });
});
