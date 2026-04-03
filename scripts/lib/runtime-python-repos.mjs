/**
 * Catalog repos that ship a Python HTTP app (e.g. Gradio), not nginx static.
 * Each has a Dockerfile under `context` (relative to uber-app repo root).
 */
export const RUNTIME_PYTHON_REPOS = new Map([
  ["dwani-ai/workshop", { context: "./runtime/workshop", port: 8000 }],
]);

/** @param {string} repo */
export function isRuntimePythonRepo(repo) {
  return RUNTIME_PYTHON_REPOS.has(repo);
}

/** @param {string} repo @returns {{ context: string, port: number } | undefined} */
export function runtimePythonBuild(repo) {
  return RUNTIME_PYTHON_REPOS.get(repo);
}
