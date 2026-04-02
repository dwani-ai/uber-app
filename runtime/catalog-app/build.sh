#!/bin/sh
# Clone is at /src. MkDocs (mkdocs.yml) → site/; else find package.json "build", install, copy dist/build/out/site/_site → /artifact
set -eu

ROOT=/src
cd "$ROOT"

artifact_copy() {
  base="$1"
  if [ ! -d "$base" ]; then return 1; fi
  if [ -f "$base/index.html" ] && [ ! -f "$base/package.json" ]; then
    cp -r "$base"/. /artifact/
    return 0
  fi
  # Cloudflare Vite + wrangler: assets live in dist/client (SPA), not dist/index.html
  if [ -d "$base/dist/client" ] && [ -n "$(ls -A "$base/dist/client" 2>/dev/null)" ]; then
    cp -r "$base/dist/client"/. /artifact/
    return 0
  fi
  if [ -d "$base/dist" ] && [ -n "$(ls -A "$base/dist" 2>/dev/null)" ]; then
    cp -r "$base/dist"/. /artifact/
    return 0
  fi
  if [ -d "$base/build" ] && [ -n "$(ls -A "$base/build" 2>/dev/null)" ]; then
    cp -r "$base/build"/. /artifact/
    return 0
  fi
  if [ -d "$base/out" ] && [ -n "$(ls -A "$base/out" 2>/dev/null)" ]; then
    cp -r "$base/out"/. /artifact/
    return 0
  fi
  if [ -d "$base/site" ] && [ -n "$(ls -A "$base/site" 2>/dev/null)" ]; then
    cp -r "$base/site"/. /artifact/
    return 0
  fi
  if [ -d "$base/_site" ] && [ -n "$(ls -A "$base/_site" 2>/dev/null)" ]; then
    cp -r "$base/_site"/. /artifact/
    return 0
  fi
  if [ -d "$base/public" ] && [ -f "$base/public/index.html" ]; then
    cp -r "$base/public"/. /artifact/
    return 0
  fi
  return 1
}

# MkDocs-only repos have no package.json; handle before Node discovery.
if [ -f "$ROOT/mkdocs.yml" ]; then
  mkdir -p /artifact
  cd "$ROOT"
  if [ -f requirements.txt ]; then
    python3 -m pip install --no-cache-dir --break-system-packages -r requirements.txt 2>/dev/null \
      || python3 -m pip install --no-cache-dir -r requirements.txt 2>/dev/null \
      || pip3 install --no-cache-dir -r requirements.txt
  else
    python3 -m pip install --no-cache-dir --break-system-packages mkdocs-material 2>/dev/null \
      || python3 -m pip install --no-cache-dir mkdocs-material 2>/dev/null \
      || pip3 install --no-cache-dir mkdocs-material
  fi
  mkdocs build
  cd "$ROOT"
  if artifact_copy "."; then
    exit 0
  fi
  printf '%s\n' '<!DOCTYPE html><html><head><meta charset="utf-8"><title>MkDocs</title></head><body><h1>MkDocs build produced no <code>site/</code> output</h1></body></html>' > /artifact/index.html
  exit 0
fi

# Jekyll sites (including remote_theme) can be built to _site.
if [ -f "$ROOT/_config.yml" ] && [ -d "$ROOT/_layouts" ]; then
  mkdir -p /artifact
  cd "$ROOT"

  if [ ! -f Gemfile ]; then
    cat > Gemfile <<'EOF'
source "https://rubygems.org"
gem "jekyll", "~> 4.3"
gem "jekyll-remote-theme"
gem "jekyll-seo-tag"
gem "jekyll-sitemap"
gem "jekyll-feed"
gem "jekyll-paginate"
gem "webrick"
EOF
  fi

  mkdir -p _includes
  # Some repos reference these includes via inherited theme layouts but don't vendor them.
  for inc in head-custom.html social-share.html; do
    if [ ! -f "_includes/$inc" ]; then
      printf '%s\n' '{% comment %}Auto-generated stub include for container build{% endcomment %}' > "_includes/$inc"
    fi
  done

  bundle install --jobs 4
  bundle exec jekyll build

  cd "$ROOT"
  if artifact_copy "."; then
    exit 0
  fi
  printf '%s\n' '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Jekyll</title></head><body><h1>Jekyll build produced no <code>_site/</code> output</h1></body></html>' > /artifact/index.html
  exit 0
