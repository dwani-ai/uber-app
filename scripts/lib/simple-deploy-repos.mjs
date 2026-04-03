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
  // escape_among_us: Next.js output: "standalone" + Socket.io — needs a Node runtime, not static nginx
  "dwani-ai/uber-app",
  // agent-olympics-school: Gradio in runtime/agent-olympics-school (not static nginx)
  "sachinsshetty/thunder-flash",
  "sachinsshetty/uberTax_discovery",
  // xr-hack-gardenia: frontend `tsc -b` fails upstream (Hero.tsx / MUI); re-add when fixed.
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
