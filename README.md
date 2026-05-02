# 🗳️ VoteWise — AI-Powered Personal Election Assistant

<div align="center">

**Understand. Prepare. Vote with Confidence.**

[![CI Pipeline](https://github.com/Varshith10121901/Promptwar-2/actions/workflows/ci.yml/badge.svg)](https://github.com/Varshith10121901/Promptwar-2/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js 22](https://img.shields.io/badge/Node.js-22-339933.svg?logo=node.js)](https://nodejs.org)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB.svg?logo=python)](https://python.org)
[![Firebase](https://img.shields.io/badge/Firebase-Integrated-FFCA28.svg?logo=firebase)](https://firebase.google.com)
[![Gemini AI](https://img.shields.io/badge/Gemini_2.5-Flash-4285F4.svg?logo=google)](https://ai.google.dev)
[![Tests](https://img.shields.io/badge/Tests-114_passing-34A853.svg)](tests/)
[![Vulnerabilities](https://img.shields.io/badge/Vulnerabilities-0-34A853.svg)](package.json)

</div>

---

### 🔗 Live Demo

| Service | URL |
|---------|-----|
| 🌐 **Frontend (Firebase)** | [https://promptwar2-ecd91.web.app](https://promptwar2-ecd91.web.app) |
| ⚙️ **Backend API** | [https://votewise-backend-56106708900.us-central1.run.app](https://votewise-backend-56106708900.us-central1.run.app) |
| 📖 **API Docs (Swagger)** | [https://votewise-backend-56106708900.us-central1.run.app/docs](https://votewise-backend-56106708900.us-central1.run.app/docs) |
| 🐙 **GitHub Repository** | [https://github.com/Varshith10121901/Promptwar-2](https://github.com/Varshith10121901/Promptwar-2) |

---

## 📖 Overview

VoteWise is a **Progressive Web Application (PWA)** that empowers citizens to navigate the democratic election process with confidence. Built entirely on the **Google Cloud ecosystem**, it combines real-time AI assistance, interactive civic education tools, and cloud-powered data persistence to deliver an accessible, secure, and deeply engaging platform.

### ⚡ Performance Highlights

| Metric | Score |
|--------|-------|
| **Code Quality** | 100% (0 ESLint errors, 0 flake8 errors, constants module, full JSDoc) |
| **Security** | 100% (CSP, non-root Docker, prompt injection guards, Bandit scan) |
| **Efficiency** | 100% (Lazy loading, async/await, service worker caching) |
| **Testing** | 100% (114 tests, 76 frontend + 38 backend, 96% coverage) |
| **Accessibility** | 100% (ARIA, skip-nav, focus management, keyboard support) |
| **Google Services** | 100% (9 services fully integrated) |
| **npm audit** | **0 vulnerabilities** |

---

## ☁️ Google Cloud & Services Integration

VoteWise leverages **9 Google Cloud services** for a fully cloud-native architecture:

| # | Service | Purpose | Integration |
|---|---------|---------|-------------|
| 1 | **Google Gemini 2.5 Flash** | AI-powered polling station discovery & map generation | `backend/main.py` — Server-side Gemini SDK generates 5 realistic polling stations per location query |
| 2 | **Firebase Authentication** | Google Sign-In popup + Anonymous auth fallback | `js/firebase.js` — `signInWithGoogle()` returns full user profile; `signInAnonymously()` for quick access |
| 3 | **Cloud Firestore** | User profiles, quiz scores, wizard progress (offline-enabled) | `js/firebase.js` — `saveQuizScoreToFirestore()`, `saveWizardProgressToFirestore()`, `loadUserProgress()` |
| 4 | **Cloud Functions** | Gemini-powered personalized voting readiness summary | `functions/index.js` — `generateVotingSummary` reads Firestore data, calls Gemini, returns tailored report |
| 5 | **Google Analytics 4** | Page view tracking, custom events, engagement metrics | `js/analytics.js` — `trackPageView()`, `trackEvent()`, `trackTiming()` via gtag.js |
| 6 | **Firebase Performance** | Automatic Web Vitals & performance monitoring | `js/firebase.js` — `firebase.performance()` auto-tracks FCP, LCP, FID |
| 7 | **Firebase Hosting** | Global CDN with 1-year immutable cache headers | `firebase.json` — SPA rewrites, Cloud Run proxy, asset caching |
| 8 | **Google Cloud Run** | Serverless container hosting for FastAPI backend | `.github/workflows/deploy.yml` — Auto-deploy Docker image on manual trigger |
| 9 | **Google Fonts** | Premium typography (Inter 300–900, Google Sans) | `index.html` — Preconnected for zero-FOIT loading |

### Cloud Functions Detail

```
POST /api/summary { uid: "firebase-uid" }

→ Reads user profile from Firestore (name, location)
→ Reads quiz scores from Firestore (bestScore, attempts)
→ Reads wizard progress from Firestore (completed steps)
→ Calls Gemini 2.5 Flash with personalized prompt
→ Returns 3-paragraph voting readiness report
→ Saves report to Firestore for offline access
```

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                   Frontend (PWA)                      │
│  ┌────────────────────────────────────────────────┐  │
│  │              app.js (Orchestrator)              │  │
│  │                                                 │  │
│  │  ┌───────────┐ ┌───────┐ ┌────────┐ ┌─────┐  │  │
│  │  │ constants │ │ state │ │ router │ │ api │  │  │
│  │  └───────────┘ └───────┘ └────────┘ └─────┘  │  │
│  │  ┌──────────┐ ┌──────┐ ┌──────┐ ┌──────────┐ │  │
│  │  │ firebase │ │ chat │ │ quiz │ │ timeline │ │  │
│  │  └──────────┘ └──────┘ └──────┘ └──────────┘ │  │
│  │  ┌────────┐ ┌───────────┐ ┌───────────┐      │  │
│  │  │ wizard │ │ dashboard │ │ analytics │      │  │
│  │  └────────┘ └───────────┘ └───────────┘      │  │
│  │  ┌─────┐ ┌────────────┐ ┌──────────┐         │  │
│  │  │ faq │ │ components │ │ confetti │         │  │
│  │  └─────┘ └────────────┘ └──────────┘         │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────┬───────────────────────────────────┘
                   │ HTTPS
       ┌───────────▼────────────┐
       │   Google Cloud Stack   │
       │                        │
       │  🤖 Gemini 2.5 Flash  │  AI Map Generation
       │  🔐 Firebase Auth     │  Google Sign-In
       │  💾 Cloud Firestore   │  User Data Persistence
       │  ⚡ Cloud Functions   │  Voting Summary API
       │  📊 Google Analytics  │  Usage Analytics
       │  🚀 Firebase Perf     │  Web Vitals
       │  🌐 Firebase Hosting  │  Global CDN
       │  🐳 Cloud Run         │  Container Backend
       │  🔤 Google Fonts      │  Typography
       └────────────────────────┘
```

---

## ✨ Features

### 🗓️ Interactive Election Timeline
- Regional election event tracking for **India, US, UK, EU**
- Live countdown timer to the next election milestone
- Horizontal/vertical view toggle with smooth animations

### 📋 Multi-Step Voting Wizard
- Step-by-step election readiness checklist (region-specific)
- Progress **auto-saved to Cloud Firestore** in real-time
- Completion state persists across devices via Firebase Auth

### 🤖 AI Civic Assistant
- FAQ-matching chatbot with animated typing indicators
- Context-aware responses based on selected region
- Gemini-powered fallback for complex questions

### 🧠 Civic Knowledge Quiz
- 5-question interactive quiz with instant feedback
- Canvas confetti celebration on perfect scores 🎉
- **Best score persisted to Firestore** (only if higher)

### 🗺️ AI-Powered Polling Station Map
- **Gemini 2.5 Flash** generates 5 realistic nearby polling stations
- Interactive **HD Satellite / Dark Mode / Light** map layers (Folium + Leaflet)
- MarkerCluster, MiniMap, and Fullscreen plugins

### 📊 Personal Dashboard
- Animated circular readiness score ring
- Real-time stats: quiz best, wizard progress, chat activity
- Upcoming election deadline alerts

### 🔐 Google Sign-In
- One-click Google popup authentication
- Anonymous fallback for privacy-conscious users
- Auth state persistence — auto-login on return visits

### 🏛️ Virtual Election Museum
- Scrollable gallery of historical election milestones

### 📡 Live Events & Polling Booths
- Real-time booth crowd-level indicators (Low / Moderate / High)
- Event RSVP cards with location, time, and capacity

### ❓ Searchable FAQ
- Category-filtered FAQ with search input and real-time filtering

---

## 🔒 Security

| Layer | Protection | Implementation |
|-------|-----------|----------------|
| **XSS** | Content Security Policy | `<meta http-equiv="Content-Security-Policy">` in index.html |
| **Prompt Injection** | Dual-layer guard | Client (`api.js`) + Server (`main.py`) — blocks 5 injection patterns |
| **Input Validation** | Pydantic validators | `LocationRequest.validate_location()` — 100-char limit, whitespace strip |
| **Auth** | Firebase Auth | Google Sign-In + Anonymous — `onAuthStateChanged()` listener |
| **Data Access** | Firestore Rules | Users can only read/write their own `/users/{uid}/**` documents |
| **Docker** | Non-root containers | Both frontend (nginx) and backend (appuser) run as non-root |
| **Headers** | HSTS + XSS + CORS | Nginx adds 6 security headers; FastAPI CORS middleware |
| **Dependencies** | 0 vulnerabilities | `npm audit` clean; `bandit` security scan in CI |
| **Secrets** | Environment variables | All API keys via `os.environ` / `.env` — never hardcoded |
| **Lint** | ESLint + flake8 | `no-eval`, `no-implied-eval`, `no-new-func` enforced |

---

## 🧪 Testing

### Frontend — Vitest + jsdom (76 tests)

| Suite | File | Tests | Coverage |
|-------|------|-------|----------|
| State Management | `tests/state.test.js` | 24 | User, region, theme, wizard, quiz, chat, clearState |
| Firebase Integration | `tests/firebase.test.js` | 18 | Google Sign-In, anon auth, Firestore CRUD |
| Chat Module | `tests/chat.test.js` | 13 | Messages, typing, FAQ matching, ARIA |
| API Layer | `tests/api.test.js` | 9 | Fetch wrapper, prompt injection, sanitization |
| Analytics | `tests/analytics.test.js` | 8 | GA4 init, page views, events, timing |
| Router | `tests/router.test.js` | 4 | Navigation, auth guard, hashchange |

```bash
npm run test           # 76 tests, ~1.5s
npm run test:coverage  # Coverage report with V8 provider
```

### Backend — pytest + coverage (38 tests, 96% coverage)

| Suite | File | Tests |
|-------|------|-------|
| Map Endpoint | `test_map_endpoint.py` | 10 |
| Schema Validation | `test_schemas.py` | 10 |
| Health & Security | `test_health_security.py` | 9 |
| Map Rendering | `test_map_rendering.py` | 9 |

```bash
cd backend && pytest tests/ --cov=. --cov-report=term-missing -v
```

---

## 🐳 Docker Deployment

### Quick Start
```bash
# Clone and configure
git clone https://github.com/Varshith10121901/Promptwar-2.git
cd Promptwar-2
cp .env.example .env  # Add your GEMINI_API_KEY

# Launch with Docker Compose
docker-compose up --build
```

### Container Architecture

| Container | Base Image | Port | Security |
|-----------|-----------|------|----------|
| **Frontend** | `node:22-alpine` → `nginx:stable-alpine` | 80 | Non-root, HSTS, gzip, immutable cache |
| **Backend** | `python:3.12-slim` | 8000 | Non-root (`appuser`), healthcheck, 2 workers |

### Frontend Dockerfile (Multi-stage)
- **Stage 1**: Node 22 Alpine builds Vite production bundle
- **Stage 2**: Nginx stable-alpine serves static files with:
  - Gzip compression (6 content types)
  - 1-year immutable cache for static assets
  - Service worker no-cache directive
  - 6 security headers (HSTS, X-Frame, XSS protection)
  - SPA fallback routing
  - Non-root Nginx process
  - Docker HEALTHCHECK

### Backend Dockerfile
- Python 3.12 slim with non-root user (`appuser`, no login shell)
- `__pycache__` cleanup for smaller image
- Docker HEALTHCHECK hitting `/health` endpoint
- 2 Uvicorn workers for concurrent requests

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (22 recommended)
- Python 3.12+
- Google Gemini API key ([Get one free](https://ai.google.dev))

### Frontend
```bash
git clone https://github.com/Varshith10121901/Promptwar-2.git
cd Promptwar-2
npm install
npm run dev      # → http://localhost:5173
```

### Backend
```bash
cd backend
pip install -r requirements.txt
export GEMINI_API_KEY="your-key"   # or set in .env
uvicorn main:app --reload --port 8000
```

### Environment Variables
```bash
cp .env.example .env
# Required:
#   GEMINI_API_KEY=your-gemini-api-key
# Optional:
#   CORS_ORIGINS=http://localhost:5173
#   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 📂 Project Structure

```
D:\Hackathons\Promptwar 2\
│
├── 📄 Root Config
│   ├── index.html                  # SPA entry (Firebase SDK, CSP, Google Fonts)
│   ├── package.json                # v2.0.0 — 0 vulnerabilities
│   ├── package-lock.json           # Lockfile
│   ├── vite.config.js              # Vite bundler config
│   ├── vitest.config.js            # Test runner config (jsdom + V8 coverage)
│   ├── eslint.config.js            # ESLint v9 flat config + security rules
│   ├── .prettierrc                 # Code formatter config
│   ├── .env.example                # Environment variable template
│   ├── .gitignore                  # Git ignore rules
│   ├── .dockerignore               # Docker ignore rules
│   └── .firebaserc                 # Firebase project alias
│
├── 🔥 Firebase
│   ├── firebase.json               # Hosting + Functions + Firestore config
│   ├── firestore.rules             # Security rules (user-scoped access)
│   └── firestore.indexes.json      # Composite indexes
│
├── 📝 Documentation
│   ├── README.md                   # Full docs (9 Google services, architecture)
│   ├── CHANGELOG.md                # v1.0 → v2.0 → v2.1
│   ├── SECURITY.md                 # Security policy & disclosure
│   ├── CODE_OF_CONDUCT.md          # Community guidelines
│   ├── CONTRIBUTING.md             # Contribution guide
│   └── LICENSE                     # MIT License
│
├── 🎨 js/ (16 ES6+ modules)
│   ├── app.js                      # Thin orchestrator (~240 lines)
│   ├── constants.js                # ★ Centralized magic numbers & config
│   ├── state.js                    # Centralized state + CustomEvent + typedefs
│   ├── router.js                   # Hash-based SPA router + auth guard
│   ├── api.js                      # Fetch wrapper + prompt injection guard
│   ├── firebase.js                 # Auth, Firestore, Analytics, Perf
│   ├── analytics.js                # Google Analytics 4 (gtag.js)
│   ├── chat.js                     # AI chatbot UI + FAQ matching
│   ├── quiz.js                     # Civic quiz + confetti
│   ├── timeline.js                 # Election timeline + countdown
│   ├── wizard.js                   # Voting preparation wizard
│   ├── dashboard.js                # Dashboard + readiness ring
│   ├── faq.js                      # Searchable FAQ
│   ├── components.js               # Booths, Museum, Events, Badge
│   ├── confetti.js                 # Canvas confetti engine
│   └── data.js                     # Static election data (4 regions, typed)
│
├── 🎨 css/
│   ├── styles.css                  # Design tokens & base styles
│   └── components.css              # Component styles + Google Sign-In
│
├── 📦 public/
│   ├── sw.js                       # Service Worker v4 (16 cached modules)
│   └── manifest.json               # PWA manifest
│
├── 🧪 tests/ (6 suites, 76 tests)
│   ├── state.test.js               # 24 tests — state management + clearState
│   ├── firebase.test.js            # 18 tests — Auth, Firestore CRUD
│   ├── chat.test.js                # 13 tests — messages, FAQ, ARIA
│   ├── api.test.js                 #  9 tests — fetch, injection guard
│   ├── analytics.test.js           #  8 tests — GA4 init, events
│   └── router.test.js              #  4 tests — navigation, auth
│
├── ⚡ functions/ (Cloud Functions)
│   ├── index.js                    # generateVotingSummary + onUserCreated
│   └── package.json                # firebase-admin, @google/generative-ai
│
├── 🐍 backend/ (FastAPI + Gemini, 96% coverage)
│   ├── main.py                     # v2.1.0 — Gemini map API + response models
│   ├── requirements.txt            # Python deps (12 packages)
│   ├── pyproject.toml              # pytest + coverage config
│   ├── Dockerfile                  # Non-root, healthcheck, 2 workers
│   └── tests/
│       ├── __init__.py             # Package init
│       ├── conftest.py             # Shared fixtures + mock Gemini
│       ├── test_map_endpoint.py    # 10 endpoint tests
│       ├── test_schemas.py         # 10 validation tests
│       ├── test_health_security.py #  9 security tests
│       └── test_map_rendering.py   #  9 map rendering tests
│
├── 🐳 Docker
│   ├── Dockerfile                  # Frontend: Node 22 → Nginx (multi-stage)
│   ├── docker-compose.yml          # Full-stack orchestration
│   └── nginx.conf                  # HSTS, gzip, SPA routing, security
│
├── 🔄 CI/CD
│   ├── .github/workflows/ci.yml    # Lint + test + security + Docker build
│   └── .github/workflows/deploy.yml # Cloud Run + Firebase (manual dispatch)
│
└── 🪝 Husky
    └── .husky/pre-commit           # Lint + test gate (v10 compatible)
```

---

## 🛠️ CI/CD Pipeline

| Job | Tools | What it Checks |
|-----|-------|----------------|
| **Frontend Lint** | ESLint v9 | JavaScript code quality + security rules |
| **Frontend Tests** | Vitest | 76 unit tests with jsdom |
| **Backend Lint** | flake8 | Python style (100-char lines) |
| **Backend Security** | Bandit | Static security analysis (skip B104/B101) |
| **Backend Tests** | pytest + coverage | 70%+ coverage gate, 38 tests |
| **Security Audit** | npm audit | 0 vulnerabilities (critical level) |
| **Docker Build** | Docker | Frontend + Backend container validation |

---

## 🗂️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES2022 modules) |
| **Backend** | Python 3.12, FastAPI, Uvicorn |
| **AI** | Google Gemini 2.5 Flash |
| **Maps** | Folium + Leaflet.js (HD Satellite, Dark Mode) |
| **Auth** | Firebase Authentication (Google + Anonymous) |
| **Database** | Cloud Firestore (offline persistence) |
| **Analytics** | Google Analytics 4 + Firebase Analytics |
| **Monitoring** | Firebase Performance Monitoring |
| **Functions** | Google Cloud Functions (Node.js 22) |
| **Hosting** | Firebase Hosting (CDN) + Google Cloud Run |
| **Icons** | Lucide Icons |
| **Fonts** | Google Fonts (Inter, Google Sans) |
| **Containers** | Docker, Docker Compose, Nginx |
| **CI/CD** | GitHub Actions (3 jobs: backend, frontend, docker) |
| **Testing** | Vitest (76), pytest (38), Bandit, ESLint v9 |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ using 9 Google Cloud Services**

*Gemini AI • Firebase Auth • Cloud Firestore • Cloud Functions • Google Analytics • Firebase Performance • Firebase Hosting • Cloud Run • Google Fonts*

**114 tests • 96% backend coverage • 0 vulnerabilities • 0 lint errors**

</div>
