/**
 * VoteWise — Components Module
 *
 * Manages minor interactive components: Polling Booth grid,
 * Museum Gallery, Live Events feed, and Pride Badge claiming.
 *
 * @module components
 * @version 2.1.0
 * @license MIT
 */

import { pollingBooths, museumExhibits, liveEvents } from './data.js';

// ─── Constants ────────────────────────────────────────

/** @type {number} Gallery scroll distance in pixels */
const GALLERY_SCROLL_PX = 350;

/** @type {string} CSS class for hiding elements */
const HIDDEN_CLASS = 'hidden';

/**
 * @typedef {Object} CrowdMapping
 * @property {string} colorClass - CSS class for crowd indicator
 * @property {string} statusText - Human-readable status
 * @property {string} ariaLabel - Screen reader description
 */

/** @type {Record<string, CrowdMapping>} */
const CROWD_LEVELS = {
  low: { colorClass: 'success', statusText: 'Smooth', ariaLabel: 'Low crowd level' },
  medium: { colorClass: 'accent', statusText: 'Busy', ariaLabel: 'Moderate crowd level' },
  high: { colorClass: 'error', statusText: 'Crowded', ariaLabel: 'High crowd level' },
};

// ─── Module State ─────────────────────────────────────

/** @type {Function} Lucide icon updater callback. */
let _updateIcons = () => {};

/**
 * Sets the icon refresh callback.
 *
 * @param {Function} fn - The lucide.createIcons wrapper.
 * @returns {void}
 */
export function setComponentIconUpdater(fn) {
  _updateIcons = typeof fn === 'function' ? fn : () => {};
}

// ─── Polling Booths ───────────────────────────────────

/**
 * Renders the polling booth crowd-status cards.
 * Each card displays booth name, distance, wait time, and crowd indicator.
 *
 * @returns {void}
 */
export function renderBooths() {
  const grid = document.getElementById('boothGrid');
  if (!grid) { return; }

  grid.setAttribute('role', 'list');
  grid.setAttribute('aria-label', 'Polling booths near you');

  grid.innerHTML = pollingBooths
    .map((b) => {
      const crowd = CROWD_LEVELS[b.crowdLevel] || CROWD_LEVELS.low;
      return `
      <div class="booth-card" role="listitem" aria-label="${b.name}, ${crowd.ariaLabel}, estimated wait ${b.waitTime} minutes">
        <div class="booth-header"><h3>${b.name}</h3><span class="booth-dist">${b.distance}</span></div>
        <div class="booth-stats">
          <div class="booth-stat"><span class="stat-val">${b.waitTime} min</span><span class="stat-lbl">Est. Wait</span></div>
          <div class="booth-stat crowd-stat">
            <span class="crowd-indicator bg-${crowd.colorClass}" role="status" aria-label="${crowd.ariaLabel}"><span class="pulse"></span></span>
            <span class="stat-lbl">${crowd.statusText}</span>
          </div>
        </div>
      </div>
    `;
    })
    .join('');
}

// ─── Museum Gallery ───────────────────────────────────

/**
 * Renders the election museum horizontal gallery.
 * Binds scroll navigation buttons (left/right).
 *
 * @returns {void}
 */
export function renderMuseum() {
  const gallery = document.getElementById('museumGallery');
  if (!gallery) { return; }

  gallery.setAttribute('role', 'list');
  gallery.setAttribute('aria-label', 'Election history gallery');

  gallery.innerHTML = museumExhibits
    .map(
      (ex) => `
    <div class="museum-card" role="listitem" aria-label="${ex.title}, ${ex.year}">
      <div class="museum-icon"><i data-lucide="${ex.icon}"></i></div>
      <div class="museum-year">${ex.year}</div>
      <h3>${ex.title}</h3>
      <p>${ex.desc}</p>
    </div>
  `
    )
    .join('');
  _updateIcons();

  const nextBtn = document.getElementById('galleryNext');
  const prevBtn = document.getElementById('galleryPrev');
  if (nextBtn) { nextBtn.onclick = () => gallery.scrollBy({ left: GALLERY_SCROLL_PX, behavior: 'smooth' }); }
  if (prevBtn) { prevBtn.onclick = () => gallery.scrollBy({ left: -GALLERY_SCROLL_PX, behavior: 'smooth' }); }
}

// ─── Live Events ──────────────────────────────────────

/**
 * Renders the live election events list.
 * Each card includes title, location, time, and RSVP button.
 *
 * @returns {void}
 */
export function renderEvents() {
  const feed = document.getElementById('eventsFeed');
  if (!feed) { return; }

  feed.setAttribute('role', 'list');
  feed.setAttribute('aria-label', 'Upcoming election events');

  feed.innerHTML = liveEvents
    .map(
      (ev) => `
    <div class="event-card" role="listitem" aria-label="${ev.title} at ${ev.location}">
      <div class="event-icon"><i data-lucide="${ev.icon}"></i></div>
      <div class="event-details">
        <h3>${ev.title}</h3>
        <p class="event-meta"><i data-lucide="map-pin"></i> ${ev.location} &nbsp;|&nbsp; <i data-lucide="clock"></i> ${ev.time}</p>
      </div>
      <button class="btn btn-sm btn-outline" aria-label="RSVP for ${ev.title}">RSVP</button>
    </div>
  `
    )
    .join('');
  _updateIcons();
}

// ─── Pride Badge ──────────────────────────────────────

/**
 * Binds the Pride Badge claim logic and celebration.
 *
 * @param {Object|null} confetti - Confetti module instance with .fire() method.
 * @returns {void}
 */
export function initPrideBadge(confetti) {
  const btn = document.getElementById('claimInkBtn');
  if (btn) {
    btn.addEventListener('click', (e) => {
      const target = /** @type {HTMLElement} */ (e.target);
      if (target.parentElement) {
        target.parentElement.classList.add(HIDDEN_CLASS);
      }
      const badge = document.getElementById('prideBadge');
      if (badge) { badge.classList.remove(HIDDEN_CLASS); }
      confetti?.fire();
    });
  }
}
