/**
 * VoteWise — Wizard Module
 *
 * Manages the multi-step election preparation wizard: rendering steps,
 * tracking completion, and updating progress bars.
 *
 * @module wizard
 */

import { electionData } from './data.js';
import { state, setRegion, toggleWizardStep } from './state.js';

/**
 * Renders the wizard steps for the current region.
 * Binds click listeners to toggle completion state.
 */
export function renderWizard() {
  const data = electionData[state.region];
  if (!data) return;

  const regionSelect = document.getElementById('wizardRegion');
  if (regionSelect) regionSelect.value = state.region;

  const steps = data.wizard || [];
  const container = document.getElementById('wizardSteps');
  if (!container) return;

  container.innerHTML = steps
    .map((step, idx) => {
      const isCompleted = state.wizardProgress[`${state.region}_${step.id}`];
      return `
      <div class="wizard-step ${isCompleted ? 'completed' : ''}" data-id="${step.id}" role="checkbox" aria-checked="${isCompleted}" tabindex="0">
        <div class="step-checkbox"></div>
        <div class="step-content">
          <h3>Step ${idx + 1}: ${step.title}</h3>
          <p>${step.desc}</p>
        </div>
      </div>
    `;
    })
    .join('');

  container.querySelectorAll('.wizard-step').forEach((el) => {
    el.addEventListener('click', () => {
      toggleWizardStep(`${state.region}_${el.dataset.id}`);
      renderWizard();
    });
    // Allow keyboard interaction
    el.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        toggleWizardStep(`${state.region}_${el.dataset.id}`);
        renderWizard();
      }
    });
  });

  const total = steps.length;
  const completed = steps.filter((s) => state.wizardProgress[`${state.region}_${s.id}`]).length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  const bar = document.getElementById('wizardProgress');
  if (bar) bar.style.width = `${pct}%`;

  const text = document.getElementById('wizardProgressText');
  if (text) text.textContent = `${pct}% Complete`;
}

/**
 * Initializes wizard UI listeners: region dropdown.
 * @param {Function} onRegionChange - Callback when region is updated via wizard.
 */
export function initWizard(onRegionChange) {
  const select = document.getElementById('wizardRegion');
  if (select) {
    select.addEventListener('change', (e) => {
      const region = e.target.value;
      setRegion(region);
      renderWizard();
      if (onRegionChange) onRegionChange(region);
    });
  }
}
