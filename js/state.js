/**
 * VoteWise State Module
 * Single source of truth for all application state.
 * Persists relevant fields to localStorage automatically.
 */

export const state = {
  user: JSON.parse(localStorage.getItem('vw_user')) || null,
  region: localStorage.getItem('vw_region') || 'india',
  theme: localStorage.getItem('vw_theme') || 'light',
  wizardProgress: JSON.parse(localStorage.getItem('vw_wizard')) || {},
  quizScore: parseInt(localStorage.getItem('vw_quizScore')) || 0,
  chatHistory: [],
  timelineView: 'horizontal'
};

/**
 * Updates the user in state and persists to localStorage.
 * @param {Object|null} user - The user object or null to log out.
 */
export function setUser(user) {
  state.user = user;
  if (user) {
    localStorage.setItem('vw_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('vw_user');
  }
}

/**
 * Updates the selected region and persists to localStorage.
 * @param {string} region - Region code e.g. 'india', 'us'
 */
export function setRegion(region) {
  state.region = region;
  localStorage.setItem('vw_region', region);
}

/**
 * Toggles a wizard step's completion and persists to localStorage.
 * @param {string} key - Compound key e.g. 'india_step1'
 */
export function toggleWizardStep(key) {
  state.wizardProgress[key] = !state.wizardProgress[key];
  localStorage.setItem('vw_wizard', JSON.stringify(state.wizardProgress));
}

/**
 * Saves the latest quiz score if it's a new high score.
 * @param {number} score - The score achieved in this session.
 */
export function saveQuizScore(score) {
  if (score > state.quizScore) {
    state.quizScore = score;
    localStorage.setItem('vw_quizScore', score);
  }
}
