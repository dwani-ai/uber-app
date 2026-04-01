import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Parse a minimal dotenv file (KEY=value, # comments, optional "quotes").
 * @param {string} root Repository root
 * @returns {Record<string, string>}
 */
export function loadEnvFile(root) {
  const envPath = join(root, ".env");
  if (!existsSync(envPath)) return {};
  const out = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

/**
 * Merge .env into process.env (does not overwrite existing env vars).
 * @param {string} root
 */
export function applyEnv(root) {
  const parsed = loadEnvFile(root);
  for (const [k, v] of Object.entries(parsed)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }
}
