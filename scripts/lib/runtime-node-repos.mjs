/**
 * Catalog repos that ship a Node HTTP server (not static nginx).
 * Each has a dedicated Dockerfile under runtime/<name>/.
 */
export const RUNTIME_NODE_REPOS = new Set(["dwani-ai/escape_among_us"]);

/** @param {string} repo */
export function isRuntimeNodeRepo(repo) {
  return RUNTIME_NODE_REPOS.has(repo);
}

/** @param {string} repo @returns {number} container listen port */
export function runtimeNodePort(repo) {
  if (repo === "dwani-ai/escape_among_us") return 3000;
  return 3000;
}
