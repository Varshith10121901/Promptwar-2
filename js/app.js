/**
 * VoteWise — Main Application Orchestrator (v2.0)
 *
 * Clean coordinator that delegates all domain logic to
 * specialized, decoupled ES modules. Integrates Google
 * Cloud services: Firebase Auth, Firestore, Analytics,
 * and Gemini AI.
 *
 * @module app
 * @version 2.0.0
 * @license MIT
 */

import { initConfetti } from './confetti.js';
import { state, setTheme, isAuthenticated } from './state.js';
import { initRouter } from './router.js';
import { fetchElectionMap } from './api.js';

// Domain Modules
import { initTimeline, renderTimeline, initCountdown } from './timeline.js';
import { initWizard, renderWizard } from './wizard.js';
import { setChatIconUpdater, initChat } from './chat.js';
import { setQuizDeps, initQuiz, renderQuiz } from './quiz.js';
import { setDashboardIconUpdater, renderDashboard } from './dashboard.js';
import { initFaq } from './faq.js';
import {
  setComponentIconUpdater,
  renderBooths,
  renderMuseum,
  renderEvents,
  initPrideBadge,
} from './components.js';

// Google Cloud Services
import { initFirebase, signInAnonymously, logAnalyticsEvent } from './firebase.js';
import { initGoogleAnalytics, trackPageView, trackEvent } from './analytics.js';

/**
 * Application entry point.
 * Executes immediately as an ES module (deferred by default).
 */
(() => {
  // ─────────────────────────────────────────────
  // 1. GOOGLE CLOUD SERVICES INITIALIZATION
  // ─────────────────────────────────────────────
  initFirebase();
  initGoogleAnalytics();

  // Anonymous auth for Firestore writes
  signInAnonymously().then((uid) => {
    if (uid) {
      console.info('[App] Firebase user:', uid);
    }
  });

  // ─────────────────────────────────────────────
  // 2. CORE UTILITIES
  // ─────────────────────────────────────────────
  const confetti = initConfetti();

  /**
   * Refreshes all Lucide SVG icons after DOM updates.
   * @returns {void}
   */
  const updateIcons = () => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  };

  // Inject dependencies into modules
  setChatIconUpdater(updateIcons);
  setQuizDeps(confetti, updateIcons);
  setDashboardIconUpdater(updateIcons);
  setComponentIconUpdater(updateIcons);

  // ─────────────────────────────────────────────
  // 3. THEME INITIALIZATION
  // ─────────────────────────────────────────────

  /**
   * Applies a theme to the document and persists the preference.
   * @param {string} t - Theme identifier: 'light' or 'dark'.
   */
  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    setTheme(t);
    const isDark = t === 'dark';

    const themeIcon = document.querySelector('.theme-icon');
    const themeLabel = document.querySelector('.theme-label');
    const themeMobile = document.getElementById('themeToggleMobile');

    if (themeIcon) {
      themeIcon.innerHTML = `<i data-lucide="${isDark ? 'sun' : 'moon'}"></i>`;
    }
    if (themeLabel) {
      themeLabel.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    }
    if (themeMobile) {
      themeMobile.innerHTML = `<i data-lucide="${isDark ? 'sun' : 'moon'}"></i>`;
    }

    updateIcons();
    trackEvent('theme_change', { theme: t });
  }

  applyTheme(state.theme);

  document.getElementById('themeToggle')?.addEventListener('click', () => {
    applyTheme(state.theme === 'light' ? 'dark' : 'light');
  });
  document.getElementById('themeToggleMobile')?.addEventListener('click', () => {
    applyTheme(state.theme === 'light' ? 'dark' : 'light');
  });

  // ─────────────────────────────────────────────
  // 4. UI NAVIGATION (Mobile Sidebar)
  // ─────────────────────────────────────────────
  document.getElementById('hamburger')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.add('open');
  });
  document.getElementById('sidebarClose')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.remove('open');
  });

  // ─────────────────────────────────────────────
  // 5. MAP GENERATION (Gemini AI Backend)
  // ─────────────────────────────────────────────

  /**
   * Initializes the interactive map feature.
   * Binds the "Find My Polling Station" button to the
   * Gemini-powered backend API.
   */
  function initMapInteraction() {
    const btn = document.getElementById('btnFindMap');
    const input = document.getElementById('mapLocationInput');
    const container = document.getElementById('mapContainer');
    const frame = document.getElementById('mapFrame');
    const loading = document.getElementById('mapLoading');

    if (!btn || !input) return;

    btn.addEventListener('click', async () => {
      const loc = input.value.trim();
      if (!loc) return;

      if (loading) loading.classList.remove('hidden');
      if (container) container.classList.add('hidden');

      try {
        const html = await fetchElectionMap(loc);
        if (frame) frame.srcdoc = html;
        if (container) container.classList.remove('hidden');

        // Track map generation event
        trackEvent('map_generated', { location: loc });
        logAnalyticsEvent('map_generated', { location: loc });
      } catch (err) {
        console.error('[Map] Generation failed:', err.message);
        const ariaLive = document.getElementById('ariaLive');
        if (ariaLive) {
          ariaLive.textContent = `Map generation failed: ${err.message}`;
        }
      } finally {
        if (loading) loading.classList.add('hidden');
      }
    });
  }

  // ─────────────────────────────────────────────
  // 6. BOOTSTRAP ALL MODULES
  // ─────────────────────────────────────────────

  /**
   * Renders page-specific content when navigating.
   * @param {string} page - The page identifier from the hash route.
   */
  const onPageLoad = (page) => {
    switch (page) {
      case 'home':
      case 'dashboard':
        renderDashboard();
        break;
      case 'timeline':
        renderTimeline();
        break;
      case 'wizard':
        renderWizard();
        break;
      case 'quiz':
        renderQuiz();
        break;
      case 'booths':
        renderBooths();
        break;
      case 'museum':
        renderMuseum();
        break;
      case 'events':
        renderEvents();
        break;
      default:
        break;
    }
    updateIcons();

    // Track page view in Google Analytics
    trackPageView(`/${page}`, `VoteWise — ${page}`);
    logAnalyticsEvent('page_view', { page_name: page });
  };

  /**
   * Callback for region changes — refreshes the active page.
   */
  const handleGlobalRefresh = () => {
    const hash = window.location.hash.replace('#', '') || 'home';
    onPageLoad(hash);
  };

  // Initialize all domain modules
  initRouter(isAuthenticated, onPageLoad);
  initTimeline(handleGlobalRefresh);
  initWizard(handleGlobalRefresh);
  initChat(
    document.getElementById('chatInput'),
    document.getElementById('chatMessages')
  );
  initQuiz();
  initFaq();
  initPrideBadge(confetti);
  initMapInteraction();
  initCountdown();

  // Initial icon render
  updateIcons();

  console.info('[VoteWise] Application initialized successfully.');
})();
