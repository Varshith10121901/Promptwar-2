/**
 * VoteWise — Dashboard Module
 *
 * Manages the personal dashboard: readiness score ring, quiz stats,
 * wizard progress, chat activity, and upcoming election deadlines.
 *
 * @module dashboard
 * @version 2.1.0
 * @license MIT
 */

import { electionData } from './data.js';
import { state } from './state.js';
import {
  QUIZ_TOTAL_QUESTIONS,
  READINESS_RING_CIRCUMFERENCE,
  MAX_DASHBOARD_DEADLINES,
  URGENT_DEADLINE_DAYS,
  RING_ANIMATION_DELAY_MS,
} from './constants.js';

// ─── Constants ────────────────────────────────────────

/** @type {number} Milliseconds in one day */
const MS_PER_DAY = 1000 * 3600 * 24;

// ─── Dependencies ─────────────────────────────────────

/** @type {Function} Lucide icon updater callback */
let _updateIcons = () => {};

/**
 * Sets the Lucide icon refresh callback.
 *
 * @param {Function} fn - The `lucide.createIcons()` wrapper.
 * @returns {void}
 */
export function setDashboardIconUpdater(fn) {
  _updateIcons = fn;
}

// ─── Helpers ──────────────────────────────────────────

/**
 * Calculates the number of days remaining until a given date string.
 *
 * @param {string} dateStr - Date string parseable by `new Date()`.
 * @returns {number} Days remaining (floored to 0 if in the past).
 */
function daysRemaining(dateStr) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / MS_PER_DAY));
}

// ─── Render ───────────────────────────────────────────

/**
 * Renders the full dashboard view based on the current global state.
 * Updates: region info, quiz stats, wizard progress, readiness ring,
 * chat activity counter, and upcoming deadlines list.
 *
 * @returns {void}
 */
export function renderDashboard() {
  const regionData = electionData[state.region];
  if (!regionData) {
    return;
  }

  // ─── Region Info ────────────────────────────
  const dashRegion = document.getElementById('dashRegion');
  if (dashRegion) {
    dashRegion.innerHTML = `<i data-lucide="${regionData.icon}"></i> ${regionData.name}`;
  }
  _updateIcons();

  // ─── Quiz Stats ─────────────────────────────
  const dashQuizStat = document.getElementById('dashQuizStat');
  if (dashQuizStat) {
    dashQuizStat.textContent =
      state.quizScore > 0
        ? `${state.quizScore}/${QUIZ_TOTAL_QUESTIONS}`
        : 'Not taken yet';
  }

  // ─── Wizard Progress ────────────────────────
  const steps = regionData.wizard || [];
  const completed = steps.filter(
    (s) => state.wizardProgress[`${state.region}_${s.id}`]
  ).length;
  const total = steps.length;
  const wizardPct = total ? Math.round((completed / total) * 100) : 0;

  const dashWizardStat = document.getElementById('dashWizardStat');
  if (dashWizardStat) {
    dashWizardStat.textContent = `${completed} / ${total} steps`;
  }

  const dashWizardFill = document.getElementById('dashWizardFill');
  if (dashWizardFill) {
    dashWizardFill.style.width = `${wizardPct}%`;
  }

  // ─── Overall Readiness Ring ─────────────────
  const quizPct = (state.quizScore / QUIZ_TOTAL_QUESTIONS) * 100;
  const readinessPct = Math.round((wizardPct + quizPct) / 2);

  const readinessPctEl = document.getElementById('readinessPct');
  if (readinessPctEl) {
    readinessPctEl.textContent = `${readinessPct}%`;
  }

  const ring = document.getElementById('readinessRing');
  if (ring) {
    const offset =
      READINESS_RING_CIRCUMFERENCE -
      (READINESS_RING_CIRCUMFERENCE * readinessPct) / 100;
    setTimeout(() => {
      ring.style.strokeDashoffset = offset;
    }, RING_ANIMATION_DELAY_MS);
  }

  // ─── Chat Activity ──────────────────────────
  const dashChatStat = document.getElementById('dashChatStat');
  if (dashChatStat) {
    dashChatStat.textContent = `${state.chatHistory.length} interactions`;
  }

  // ─── Upcoming Deadlines ─────────────────────
  const deadlines = regionData.timeline.filter((t) => !t.passed);
  const list = document.getElementById('deadlinesList');

  if (list) {
    if (deadlines.length === 0) {
      list.innerHTML = '<p class="text-muted">No upcoming deadlines.</p>';
    } else {
      list.innerHTML = deadlines
        .slice(0, MAX_DASHBOARD_DEADLINES)
        .map((d) => {
          const days = daysRemaining(d.date);
          const urgent = days < URGENT_DEADLINE_DAYS && days > 0;
          return `
          <div class="deadline-item ${urgent ? 'urgent' : ''}" role="listitem">
            <div class="dl-info">
              <span class="dl-title">${d.title}</span>
              <span class="dl-date">${d.date}</span>
            </div>
            <span class="dl-days" aria-label="${days} days remaining">${days} days</span>
          </div>
        `;
        })
        .join('');
    }
  }
}
