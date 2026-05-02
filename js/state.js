/**
 * VoteWise — Centralized State Module
 *
 * Single source of truth for all application state.
 * Uses localStorage for persistence and CustomEvents for reactivity.
 * Other modules subscribe via `window.addEventListener('stateChange', ...)`.
 *
 * @module state
 * @version 2.1.0
 * @license MIT
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
 */

import {
  STORAGE_KEY_USER,
  STORAGE_KEY_REGION,
  STORAGE_KEY_THEME,
  STORAGE_KEY_WIZARD,
  STORAGE_KEY_QUIZ,
  DEFAULT_REGION,
  DEFAULT_THEME,
  DEFAULT_TIMELINE_VIEW,
} from './constants.js';

// ─── Type Definitions ─────────────────────────────────

/**
 * @typedef {Object} User
 * @property {string} uid - Unique identifier (Firebase UID or local ID)
 * @property {string} displayName - User's display name
 * @property {string} email - User's email address
 * @property {string} [location] - User's native location
 * @property {string} [photoURL] - Profile photo URL (Google Sign-In)
 * @property {string} provider - Auth provider ('google' | 'anonymous' | 'form')
 */

/**
 * @typedef {Object} AppState
 * @property {User|null} user - Current authenticated user
 * @property {string} region - Active region code ('india'|'us'|'uk'|'eu')
 * @property {string} theme - Active theme ('light'|'dark')
 * @property {Object<string, boolean>} wizardProgress - Wizard step completion map
 * @property {number} quizScore - Best quiz score achieved
 * @property {Array<{q: string, a: string}>} chatHistory - Chat interaction log
 * @property {string} timelineView - Timeline layout mode ('horizontal'|'vertical')
 * @property {boolean} isLoading - Global loading indicator
 * @property {string|null} error - Last error message
 */

// ─── Helper: Safe JSON Parse ──────────────────────────

/**
 * Safely parses a JSON string from localStorage.
 * Returns the fallback value on any parse failure.
 *
 * @param {string} key - The localStorage key to read.
 * @param {*} fallback - Default value if key is missing or corrupt.
 * @returns {*} Parsed value or fallback.
 */
function safeJsonParse(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// ─── State Initialization ─────────────────────────────

/** @type {AppState} */
export const state = {
  user: safeJsonParse(STORAGE_KEY_USER, null),
  region: localStorage.getItem(STORAGE_KEY_REGION) || DEFAULT_REGION,
  theme: localStorage.getItem(STORAGE_KEY_THEME) || DEFAULT_THEME,
  wizardProgress: safeJsonParse(STORAGE_KEY_WIZARD, {}),
  quizScore: parseInt(localStorage.getItem(STORAGE_KEY_QUIZ), 10) || 0,
  chatHistory: [],
  timelineView: DEFAULT_TIMELINE_VIEW,
  isLoading: false,
  error: null,
};

// ─── Reactivity: Event Dispatcher ─────────────────────

/**
 * Dispatches a `stateChange` CustomEvent on the window.
 * All modules can subscribe via `window.addEventListener('stateChange', ...)`.
 *
 * @param {string} key - The state key that changed.
 * @returns {void}
 */
function notify(key) {
  window.dispatchEvent(new CustomEvent('stateChange', { detail: { key } }));
}

// ─── State Mutators ───────────────────────────────────

/**
 * Sets the authenticated user and persists to localStorage.
 *
 * @param {User|null} user - User object or null to clear session.
 * @returns {void}
 */
export function setUser(user) {
  state.user = user;
  if (user) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY_USER);
  }
  notify('user');
}

/**
 * Updates the selected region and persists.
 *
 * @param {string} region - Region code: 'india', 'us', 'uk', or 'eu'.
 * @returns {void}
 * @throws {Error} If region is not a valid string.
 */
export function setRegion(region) {
  if (!region || typeof region !== 'string') {
    throw new Error('Region must be a non-empty string.');
  }
  state.region = region;
  localStorage.setItem(STORAGE_KEY_REGION, region);
  notify('region');
}

/**
 * Applies and persists the theme preference.
 *
 * @param {string} theme - 'light' or 'dark'.
 * @returns {void}
 */
export function setTheme(theme) {
  const valid = theme === 'dark' ? 'dark' : 'light';
  state.theme = valid;
  localStorage.setItem(STORAGE_KEY_THEME, valid);
  notify('theme');
}

/**
 * Toggles a wizard step's completion state.
 *
 * @param {string} key - Compound key e.g. 'india_reg'.
 * @returns {void}
 */
export function toggleWizardStep(key) {
  if (!key || typeof key !== 'string') {
    return;
  }
  state.wizardProgress[key] = !state.wizardProgress[key];
  localStorage.setItem(STORAGE_KEY_WIZARD, JSON.stringify(state.wizardProgress));
  notify('wizardProgress');
}

/**
 * Saves quiz score — only persists if it exceeds the previous best.
 *
 * @param {number} score - Score achieved (0–5).
 * @returns {boolean} True if the new score was higher and was saved.
 */
export function saveQuizScore(score) {
  const numScore = Number(score) || 0;
  if (numScore > state.quizScore) {
    state.quizScore = numScore;
    localStorage.setItem(STORAGE_KEY_QUIZ, String(numScore));
    notify('quizScore');
    return true;
  }
  return false;
}

/**
 * Appends a chat interaction to session history.
 *
 * @param {string} question - The user's question text.
 * @param {string} answer - The bot's response text.
 * @returns {void}
 */
export function addChatEntry(question, answer) {
  if (!question || !answer) {
    return;
  }
  state.chatHistory.push({ q: question, a: answer });
  notify('chatHistory');
}

// ─── State Queries ────────────────────────────────────

/**
 * Returns true if a user session exists (authenticated).
 *
 * @returns {boolean} Whether the user is logged in.
 */
export function isAuthenticated() {
  return state.user !== null;
}

/**
 * Returns the current user's UID, or null.
 *
 * @returns {string|null} The user's unique identifier.
 */
export function getCurrentUserId() {
  return state.user?.uid || null;
}

/**
 * Clears all persisted state and resets to defaults.
 * Used during sign-out.
 *
 * @returns {void}
 */
export function clearState() {
  state.user = null;
  state.region = DEFAULT_REGION;
  state.theme = DEFAULT_THEME;
  state.wizardProgress = {};
  state.quizScore = 0;
  state.chatHistory = [];
  state.isLoading = false;
  state.error = null;

  localStorage.removeItem(STORAGE_KEY_USER);
  localStorage.removeItem(STORAGE_KEY_REGION);
  localStorage.removeItem(STORAGE_KEY_THEME);
  localStorage.removeItem(STORAGE_KEY_WIZARD);
  localStorage.removeItem(STORAGE_KEY_QUIZ);

  notify('reset');
}