fi

has_build_script() {
  f="$1/package.json"
  [ -f "$f" ] && grep -q '"build"' "$f"
}

# Prefer subdirs where many monorepos keep the SPA (order matters).
try_dirs=""
if has_build_script "."; then try_dirs="."
fi
for d in web frontend client app ui talk-ui dashboard/tax_ui packages/web packages/frontend; do
  if [ -z "$try_dirs" ] && [ -d "$d" ] && has_build_script "$d"; then
    try_dirs="$d"
    break
  fi
done

# Last resort: shallow find package.json with "build" (maxdepth 4)
if [ -z "$try_dirs" ]; then
  found=""
  for f in $(find . -maxdepth 6 -name package.json 2>/dev/null | grep -v /node_modules/ | sort); do
    d=$(dirname "$f")
    d=${d#./}
    [ "$d" = "." ] && continue
    if has_build_script "$d"; then
      found=$d
      break
    fi
  done
  try_dirs=$found
fi

mkdir -p /artifact

if [ -z "$try_dirs" ]; then
  printf '%s\n' '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Catalog app</title><style>body{font-family:system-ui;margin:2rem}</style></head><body><h1>No Node build target</h1><p>No <code>package.json</code> with a <code>build</code> script found (checked root, <code>web/</code>, <code>frontend/</code>, etc.).</p></body></html>' > /artifact/index.html
  exit 0
fi

echo "catalog-app: using app directory: $try_dirs"
cd "$ROOT/$try_dirs"

# dwani-ai/talk currently misses this frontend helper in repo; provide safe fallback.
if [ -f "$ROOT/talk-ui/src/contexts/AuthContext.jsx" ] && [ ! -f "$ROOT/talk-ui/src/lib/authClient.js" ]; then
  mkdir -p "$ROOT/talk-ui/src/lib"
  cat > "$ROOT/talk-ui/src/lib/authClient.js" <<'EOF'
const BASE = '/v1/auth'

async function jsonRequest(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    ...init,
  })
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`
    try {
      const body = await res.json()
      if (body && body.detail) message = body.detail
    } catch (_) {}
    throw new Error(message)
  }
  return res.status === 204 ? null : res.json()
}

export function getCurrentUser() {
  return jsonRequest('/me', { method: 'GET' })
}

export function signup(payload) {
  return jsonRequest('/signup', { method: 'POST', body: JSON.stringify(payload) })
}

export function login(payload) {
  return jsonRequest('/login', { method: 'POST', body: JSON.stringify(payload) })
}

export function logout() {
  return jsonRequest('/logout', { method: 'POST' })
}
EOF
fi

# Relaxed peers for automated builds (Dockerfile also sets this).
export NPM_CONFIG_LEGACY_PEER_DEPS="${NPM_CONFIG_LEGACY_PEER_DEPS:-true}"

corepack enable 2>/dev/null || true

if [ -f pnpm-lock.yaml ]; then
  pnpm install --frozen-lockfile 2>/dev/null || pnpm install
elif [ -f yarn.lock ]; then
  yarn install --frozen-lockfile 2>/dev/null || yarn install
elif [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund 2>/dev/null || npm install --no-audit --no-fund
else
  npm install --no-audit --no-fund
fi

npm run build 2>/dev/null || npm run build:prod 2>/dev/null || true

cd "$ROOT"
if artifact_copy "$try_dirs"; then
  exit 0
fi

# Some tools write to cwd only
cd "$ROOT/$try_dirs"
if artifact_copy "."; then
  exit 0
fi

printf '%s\n' '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Build</title><style>body{font-family:system-ui;margin:2rem}</style></head><body><h1>No static output</h1><p>Build ran in <code>'"$try_dirs"'</code> but no <code>dist</code>/<code>build</code>/<code>out</code>/<code>site</code>/<code>_site</code> was found.</p></body></html>' > /artifact/index.html
