# 🗳️ VoteWise — AI-Powered Personal Election Assistant

<div align="center">

**Understand. Prepare. Vote with Confidence.**

[![CI/CD Pipeline](https://github.com/Varshith10121901/Promptwar-2/actions/workflows/ci.yml/badge.svg)](https://github.com/Varshith10121901/Promptwar-2/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-22-green.svg)](https://nodejs.org)
[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://python.org)
[![Firebase](https://img.shields.io/badge/Firebase-Integrated-orange.svg)](https://firebase.google.com)

</div>

---

## 📖 Overview

VoteWise is a **Progressive Web Application (PWA)** that empowers citizens to navigate the election process with confidence. Built entirely on the **Google Cloud ecosystem**, it combines real-time AI assistance, interactive learning tools, and cloud-powered data persistence to deliver an accessible, secure, and engaging civic education platform.

---

## 🏗️ Architecture (v2.0 — Modular)

VoteWise uses a strictly decoupled, event-driven SPA architecture designed for maximum code quality, testability, and maintainability.

```
┌─────────────────────────────────────────────────┐
│                  Frontend (PWA)                  │
│  ┌──────────────────────────────────────────┐   │
│  │           app.js (Orchestrator)           │   │
│  │  ┌─────┐ ┌──────┐ ┌────┐ ┌────────┐    │   │
│  │  │state│ │router│ │api │ │firebase│    │   │
│  │  └─────┘ └──────┘ └────┘ └────────┘    │   │
│  │  ┌────┐ ┌────┐ ┌────────┐ ┌─────┐      │   │
│  │  │chat│ │quiz│ │timeline│ │ faq │      │   │
│  │  └────┘ └────┘ └────────┘ └─────┘      │   │
│  │  ┌──────┐ ┌──────────┐ ┌──────────┐    │   │
│  │  │wizard│ │dashboard │ │analytics │    │   │
│  │  └──────┘ └──────────┘ └──────────┘    │   │
│  └──────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────┘
                  │
       ┌──────────▼──────────┐
       │   Google Services   │
       │  ┌────────────────┐ │
       │  │  Gemini 2.5    │ │  ← AI Map Generation
       │  │  Flash API     │ │
       │  └────────────────┘ │
       │  ┌────────────────┐ │
       │  │ Firebase Auth  │ │  ← Google Sign-In + Anon
       │  └────────────────┘ │
       │  ┌────────────────┐ │
       │  │  Firestore DB  │ │  ← Cloud Persistence
       │  └────────────────┘ │
       │  ┌────────────────┐ │
       │  │Cloud Functions │ │  ← Gemini Summary API
       │  └────────────────┘ │
       │  ┌────────────────┐ │
       │  │ GA4 Analytics  │ │  ← Usage Tracking
       │  └────────────────┘ │
       │  ┌────────────────┐ │
       │  │ Firebase Perf  │ │  ← Performance Monitoring
       │  └────────────────┘ │
       │  ┌────────────────┐ │
       │  │ Firebase Host  │ │  ← CDN Delivery
       │  └────────────────┘ │
       │  ┌────────────────┐ │
       │  │  Cloud Run     │ │  ← Serverless Backend
       │  └────────────────┘ │
       │  ┌────────────────┐ │
       │  │ Google Fonts   │ │  ← Typography
       │  └────────────────┘ │
       └─────────────────────┘
```

---

## ☁️ Google Cloud & Services Integration

VoteWise leverages **8 Google Cloud services** for a fully cloud-native architecture:

| # | Service | Purpose | Module |
|---|---------|---------|--------|
| 1 | **Google Gemini 2.5 Flash** | AI-powered polling station generation & civic assistant | `backend/main.py` |
| 2 | **Firebase Authentication** | Google Sign-In + Anonymous auth for secure sessions | `js/firebase.js` |
| 3 | **Cloud Firestore** | User profiles, quiz scores, wizard progress persistence | `js/firebase.js` |
| 4 | **Cloud Functions** | Gemini-powered personalized voting summary generation | `functions/index.js` |
| 5 | **Google Analytics 4** | Page view tracking, event analytics, user engagement | `js/analytics.js` |
| 6 | **Firebase Performance** | Automatic performance monitoring & Web Vitals | `js/firebase.js` |
| 7 | **Firebase Hosting** | Global CDN deployment for the PWA frontend | `firebase.json` |
| 8 | **Google Cloud Run** | Serverless container hosting for FastAPI backend | `.github/workflows/deploy.yml` |
| 9 | **Google Fonts** | Premium typography (Inter, Google Sans) | `index.html` |

---

## ✨ Key Features

### 🗓️ Interactive Election Timeline
- Regional election event tracking (India, US, UK, EU)
- Countdown timer to next election milestone
- Horizontal/vertical view toggle

### 📋 Voting Preparation Wizard
- Step-by-step election readiness checklist
- Progress tracking with cloud persistence
- Region-specific requirements

### 🤖 AI Civic Assistant
- FAQ-matching chatbot with typing indicators
- Context-aware responses based on selected region
- Accessible design with ARIA live regions

### 🧠 Civic Knowledge Quiz
- 5-question interactive quiz with scoring
- Confetti celebration on perfect scores
- Score persistence to Firestore

### 🗺️ AI-Powered Polling Station Map
- **Gemini 2.5 Flash** generates realistic nearby polling stations
- Interactive HD Satellite/Dark/Light map layers (Folium)
- Marker clustering with mini-map navigation

### 📊 Personal Dashboard
- Readiness score with animated circular progress ring
- Quiz stats, wizard progress, chat activity metrics
- Upcoming deadline alerts

### 🏛️ Virtual Election Museum
- Scrollable exhibit gallery with historical milestones
- Fully accessible with keyboard navigation

### 📡 Live Events & Polling Booths
- Real-time booth crowd-level indicators
- Event RSVP with location and time data

---

## 🔒 Security

- **Content Security Policy (CSP)** meta tag prevents XSS attacks
- **Prompt injection guard** on both client (`api.js`) and server (`main.py`)
- **Pydantic validation** with strict input sanitization
- **Environment variables** for all API keys and secrets
- **ESLint security rules**: `no-eval`, `no-implied-eval`, `no-new-func`
- **Bandit security scanner** in CI pipeline
- **npm audit** for dependency vulnerability scanning

---

## 🧪 Testing

### Frontend (Vitest + jsdom)
```bash
npm run test          # Run all tests
npm run test:coverage # Run with coverage report
```

Test suites:
- `tests/state.test.js` — State management (15 tests)
- `tests/api.test.js` — API layer & prompt injection (9 tests)
- `tests/firebase.test.js` — Firebase integration (6 tests)
- `tests/analytics.test.js` — Google Analytics (7 tests)
- `tests/router.test.js` — SPA routing (5 tests)

### Backend (pytest + coverage)
```bash
cd backend
pytest tests/ --cov=. --cov-report=term-missing -v
```

Test suites:
- `tests/test_map_endpoint.py` — API endpoint tests (10 tests)
- `tests/test_schemas.py` — Pydantic validation tests (10 tests)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (recommended: 22)
- Python 3.12+
- A Google Gemini API key

### Frontend Setup
```bash
git clone https://github.com/Varshith10121901/Promptwar-2.git
cd Promptwar-2
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
export GEMINI_API_KEY="your-key-here"
uvicorn main:app --reload --port 8000
```

### Environment Variables
```bash
cp .env.example .env
# Edit .env with your actual API keys
```

---

## 📂 Project Structure

```
votewise/
├── index.html              # Main SPA entry point
├── package.json            # Node.js config (v2.0.0)
├── vite.config.js          # Vite bundler config
├── vitest.config.js        # Vitest test runner config
├── firebase.json           # Firebase Hosting config
├── .eslintrc.json          # ESLint config with security rules
├── .env.example            # Environment variable template
├── CHANGELOG.md            # Version history
├── LICENSE                 # MIT License
│
├── js/                     # Frontend ES6+ modules
│   ├── app.js              # Thin orchestrator
│   ├── state.js            # Centralized state (localStorage + CustomEvent)
│   ├── router.js           # Hash-based SPA router with auth guard
│   ├── api.js              # Sanitized backend API layer
│   ├── firebase.js         # Firebase Auth, Firestore, Analytics, Perf
│   ├── analytics.js        # Google Analytics 4 (gtag.js) wrapper
│   ├── chat.js             # AI chatbot UI + FAQ matching
│   ├── quiz.js             # Civic knowledge quiz
│   ├── timeline.js         # Election timeline & countdown
│   ├── wizard.js           # Voting preparation wizard
│   ├── dashboard.js        # Personal dashboard
│   ├── faq.js              # FAQ section
│   ├── components.js       # Booths, Museum, Events, Pride Badge
│   ├── confetti.js         # Canvas confetti animation
│   └── data.js             # Static election data
│
├── css/
│   ├── styles.css          # Base styles & design tokens
│   └── components.css      # Component-specific styles
│
├── public/
│   ├── sw.js               # Service Worker (offline support)
│   └── manifest.json       # PWA manifest
│
├── tests/                  # Frontend test suites
│   ├── state.test.js       # State module tests
│   ├── api.test.js         # API module tests
│   ├── firebase.test.js    # Firebase integration tests
│   ├── analytics.test.js   # Analytics module tests
│   └── router.test.js      # Router module tests
│
├── backend/                # Python FastAPI backend
│   ├── main.py             # Gemini AI + Folium map generator
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile          # Backend container
│   └── tests/
│       ├── conftest.py     # Shared fixtures
│       ├── test_map_endpoint.py
│       └── test_schemas.py
│
├── .github/workflows/
│   ├── ci.yml              # CI: lint, test, security scan
│   └── deploy.yml          # CD: Cloud Run + Firebase Hosting
│
├── Dockerfile              # Frontend container
├── docker-compose.yml      # Full-stack orchestration
└── nginx.conf              # Production Nginx config
```

---

## 🛠️ CI/CD Pipeline

Automated via **GitHub Actions**:

| Job | Tools | Purpose |
|-----|-------|---------|
| Backend Lint | flake8 | Python code style enforcement |
| Backend Security | Bandit | Static security analysis |
| Backend Tests | pytest + coverage | 70%+ code coverage gate |
| Frontend Tests | Vitest | Unit tests with jsdom |
| Security Audit | npm audit | Dependency vulnerability scan |
| Docker Validation | Docker Build | Container build verification |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ using Google Cloud, Firebase, and Gemini AI**

</div>
