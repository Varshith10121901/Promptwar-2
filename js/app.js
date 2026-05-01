/**
 * VoteWise — Main Application Orchestrator
 *
 * This file is a thin coordinator. All logic is delegated to dedicated modules:
 *   - state.js   → State management & persistence
 *   - router.js  → SPA routing & auth guard
 *   - api.js     → Backend API calls
 *   - data.js    → Mock data layer
 *   - confetti.js → Confetti animation
 *
 * @module app
 */

import {
  electionData,
  faqs,
  quizQuestions,
  pollingBooths,
  museumExhibits,
  liveEvents,
} from './data.js';
import { initConfetti } from './confetti.js';
import {
  state,
  setUser,
  setRegion,
  setTheme,
  toggleWizardStep,
  saveQuizScore,
  addChatEntry,
  isAuthenticated,
} from './state.js';
import { navigate, initRouter } from './router.js';
import { fetchElectionMap } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  // ─────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────
  const confetti = initConfetti();
  const updateIcons = () => {
    if (window.lucide) window.lucide.createIcons();
  };

  // ─────────────────────────────────────────────
  // THEME MODULE
  // ─────────────────────────────────────────────
  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    setTheme(t);
    const isDark = t === 'dark';
    document.querySelector('.theme-icon').innerHTML = isDark
      ? '<i data-lucide="sun"></i>'
      : '<i data-lucide="moon"></i>';
    document.querySelector('.theme-label').textContent = isDark ? 'Light Mode' : 'Dark Mode';
    document.getElementById('themeToggleMobile').innerHTML = isDark
      ? '<i data-lucide="sun"></i>'
      : '<i data-lucide="moon"></i>';
    updateIcons();
  }

  applyTheme(state.theme);

  document.getElementById('themeToggle').addEventListener('click', () => {
    applyTheme(state.theme === 'light' ? 'dark' : 'light');
  });
  document.getElementById('themeToggleMobile').addEventListener('click', () => {
    applyTheme(state.theme === 'light' ? 'dark' : 'light');
  });

  // ─────────────────────────────────────────────
  // MOBILE MENU
  // ─────────────────────────────────────────────
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
  });
  document.getElementById('sidebarClose').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
  });

  // ─────────────────────────────────────────────
  // TIMELINE MODULE
  // ─────────────────────────────────────────────
  function renderTimeline() {
    const data = electionData[state.region];
    if (!data) return;

    document.getElementById('countdownEvent').textContent = data.nextEvent;

    const container = document.getElementById('timelineContainer');
    container.className = `timeline-container ${state.timelineView}`;

    container.innerHTML = data.timeline
      .map(
        (item) => `
      <div class="timeline-card ${item.passed ? 'passed' : item.upcoming ? 'upcoming' : ''}">
        <div class="tl-date">${item.date}</div>
        <h3 class="tl-title">${item.title}</h3>
        <p class="tl-desc">${item.desc}</p>
      </div>
    `
      )
      .join('');

    document.querySelectorAll('.region-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.region === state.region);
    });
  }

  document.querySelectorAll('.region-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      setRegion(e.target.dataset.region);
      renderTimeline();
      renderWizard();
    });
  });

  document.querySelectorAll('.toggle-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      state.timelineView = e.target.dataset.view;
      document.querySelectorAll('.toggle-btn').forEach((b) => b.classList.remove('active'));
      e.target.classList.add('active');
      renderTimeline();
    });
  });

  // Countdown clock
  setInterval(() => {
    const data = electionData[state.region];
    if (!data || !data.nextDate) return;
    const diff = data.nextDate - Date.now();
    if (diff <= 0) {
      document.getElementById('countdownTimer').innerHTML = '<span>Happening Now!</span>';
      return;
    }
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);

    document.getElementById('countdownTimer').innerHTML = `
      <div class="timer-block"><span class="timer-val">${d}</span><span class="timer-lbl">Days</span></div>
      <div class="timer-block"><span class="timer-val">${h}</span><span class="timer-lbl">Hrs</span></div>
      <div class="timer-block"><span class="timer-val">${m}</span><span class="timer-lbl">Min</span></div>
    `;
  }, 1000);

  // ─────────────────────────────────────────────
  // WIZARD MODULE
  // ─────────────────────────────────────────────
  function renderWizard() {
    const data = electionData[state.region];
    if (!data) return;

    document.getElementById('wizardRegion').value = state.region;
    const steps = data.wizard;
    const container = document.getElementById('wizardSteps');

    container.innerHTML = steps
      .map((step, idx) => {
        const isCompleted = state.wizardProgress[`${state.region}_${step.id}`];
        return `
        <div class="wizard-step ${isCompleted ? 'completed' : ''}" data-id="${step.id}">
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
    });

    const total = steps.length;
    const completed = steps.filter((s) => state.wizardProgress[`${state.region}_${s.id}`]).length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

    document.getElementById('wizardProgress').style.width = `${pct}%`;
    document.getElementById('wizardProgressText').textContent = `${pct}% Complete`;
  }

  document.getElementById('wizardRegion').addEventListener('change', (e) => {
    setRegion(e.target.value);
    renderWizard();
    renderTimeline();
  });

  // ─────────────────────────────────────────────
  // CHATBOT MODULE
  // ─────────────────────────────────────────────
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');

  function addChatMessage(text, isUser = false) {
    const div = document.createElement('div');
    div.className = `message ${isUser ? 'user' : 'bot'}`;
    div.innerHTML = `
      ${!isUser ? '<div class="message-avatar"><i data-lucide="bot"></i></div>' : '<div class="message-avatar"><i data-lucide="user"></i></div>'}
      <div class="message-content">${text}</div>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    updateIcons();
  }

  function showTyping() {
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.className = 'message bot';
    div.id = id;
    div.innerHTML = `
      <div class="message-avatar"><i data-lucide="bot"></i></div>
      <div class="typing-indicator"><span></span><span></span><span></span></div>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    updateIcons();
    return id;
  }

  function handleChat(q) {
    if (!q.trim()) return;
    addChatMessage(q, true);
    chatInput.value = '';

    const typingId = showTyping();

    setTimeout(() => {
      document.getElementById(typingId)?.remove();

      const lq = q.toLowerCase();
      let response =
        "I'm not sure about that. I recommend checking your local election authority's official website.";

      const matchedFaq = faqs.find(
        (f) => lq.includes(f.category) || lq.includes(f.q.toLowerCase().split(' ')[1])
      );
      if (matchedFaq) response = matchedFaq.a;

      if (lq.includes('hello') || lq.includes('hi'))
        response = 'Hello! How can I help you prepare for the upcoming elections?';
      if (lq.includes('when') && lq.includes('election')) {
        response = `Based on your region (${electionData[state.region].name}), the next event is ${electionData[state.region].nextEvent}.`;
      }

      addChatMessage(response, false);
      addChatEntry(q, response);
    }, 1200);
  }

  document.getElementById('chatSend').addEventListener('click', () => handleChat(chatInput.value));
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChat(chatInput.value);
  });
  document.querySelectorAll('.suggestion-chip').forEach((chip) => {
    chip.addEventListener('click', () => handleChat(chip.textContent));
  });

  // ─────────────────────────────────────────────
  // QUIZ MODULE
  // ─────────────────────────────────────────────
  let currentQIdx = 0;
  let currentScore = 0;

  function renderQuiz() {
    if (currentQIdx >= quizQuestions.length) {
      showResults();
      return;
    }

    const q = quizQuestions[currentQIdx];
    document.getElementById('quizProgressText').textContent =
      `Question ${currentQIdx + 1} of ${quizQuestions.length}`;
    document.getElementById('quizProgressFill').style.width =
      `${(currentQIdx / quizQuestions.length) * 100}%`;

    document.getElementById('quizQuestion').textContent = q.q;
    const opts = document.getElementById('quizOptions');
    opts.innerHTML = q.options
      .map(
        (opt, idx) => `
      <div class="quiz-option" data-idx="${idx}">${opt}</div>
    `
      )
      .join('');

    const btnNext = document.getElementById('quizNext');
    btnNext.classList.add('hidden');

    opts.querySelectorAll('.quiz-option').forEach((el) => {
      el.addEventListener('click', (e) => {
        if (!btnNext.classList.contains('hidden')) return;
        const selected = parseInt(e.target.dataset.idx);
        e.target.classList.add('selected');

        if (selected === q.answer) {
          e.target.classList.add('correct');
          currentScore++;
        } else {
          e.target.classList.add('wrong');
          opts.children[q.answer].classList.add('correct');
        }

        btnNext.classList.remove('hidden');
        if (currentQIdx === quizQuestions.length - 1) btnNext.textContent = 'Finish Quiz';
      });
    });
  }

  function showResults() {
    document.getElementById('quizActive').classList.add('hidden');
    document.getElementById('quizResults').classList.remove('hidden');

    document.getElementById('resultsScore').textContent = `${currentScore}/${quizQuestions.length}`;

    let msg = 'Keep learning!';
    let icon = 'book-open';
    if (currentScore > 3) {
      msg = 'Good job!';
      icon = 'star';
    }
    if (currentScore === 5) {
      msg = 'Perfect Score! Civic Genius!';
      icon = 'trophy';
      confetti?.fire();
    }

    document.getElementById('resultsMessage').textContent = msg;
    document.getElementById('resultsIcon').innerHTML =
      `<i data-lucide="${icon}" style="width:64px;height:64px"></i>`;
    updateIcons();

    saveQuizScore(currentScore);
  }

  document.getElementById('startQuizBtn').addEventListener('click', () => {
    document.getElementById('quizStart').classList.add('hidden');
    document.getElementById('quizActive').classList.remove('hidden');
    currentQIdx = 0;
    currentScore = 0;
    renderQuiz();
  });

  document.getElementById('quizNext').addEventListener('click', () => {
    currentQIdx++;
    renderQuiz();
  });
  document.getElementById('retryQuiz').addEventListener('click', () => {
    document.getElementById('quizResults').classList.add('hidden');
    document.getElementById('quizStart').classList.remove('hidden');
  });

  // ─────────────────────────────────────────────
  // FAQ MODULE
  // ─────────────────────────────────────────────
  function renderFaqs(filterCat = 'all', searchQuery = '') {
    const list = document.getElementById('faqList');
    let filtered = faqs;
    if (filterCat !== 'all') filtered = filtered.filter((f) => f.category === filterCat);
    if (searchQuery)
      filtered = filtered.filter(
        (f) =>
          f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.a.toLowerCase().includes(searchQuery.toLowerCase())
      );

    list.innerHTML = filtered
      .map(
        (f) => `
      <div class="faq-item">
        <div class="faq-question">
          <span>${f.q}</span>
          <span class="faq-icon">▼</span>
        </div>
        <div class="faq-answer"><p>${f.a}</p></div>
      </div>
    `
      )
      .join('');

    list.querySelectorAll('.faq-question').forEach((q) => {
      q.addEventListener('click', () => q.parentElement.classList.toggle('open'));
    });
  }

  document.querySelectorAll('.faq-cat').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.faq-cat').forEach((b) => b.classList.remove('active'));
      e.target.classList.add('active');
      renderFaqs(e.target.dataset.cat, document.getElementById('faqSearch').value);
    });
  });

  document.getElementById('faqSearch').addEventListener('input', (e) => {
    const activeCat = document.querySelector('.faq-cat.active').dataset.cat;
    renderFaqs(activeCat, e.target.value);
  });

  // ─────────────────────────────────────────────
  // DASHBOARD MODULE
  // ─────────────────────────────────────────────
  function renderDashboard() {
    document.getElementById('dashRegion').innerHTML =
      `<i data-lucide="${electionData[state.region].icon}"></i> ${electionData[state.region].name}`;
    updateIcons();

    document.getElementById('dashQuizStat').textContent =
      state.quizScore > 0 ? `${state.quizScore}/5` : 'Not taken yet';

    const steps = electionData[state.region].wizard || [];
    const completed = steps.filter((s) => state.wizardProgress[`${state.region}_${s.id}`]).length;
    const total = steps.length;
    const pct = total ? Math.round((completed / total) * 100) : 0;

    document.getElementById('dashWizardStat').textContent = `${completed} / ${total} steps`;
    document.getElementById('dashWizardFill').style.width = `${pct}%`;

    const readinessPct = Math.round((pct + (state.quizScore / 5) * 100) / 2);
    document.getElementById('readinessPct').textContent = `${readinessPct}%`;
    const offset = 314 - (314 * readinessPct) / 100;
    setTimeout(() => {
      document.getElementById('readinessRing').style.strokeDashoffset = offset;
    }, 100);

    document.getElementById('dashChatStat').textContent =
      `${state.chatHistory.length} interactions`;

    const deadlines = electionData[state.region].timeline.filter((t) => !t.passed);
    const list = document.getElementById('deadlinesList');

    if (deadlines.length === 0) {
      list.innerHTML = '<p class="text-muted">No upcoming deadlines.</p>';
    } else {
      list.innerHTML = deadlines
        .slice(0, 3)
        .map((d) => {
          const diff = new Date(d.date).getTime() - Date.now();
          const days = Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
          const urgent = days < 30 && days > 0;
          return `
          <div class="deadline-item ${urgent ? 'urgent' : ''}">
            <div class="dl-info">
              <span class="dl-title">${d.title}</span>
              <span class="dl-date">${d.date}</span>
            </div>
            <span class="dl-days">${days} days</span>
          </div>
        `;
        })
        .join('');
    }
  }

  // ─────────────────────────────────────────────
  // ELECTHON'23: BOOTHS, MUSEUM, EVENTS, PRIDE
  // ─────────────────────────────────────────────
  function renderBooths() {
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

  function renderMuseum() {
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
    updateIcons();

    const nextBtn = document.getElementById('galleryNext');
    const prevBtn = document.getElementById('galleryPrev');
    if (nextBtn) nextBtn.onclick = () => gallery.scrollBy({ left: 350, behavior: 'smooth' });
    if (prevBtn) prevBtn.onclick = () => gallery.scrollBy({ left: -350, behavior: 'smooth' });
  }

  function renderEvents() {
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
    updateIcons();
  }

  function initPrideBadge() {
    const btn = document.getElementById('claimInkBtn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.target.parentElement.classList.add('hidden');
        document.getElementById('prideBadge').classList.remove('hidden');
        confetti?.fire();
      });
    }
  }

  // ─────────────────────────────────────────────
  // MAP MODULE (Uses api.js)
  // ─────────────────────────────────────────────
  function initMap() {
    const btn = document.getElementById('btnFindMap');
    const input = document.getElementById('mapLocationInput');
    const container = document.getElementById('mapContainer');
    const frame = document.getElementById('mapFrame');
    const loading = document.getElementById('mapLoading');
    const ariaLive = document.getElementById('ariaLive');

    if (!btn) return;

    // Auto-fill from user's saved location
    if (state.user?.location && !input.value) {
      input.value = state.user.location;
    }

    btn.addEventListener('click', async () => {
      const loc = input.value.trim();
      if (!loc) {
        alert('Please enter a location first.');
        return;
      }

      container.classList.remove('hidden');
      loading.classList.remove('hidden');
      frame.src = 'about:blank';
      if (ariaLive) ariaLive.textContent = 'Generating election zone map...';

      try {
        const html = await fetchElectionMap(loc);
        const blob = new Blob([html], { type: 'text/html' });
        frame.src = URL.createObjectURL(blob);
        if (ariaLive) ariaLive.textContent = 'Election zone map loaded successfully.';
      } catch (err) {
        console.error('[Map Error]', err);
        alert('Failed to generate map. Is the Python backend running?');
        container.classList.add('hidden');
      } finally {
        loading.classList.add('hidden');
      }
    });
  }

  // ─────────────────────────────────────────────
  // LOGIN MODULE (Uses state.js)
  // ─────────────────────────────────────────────
  function initLogin() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('userName').value;
      const email = document.getElementById('userEmail').value;
      const location = document.getElementById('userLocation').value;

      setUser({ name, email, location });
      document.body.classList.remove('is-logged-out');
      navigate('home');

      const mapInput = document.getElementById('mapLocationInput');
      if (mapInput) mapInput.value = location;

      confetti?.fire();
    });

    // Session check
    if (!isAuthenticated()) {
      document.body.classList.add('is-logged-out');
    } else {
      document.body.classList.remove('is-logged-out');
    }
  }

  // ─────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────
  initLogin();
  initMap();
  renderTimeline();
  renderWizard();
  renderFaqs();
  renderBooths();
  renderMuseum();
  renderEvents();
  initPrideBadge();

  // Initialize router with auth guard and dashboard callback
  initRouter(isAuthenticated, (pageId) => {
    if (pageId === 'dashboard') renderDashboard();
  });

  // Animate hero stats on home
  document.querySelectorAll('.stat-number').forEach((n) => {
    const target = parseInt(n.dataset.count);
    let current = 0;
    const timer = setInterval(() => {
      current += Math.ceil(target / 20);
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      n.textContent = current + (target > 50 ? '+' : '');
    }, 50);
  });
});
