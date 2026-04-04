#!/bin/sh
# Clone is at /src. MkDocs (mkdocs.yml) → site/; else find package.json "build", install, copy dist/build/out/site/_site → /artifact
set -eu

ROOT=/src
cd "$ROOT"

# When docker-compose build `args:` omit CATALOG_* (old compose, cached build), still pick the right app dir / command.
case "${CLONE_REPO:-}" in
  sachinsshetty/xr-hack-gardenia)
    CATALOG_APP_DIR=${CATALOG_APP_DIR:-frontend}
    CATALOG_APP_BUILD_CMD=${CATALOG_APP_BUILD_CMD:-npx vite build}
    ;;
  dwani-ai/dwani-ai.github.io)
    CATALOG_APP_BUILD_CMD=${CATALOG_APP_BUILD_CMD:-npx vite build}
    ;;
esac

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

# dwani-ai/vision_benchmarks: markdown under docs/ but no mkdocs.yml (see overlay-vision-benchmarks-mkdocs.yml).
if [ ! -f "$ROOT/mkdocs.yml" ] && [ -f "$ROOT/docs/setup.md" ] && [ -f "$ROOT/docs/vision_models.md" ] && [ -f "$ROOT/compose.yml" ] && [ -f /opt/overlay-vision-benchmarks-mkdocs.yml ]; then
  cp /opt/overlay-vision-benchmarks-mkdocs.yml "$ROOT/mkdocs.yml"
fi

# MkDocs-only repos have no package.json; handle before Node discovery.
if [ -f "$ROOT/mkdocs.yml" ]; then
  mkdir -p /artifact
  cd "$ROOT"
  if [ -f requirements.txt ]; then
    python3 -m pip install --no-cache-dir --break-system-packages -r requirements.txt \
      || pip3 install --no-cache-dir --break-system-packages -r requirements.txt
  else
    python3 -m pip install --no-cache-dir --break-system-packages mkdocs-material \
      || pip3 install --no-cache-dir --break-system-packages mkdocs-material
  fi
  mkdocs build
  cd "$ROOT"
  if artifact_copy "."; then
    exit 0
  fi
  if [ "${CATALOG_APP_STRICT_BUILD:-0}" = "1" ]; then
    echo "catalog-app: strict build failed (MkDocs produced no site/)" >&2
    exit 1
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
  if [ "${CATALOG_APP_STRICT_BUILD:-0}" = "1" ]; then
    echo "catalog-app: strict build failed (Jekyll produced no _site/)" >&2
    exit 1
  fi
  printf '%s\n' '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Jekyll</title></head><body><h1>Jekyll build produced no <code>_site/</code> output</h1></body></html>' > /artifact/index.html
  exit 0
fi

# dwani-ai/talk: SPA in talk-ui/; upstream omits src/lib/* (AuthContext, App imports).
if [ -d "$ROOT/talk-ui/src" ]; then
  mkdir -p "$ROOT/talk-ui/src/lib"
  if [ -f "$ROOT/talk-ui/src/contexts/AuthContext.jsx" ] && [ ! -f "$ROOT/talk-ui/src/lib/authClient.js" ] && [ -f /opt/talk-authClient.js ]; then
    cp /opt/talk-authClient.js "$ROOT/talk-ui/src/lib/authClient.js"
  fi
  if [ -f "$ROOT/talk-ui/src/App.jsx" ]; then
    [ ! -f "$ROOT/talk-ui/src/lib/apiClient.js" ] && [ -f /opt/talk-apiClient.js ] && cp /opt/talk-apiClient.js "$ROOT/talk-ui/src/lib/apiClient.js"
    [ ! -f "$ROOT/talk-ui/src/lib/audio.js" ] && [ -f /opt/talk-audio.js ] && cp /opt/talk-audio.js "$ROOT/talk-ui/src/lib/audio.js"
    [ ! -f "$ROOT/talk-ui/src/lib/session.js" ] && [ -f /opt/talk-session.js ] && cp /opt/talk-session.js "$ROOT/talk-ui/src/lib/session.js"
  fi
fi

has_build_script() {
  f="$1/package.json"
  [ -f "$f" ] && grep -q '"build"' "$f"
}

