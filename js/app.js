import { electionData, faqs, quizQuestions, pollingBooths, museumExhibits, liveEvents } from './data.js';
import { initConfetti } from './confetti.js';

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE ---
  const state = {
    region: localStorage.getItem('vw_region') || 'india',
    theme: localStorage.getItem('vw_theme') || 'light',
    wizardProgress: JSON.parse(localStorage.getItem('vw_wizard')) || {},
    quizScore: parseInt(localStorage.getItem('vw_quizScore')) || 0,
    chatHistory: [],
    timelineView: 'horizontal'
  };

  const confetti = initConfetti();

  const updateIcons = () => { if(window.lucide) window.lucide.createIcons(); };

  // --- CORE SYSTEM: ROUTING & NAVIGATION ---
  const pages = document.querySelectorAll('.page');
  const navItems = document.querySelectorAll('.nav-item');
  
  function navigate(pageId) {
    window.location.hash = pageId;
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${pageId}`)?.classList.add('active');
    
    navItems.forEach(n => {
      n.classList.remove('active');
      if(n.dataset.page === pageId) n.classList.add('active');
    });

    if(pageId === 'dashboard') renderDashboard();
    
    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
  }

  // Handle hash change
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'home';
    navigate(hash);
  });
  
  // Intercept navigation clicks
  document.querySelectorAll('[data-navigate]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(el.dataset.navigate);
    });
  });

  // Mobile Menu
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
  });
  document.getElementById('sidebarClose').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
  });

  // --- CORE SYSTEM: THEME ---
  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    localStorage.setItem('vw_theme', t);
    state.theme = t;
    const isDark = t === 'dark';
    document.querySelector('.theme-icon').innerHTML = isDark ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
    document.querySelector('.theme-label').textContent = isDark ? 'Light Mode' : 'Dark Mode';
    document.getElementById('themeToggleMobile').innerHTML = isDark ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
    updateIcons();
  }
  
  applyTheme(state.theme);
  
  document.getElementById('themeToggle').addEventListener('click', () => {
    applyTheme(state.theme === 'light' ? 'dark' : 'light');
  });
  document.getElementById('themeToggleMobile').addEventListener('click', () => {
    applyTheme(state.theme === 'light' ? 'dark' : 'light');
  });

  // --- TIMELINE MODULE ---
  function renderTimeline() {
    const data = electionData[state.region];
    if (!data) return;

    // Update Banner
    document.getElementById('countdownEvent').textContent = data.nextEvent;
    
    // Render Cards
    const container = document.getElementById('timelineContainer');
    container.className = `timeline-container ${state.timelineView}`;
    
    container.innerHTML = data.timeline.map(item => `
      <div class="timeline-card ${item.passed ? 'passed' : item.upcoming ? 'upcoming' : ''}">
        <div class="tl-date">${item.date}</div>
        <h3 class="tl-title">${item.title}</h3>
        <p class="tl-desc">${item.desc}</p>
      </div>
    `).join('');

    // Update Region Buttons
    document.querySelectorAll('.region-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.region === state.region);
    });
  }

  // Timeline Event Listeners
  document.querySelectorAll('.region-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.region = e.target.dataset.region;
      localStorage.setItem('vw_region', state.region);
      renderTimeline();
      renderWizard();
    });
  });

  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.timelineView = e.target.dataset.view;
      document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderTimeline();
    });
  });

  // Countdown logic
  setInterval(() => {
    const data = electionData[state.region];
    if(!data || !data.nextDate) return;
    const diff = data.nextDate - new Date().getTime();
    if(diff <= 0) {
      document.getElementById('countdownTimer').innerHTML = "<span>Happening Now!</span>";
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


  // --- WIZARD MODULE ---
  function renderWizard() {
    const data = electionData[state.region];
    if(!data) return;

    document.getElementById('wizardRegion').value = state.region;

    const steps = data.wizard;
    const container = document.getElementById('wizardSteps');
    
    container.innerHTML = steps.map((step, idx) => {
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
    }).join('');

    // Add listeners
    container.querySelectorAll('.wizard-step').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        const key = `${state.region}_${id}`;
        state.wizardProgress[key] = !state.wizardProgress[key];
        localStorage.setItem('vw_wizard', JSON.stringify(state.wizardProgress));
        renderWizard(); // re-render to update progress
      });
    });

    // Update Progress Bar
    const total = steps.length;
    const completed = steps.filter(s => state.wizardProgress[`${state.region}_${s.id}`]).length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    document.getElementById('wizardProgress').style.width = `${pct}%`;
    document.getElementById('wizardProgressText').textContent = `${pct}% Complete`;
  }

  document.getElementById('wizardRegion').addEventListener('change', (e) => {
    state.region = e.target.value;
    localStorage.setItem('vw_region', state.region);
    renderWizard();
    renderTimeline();
  });


  // --- CHATBOT MODULE ---
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
    div.className = `message bot`;
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
    if(!q.trim()) return;
    addChatMessage(q, true);
    chatInput.value = '';

    const typingId = showTyping();

    // Simulate network delay and AI RAG processing
    setTimeout(() => {
      document.getElementById(typingId)?.remove();
      
      // Simple RAG simulation
      const lq = q.toLowerCase();
      let response = "I'm not sure about that specific detail. As an AI assistant, I recommend checking your local election authority's official website.";
      
      const matchedFaq = faqs.find(f => lq.includes(f.category) || lq.includes(f.q.toLowerCase().split(' ')[1]));
      if(matchedFaq) response = matchedFaq.a;
      
      if(lq.includes('hello') || lq.includes('hi')) response = "Hello! How can I help you prepare for the upcoming elections?";
      if(lq.includes('when') && lq.includes('election')) response = `Based on your selected region (${electionData[state.region].name}), the next key event is ${electionData[state.region].nextEvent} on ${new Date(electionData[state.region].nextDate).toLocaleDateString()}.`;

      addChatMessage(response, false);
      state.chatHistory.push({q, a: response});
    }, 1200);
  }

  document.getElementById('chatSend').addEventListener('click', () => handleChat(chatInput.value));
  chatInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') handleChat(chatInput.value);
  });

  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => handleChat(chip.textContent));
  });


  // --- QUIZ MODULE ---
  let currentQIdx = 0;
  let currentScore = 0;

  function renderQuiz() {
    if(currentQIdx >= quizQuestions.length) {
      showResults();
      return;
    }

    const q = quizQuestions[currentQIdx];
    document.getElementById('quizProgressText').textContent = `Question ${currentQIdx + 1} of ${quizQuestions.length}`;
    document.getElementById('quizProgressFill').style.width = `${((currentQIdx) / quizQuestions.length) * 100}%`;
    
    document.getElementById('quizQuestion').textContent = q.q;
    const opts = document.getElementById('quizOptions');
    opts.innerHTML = q.options.map((opt, idx) => `
      <div class="quiz-option" data-idx="${idx}">${opt}</div>
    `).join('');

    const btnNext = document.getElementById('quizNext');
    btnNext.classList.add('hidden');
    
    opts.querySelectorAll('.quiz-option').forEach(el => {
      el.addEventListener('click', (e) => {
        if(!btnNext.classList.contains('hidden')) return; // already answered
        
        const selected = parseInt(e.target.dataset.idx);
        e.target.classList.add('selected');
        
        if(selected === q.answer) {
          e.target.classList.add('correct');
          currentScore++;
        } else {
          e.target.classList.add('wrong');
          opts.children[q.answer].classList.add('correct');
        }
        
        btnNext.classList.remove('hidden');
        if(currentQIdx === quizQuestions.length - 1) btnNext.textContent = "Finish Quiz";
      });
    });
  }

  function showResults() {
    document.getElementById('quizActive').classList.add('hidden');
    document.getElementById('quizResults').classList.remove('hidden');
    
    document.getElementById('resultsScore').textContent = `${currentScore}/${quizQuestions.length}`;
    
    let msg = "Keep learning!"; let icon = "book-open";
    if(currentScore > 3) { msg = "Good job!"; icon = "star"; }
    if(currentScore === 5) { msg = "Perfect Score! Civic Genius!"; icon = "trophy"; confetti?.fire(); }
    
    document.getElementById('resultsMessage').textContent = msg;
    document.getElementById('resultsIcon').innerHTML = `<i data-lucide="${icon}" style="width:64px;height:64px"></i>`;
    updateIcons();

    if(currentScore > state.quizScore) {
      state.quizScore = currentScore;
      localStorage.setItem('vw_quizScore', currentScore);
    }
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


  // --- FAQ MODULE ---
  function renderFaqs(filterCat = 'all', searchQuery = '') {
    const list = document.getElementById('faqList');
    
    let filtered = faqs;
    if(filterCat !== 'all') filtered = filtered.filter(f => f.category === filterCat);
    if(searchQuery) filtered = filtered.filter(f => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase()));

    list.innerHTML = filtered.map((f, i) => `
      <div class="faq-item">
        <div class="faq-question">
          <span>${f.q}</span>
          <span class="faq-icon">▼</span>
        </div>
        <div class="faq-answer"><p>${f.a}</p></div>
      </div>
    `).join('');

    list.querySelectorAll('.faq-question').forEach(q => {
      q.addEventListener('click', (e) => {
        const item = q.parentElement;
        item.classList.toggle('open');
      });
    });
  }

  document.querySelectorAll('.faq-cat').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.faq-cat').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderFaqs(e.target.dataset.cat, document.getElementById('faqSearch').value);
    });
  });

  document.getElementById('faqSearch').addEventListener('input', (e) => {
    const activeCat = document.querySelector('.faq-cat.active').dataset.cat;
    renderFaqs(activeCat, e.target.value);
  });


  // --- DASHBOARD MODULE ---
  function renderDashboard() {
    document.getElementById('dashRegion').innerHTML = `<i data-lucide="${electionData[state.region].icon}"></i> ${electionData[state.region].name}`;
    updateIcons();
    
    // Quiz Stat
    document.getElementById('dashQuizStat').textContent = state.quizScore > 0 ? `${state.quizScore}/5` : 'Not taken yet';
    
    // Wizard Stat
    const steps = electionData[state.region].wizard || [];
    const completed = steps.filter(s => state.wizardProgress[`${state.region}_${s.id}`]).length;
    const total = steps.length;
    const pct = total ? Math.round((completed/total)*100) : 0;
    
    document.getElementById('dashWizardStat').textContent = `${completed} / ${total} steps`;
    document.getElementById('dashWizardFill').style.width = `${pct}%`;
    
    // Readiness Ring
    const readinessPct = Math.round((pct + (state.quizScore/5)*100)/2);
    document.getElementById('readinessPct').textContent = `${readinessPct}%`;
    const offset = 314 - (314 * readinessPct) / 100;
    setTimeout(() => {
      document.getElementById('readinessRing').style.strokeDashoffset = offset;
    }, 100);

    // Chat stat
    document.getElementById('dashChatStat').textContent = `${state.chatHistory.length} interactions`;

    // Deadlines
    const deadlines = electionData[state.region].timeline.filter(t => !t.passed);
    const list = document.getElementById('deadlinesList');
    
    if(deadlines.length === 0) {
      list.innerHTML = `<p class="text-muted">No upcoming deadlines.</p>`;
    } else {
      list.innerHTML = deadlines.slice(0,3).map(d => {
        const diff = new Date(d.date).getTime() - new Date().getTime();
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
      }).join('');
    }
  }

  // --- ELECTHON'23 NEW MODULES ---

  function renderBooths() {
    const grid = document.getElementById('boothGrid');
    if(!grid) return;
    grid.innerHTML = pollingBooths.map(b => {
      let colorClass = b.crowdLevel === 'low' ? 'success' : (b.crowdLevel === 'medium' ? 'accent' : 'error');
      let statusText = b.crowdLevel === 'low' ? 'Smooth' : (b.crowdLevel === 'medium' ? 'Busy' : 'Crowded');
      return `
        <div class="booth-card">
          <div class="booth-header">
            <h3>${b.name}</h3>
            <span class="booth-dist">${b.distance}</span>
          </div>
          <div class="booth-stats">
            <div class="booth-stat">
              <span class="stat-val">${b.waitTime} min</span>
              <span class="stat-lbl">Est. Wait</span>
            </div>
            <div class="booth-stat crowd-stat">
              <span class="crowd-indicator bg-${colorClass}">
                <span class="pulse"></span>
              </span>
              <span class="stat-lbl">${statusText}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderMuseum() {
    const gallery = document.getElementById('museumGallery');
    if(!gallery) return;
    gallery.innerHTML = museumExhibits.map((ex, i) => `
      <div class="museum-card">
        <div class="museum-icon"><i data-lucide="${ex.icon}"></i></div>
        <div class="museum-year">${ex.year}</div>
        <h3>${ex.title}</h3>
        <p>${ex.desc}</p>
      </div>
    `).join('');
    updateIcons();

    const nextBtn = document.getElementById('galleryNext');
    const prevBtn = document.getElementById('galleryPrev');
    if(nextBtn) nextBtn.onclick = () => gallery.scrollBy({ left: 350, behavior: 'smooth' });
    if(prevBtn) prevBtn.onclick = () => gallery.scrollBy({ left: -350, behavior: 'smooth' });
  }

  function renderEvents() {
    const feed = document.getElementById('eventsFeed');
    if(!feed) return;
    feed.innerHTML = liveEvents.map(ev => `
      <div class="event-card">
        <div class="event-icon"><i data-lucide="${ev.icon}"></i></div>
        <div class="event-details">
          <h3>${ev.title}</h3>
          <p class="event-meta"><i data-lucide="map-pin"></i> ${ev.location} &nbsp;|&nbsp; <i data-lucide="clock"></i> ${ev.time}</p>
        </div>
        <button class="btn btn-sm btn-outline">RSVP</button>
      </div>
    `).join('');
    updateIcons();
  }

  function initPrideBadge() {
    const btn = document.getElementById('claimInkBtn');
    if(btn) {
      btn.addEventListener('click', (e) => {
        e.target.parentElement.classList.add('hidden');
        document.getElementById('prideBadge').classList.remove('hidden');
        confetti?.fire();
      });
    }
  }

  function initMap() {
    const btn = document.getElementById('btnFindMap');
    const input = document.getElementById('mapLocationInput');
    const container = document.getElementById('mapContainer');
    const frame = document.getElementById('mapFrame');
    const loading = document.getElementById('mapLoading');

    if(!btn) return;

    btn.addEventListener('click', async () => {
      const loc = input.value.trim();
      if(!loc) return alert("Please enter a location first.");

      // Show loading
      container.classList.remove('hidden');
      loading.classList.remove('hidden');
      frame.src = "about:blank"; // clear previous

      try {
        const res = await fetch('http://localhost:8000/api/generate_map', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location: loc })
        });

        if(!res.ok) throw new Error("Failed to load map.");
        
        const html = await res.text();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        frame.src = url;

      } catch (err) {
        console.error(err);
        alert("Failed to generate map. Is the Python backend running?");
        container.classList.add('hidden');
      } finally {
        loading.classList.add('hidden');
      }
    });
  }

  // --- INITIALIZATION ---
  initMap();
  renderTimeline();
  renderWizard();
  renderFaqs();
  renderBooths();
  renderMuseum();
  renderEvents();
  initPrideBadge();
  
  // Set initial page
  const hash = window.location.hash.replace('#', '') || 'home';
  navigate(hash);
  
  // Animate numbers on home
  document.querySelectorAll('.stat-number').forEach(n => {
    const target = parseInt(n.dataset.count);
    let current = 0;
    const timer = setInterval(() => {
      current += Math.ceil(target / 20);
      if(current >= target) {
        current = target;
        clearInterval(timer);
      }
      n.textContent = current + (target > 50 ? '+' : '');
    }, 50);
  });
});
