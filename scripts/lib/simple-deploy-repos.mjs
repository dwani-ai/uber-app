/**
 * Catalog `repo` strings (owner/name) that use runtime/catalog-app: clone,
 * then build.sh (MkDocs → site/, or Node `npm run build` → dist/build/…) → nginx.
 */
export const SIMPLE_DEPLOY_REPOS = new Set([
  "dwani-ai/discovery",
  "dwani-ai/dwani-ai.github.io",
  // escape_among_us: Next.js output: "standalone" + Socket.io — needs a Node runtime, not static nginx
  "dwani-ai/uber-app",
  // agent-olympics-school: frontend/ is Python (Streamlit), not Node — not catalog-app
  "sachinsshetty/thunder-flash",
  "sachinsshetty/uberTax_discovery",
  "sachinsshetty/xr-hack-gardenia",
  "slabstech/gaganyatri.in",
  "slabstech/sahana-website",
  // MkDocs → runtime/catalog-app (build.sh: mkdocs build → site/)
  "slabstech/book-nation-building-sir-m-vishveshwaraya",
  // Vite SPA (outDir: build)
  "slabstech/sanjeevini_frontend",
]);

/** @param {string} repo */
export function isSimpleDeployRepo(repo) {
  return SIMPLE_DEPLOY_REPOS.has(repo);
}
