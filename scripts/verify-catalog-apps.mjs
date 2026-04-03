#!/usr/bin/env node
/**
 * Build runtime/catalog-app for every SIMPLE_DEPLOY_REPOS entry (clone + build.sh → nginx).
 * Use before releases or after changing catalog-app/build.sh.
 *
 *   node scripts/verify-catalog-apps.mjs
 *   node scripts/verify-catalog-apps.mjs --repo dwani-ai/discovery
 *
 * Env:
 *   VERIFY_CATALOG_PLATFORM — e.g. linux/amd64 for the same arch as most cloud VMs (needs QEMU/binfmt on ARM Macs).
 *   VERIFY_CATALOG_SKIP — comma-separated owner/name repos to skip (e.g. local ARM quirks).
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { SIMPLE_DEPLOY_REPOS } from "./lib/simple-deploy-repos.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dockerfile = join(root, "runtime/catalog-app/Dockerfile");
const context = join(root, "runtime/catalog-app");

const args = process.argv.slice(2);
const repoArg = args.find((a) => a.startsWith("--repo="))?.slice("--repo=".length)?.trim();
const platform = (process.env.VERIFY_CATALOG_PLATFORM ?? "").trim();
const skipRepos = new Set(
  (process.env.VERIFY_CATALOG_SKIP ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
);

let repos = repoArg ? [repoArg] : [...SIMPLE_DEPLOY_REPOS].sort();
if (repoArg && !SIMPLE_DEPLOY_REPOS.has(repoArg)) {
  console.error(`verify-catalog-apps: unknown repo ${repoArg} (not in SIMPLE_DEPLOY_REPOS)`);
  process.exit(1);
}
if (!repoArg) {
  repos = repos.filter((r) => !skipRepos.has(r));
}

const failures = [];
for (const repo of repos) {
  const tag = `catalog-verify:${repo.replace(/\//g, "-")}`;
  console.log(`\n========== ${repo} → ${tag} ==========\n`);
  const dockerArgs = [
    "build",
    "-f",
    dockerfile,
    "--build-arg",
    `REPO=${repo}`,
    "--build-arg",
    "CATALOG_APP_STRICT_BUILD=1",
    "-t",
    tag,
    context,
  ];
  if (platform) {
    dockerArgs.splice(1, 0, "--platform", platform);
  }
  const r = spawnSync("docker", dockerArgs, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  if (r.status !== 0) failures.push(repo);
}

console.log("\n========== summary ==========");
if (skipRepos.size > 0 && !repoArg) {
  console.log(`verify-catalog-apps: skipped (${[...skipRepos].join(", ")})`);
}
if (failures.length === 0) {
  console.log(`verify-catalog-apps: OK (${repos.length} image(s))`);
  process.exit(0);
}
console.error(`verify-catalog-apps: FAILED: ${failures.join(", ")}`);
process.exit(1);
