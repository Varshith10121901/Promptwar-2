# ─────────────────────────────────────────────
# Stage 1: Build the Vite frontend
# ─────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Copy dependency manifests first (Docker layer cache)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source files
COPY . .

# Build production bundle (outputs to /app/dist)
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Serve with Nginx (hardened alpine)
# ─────────────────────────────────────────────
FROM nginx:stable-alpine AS production

# Security: remove default pages and unnecessary modules
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled frontend from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy PWA service worker and manifest to root
COPY --from=build /app/public/sw.js /usr/share/nginx/html/sw.js
COPY --from=build /app/public/manifest.json /usr/share/nginx/html/manifest.json

# Copy custom Nginx config for SPA routing + compression + security
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Security: run Nginx as non-root
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
