/**
 * VoteWise — FAQ Module
 *
 * Manages the FAQ section: rendering by category,
 * search filtering, and active category toggling.
 *
 * @module faq
 * @version 2.1.0
 * @license MIT
 */

import { faqs } from './data.js';

/**
 * Renders the FAQ list based on category and search query.
 * @param {string} category - Current selected category.
 * @param {string} [searchQuery=''] - Optional filter string.
 */
export function renderFaqs(category, searchQuery = '') {
  const container = document.getElementById('faqList');
  if (!container) { return; }

  container.setAttribute('role', 'list');
  container.setAttribute('aria-label', 'Frequently asked questions');

  const filtered = faqs.filter((f) => {
    const matchesCat = category === 'all' || f.category === category;
    const matchesSearch =
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<p class="text-muted" role="status">No results found.</p>';
    return;
  }

  container.innerHTML = filtered
    .map(
      (f) => `
    <div class="faq-card" role="article" aria-label="${f.q}">
      <h3>${f.q}</h3>
      <p>${f.a}</p>
    </div>
  `
    )
    .join('');
}

/**
 * Initializes FAQ UI listeners: category chips and search input.
 */
export function initFaq() {
  const chips = document.querySelectorAll('.faq-cat');
  const searchInput = document.getElementById('faqSearch');

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => {
        c.classList.remove('active');
        c.setAttribute('aria-selected', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-selected', 'true');
      renderFaqs(chip.dataset.cat, searchInput?.value || '');
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const activeChip = document.querySelector('.faq-cat.active');
      const activeCat = activeChip ? activeChip.dataset.cat : 'all';
      renderFaqs(activeCat, e.target.value);
    });
  }

  // Initial render
  renderFaqs('all');
}
