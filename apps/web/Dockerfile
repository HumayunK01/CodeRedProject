# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json* bun.lockb* ./
RUN npm install --frozen-lockfile 2>/dev/null || npm install

# Copy source and build
COPY . .

# Build args become env vars at build time (Vite embeds them)
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_INFER_BASE_URL
ARG VITE_OPENROUTER_API_KEY
ARG VITE_CHATBOT_MODEL

ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_INFER_BASE_URL=$VITE_INFER_BASE_URL
ENV VITE_OPENROUTER_API_KEY=$VITE_OPENROUTER_API_KEY
ENV VITE_CHATBOT_MODEL=$VITE_CHATBOT_MODEL

RUN npm run build

# ── Stage 2: Serve with Nginx ────────────────────────────────────────────────
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
