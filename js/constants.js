/**
 * VoteWise — Constants Module
 *
 * All magic numbers, strings, and configuration values are centralized here.
 * No hardcoded values should exist outside this file.
 *
 * @module constants
 * @version 2.1.0
 * @license MIT
 */

// ─── Storage Keys ─────────────────────────────────────
/** @type {string} localStorage key for user data */
export const STORAGE_KEY_USER = 'vw_user';
/** @type {string} localStorage key for region */
export const STORAGE_KEY_REGION = 'vw_region';
/** @type {string} localStorage key for theme */
export const STORAGE_KEY_THEME = 'vw_theme';
/** @type {string} localStorage key for wizard progress */
export const STORAGE_KEY_WIZARD = 'vw_wizard';
/** @type {string} localStorage key for quiz score */
export const STORAGE_KEY_QUIZ = 'vw_quizScore';

// ─── Defaults ─────────────────────────────────────────
/** @type {string} Default region */
export const DEFAULT_REGION = 'india';
/** @type {string} Default theme */
export const DEFAULT_THEME = 'light';
/** @type {string} Default timeline view mode */
export const DEFAULT_TIMELINE_VIEW = 'horizontal';

// ─── API ──────────────────────────────────────────────
/** @type {string} Backend API base URL */
export const API_BASE_URL = 'http://localhost:8000';
/** @type {number} Maximum location input length */
export const MAX_LOCATION_LENGTH = 100;
/** @type {number} Request timeout in milliseconds */
export const API_TIMEOUT_MS = 30000;

// ─── Quiz ─────────────────────────────────────────────
/** @type {number} Total quiz questions */
export const QUIZ_TOTAL_QUESTIONS = 5;
/** @type {number} Score required for perfect rating */
export const QUIZ_PERFECT_SCORE = 5;
/** @type {number} Score threshold for "good" rating */
export const QUIZ_GOOD_THRESHOLD = 3;

// ─── Security ─────────────────────────────────────────
/** @type {string[]} Blocked prompt injection phrases (defense-in-depth) */
export const BLOCKED_INJECTION_PHRASES = [
  'ignore previous',
  'forget',
  'system:',
  'assistant:',
  'you are now',
];

// ─── UI ───────────────────────────────────────────────
/** @type {number} Typing indicator delay in milliseconds */
export const CHAT_TYPING_DELAY_MS = 1200;
/** @type {number} Countdown timer interval in milliseconds */
export const COUNTDOWN_INTERVAL_MS = 1000;
/** @type {number} Dashboard readiness ring circumference */
export const READINESS_RING_CIRCUMFERENCE = 314;
/** @type {number} Maximum deadlines shown on dashboard */
export const MAX_DASHBOARD_DEADLINES = 3;
/** @type {number} Urgent deadline threshold in days */
export const URGENT_DEADLINE_DAYS = 30;
/** @type {number} Confetti particle count */
export const CONFETTI_PARTICLE_COUNT = 100;
/** @type {number} Animation delay for readiness ring (ms) */
export const RING_ANIMATION_DELAY_MS = 100;

// ─── Google Analytics ─────────────────────────────────
/** @type {string} GA4 Measurement ID */
export const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

// ─── Event Names (for analytics tracking) ─────────────
export const EVENTS = Object.freeze({
  LOGIN_SUCCESS: 'login_success',
  THEME_CHANGE: 'theme_change',
  MAP_GENERATED: 'map_generated',
  QUIZ_COMPLETED: 'quiz_completed',
  WIZARD_STEP: 'wizard_step_toggle',
  PAGE_VIEW: 'page_view',
  CHAT_MESSAGE: 'chat_message',
});
