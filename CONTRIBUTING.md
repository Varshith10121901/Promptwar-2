# Contributing to VoteWise

Thank you for considering contributing to VoteWise! We welcome contributions that improve the app's quality, accessibility, and civic value.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Promptwar-2.git`
3. Install dependencies: `npm install` and `pip install -r backend/requirements.txt`

## Development Workflow

- Create a feature branch: `git checkout -b feat/your-feature`
- Run the frontend: `npm run dev`
- Run the backend: `python backend/main.py`
- Run frontend tests: `npm run test`
- Run backend tests: `cd backend && pytest tests/ -v`

## Code Standards

- **JavaScript**: Follow ESLint rules defined in `.eslintrc.json`. Run `npx eslint js/`.
- **Python**: Follow PEP 8, enforced by flake8. Max line length: 100.
- **Commits**: Use conventional commits format: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`

## Pull Request Requirements

- All CI checks must pass (lint, tests, Docker build)
- Write tests for any new backend endpoints or frontend modules
- Update the README if you add or change a feature

## Reporting Issues

Please open a GitHub Issue with:
- A clear description of the bug or feature request
- Steps to reproduce (for bugs)
- Expected vs actual behaviour
