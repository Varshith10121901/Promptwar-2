# ─────────────────────────────────────────────
# VoteWise Backend Dockerfile (v2.1.0)
#
# Python 3.12 slim with:
#   - Non-root user (appuser, no login shell)
#   - __pycache__ cleanup for smaller image
#   - Docker HEALTHCHECK on /health endpoint
#   - 2 Uvicorn workers for concurrent requests
#
# Security: non-root, no cache, minimal attack surface
# ─────────────────────────────────────────────

FROM python:3.12-slim AS base

# ─── Metadata ───
LABEL maintainer="VoteWise Team"
LABEL description="VoteWise Map API — Gemini 2.5 Flash powered polling station generator"
LABEL version="2.1.0"

# ─── Security: create non-root user ───
RUN groupadd -r appuser && useradd -r -g appuser -s /bin/false appuser

WORKDIR /app

# ─── Dependencies (cached layer) ───
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    find /usr/local -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null; true

# ─── Application code ───
COPY . .

# ─── Security: switch to non-root ───
USER appuser

EXPOSE 8000

# ─── Health check for Cloud Run / Docker ───
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=10s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
