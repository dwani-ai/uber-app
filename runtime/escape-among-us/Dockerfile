# syntax=docker/dockerfile:1
# Mirrors dwani-ai/escape_among_us upstream Dockerfile: Next standalone + custom server.js + socket.io.
# Build context is this directory only; source is cloned at build time.

FROM alpine:3.20 AS clone
RUN apk add --no-cache git
WORKDIR /src
ARG ESCAPE_REPO_URL=https://github.com/dwani-ai/escape_among_us.git
RUN git clone --depth 1 "${ESCAPE_REPO_URL}" app

FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY --from=clone /src/app/package.json /src/app/package-lock.json ./
ENV NPM_CONFIG_LEGACY_PEER_DEPS=true
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
ENV NPM_CONFIG_LEGACY_PEER_DEPS=true
COPY --from=deps /app/node_modules ./node_modules
COPY --from=clone /src/app/ ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/server.js ./server.js

RUN npm install socket.io@4 --no-save

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