# Prefer explicit dir from compose/verify (monorepos where root `build` is not the static site).
try_dirs=""
if [ -n "${CATALOG_APP_DIR:-}" ]; then
  if [ -d "$ROOT/$CATALOG_APP_DIR" ] && has_build_script "$CATALOG_APP_DIR"; then
    try_dirs="$CATALOG_APP_DIR"
  elif [ "${CATALOG_APP_STRICT_BUILD:-0}" = "1" ]; then
    echo "catalog-app: CATALOG_APP_DIR=${CATALOG_APP_DIR} missing or has no package.json build script" >&2
    exit 1
  fi
fi

# Prefer subdirs where many monorepos keep the SPA (order matters).
if [ -z "$try_dirs" ] && has_build_script "."; then try_dirs="."
fi
if [ -z "$try_dirs" ]; then
  for d in web frontend client app ui sanjeevini-ui talk-ui dashboard/tax_ui packages/web packages/frontend; do
    if [ -d "$d" ] && has_build_script "$d"; then
      try_dirs="$d"
      break
    fi
  done
fi

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
  if [ "${CATALOG_APP_STRICT_BUILD:-0}" = "1" ]; then
    echo "catalog-app: strict build failed (no package.json with build script)" >&2
    exit 1
  fi
  printf '%s\n' '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Catalog app</title><style>body{font-family:system-ui;margin:2rem}</style></head><body><h1>No Node build target</h1><p>No <code>package.json</code> with a <code>build</code> script found (checked root, <code>web/</code>, <code>frontend/</code>, etc.).</p></body></html>' > /artifact/index.html
  exit 0
fi

echo "catalog-app: using app directory: $try_dirs"
cd "$ROOT/$try_dirs"

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

# Alpine + musl: npm can skip Rollup optional natives (vite build); see npm/cli#4828.
if [ -d node_modules/rollup ]; then
  _m=$(uname -m)
  case "$_m" in
    aarch64|arm64) _rp="@rollup/rollup-linux-arm64-musl" ;;
    x86_64|amd64) _rp="@rollup/rollup-linux-x64-musl" ;;
    *) _rp="" ;;
  esac
  if [ -n "$_rp" ]; then
    npm install "$_rp" --no-save --no-audit --no-fund 2>/dev/null || true
  fi
fi

# Alpine + musl: @vitejs/plugin-react-swc / @swc/core optional binding may be missing.
if [ -d node_modules/@swc/core ]; then
  _m=$(uname -m)
  case "$_m" in
    aarch64|arm64) _swc="@swc/core-linux-arm64-musl" ;;
    x86_64|amd64) _swc="@swc/core-linux-x64-musl" ;;
    *) _swc="" ;;
  esac
  if [ -n "$_swc" ]; then
    npm install "$_swc" --no-save --no-audit --no-fund 2>/dev/null || true
  fi
fi

if [ -n "${CATALOG_APP_BUILD_CMD:-}" ]; then
  if [ "${CATALOG_APP_STRICT_BUILD:-0}" = "1" ]; then
    sh -c "$CATALOG_APP_BUILD_CMD" || exit 1
  else
    sh -c "$CATALOG_APP_BUILD_CMD" 2>/dev/null || true
  fi
elif [ "${CATALOG_APP_STRICT_BUILD:-0}" = "1" ]; then
  if npm run build; then
    :
  elif npm run build:prod; then
    :
  else
    exit 1
  fi
else
  npm run build 2>/dev/null || npm run build:prod 2>/dev/null || true
fi

cd "$ROOT"
if artifact_copy "$try_dirs"; then
  exit 0
fi

# Some tools write to cwd only
cd "$ROOT/$try_dirs"
if artifact_copy "."; then
  exit 0
fi

# Monorepo Vite apps may emit outside appDir (e.g. openclaw ui/ → ../dist/control-ui).
cd "$ROOT"
if [ -n "${CATALOG_APP_ARTIFACT_DIR:-}" ] && artifact_copy "$CATALOG_APP_ARTIFACT_DIR"; then
  exit 0
fi

if [ "${CATALOG_APP_STRICT_BUILD:-0}" = "1" ]; then
  echo "catalog-app: strict build failed (no dist/build/out/site/_site under $try_dirs)" >&2
  exit 1
fi

printf '%s\n' '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Build</title><style>body{font-family:system-ui;margin:2rem}</style></head><body><h1>No static output</h1><p>Build ran in <code>'"$try_dirs"'</code> but no <code>dist</code>/<code>build</code>/<code>out</code>/<code>site</code>/<code>_site</code> was found.</p></body></html>' > /artifact/index.html
