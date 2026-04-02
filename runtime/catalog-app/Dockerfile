# syntax=docker/dockerfile:1
# Build-arg REPO is "owner/name" (GitHub). Clone + discover Node app dir + build → nginx.
ARG REPO

FROM alpine:3.20 AS clone
RUN apk add --no-cache git
WORKDIR /work
ARG REPO
RUN git clone --depth 1 "https://github.com/${REPO}.git" repo

FROM node:22-alpine AS build
RUN apk add --no-cache python3 make g++
# Upstream repos often have imperfect peer ranges (e.g. React 18 vs a lib asking for React 19).
ENV NPM_CONFIG_LEGACY_PEER_DEPS=true
WORKDIR /src
COPY --from=clone /work/repo ./
COPY build.sh /src/build.sh
RUN chmod +x /src/build.sh && /src/build.sh

FROM nginx:1.27-alpine
# Empty artifact must not leave the default "Welcome to nginx" index behind.
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /artifact/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
