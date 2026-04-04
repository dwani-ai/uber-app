import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isSimpleDeployRepo } from "../../scripts/lib/simple-deploy-repos.mjs";
import { isRuntimeNodeRepo } from "../../scripts/lib/runtime-node-repos.mjs";
import {
  isRuntimePythonRepo,
  runtimePythonEmbedPath,
} from "../../scripts/lib/runtime-python-repos.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const webRepos = [
  "slabstech/sahana-website",
  "slabstech/gaganyatri.in",
  "slabstech/slabstech.github.io",
  "slabstech/flex-fit-app",
  "slabstech/book-nation-building-sir-m-vishveshwaraya",
  "slabstech/sanjeevini_frontend",
  "dwani-ai/dwani-ai.github.io",
  "dwani-ai/talk",
  "dwani-ai/workshop",
  "dwani-ai/discovery",
  "dwani-ai/escape_among_us",
  "dwani-ai/drishti",
  "dwani-ai/swara",
  "dwani-ai/artha",
  "dwani-ai/uber-app",
  "sachinsshetty/care_scribe_fe",
];

const aiRepos = [
  "sachinsshetty/openclaw",
  "sachinsshetty/sanjeevini",
  "sachinsshetty/elixir_edge",
  "sachinsshetty/agent-olympics-school",
  "sachinsshetty/agent-beats-dwani-discovery",
  "sachinsshetty/track-me-not",
  "sachinsshetty/uberTax_discovery",
  "sachinsshetty/xr-hack-gardenia",
  "sachinsshetty/thunder-flash",
  "sachinsshetty/prime-rl",
  "sachinsshetty/smart_city_hackathon",
  "sachinsshetty/segment-anything-2",
  "sachinsshetty/xr_dwani",
  "sachinsshetty/IndicTrans2",
  "sachinsshetty/notebooklm",
  "sachinsshetty/inference_hackathon",
  "sachinsshetty/biryani_bot",
  "sachinsshetty/ksim",
  "sachinsshetty/care_scribe",
  "sachinsshetty/MedAgentBench",
  "sachinsshetty/faster-whisper-server",
  "sachinsshetty/passpredict",
  "sachinsshetty/onwards",
  "slabstech/olmocr",
  "slabstech/IndicF5",
  "slabstech/parler-tts-server",
  "slabstech/audiocraft-tts-server",
  "slabstech/dhwani-hf-deploy",
  "slabstech/sanjeevini_backend",
  "slabstech/bhoomi",
  "dwani-ai/sanjeevini",
  "dwani-ai/tts-indic-server",
  "dwani-ai/asr-indic-server",
  "dwani-ai/llm-indic-server",
  "dwani-ai/indic-translate-server",
  "dwani-ai/docs-indic-server",
  "dwani-ai/dwani-api-server",
  "dwani-ai/dwani-server",
  "dwani-ai/agent-recipes",
  "dwani-ai/llm-recipes",
  "dwani-ai/vision_benchmarks",
  "dwani-ai/docs",
];

/**
 * Shown in the hub when `liveUrl` is null and the project is tagged `web`.
 * (Repos that cannot ship via catalog / runtime-node / runtime-python yet.)
 */
const stubWebDeployHints = {
  "dwani-ai/artha":
    "No app sources in the repo yet; cannot run a static or Node preview.",
  "dwani-ai/swara":
    "No app sources in the repo yet; cannot run a static or Node preview.",
  "dwani-ai/drishti":
    "Python/services only; no static front-end build for nginx.",
  "sachinsshetty/care_scribe_fe":
    "Component stub only (no `build` script / app tree in this fork).",
  "slabstech/flex-fit-app":
    "Android (Compose) project; not a static web export.",
};

/** @type {Record<string, string>} */
const titleOverrides = {
  "slabstech/gaganyatri.in": "Gaganyatri",
  "slabstech/book-nation-building-sir-m-vishveshwaraya":
    "Nation-building — Sir M. Visvesvaraya",
  "sachinsshetty/uberTax_discovery": "UberTax discovery",
  "sachinsshetty/xr-hack-gardenia": "XR hack — Gardenia",
  "sachinsshetty/IndicTrans2": "IndicTrans2",
  "slabstech/IndicF5": "IndicF5",
  "dwani-ai/dwani-ai.github.io": "dwani-ai (GitHub Pages)",
  "dwani-ai/uber-app": "UberApp (this hub)",
  "sachinsshetty/MedAgentBench": "MedAgentBench",
  "sachinsshetty/care_scribe_fe": "Care scribe (frontend)",
  "sachinsshetty/care_scribe": "Care scribe",
  "dwani-ai/escape_among_us": "Escape Among Us",
  "dwani-ai/llm-recipes": "LLM recipes",
  "dwani-ai/docs": "dwani.ai docs",
  "dwani-ai/vision_benchmarks": "Vision benchmarks",
  "sachinsshetty/onwards": "Onwards",
  "sachinsshetty/track-me-not": "Track me not",
  "sachinsshetty/openclaw": "OpenClaw",
  "dwani-ai/sanjeevini": "Sanjeevini",
  "sachinsshetty/agent-beats-dwani-discovery": "Agent Beats (discovery)",
  "sachinsshetty/biryani_bot": "Biryani Bot",
  "sachinsshetty/inference_hackathon": "Inference hackathon",
};

