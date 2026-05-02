# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | ✅ Fully supported |
| 1.0.x   | ❌ No longer supported |

## Reporting a Vulnerability

If you discover a security vulnerability within VoteWise, please report it responsibly:

1. **Do NOT** open a public GitHub issue.
2. Email the security team at: **security@votewise-app.com**
3. Include a detailed description and steps to reproduce.
4. We will acknowledge receipt within 48 hours.
5. A fix will be deployed within 7 business days.

## Security Measures

### Frontend
- **Content Security Policy (CSP)** meta tag to prevent XSS
- **Input sanitization** on all user inputs before API calls
- **Prompt injection guards** to block LLM manipulation
- **ESLint security rules** (`no-eval`, `no-implied-eval`, `no-new-func`)

### Backend
- **Pydantic validators** for strict input validation
- **Rate limiting** and input length restrictions
- **Bandit security scanner** in CI pipeline
- **Non-root Docker containers** for defense-in-depth
- **Environment variables** for all secrets (no hardcoded keys)

### Infrastructure
- **Firebase App Check** for API abuse prevention
- **Firebase Auth** for session management
- **HTTPS-only** deployment via Firebase Hosting
- **Automated dependency scanning** via `npm audit` and `pip audit`

## Dependency Updates

We monitor dependencies for known vulnerabilities using:
- `npm audit` (frontend)
- `bandit` (backend)
- GitHub Dependabot (automated PRs)
