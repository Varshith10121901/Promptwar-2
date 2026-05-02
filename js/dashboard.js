/**
 * VoteWise — Dashboard Module
 *
 * Manages the user dashboard view: rendering region info,
 * quiz statistics, wizard progress, and upcoming deadlines.
 *
 * @module dashboard
 */

import { electionData } from './data.js';
import { state } from './state.js';

/** @type {Function} Lucide icon updater. */
let _updateIcons = () => {};

/**
 * Sets the icon refresh callback.
 * @param {Function} fn - The lucide.createIcons wrapper.
 */
export function setDashboardIconUpdater(fn) {
  _updateIcons = fn;
}

/**
 * Renders the full dashboard view based on the current global state.
 */
export function renderDashboard() {
  const regionData = electionData[state.region];
  if (!regionData) return;

  // Region Info
  const dashRegion = document.getElementById('dashRegion');
  if (dashRegion) {
    dashRegion.innerHTML = `<i data-lucide="${regionData.icon}"></i> ${regionData.name}`;
  }
  _updateIcons();

  // Quiz Stats
  const dashQuizStat = document.getElementById('dashQuizStat');
  if (dashQuizStat) {
    dashQuizStat.textContent = state.quizScore > 0 ? `${state.quizScore}/5` : 'Not taken yet';
  }

  // Wizard Progress
  const steps = regionData.wizard || [];
  const completed = steps.filter((s) => state.wizardProgress[`${state.region}_${s.id}`]).length;
  const total = steps.length;
  const wizardPct = total ? Math.round((completed / total) * 100) : 0;

  const dashWizardStat = document.getElementById('dashWizardStat');
  if (dashWizardStat) dashWizardStat.textContent = `${completed} / ${total} steps`;

  const dashWizardFill = document.getElementById('dashWizardFill');
  if (dashWizardFill) dashWizardFill.style.width = `${wizardPct}%`;

  // Overall Readiness (Circular Ring)
  const readinessPct = Math.round((wizardPct + (state.quizScore / 5) * 100) / 2);
  const readinessPctEl = document.getElementById('readinessPct');
  if (readinessPctEl) readinessPctEl.textContent = `${readinessPct}%`;

  const ring = document.getElementById('readinessRing');
  if (ring) {
    const offset = 314 - (314 * readinessPct) / 100;
    setTimeout(() => {
      ring.style.strokeDashoffset = offset;
    }, 100);
  }

  // Chat Activity
  const dashChatStat = document.getElementById('dashChatStat');
  if (dashChatStat) dashChatStat.textContent = `${state.chatHistory.length} interactions`;

  // Deadlines List
  const deadlines = regionData.timeline.filter((t) => !t.passed);
  const list = document.getElementById('deadlinesList');

  if (list) {
    if (deadlines.length === 0) {
      list.innerHTML = '<p class="text-muted">No upcoming deadlines.</p>';
    } else {
      list.innerHTML = deadlines
        .slice(0, 3)
        .map((d) => {
          const diff = new Date(d.date).getTime() - Date.now();
          const days = Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
          const urgent = days < 30 && days > 0;
          return `
          <div class="deadline-item ${urgent ? 'urgent' : ''}">
            <div class="dl-info">
              <span class="dl-title">${d.title}</span>
              <span class="dl-date">${d.date}</span>
            </div>
            <span class="dl-days">${days} days</span>
          </div>
        `;
        })
        .join('');
    }
  }
}
