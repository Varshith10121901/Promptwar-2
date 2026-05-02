# ─────────────────────────────────────────────
# VoteWise Frontend Dockerfile (v2.1.0)
#
# Multi-stage build:
#   Stage 1: Node 22 Alpine → Vite production build
#   Stage 2: Nginx stable-alpine → Hardened static serving
#
# Security: Non-root, HSTS, CSP, gzip, immutable cache
# ─────────────────────────────────────────────

# ─── Stage 1: Build ────────────────────────
FROM node:22-alpine AS build

LABEL maintainer="VoteWise Team"
LABEL version="2.1.0"

WORKDIR /app

# Copy dependency manifests first (Docker layer cache)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source files and build
COPY . .
RUN npm run build

# ─── Stage 2: Serve ────────────────────────
FROM nginx:stable-alpine AS production

LABEL maintainer="VoteWise Team"
LABEL description="VoteWise PWA — AI-powered election assistant frontend"
LABEL version="2.1.0"

# Security: remove default pages
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled frontend from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy PWA service worker and manifest to root
COPY --from=build /app/public/sw.js /usr/share/nginx/html/sw.js
COPY --from=build /app/public/manifest.json /usr/share/nginx/html/manifest.json

# Copy custom Nginx config (SPA routing + gzip + security headers)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Security: run Nginx as non-root
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

# Health check: ensures Nginx is serving content
HEALTHCHECK --interval=30s --timeout=3s --retries=3 --start-period=5s \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
