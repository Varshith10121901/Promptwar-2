/**
 * @vitest-environment jsdom
 * Tests for the State Module (js/state.js)
 *
 * Covers: setUser, setRegion, setTheme, toggleWizardStep,
 * saveQuizScore, addChatEntry, isAuthenticated, getCurrentUserId, clearState
 */
import { describe, it, expect, beforeEach } from 'vitest';

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

// Spy on CustomEvent dispatches
const dispatchedEvents = [];
const originalDispatch = window.dispatchEvent;
window.dispatchEvent = (event) => {
  if (event.type === 'stateChange') {dispatchedEvents.push(event.detail);}
  return originalDispatch.call(window, event);
};

import {
  state, setUser, setRegion, setTheme,
  toggleWizardStep, saveQuizScore, addChatEntry,
  isAuthenticated, getCurrentUserId, clearState
} from '../js/state.js';

describe('State Module', () => {
  beforeEach(() => {
    localStorage.clear();
    state.user = null;
    state.region = 'india';
    state.theme = 'light';
    state.wizardProgress = {};
    state.quizScore = 0;
    state.chatHistory = [];
    state.isLoading = false;
    state.error = null;
    dispatchedEvents.length = 0;
  });

  describe('setUser()', () => {
    it('saves user to state and localStorage', () => {
      const user = { uid: 'u1', displayName: 'Varshith', email: 'v@test.com', location: 'Hubli', provider: 'form' };
      setUser(user);
      expect(state.user).toEqual(user);
      expect(JSON.parse(localStorage.getItem('vw_user'))).toEqual(user);
    });

    it('clears user on setUser(null)', () => {
      setUser({ uid: 'u2', displayName: 'Test', email: 'test@t.com', location: 'X', provider: 'form' });
      setUser(null);
      expect(state.user).toBeNull();
      expect(localStorage.getItem('vw_user')).toBeNull();
    });

    it('dispatches stateChange event with key "user"', () => {
      setUser({ uid: 'u3', displayName: 'A', email: 'a@a.com', location: 'B', provider: 'google' });
      expect(dispatchedEvents).toContainEqual({ key: 'user' });
    });
  });

  describe('setRegion()', () => {
    it('updates region and persists', () => {
      setRegion('us');
      expect(state.region).toBe('us');
      expect(localStorage.getItem('vw_region')).toBe('us');
    });

    it('supports all four regions', () => {
      for (const r of ['india', 'us', 'uk', 'eu']) {
        setRegion(r);
        expect(state.region).toBe(r);
      }
    });

    it('dispatches stateChange event', () => {
      setRegion('uk');
      expect(dispatchedEvents).toContainEqual({ key: 'region' });
    });

    it('throws on invalid input', () => {
      expect(() => setRegion('')).toThrow();
      expect(() => setRegion(null)).toThrow();
    });
  });

  describe('setTheme()', () => {
    it('saves theme to state and localStorage', () => {
      setTheme('dark');
      expect(state.theme).toBe('dark');
      expect(localStorage.getItem('vw_theme')).toBe('dark');
    });

    it('defaults invalid themes to light', () => {
      setTheme('invalid');
      expect(state.theme).toBe('light');
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

    it('ignores invalid keys', () => {
      toggleWizardStep(null);
      toggleWizardStep('');
      expect(Object.keys(state.wizardProgress)).toHaveLength(0);
    });
  });

  describe('saveQuizScore()', () => {
    it('saves a higher score and returns true', () => {
      state.quizScore = 5;
      const result = saveQuizScore(8);
      expect(state.quizScore).toBe(8);
      expect(result).toBe(true);
    });

    it('does not overwrite a higher existing score and returns false', () => {
      state.quizScore = 9;
      const result = saveQuizScore(7);
      expect(state.quizScore).toBe(9);
      expect(result).toBe(false);
    });
  });

  describe('addChatEntry()', () => {
    it('adds question/answer pair to chatHistory', () => {
      addChatEntry('What is voting?', 'Voting is a right.');
      expect(state.chatHistory).toHaveLength(1);
      expect(state.chatHistory[0]).toEqual({ q: 'What is voting?', a: 'Voting is a right.' });
    });

    it('ignores empty inputs', () => {
      addChatEntry('', 'answer');
      addChatEntry('question', '');
      expect(state.chatHistory).toHaveLength(0);
    });
  });

  describe('isAuthenticated()', () => {
    it('returns false when no user', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('returns true when user exists', () => {
      setUser({ uid: 'u4', displayName: 'Test', email: 't@t.com', location: 'X', provider: 'form' });
      expect(isAuthenticated()).toBe(true);
    });
  });

  describe('getCurrentUserId()', () => {
    it('returns null when no user', () => {
      expect(getCurrentUserId()).toBeNull();
    });

    it('returns uid when user exists', () => {
      setUser({ uid: 'firebase-123', displayName: 'A', email: 'a@a.com', provider: 'google' });
      expect(getCurrentUserId()).toBe('firebase-123');
    });
  });

  describe('clearState()', () => {
    it('resets all state to defaults', () => {
      setUser({ uid: 'x', displayName: 'X', email: 'x@x.com', provider: 'form' });
      setRegion('us');
      setTheme('dark');
      saveQuizScore(5);
      addChatEntry('hi', 'hello');
      toggleWizardStep('us_reg');

      clearState();

      expect(state.user).toBeNull();
      expect(state.region).toBe('india');
      expect(state.theme).toBe('light');
      expect(state.quizScore).toBe(0);
      expect(state.chatHistory).toHaveLength(0);
      expect(Object.keys(state.wizardProgress)).toHaveLength(0);
    });

    it('clears all localStorage keys', () => {
      setUser({ uid: 'z', displayName: 'Z', email: 'z@z.com', provider: 'form' });
      clearState();
      expect(localStorage.getItem('vw_user')).toBeNull();
      expect(localStorage.getItem('vw_region')).toBeNull();
    });

    it('dispatches stateChange with key "reset"', () => {
      clearState();
      expect(dispatchedEvents).toContainEqual({ key: 'reset' });
    });
  });
});
