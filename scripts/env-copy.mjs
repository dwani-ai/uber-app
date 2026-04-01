#!/usr/bin/env node
import { copyFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = join(root, ".env");
const ex = join(root, ".env.example");
if (existsSync(env)) {
  console.log(".env already exists");
  process.exit(0);
}
if (!existsSync(ex)) {
  console.error("No .env.example found");
  process.exit(1);
}
copyFileSync(ex, env);
console.log("Created .env from .env.example — set DOMAIN and run npm run deploy");
