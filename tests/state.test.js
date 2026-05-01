/**
 * @vitest-environment jsdom
 * Tests for the State Module (js/state.js)
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
  if (event.type === 'stateChange') dispatchedEvents.push(event.detail);
  return originalDispatch.call(window, event);
};

import {
  state, setUser, setRegion, setTheme,
  toggleWizardStep, saveQuizScore, addChatEntry, isAuthenticated
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
    dispatchedEvents.length = 0;
  });

  describe('setUser()', () => {
    it('saves user to state and localStorage', () => {
      const user = { name: 'Varshith', email: 'v@test.com', location: 'Hubli' };
      setUser(user);
      expect(state.user).toEqual(user);
      expect(JSON.parse(localStorage.getItem('vw_user'))).toEqual(user);
    });

    it('clears user on setUser(null)', () => {
      setUser({ name: 'Test', email: 'test@t.com', location: 'X' });
      setUser(null);
      expect(state.user).toBeNull();
      expect(localStorage.getItem('vw_user')).toBeNull();
    });

    it('dispatches stateChange event with key "user"', () => {
      setUser({ name: 'A', email: 'a@a.com', location: 'B' });
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
  });

  describe('setTheme()', () => {
    it('saves theme to state and localStorage', () => {
      setTheme('dark');
      expect(state.theme).toBe('dark');
      expect(localStorage.getItem('vw_theme')).toBe('dark');
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

  describe('addChatEntry()', () => {
    it('adds question/answer pair to chatHistory', () => {
      addChatEntry('What is voting?', 'Voting is a right.');
      expect(state.chatHistory).toHaveLength(1);
      expect(state.chatHistory[0]).toEqual({ q: 'What is voting?', a: 'Voting is a right.' });
    });
  });

  describe('isAuthenticated()', () => {
    it('returns false when no user', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('returns true when user exists', () => {
      setUser({ name: 'Test', email: 't@t.com', location: 'X' });
      expect(isAuthenticated()).toBe(true);
    });
  });
});