/**
 * Hostname used in Traefik (docker compose, stubs). Default localhost matches
 * docker-compose `hub.${DOMAIN:-localhost}` when .env has no DOMAIN.
 */
function effectiveDeployDomain() {
  return (
    process.env.UBERAPP_DEPLOY_DOMAIN ||
    process.env.DOMAIN ||
    "localhost"
  ).trim();
}

/** @param {string} domain */
function urlSchemeForDomain(domain) {
  const explicit = (process.env.UBERAPP_URL_SCHEME || "").trim().toLowerCase();
  if (explicit === "http" || explicit === "https") return explicit;
  if (
    domain === "localhost" ||
    domain === "127.0.0.1" ||
    domain.endsWith(".localhost")
  ) {
    return "http";
  }
  return "https";
}

/**
 * Published app URL inside UberApp only (Traefik → stub or real service).
 * @param {string} hostLabel catalog id, or "hub" for this portfolio UI
 * @param {string} domain
 */
function uberappServiceUrl(hostLabel, domain) {
  const scheme = urlSchemeForDomain(domain);
  const port = (process.env.UBERAPP_PUBLIC_PORT || "").trim();
  const p = port ? `:${port}` : "";
  return `${scheme}://${hostLabel}.${domain}${p}/`;
}

/**
 * liveUrl for static simple-deploy and Node runtime apps (see runtime-node-repos).
 * @param {string} repo
 * @returns {string | null}
 */
function liveUrlForRepo(repo) {
  if (
    !isSimpleDeployRepo(repo) &&
    !isRuntimeNodeRepo(repo) &&
    !isRuntimePythonRepo(repo)
  ) {
    return null;
  }
  const domain = effectiveDeployDomain();
  let base;
  if (repo === "dwani-ai/uber-app") {
    base = uberappServiceUrl("hub", domain);
  } else {
    base = uberappServiceUrl(idFromRepo(repo), domain);
  }
  if (isRuntimePythonRepo(repo)) {
    const embed = runtimePythonEmbedPath(repo);
    if (embed) {
      return base.replace(/\/$/, "") + embed;
    }
  }
  return base;
}

function titleFromRepo(repo) {
  if (titleOverrides[repo]) return titleOverrides[repo];
  const name = repo.split("/")[1];
  if (name.includes("_")) {
    return name.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  }
  return name
    .replaceAll(".", "-")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Stable id for Traefik Host(), subdomains, and /run/:id.
 * Underscores are not valid in DNS host labels (RFC 1035), so map them to hyphens.
 */
function idFromRepo(repo) {
  return repo
    .replace(/\//g, "-")
    .replace(/\./g, "-")
    .replace(/_/g, "-")
    .toLowerCase();
}

/**
 * @param {string} repo
 * @param {("web"|"ai")[]} categories
 * @param {string | null} liveUrl
 */
function descriptionForRepo(repo, categories, liveUrl) {
  if (liveUrl != null) return null;
  if (!categories.includes("web")) return null;
  return stubWebDeployHints[repo] ?? null;
}

const webSet = new Set(webRepos);
const aiSet = new Set(aiRepos);
const allRepos = [...new Set([...webRepos, ...aiRepos])].sort((a, b) =>
  a.localeCompare(b)
);

const projects = allRepos.map((repo) => {
  /** @type {("web"|"ai")[]} */
  const categories = [];
  if (webSet.has(repo)) categories.push("web");
  if (aiSet.has(repo)) categories.push("ai");
  const liveUrl = liveUrlForRepo(repo);
  return {
    id: idFromRepo(repo),
    title: titleFromRepo(repo),
    repo,
    categories,
    description: descriptionForRepo(repo, categories, liveUrl),
    liveUrl,
    docsUrl: `https://github.com/${repo}`,
    subdomain: idFromRepo(repo),
  };
});

const manifest = {
  $schema: "/projects.v1.schema.json",
  version: 1,
  projects,
};
const out = path.join(__dirname, "..", "public", "projects.v1.json");
fs.writeFileSync(out, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log("Wrote", out, "—", projects.length, "projects");
