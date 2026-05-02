/**
 * VoteWise — Main Application Orchestrator (v2.1)
 *
 * Thin coordinator delegating all domain logic to specialized modules.
 * Integrates Google Cloud services: Firebase Auth (Google Sign-In),
 * Cloud Firestore, Google Analytics, and Gemini AI.
 *
 * @module app
 * @version 2.1.0
 * @license MIT
 */

import { initConfetti } from './confetti.js';
import { state, setUser, setTheme, isAuthenticated, saveQuizScore, toggleWizardStep } from './state.js';
import { initRouter, navigate } from './router.js';
import { fetchElectionMap } from './api.js';

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
import {
  initFirebase,
  signInWithGoogle,
  signInAnonymously,
  saveUserProfile,
  saveQuizScoreToFirestore,
  saveWizardProgressToFirestore,
  loadUserProgress,
  logAnalyticsEvent,
  onAuthStateChanged,
} from './firebase.js';
import { initGoogleAnalytics, trackPageView, trackEvent } from './analytics.js';

// ─────────────────────────────────────────────
// APPLICATION BOOTSTRAP
// ─────────────────────────────────────────────
(() => {
  // 1. Initialize Google Cloud services
  initFirebase();
  initGoogleAnalytics();

  // 2. Core utilities
  const confetti = initConfetti();

  /** @returns {void} */
  const updateIcons = () => {
    if (window.lucide) { window.lucide.createIcons(); }
  };

  // Inject dependencies
  setChatIconUpdater(updateIcons);
  setQuizDeps(confetti, updateIcons);
  setDashboardIconUpdater(updateIcons);
  setComponentIconUpdater(updateIcons);

  // ─────────────────────────────────────────────
  // 3. FIREBASE AUTH: Google Sign-In + State Sync
  // ─────────────────────────────────────────────

  /**
   * Handles successful authentication and loads cloud data.
   * @param {Object} profile - User profile from Firebase Auth.
   */
  async function handleAuthSuccess(profile) {
    setUser(profile);

    // Load progress from Firestore and merge with local state
    const progress = await loadUserProgress(profile.uid);
    if (progress) {
      if (progress.quizScore > state.quizScore) {
        saveQuizScore(progress.quizScore);
      }
      if (progress.wizardProgress) {
        Object.entries(progress.wizardProgress).forEach(([key, val]) => {
          if (val && !state.wizardProgress[key]) {
            toggleWizardStep(key);
          }
        });
      }
    }

    navigate('home');
    trackEvent('login_success', { provider: profile.provider });
    logAnalyticsEvent('login', { method: profile.provider });
  }

  // Google Sign-In button
  document.getElementById('googleSignInBtn')?.addEventListener('click', async () => {
    const profile = await signInWithGoogle();
    if (profile) {
      await handleAuthSuccess(profile);
    }
  });

  // Form-based login (existing)
  document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('userName')?.value.trim();
    const email = document.getElementById('userEmail')?.value.trim();
    const location = document.getElementById('userLocation')?.value.trim();

    if (!name || !email || !location) { return; }

    // Create session with anonymous auth + form data
    const uid = await signInAnonymously();
    const profile = {
      uid: uid || `local_${Date.now()}`,
      displayName: name,
      email,
      location,
      provider: uid ? 'anonymous' : 'form',
    };

    await saveUserProfile(profile);
    await handleAuthSuccess(profile);
  });

  // Listen for auth state changes (auto-login returning users)
  onAuthStateChanged((user) => {
    if (user && !state.user) {
      const profile = {
        uid: user.uid,
        displayName: user.displayName || 'Voter',
        email: user.email || '',
        photoURL: user.photoURL || '',
        provider: user.isAnonymous ? 'anonymous' : 'google',
      };
      setUser(profile);
    }
  });

  // ─────────────────────────────────────────────
  // 4. THEME
  // ─────────────────────────────────────────────

  /** @param {string} t */
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
  // 5. MOBILE SIDEBAR
  // ─────────────────────────────────────────────
  document.getElementById('hamburger')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.add('open');
  });
  document.getElementById('sidebarClose')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.remove('open');
  });

  // ─────────────────────────────────────────────
  // 6. MAP (Gemini AI Backend)
  // ─────────────────────────────────────────────
  function initMapInteraction() {
    const btn = document.getElementById('btnFindMap');
    const input = document.getElementById('mapLocationInput');
    const container = document.getElementById('mapContainer');
    const frame = document.getElementById('mapFrame');
    const loading = document.getElementById('mapLoading');

    if (!btn || !input) { return; }

    btn.addEventListener('click', async () => {
      const loc = input.value.trim();
      if (!loc) { return; }

      if (loading) { loading.classList.remove('hidden'); }
      if (container) { container.classList.add('hidden'); }

      try {
        const html = await fetchElectionMap(loc);
        if (frame) { frame.srcdoc = html; }
        if (container) { container.classList.remove('hidden'); }
        trackEvent('map_generated', { location: loc });
        logAnalyticsEvent('map_generated', { location: loc });
      } catch (err) {
        console.error('[Map] Failed:', err.message);
        const ariaLive = document.getElementById('ariaLive');
        if (ariaLive) { ariaLive.textContent = `Map failed: ${err.message}`; }
      } finally {
        if (loading) { loading.classList.add('hidden'); }
      }
    });
  }

  // ─────────────────────────────────────────────
  // 7. FIRESTORE SYNC (persist quiz + wizard changes)
  // ─────────────────────────────────────────────
  window.addEventListener('stateChange', async (e) => {
    const uid = state.user?.uid;
    if (!uid) { return; }

    const key = e.detail?.key;
    if (key === 'quizScore') {
      await saveQuizScoreToFirestore(uid, state.quizScore);
    } else if (key === 'wizardProgress') {
      await saveWizardProgressToFirestore(uid, state.wizardProgress);
    }
  });

  // ─────────────────────────────────────────────
  // 8. PAGE ROUTING
  // ─────────────────────────────────────────────

  /** @param {string} page */
  const onPageLoad = (page) => {
    switch (page) {
      case 'home':
      case 'dashboard': renderDashboard(); break;
      case 'timeline': renderTimeline(); break;
      case 'wizard': renderWizard(); break;
      case 'quiz': renderQuiz(); break;
      case 'booths': renderBooths(); break;
      case 'museum': renderMuseum(); break;
      case 'events': renderEvents(); break;
      default: break;
    }
    updateIcons();
    trackPageView(`/${page}`, `VoteWise — ${page}`);
    logAnalyticsEvent('page_view', { page_name: page });
  };

  const handleGlobalRefresh = () => {
    const hash = window.location.hash.replace('#', '') || 'home';
    onPageLoad(hash);
  };

  // Initialize all modules
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
  updateIcons();

  console.info('[VoteWise] v2.1 initialized.');
})();

// Register Service Worker for PWA offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('[SW] Registered:', reg.scope))
      .catch((err) => console.warn('[SW] Registration failed:', err));
  });
}
