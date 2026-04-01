#!/bin/bash
# Ubuntu/Debian startup script for Google Compute Engine.
# Set instance custom metadata: uberapp_domain = yourapex e.g. portfolio.example.com
# Optional: uberapp_repo_url = https://github.com/OWNER/uber-app.git
#
# gcloud example (from repo root):
#   gcloud compute instances create uber-app \
#     --zone=us-central1-a \
#     --machine-type=e2-standard-4 \
#     --boot-disk-size=100GB \
#     --tags=http-server \
#     --metadata-from-file=startup-script=scripts/gcp-startup.sh \
#     --metadata=uberapp_domain=YOUR_DOMAIN
#
# Open VPC firewall for tcp:80 to the instance (or use tag http-server with default rule).

set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

log() { echo "[uberapp] $*"; }

META_BASE="http://metadata.google.internal/computeMetadata/v1"
META_HDR=( -H "Metadata-Flavor: Google" )

domain="${DOMAIN:-}"
if [[ -z "$domain" ]]; then
  domain="$(curl -fsS "${META_HDR[@]}" "${META_BASE}/instance/attributes/uberapp_domain" 2>/dev/null || true)"
fi

repo_url="${REPO_URL:-}"
if [[ -z "$repo_url" ]]; then
  repo_url="$(curl -fsS "${META_HDR[@]}" "${META_BASE}/instance/attributes/uberapp_repo_url" 2>/dev/null || true)"
fi
repo_url="${repo_url:-https://github.com/dwani-ai/uber-app.git}"

if [[ -z "$domain" ]]; then
  log "Set metadata uberapp_domain on the VM (or export DOMAIN=) before re-running."
  exit 1
fi

log "Installing packages…"
apt-get update -qq
apt-get install -y -qq git ca-certificates curl

if ! command -v docker >/dev/null 2>&1; then
  log "Installing Docker…"
  curl -fsSL https://get.docker.com | sh
fi

if ! command -v node >/dev/null 2>&1; then
  log "Installing Node.js 22…"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y -qq nodejs
fi

APP_DIR="${UBERAPP_HOME:-/opt/uber-app}"
mkdir -p "$(dirname "$APP_DIR")"
if [[ ! -d "$APP_DIR/.git" ]]; then
  log "Cloning $repo_url into $APP_DIR…"
  git clone --depth 1 "$repo_url" "$APP_DIR"
else
  log "Updating $APP_DIR…"
  git -C "$APP_DIR" pull --ff-only || true
fi

cd "$APP_DIR"
export DOMAIN="$domain"
# Production: if you terminate TLS at the VM, set UBERAPP_URL_SCHEME=https in .env after first boot.
export UBERAPP_URL_SCHEME="${UBERAPP_URL_SCHEME:-http}"

log "Running deploy (long first build if catalog apps are enabled)…"
node scripts/deploy.mjs

log "Done. Point DNS wildcard *.$domain (and hub.$domain) to this VM’s IP. Hub: http://hub.$domain/"
