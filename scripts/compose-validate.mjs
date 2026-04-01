#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { applyEnv } from "./lib/load-env.mjs";
import { getComposeArgs } from "./lib/compose-files.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
applyEnv(root);

if (!process.env.DOMAIN) {
  console.warn(
    "warning: DOMAIN is unset — set it in .env for production Traefik rules (validation may still pass with empty substitution)."
  );
}

const r = spawnSync("docker", ["compose", ...getComposeArgs(root), "config"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
process.exit(r.status === null ? 1 : r.status);
