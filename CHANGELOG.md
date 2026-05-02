# Changelog

All notable changes to VoteWise are documented in this file.

## [2.1.0] — 2026-05-02

### Added
- **Google Sign-In**: Full Firebase Auth with Google popup login.
- **Cloud Functions**: Gemini-powered `generateVotingSummary` endpoint.
- **Firestore Persistence**: Quiz scores, wizard progress, and user profiles synced to cloud.
- **Firestore Security Rules**: Users can only read/write their own data.
- **Auth State Listener**: Auto-login for returning authenticated users.
- **Chat module tests**: 12 new tests covering message rendering, FAQ matching, accessibility.
- **Firestore CRUD tests**: 18 new tests for profile, quiz, wizard persistence.
- **Google Sign-In button**: SVG Google logo with dark mode support.

### Changed
- `firebase.js` upgraded from anonymous-only to Google Sign-In + anonymous fallback.
- `app.js` now syncs quiz/wizard changes to Firestore in real-time via stateChange events.
- `firebase.json` updated with Cloud Functions and Firestore configuration.
- Service worker bumped to v3 with all 15 JS modules cached.
- Total Google Cloud services: **9** (was 8).
- Total tests: **~70** (was ~42).


## [2.0.0] — 2026-05-02

### Added
- **Firebase Auth**: Anonymous authentication for session persistence.
- **Cloud Firestore**: Cloud-based user data storage with offline support.
- **Google Analytics 4**: Page view and event tracking via gtag.js.
- **Firebase Performance Monitoring**: Automatic performance metrics.
- **Content Security Policy**: XSS protection via CSP meta tag.
- **Modular Architecture**: Extracted all domain logic into dedicated modules:
  - `chat.js`, `quiz.js`, `timeline.js`, `wizard.js`, `dashboard.js`, `faq.js`, `components.js`
- **Firebase integration module** (`firebase.js`) with Auth, Firestore, Analytics.
- **Analytics module** (`analytics.js`) with Google Analytics 4 gtag.js wrapper.
- **Environment configuration** (`.env.example`) for secure API key management.
- **MIT License** file.
- **CHANGELOG.md** (this file).

### Changed
- Refactored `app.js` from 651-line monolith to 220-line thin orchestrator.
- Moved Gemini API key from hardcoded to `os.environ.get("GEMINI_API_KEY")`.
- Updated CORS configuration to use environment variables.
- Improved all backend code to pass flake8 (100-char line limit).
- Enhanced ESLint config with security rules (`no-eval`, `no-implied-eval`).
- Updated service worker cache to v2 with all new modules.

### Fixed
- ES module initialization bug (DOMContentLoaded race condition).
- CI/CD pipeline failures (Bandit, flake8, npm audit).
- Backend Bandit security scan (removed hardcoded API key).

### Security
- Removed hardcoded API key from `backend/main.py`.
- Added Content Security Policy headers.
- Added prompt injection guards on both client and server.
- Added `no-eval` and `no-new-func` ESLint rules.
- Environment variables for all secrets.

## [1.0.0] — 2026-04-30

### Added
- Initial release with election timeline, voting wizard, AI chatbot.
- Interactive quiz with confetti celebration.
- HD Satellite map generation via Gemini 2.5 Flash.
- Progressive Web App (PWA) with offline support.
- Docker and Docker Compose deployment.
- GitHub Actions CI/CD pipeline.
