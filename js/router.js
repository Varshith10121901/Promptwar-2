/**
 * VoteWise Router Module
 * Hash-based SPA routing with authentication guard.
 */

const PROTECTED_PAGES = ['home', 'timeline', 'wizard', 'chat', 'quiz', 'dashboard', 'booths', 'museum', 'events', 'faq'];

/**
 * Navigates to a page by its ID.
 * @param {string} pageId - The page identifier (without the 'page-' prefix).
 * @param {Function} onDashboard - Callback to invoke when navigating to dashboard.
 */
export function navigate(pageId, onDashboard) {
  window.location.hash = pageId;
  const pages = document.querySelectorAll('.page');
  const navItems = document.querySelectorAll('.nav-item');

  pages.forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${pageId}`)?.classList.add('active');

  navItems.forEach(n => {
    n.classList.remove('active');
    if (n.dataset.page === pageId) n.classList.add('active');
  });

  if (pageId === 'dashboard' && typeof onDashboard === 'function') {
    onDashboard();
  }

  // Close mobile sidebar on navigation
  document.getElementById('sidebar')?.classList.remove('open');
}

/**
 * Initializes the router. Sets up hash change listener and intercepts
 * all [data-navigate] clicks. Enforces auth guard for protected pages.
 *
 * @param {Function} onNavigate - Called with (pageId) on every navigation.
 * @param {Function} isAuthenticated - Returns true if user is logged in.
 */
export function initRouter(onNavigate, isAuthenticated) {
  const handleHash = () => {
    const hash = window.location.hash.replace('#', '') || 'home';
    const isProtected = PROTECTED_PAGES.includes(hash);

    if (isProtected && !isAuthenticated()) {
      navigate('login', null);
      return;
    }
    onNavigate(hash);
  };

  window.addEventListener('hashchange', handleHash);

  document.querySelectorAll('[data-navigate]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const target = el.dataset.navigate;
      if (PROTECTED_PAGES.includes(target) && !isAuthenticated()) {
        navigate('login', null);
        return;
      }
      onNavigate(target);
    });
  });

  // Handle initial load
  handleHash();
}
