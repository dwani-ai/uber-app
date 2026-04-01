import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
};

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

function idFromRepo(repo) {
  return repo.replace(/\//g, "-").replace(/\./g, "-").toLowerCase();
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
  return {
    id: idFromRepo(repo),
    title: titleFromRepo(repo),
    repo,
    categories,
    description: null,
    liveUrl: null,
    docsUrl: `https://github.com/${repo}`,
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
