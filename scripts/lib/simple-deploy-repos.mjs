/**
 * Optional per-repo overrides for runtime/catalog-app (clone root = /src).
 * - appDir: use this package.json directory instead of auto-detect (monorepos).
 * - buildCmd: shell command run in appDir instead of `npm run build` (e.g. vite-only when tsc is broken upstream).
 */
export const SIMPLE_DEPLOY_CATALOG_OVERRIDES = {
  /** Root Vite SPA; `tsc -b` fails in container — vite alone writes `build/`. */
  "dwani-ai/dwani-ai.github.io": { buildCmd: "npx vite build" },
  /** Vite outDir is repo-root dist/control-ui (see ui/vite.config). */
  "sachinsshetty/openclaw": { appDir: "ui", artifactDir: "dist/control-ui" },
  /** Upstream `tsc && vite build` fails (CSS module typings); Vite alone is enough for static nginx. */
  "dwani-ai/sanjeevini": { appDir: "sanjeevini-ui", buildCmd: "npx vite build" },
  "sachinsshetty/xr-hack-gardenia": {
    appDir: "frontend",
    buildCmd: "npx vite build",
  },
};

/** @param {string} repo */
export function catalogAppDir(repo) {
  return SIMPLE_DEPLOY_CATALOG_OVERRIDES[repo]?.appDir ?? "";
}

/** @param {string} repo */
export function catalogAppBuildCmd(repo) {
  return SIMPLE_DEPLOY_CATALOG_OVERRIDES[repo]?.buildCmd ?? "";
}

/** Static output path relative to clone root (when not under appDir). */
export function catalogAppArtifactDir(repo) {
  return SIMPLE_DEPLOY_CATALOG_OVERRIDES[repo]?.artifactDir ?? "";
}

/**
 * Catalog `repo` strings (owner/name) that use runtime/catalog-app: clone,
 * then build.sh (MkDocs → site/, or Node `npm run build` → dist/build/…) → nginx.
 */
export const SIMPLE_DEPLOY_REPOS = new Set([
  // Tier A docs (MkDocs)
  "dwani-ai/agent-recipes",
  "dwani-ai/docs",
  "dwani-ai/discovery",
  "dwani-ai/dwani-ai.github.io",
  "dwani-ai/talk",
  "dwani-ai/llm-recipes",
  // vision_benchmarks: build.sh adds mkdocs overlay (docs/ only)
  "dwani-ai/vision_benchmarks",
  // escape_among_us: Next.js output: "standalone" + Socket.io — needs a Node runtime, not static nginx
  "dwani-ai/uber-app",
  // agent-olympics-school: Gradio in runtime/agent-olympics-school (not static nginx)
  "sachinsshetty/onwards",
  "sachinsshetty/passpredict",
  "sachinsshetty/thunder-flash",
  "sachinsshetty/track-me-not",
  "sachinsshetty/openclaw",
  "sachinsshetty/uberTax_discovery",
  // xr-hack-gardenia: static via `vite build` only (see SIMPLE_DEPLOY_CATALOG_OVERRIDES.buildCmd); tsc still fails upstream.
  "sachinsshetty/xr-hack-gardenia",
  "dwani-ai/sanjeevini",
  "slabstech/gaganyatri.in",
  "slabstech/sahana-website",
  // MkDocs → runtime/catalog-app (build.sh: mkdocs build → site/)
  "slabstech/book-nation-building-sir-m-vishveshwaraya",
  // Vite SPA (outDir: build)
  "slabstech/sanjeevini_frontend",
  // Jekyll + remote theme
  "slabstech/slabstech.github.io",
]);

/** @param {string} repo */
export function isSimpleDeployRepo(repo) {
  return SIMPLE_DEPLOY_REPOS.has(repo);
}
