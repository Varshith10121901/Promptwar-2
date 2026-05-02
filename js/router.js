/**
 * VoteWise — Router Module
 *
 * Handles hash-based SPA routing with authentication guard.
 * Protected pages require a logged-in user; unauthenticated users
 * are redirected to the login page.
 *
 * @module router
 * @version 2.1.0
 * @license MIT
 */

const PROTECTED_PAGES = [
  'home',
  'timeline',
  'wizard',
  'chat',
  'quiz',
  'dashboard',
  'booths',
  'museum',
  'events',
  'faq',
];

/**
 * Navigates to a page by setting the hash and toggling visibility.
 * @param {string} pageId - Page identifier (without 'page-' prefix).
 */
export function navigate(pageId) {
  window.location.hash = pageId;

  document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
  document.getElementById(`page-${pageId}`)?.classList.add('active');

  document.querySelectorAll('.nav-item').forEach((n) => {
    n.classList.remove('active');
    if (n.dataset.page === pageId) {n.classList.add('active');}
  });

  // Close mobile sidebar on navigation
  document.getElementById('sidebar')?.classList.remove('open');

  // Announce navigation to screen readers
  const ariaLive = document.getElementById('ariaLive');
  if (ariaLive) {ariaLive.textContent = `Navigated to ${pageId} page`;}
}

/**
 * Initializes the SPA router.
 * Binds hash changes, [data-navigate] click handlers,
 * and enforces the authentication guard.
 *
 * @param {Function} isAuthenticated - Returns true if user is logged in.
 * @param {Function} onNavigate - Called after every successful navigation.
 */
export function initRouter(isAuthenticated, onNavigate) {
  function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'home';

    // Auth guard: redirect to login if not authenticated
    if (PROTECTED_PAGES.includes(hash) && !isAuthenticated()) {
      navigate('login');
      return;
    }

    navigate(hash);
    if (typeof onNavigate === 'function') {onNavigate(hash);}
  }

  // Listen for hash changes
  window.addEventListener('hashchange', handleRoute);

  // Intercept all [data-navigate] clicks
  document.querySelectorAll('[data-navigate]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const target = el.dataset.navigate;

      if (PROTECTED_PAGES.includes(target) && !isAuthenticated()) {
        navigate('login');
        return;
      }

      navigate(target);
      if (typeof onNavigate === 'function') {onNavigate(target);}
    });
  });

  // Initial route on page load
  handleRoute();
}
