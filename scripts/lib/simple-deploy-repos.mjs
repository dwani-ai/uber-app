/**
 * Catalog `repo` strings (owner/name) that use runtime/catalog-app today: clone +
 * root npm install + npm run build → nginx static. Expand as you add Dockerfiles
 * or custom stacks for other projects.
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
]);

/** @param {string} repo */
export function isSimpleDeployRepo(repo) {
  return SIMPLE_DEPLOY_REPOS.has(repo);
}
