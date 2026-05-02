/**
 * VoteWise — Timeline Module
 *
 * Handles the election timeline rendering: horizontal/vertical views,
 * countdown timers, and region selection updates.
 *
 * @module timeline
 * @version 2.1.0
 * @license MIT
 */

import { electionData } from './data.js';
import { state, setRegion } from './state.js';
import { COUNTDOWN_INTERVAL_MS } from './constants.js';

/**
 * Renders the election timeline based on current region and view mode.
 */
export function renderTimeline() {
  const data = electionData[state.region];
  if (!data) {return;}

  const eventEl = document.getElementById('countdownEvent');
  if (eventEl) {eventEl.textContent = data.nextEvent;}

  const container = document.getElementById('timelineContainer');
  if (container) {
    container.className = `timeline-container ${state.timelineView}`;
    container.setAttribute('role', 'list');
    container.setAttribute('aria-label', 'Election timeline events');
    container.innerHTML = data.timeline
      .map(
        (item) => `
      <div class="timeline-card ${item.passed ? 'passed' : item.upcoming ? 'upcoming' : ''}"
           role="listitem" aria-label="${item.title} — ${item.date}">
        <div class="tl-date">${item.date}</div>
        <h3 class="tl-title">${item.title}</h3>
        <p class="tl-desc">${item.desc}</p>
      </div>
    `
      )
      .join('');
  }

  // Update region buttons active state and ARIA
  document.querySelectorAll('.region-btn').forEach((b) => {
    const isActive = b.dataset.region === state.region;
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-selected', isActive.toString());
  });
}

/**
 * Starts the countdown timer interval.
 * Updates the 'countdownTimer' element every second.
 */
export function initCountdown() {
  setInterval(() => {
    const data = electionData[state.region];
    if (!data || !data.nextDate) {return;}

    const timerEl = document.getElementById('countdownTimer');
    if (!timerEl) {return;}

    const diff = data.nextDate - Date.now();
    if (diff <= 0) {
      timerEl.innerHTML = '<span>Happening Now!</span>';
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);

    timerEl.innerHTML = `
      <div class="timer-block"><span class="timer-val">${d}</span><span class="timer-lbl">Days</span></div>
      <div class="timer-block"><span class="timer-val">${h}</span><span class="timer-lbl">Hrs</span></div>
      <div class="timer-block"><span class="timer-val">${m}</span><span class="timer-lbl">Min</span></div>
    `;
  }, COUNTDOWN_INTERVAL_MS);
}

/**
 * Initializes timeline UI listeners: region buttons and view toggles.
 * @param {Function} onRegionChange - Callback when region is updated.
 */
export function initTimeline(onRegionChange) {
  document.querySelectorAll('.region-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const region = e.target.dataset.region;
      setRegion(region);
      renderTimeline();
      if (onRegionChange) {onRegionChange(region);}
    });
  });

  document.querySelectorAll('.toggle-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      state.timelineView = e.target.dataset.view;
      document.querySelectorAll('.toggle-btn').forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      e.target.classList.add('active');
      e.target.setAttribute('aria-selected', 'true');
      renderTimeline();
    });
  });
}
