# Changelog

All notable changes to VoteWise are documented in this file.

## [2.1.0] — 2026-05-02 (GOD MODE Release)

### Added
- **`js/constants.js`**: Centralized constants module — zero magic numbers across codebase.
- **Full JSDoc**: `@module`, `@version 2.1.0`, `@license MIT` on all 16 JS modules.
- **TypeDefs**: `@typedef` for `User`, `AppState`, `Particle`, `TimelineEvent`, `WizardStep`, `RegionData`.
- **`clearState()`**: New state export for complete session reset.
- **`getCurrentUserId()`**: New state export for Firebase UID retrieval.
- **`safeJsonParse()`**: Crash-proof localStorage reads in state.js.
- **`HealthResponse` / `MapErrorResponse`**: Pydantic response models for OpenAPI docs.
- **`test_map_rendering.py`**: 9 new backend tests for Folium map rendering.
- **`pyproject.toml`**: Backend pytest + coverage configuration.
- **ESLint step**: Added to CI pipeline for frontend quality gate.
- **Google Sign-In**: Full Firebase Auth with Google popup login.
- **Cloud Functions**: Gemini-powered `generateVotingSummary` with `safeDocRead()` helper.
- **Firestore Persistence**: Quiz scores, wizard progress, and user profiles synced to cloud.
- **Firestore Security Rules**: Users can only read/write their own data.

### Changed
- Backend `main.py` upgraded to v2.1.0 with full type hints and constants extraction.
- Cloud Functions refactored with `Promise.all()` parallel reads and extracted helpers.
- Service worker bumped to **v4** with 16 cached modules (including constants.js).
- Frontend tests expanded: **76 tests** (was 67) — added clearState, getCurrentUserId, input validation.
- Backend tests expanded: **38 tests** (was 30) — added map rendering suite.
- Backend coverage: **96%** with `--cov-fail-under=85` gate.
- Total tests: **114** (76 frontend + 38 backend).
- Docker frontend: fixed `npm ci --omit=dev` → `npm ci` (vite needed for build).
- Package version bumped to **2.1.0**.
- CI pipeline: flake8 lint errors fixed (E203, F401, E303).
- Deploy pipeline: real Firebase project ID (`promptwar2-ecd91`).

### Security
- Input validation: `setRegion()` throws on invalid, `toggleWizardStep()` guards null.
- `setTheme()` normalizes invalid values to 'light'.
- `addChatEntry()` rejects empty inputs.
- Sidebar ARIA: `role="navigation"` + `aria-label="Main navigation"`.


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
