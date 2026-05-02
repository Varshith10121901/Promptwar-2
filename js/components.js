/**
 * VoteWise — Components Module
 *
 * Manages minor interactive components: Polling Booth grid,
 * Museum Gallery, Live Events feed, and Pride Badge claiming.
 *
 * @module components
 */

import { pollingBooths, museumExhibits, liveEvents } from './data.js';

/** @type {Function} Lucide icon updater. */
let _updateIcons = () => {};

/**
 * Sets the icon refresh callback.
 * @param {Function} fn - The lucide.createIcons wrapper.
 */
export function setComponentIconUpdater(fn) {
  _updateIcons = fn;
}

/**
 * Renders the polling booth crowd-status cards.
 */
export function renderBooths() {
  const grid = document.getElementById('boothGrid');
  if (!grid) return;

  grid.innerHTML = pollingBooths
    .map((b) => {
      const colorClass =
        b.crowdLevel === 'low' ? 'success' : b.crowdLevel === 'medium' ? 'accent' : 'error';
      const statusText =
        b.crowdLevel === 'low' ? 'Smooth' : b.crowdLevel === 'medium' ? 'Busy' : 'Crowded';
      return `
      <div class="booth-card">
        <div class="booth-header"><h3>${b.name}</h3><span class="booth-dist">${b.distance}</span></div>
        <div class="booth-stats">
          <div class="booth-stat"><span class="stat-val">${b.waitTime} min</span><span class="stat-lbl">Est. Wait</span></div>
          <div class="booth-stat crowd-stat">
            <span class="crowd-indicator bg-${colorClass}"><span class="pulse"></span></span>
            <span class="stat-lbl">${statusText}</span>
          </div>
        </div>
      </div>
    `;
    })
    .join('');
}

/**
 * Renders the election museum horizontal gallery.
 * Binds scroll navigation buttons.
 */
export function renderMuseum() {
  const gallery = document.getElementById('museumGallery');
  if (!gallery) return;

  gallery.innerHTML = museumExhibits
    .map(
      (ex) => `
    <div class="museum-card">
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
  if (nextBtn) nextBtn.onclick = () => gallery.scrollBy({ left: 350, behavior: 'smooth' });
  if (prevBtn) prevBtn.onclick = () => gallery.scrollBy({ left: -350, behavior: 'smooth' });
}

/**
 * Renders the live election events list.
 */
export function renderEvents() {
  const feed = document.getElementById('eventsFeed');
  if (!feed) return;

  feed.innerHTML = liveEvents
    .map(
      (ev) => `
    <div class="event-card">
      <div class="event-icon"><i data-lucide="${ev.icon}"></i></div>
      <div class="event-details">
        <h3>${ev.title}</h3>
        <p class="event-meta"><i data-lucide="map-pin"></i> ${ev.location} &nbsp;|&nbsp; <i data-lucide="clock"></i> ${ev.time}</p>
      </div>
      <button class="btn btn-sm btn-outline">RSVP</button>
    </div>
  `
    )
    .join('');
  _updateIcons();
}

/**
 * Binds the Pride Badge claim logic and celebration.
 * @param {Object} confetti - Confetti module instance.
 */
export function initPrideBadge(confetti) {
  const btn = document.getElementById('claimInkBtn');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.target.parentElement.classList.add('hidden');
      document.getElementById('prideBadge').classList.remove('hidden');
      confetti?.fire();
    });
  }
}
