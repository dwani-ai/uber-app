/**
 * Catalog repos that ship a Python HTTP app (e.g. Gradio), not nginx static.
 * Each has a Dockerfile under `context` (relative to uber-app repo root).
 *
 * Optional composeEnv: extra docker-compose environment lines (YAML values).
 * Optional apiSidecar: second container (same context, no Traefik) for in-stack APIs.
 *   When set, generate-docker-compose-apps sets SCHOOL_BACKEND_URL to the sidecar unless
 *   composeEnv already defines SCHOOL_BACKEND_URL.
 * Optional dependsOn: service ids for docker compose depends_on.
 * Optional dockerfile: main service Dockerfile (default Dockerfile).
 * Optional embedPath: path appended to manifest liveUrl so "Run in UberApp" opens Swagger (e.g. "/docs").
 * Optional gpus: when true, compose sets `gpus: all` (NVIDIA Container Toolkit + Compose v2 on the host).
 */
export const RUNTIME_PYTHON_REPOS = new Map([
  ["dwani-ai/workshop", { context: "./runtime/workshop", port: 8000 }],
  [
    "dwani-ai/dwani-api-server",
    {
      context: "./runtime/dwani-api-server",
      port: 18888,
      embedPath: "/docs",
    },
  ],
  [
    "sachinsshetty/faster-whisper-server",
    {
      context: "./runtime/faster-whisper-server",
      port: 8000,
      embedPath: "/docs",
    },
  ],
  [
    "dwani-ai/asr-indic-server",
    {
      context: "./runtime/asr-indic-server",
      port: 10803,
      embedPath: "/docs",
      gpus: true,
    },
  ],
  [
    "dwani-ai/tts-indic-server",
    {
      context: "./runtime/tts-indic-server",
      port: 10804,
      embedPath: "/docs",
      gpus: true,
    },
  ],
  [
    "dwani-ai/llm-indic-server",
    {
      context: "./runtime/llm-indic-server",
      port: 7860,
      embedPath: "/docs",
      gpus: true,
    },
  ],
  [
    "slabstech/parler-tts-server",
    {
      context: "./runtime/parler-tts-server",
      port: 8000,
      embedPath: "/docs",
      gpus: true,
    },
  ],
  [
    "slabstech/audiocraft-tts-server",
    {
      context: "./runtime/audiocraft-tts-server",
      port: 8000,
      embedPath: "/docs",
      gpus: true,
    },
  ],
  [
    "sachinsshetty/agent-olympics-school",
    {
      context: "./runtime/agent-olympics-school",
      port: 8080,
      dependsOn: ["sachinsshetty-agent-olympics-school-api"],
      apiSidecar: {
        serviceId: "sachinsshetty-agent-olympics-school-api",
        dockerfile: "Dockerfile.backend",
        port: 8000,
        composeEnv: {
          TUTOR_API_KEY: "${TUTOR_API_KEY:-}",
          DWANI_API_BASE_URL: "${DWANI_API_BASE_URL:-}",
        },
      },
    },
  ],
]);

/** @param {string} repo */
export function isRuntimePythonRepo(repo) {
  return RUNTIME_PYTHON_REPOS.has(repo);
}

/** @param {string} repo */
export function runtimePythonBuild(repo) {
  return RUNTIME_PYTHON_REPOS.get(repo);
}

/** @param {string} repo @returns {string} path like "/docs" or "" */
export function runtimePythonEmbedPath(repo) {
  const ep = RUNTIME_PYTHON_REPOS.get(repo)?.embedPath;
  if (!ep || typeof ep !== "string") return "";
  return ep.startsWith("/") ? ep : `/${ep}`;
}
