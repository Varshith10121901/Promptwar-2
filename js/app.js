/**
 * VoteWise — Main Application Orchestrator
 *
 * This file is a clean coordinator that delegatess all domain logic
 * to specialized, decoupled ES modules.
 *
 * @module app
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
  initPrideBadge 
} from './components.js';

/**
 * Entry point of the application.
 * Executes immediately as a module.
 */
(() => {
  // ─────────────────────────────────────────────
  // 1. CORE UTILITIES
  // ─────────────────────────────────────────────
  const confetti = initConfetti();
  const updateIcons = () => {
    if (window.lucide) window.lucide.createIcons();
  };

  // Inject dependencies into modules
  setChatIconUpdater(updateIcons);
  setQuizDeps(confetti, updateIcons);
  setDashboardIconUpdater(updateIcons);
  setComponentIconUpdater(updateIcons);

  // ─────────────────────────────────────────────
  // 2. THEME INITIALIZATION
  // ─────────────────────────────────────────────
  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    setTheme(t);
    const isDark = t === 'dark';
    
    // Update Theme Toggle Buttons
    const themeIcon = document.querySelector('.theme-icon');
    const themeLabel = document.querySelector('.theme-label');
    const themeMobile = document.getElementById('themeToggleMobile');

    if (themeIcon) themeIcon.innerHTML = `<i data-lucide="${isDark ? 'sun' : 'moon'}"></i>`;
    if (themeLabel) themeLabel.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    if (themeMobile) themeMobile.innerHTML = `<i data-lucide="${isDark ? 'sun' : 'moon'}"></i>`;
    
    updateIcons();
  }

  // Initial Theme Load
  applyTheme(state.theme);

  // Listeners
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    applyTheme(state.theme === 'light' ? 'dark' : 'light');
  });
  document.getElementById('themeToggleMobile')?.addEventListener('click', () => {
    applyTheme(state.theme === 'light' ? 'dark' : 'light');
  });

  // ─────────────────────────────────────────────
  // 3. UI NAVIGATION (Mobile)
  // ─────────────────────────────────────────────
  document.getElementById('hamburger')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.add('open');
  });
  document.getElementById('sidebarClose')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.remove('open');
  });

  // ─────────────────────────────────────────────
  // 4. MAP GENERATION (Backend Integration)
  // ─────────────────────────────────────────────
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

      loading.classList.remove('hidden');
      container.classList.add('hidden');

      try {
        const html = await fetchElectionMap(loc);
        frame.srcdoc = html;
        container.classList.remove('hidden');
      } catch (err) {
        alert(err.message);
      } finally {
        loading.classList.add('hidden');
      }
    });
  }

  // ─────────────────────────────────────────────
  // 5. BOOTSTRAP ALL MODULES
  // ─────────────────────────────────────────────
  
  // Refresh UI based on current route/page
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
    }
    updateIcons();
  };

  // Shared callback for region changes
  const handleGlobalRefresh = () => {
    onPageLoad(window.location.hash.replace('#', '') || 'home');
  };

  // Init Domain Logic
  initRouter(isAuthenticated, onPageLoad);
  initTimeline(handleGlobalRefresh);
  initWizard(handleGlobalRefresh);
  initChat(document.getElementById('chatInput'), document.getElementById('chatMessages'));
  initQuiz();
  initFaq();
  initPrideBadge(confetti);
  initMapInteraction();
  initCountdown();

  // Initial render
  updateIcons();
})();
