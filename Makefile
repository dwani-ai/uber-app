# UberApp — thin wrappers around scripts/*.mjs (requires Node 20+ and Docker).
# Copy .env.example → .env and set DOMAIN before deploy.

SHELL := /bin/bash
.DEFAULT_GOAL := help

.PHONY: help
help:
	@echo "UberApp automation"
	@echo "  make install      npm ci in web/"
	@echo "  make manifest     regenerate web/public/projects.v1.json (.env DOMAIN)"
	@echo "  make validate     docker compose config"
	@echo "  make deploy       install + manifest + compose build + up"
	@echo "  make build-only   same as deploy but no docker up"
	@echo "  make ci           CI pipeline (web build + compose + hub image)"
	@echo ""

.PHONY: install
install:
	cd web && npm ci

.PHONY: manifest
manifest:
	node scripts/run-manifest.mjs

.PHONY: compose-apps
compose-apps:
	node scripts/generate-docker-compose-apps.mjs

.PHONY: stubs
stubs:
	node scripts/generate-traefik-stubs.mjs

.PHONY: validate
validate:
	node scripts/compose-validate.mjs

.PHONY: deploy
deploy:
	node scripts/deploy.mjs

.PHONY: build-only
build-only:
	node scripts/deploy.mjs --no-up

.PHONY: ci
ci:
	node scripts/ci.mjs
