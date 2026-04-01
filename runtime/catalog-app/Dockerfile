# syntax=docker/dockerfile:1
# Build-arg REPO is "owner/name" (GitHub). Clone + best-effort static frontend build → nginx.
ARG REPO

FROM alpine:3.20 AS clone
RUN apk add --no-cache git
WORKDIR /work
ARG REPO
RUN git clone --depth 1 "https://github.com/${REPO}.git" repo

FROM node:22-alpine AS build
RUN apk add --no-cache python3 make g++
WORKDIR /src
COPY --from=clone /work/repo ./
RUN set -eux; \
  if [ ! -f package.json ]; then \
    mkdir -p /artifact; \
    printf '%s\n' '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Catalog app</title><style>body{font-family:system-ui;margin:2rem}</style></head><body><h1>No package.json</h1><p>This repository has no Node frontend in the repo root. It may be API-only — see GitHub for how to run it.</p></body></html>' \
      > /artifact/index.html; \
    exit 0; \
  fi; \
  if [ -f package-lock.json ]; then \
    npm ci --no-audit --no-fund 2>/dev/null || npm install --no-audit --no-fund || true; \
  else \
    npm install --no-audit --no-fund || true; \
  fi; \
  npm run build --if-present 2>/dev/null || true; \
  mkdir -p /artifact; \
  if [ -f dist/index.html ] || ls dist/*.html 1>/dev/null 2>&1; then cp -r dist/. /artifact/; \
  elif [ -f build/index.html ]; then cp -r build/. /artifact/; \
  elif [ -d out ] && [ -n "$(ls -A out 2>/dev/null)" ]; then cp -r out/. /artifact/; \
  elif [ -d public ] && [ -f public/index.html ]; then cp -r public/. /artifact/; \
  elif [ -f index.html ]; then cp index.html /artifact/; \
  else \
    printf '%s\n' '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Build</title><style>body{font-family:system-ui;margin:2rem}</style></head><body><h1>No static output</h1><p>Clone and npm install ran; no dist/build/out was found. Add a Dockerfile in the upstream repo or extend <code>runtime/catalog-app/Dockerfile</code>.</p></body></html>' \
      > /artifact/index.html; \
  fi

FROM nginx:1.27-alpine
COPY --from=build /artifact/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
