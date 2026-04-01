#!/usr/bin/env node
/**
 * CI pipeline (no .env required): web build + stub routes + compose validate + images.
 * Run: node scripts/ci.mjs
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = {
  ...process.env,
  DOMAIN: process.env.DOMAIN || "ci.example.com",
};

function run(cmd, args, opts = {}) {
  const { cwd = root } = opts;
  const r = spawnSync(cmd, args, {
    cwd,
    stdio: "inherit",
    env,
    shell: false,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

run("npm", ["ci"], { cwd: join(root, "web") });
run("npm", ["run", "build"], { cwd: join(root, "web") });
run(process.execPath, ["scripts/generate-traefik-stubs.mjs"]);
run("docker", ["compose", "-f", "docker-compose.yml", "config"]);
run("docker", ["compose", "-f", "docker-compose.yml", "build"]);
console.log("ci: OK");
