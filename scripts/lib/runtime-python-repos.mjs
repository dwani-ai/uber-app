/**
 * Catalog repos that ship a Python HTTP app (e.g. Gradio), not nginx static.
 * Each has a Dockerfile under `context` (relative to uber-app repo root).
 * Optional composeEnv: extra docker-compose environment lines (YAML values, often ${VAR:-default}).
 */
export const RUNTIME_PYTHON_REPOS = new Map([
  ["dwani-ai/workshop", { context: "./runtime/workshop", port: 8000 }],
  [
    "sachinsshetty/agent-olympics-school",
    {
      context: "./runtime/agent-olympics-school",
      port: 8080,
      composeEnv: {
        SCHOOL_BACKEND_URL:
          "${SCHOOL_BACKEND_URL:-https://school-server.dwani.ai/}",
      },
    },
  ],
]);

/** @param {string} repo */
export function isRuntimePythonRepo(repo) {
  return RUNTIME_PYTHON_REPOS.has(repo);
}

/**
 * @param {string} repo
 * @returns {{ context: string, port: number, composeEnv?: Record<string, string> } | undefined}
 */
export function runtimePythonBuild(repo) {
  return RUNTIME_PYTHON_REPOS.get(repo);
}
