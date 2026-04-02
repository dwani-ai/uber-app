#!/usr/bin/env node
/**
 * Build runtime/catalog-app for every SIMPLE_DEPLOY_REPOS entry (clone + build.sh → nginx).
 * Use before releases or after changing catalog-app/build.sh.
 *
 *   node scripts/verify-catalog-apps.mjs
 *   node scripts/verify-catalog-apps.mjs --repo dwani-ai/discovery
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

let repos = repoArg ? [repoArg] : [...SIMPLE_DEPLOY_REPOS].sort();
if (repoArg && !SIMPLE_DEPLOY_REPOS.has(repoArg)) {
  console.error(`verify-catalog-apps: unknown repo ${repoArg} (not in SIMPLE_DEPLOY_REPOS)`);
  process.exit(1);
}

const failures = [];
for (const repo of repos) {
  const tag = `catalog-verify:${repo.replace(/\//g, "-")}`;
  console.log(`\n========== ${repo} → ${tag} ==========\n`);
  const r = spawnSync(
    "docker",
    [
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
    ],
    { cwd: root, stdio: "inherit", env: process.env }
  );
  if (r.status !== 0) failures.push(repo);
}

console.log("\n========== summary ==========");
if (failures.length === 0) {
  console.log(`verify-catalog-apps: OK (${repos.length} image(s))`);
  process.exit(0);
}
console.error(`verify-catalog-apps: FAILED: ${failures.join(", ")}`);
process.exit(1);
