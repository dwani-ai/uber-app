#!/usr/bin/env node
/**
 * One-shot: optional .env bootstrap → npm ci (web) → gen manifest → docker compose build → up.
 *
 * Usage:
 *   node scripts/deploy.mjs
 *   node scripts/deploy.mjs --skip-install
 *   node scripts/deploy.mjs --skip-manifest
 *   node scripts/deploy.mjs --no-up          # build images only
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { applyEnv } from "./lib/load-env.mjs";
import { getComposeArgs } from "./lib/compose-files.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(cmd, args, opts = {}) {
  const { cwd = root, ...spawnOpts } = opts;
  const r = spawnSync(cmd, args, {
    cwd,
    stdio: "inherit",
    env: process.env,
    shell: false,
    ...spawnOpts,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function parseArgs() {
  const a = process.argv.slice(2);
  return {
    skipInstall: a.includes("--skip-install"),
    skipManifest: a.includes("--skip-manifest"),
    noUp: a.includes("--no-up") || a.includes("--build-only"),
  };
}

const { skipInstall, skipManifest, noUp } = parseArgs();

applyEnv(root);

if (!existsSync(join(root, ".env"))) {
  const ex = join(root, ".env.example");
  if (existsSync(ex)) {
    copyFileSync(ex, join(root, ".env"));
    console.log(
      "Created .env from .env.example — set DOMAIN (and optional TRAEFIK_HTTP_PORT), then run:\n  node scripts/deploy.mjs"
    );
    process.exit(1);
  }
  console.error("Missing .env and .env.example — create .env with DOMAIN=your.domain");
  process.exit(1);
}

if (!skipInstall) {
  run("npm", ["ci"], { cwd: join(root, "web") });
}

if (!skipManifest) {
  run(process.execPath, ["scripts/run-manifest.mjs"]);
}

if (process.env.DOMAIN?.trim()) {
  run(process.execPath, ["scripts/generate-traefik-stubs.mjs"]);
}

const composeArgs = ["compose", ...getComposeArgs(root), "config"];
run("docker", composeArgs);
run("docker", ["compose", ...getComposeArgs(root), "build"]);
if (!noUp) {
  run("docker", ["compose", ...getComposeArgs(root), "up", "-d"]);
  console.log("\nDone. Hub: http://hub." + (process.env.DOMAIN || "<DOMAIN>") + "/ (after DNS / hosts).");
}
