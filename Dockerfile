# ─────────────────────────────────────────────
# Stage 1: Build the Vite frontend
# ─────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests first (leverages Docker layer cache)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy all source files
COPY . .

# Build production bundle (outputs to /app/dist)
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Serve with Nginx (minimal alpine image)
# ─────────────────────────────────────────────
FROM nginx:alpine AS production

# Remove default Nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled frontend from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx config for SPA routing + compression
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
