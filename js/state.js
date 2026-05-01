/**
 * VoteWise — Centralized State Module
 *
 * Single source of truth for all application state.
 * Uses localStorage for persistence and CustomEvents for reactivity.
 * Other modules subscribe via window.addEventListener('stateChange', ...).
 */

export const state = {
  user: JSON.parse(localStorage.getItem('vw_user')) || null,
  region: localStorage.getItem('vw_region') || 'india',
  theme: localStorage.getItem('vw_theme') || 'light',
  wizardProgress: JSON.parse(localStorage.getItem('vw_wizard')) || {},
  quizScore: parseInt(localStorage.getItem('vw_quizScore')) || 0,
  chatHistory: [],
  timelineView: 'horizontal',
  isLoading: false,
  error: null,
};

/**
 * Dispatches a stateChange event so all modules can react.
 * @param {string} key - The state key that changed.
 */
function notify(key) {
  window.dispatchEvent(new CustomEvent('stateChange', { detail: { key } }));
}

/**
 * Saves user to state and persists to localStorage.
 * @param {Object|null} user - User object { name, email, location } or null.
 */
export function setUser(user) {
  state.user = user;
  if (user) {
    localStorage.setItem('vw_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('vw_user');
  }
  notify('user');
}

/**
 * Updates the selected region and persists.
 * @param {string} region - Region code: 'india', 'us', 'uk', 'eu'.
 */
export function setRegion(region) {
  state.region = region;
  localStorage.setItem('vw_region', region);
  notify('region');
}

/**
 * Applies and persists theme.
 * @param {string} theme - 'light' or 'dark'.
 */
export function setTheme(theme) {
  state.theme = theme;
  localStorage.setItem('vw_theme', theme);
  notify('theme');
}

/**
 * Toggles a wizard step's completion state.
 * @param {string} key - Compound key e.g. 'india_step1'.
 */
export function toggleWizardStep(key) {
  state.wizardProgress[key] = !state.wizardProgress[key];
  localStorage.setItem('vw_wizard', JSON.stringify(state.wizardProgress));
  notify('wizardProgress');
}

/**
 * Saves quiz score (only if higher than previous best).
 * @param {number} score - Score achieved.
 */
export function saveQuizScore(score) {
  if (score > state.quizScore) {
    state.quizScore = score;
    localStorage.setItem('vw_quizScore', String(score));
    notify('quizScore');
  }
}

/**
 * Adds a chat interaction to history.
 * @param {string} question
 * @param {string} answer
 */
export function addChatEntry(question, answer) {
  state.chatHistory.push({ q: question, a: answer });
  notify('chatHistory');
}

/**
 * Returns true if a user session exists.
 * @returns {boolean}
 */
export function isAuthenticated() {
  return state.user !== null;
}
