# syntax=docker/dockerfile:1
# Build-arg REPO is "owner/name" (GitHub). Clone + MkDocs or Node build → nginx static.
ARG REPO

FROM alpine:3.20 AS clone
RUN apk add --no-cache git
WORKDIR /work
ARG REPO
RUN git clone --depth 1 "https://github.com/${REPO}.git" repo

FROM node:22-alpine AS build
# python3 + pip: MkDocs; ruby + bundler: Jekyll; make/g++: native deps
RUN apk add --no-cache python3 py3-pip ruby ruby-bundler ruby-dev make g++ git
# Upstream repos often have imperfect peer ranges (e.g. React 18 vs a lib asking for React 19).
ENV NPM_CONFIG_LEGACY_PEER_DEPS=true
# 1 = fail if install/build produces no static output (use with verify:catalog-apps). Default: lenient for prod.
ARG CATALOG_APP_STRICT_BUILD=0
ENV CATALOG_APP_STRICT_BUILD=$CATALOG_APP_STRICT_BUILD
WORKDIR /src
COPY --from=clone /work/repo ./
COPY build.sh /src/build.sh
COPY talk-authClient.js /opt/talk-authClient.js
COPY talk-apiClient.js /opt/talk-apiClient.js
COPY talk-audio.js /opt/talk-audio.js
COPY talk-session.js /opt/talk-session.js
RUN chmod +x /src/build.sh && /src/build.sh

FROM nginx:1.27-alpine
# Empty artifact must not leave the default "Welcome to nginx" index behind.
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /artifact/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
