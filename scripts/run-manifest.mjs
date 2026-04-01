#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { applyEnv } from "./lib/load-env.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
applyEnv(root);

const r = spawnSync(process.execPath, ["web/scripts/gen-manifest.mjs"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
process.exit(r.status === null ? 1 : r.status);
