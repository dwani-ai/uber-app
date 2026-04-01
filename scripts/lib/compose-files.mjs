import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Optional merge: docker-compose.apps.yml (copy from docker-compose.apps.example.yml).
 * @param {string} root
 * @returns {string[]}
 */
export function getComposeFiles(root) {
  const files = [join(root, "docker-compose.yml")];
  const apps = join(root, "docker-compose.apps.yml");
  if (existsSync(apps)) files.push(apps);
  return files;
}

/**
 * @param {string} root
 * @returns {string[]} e.g. ['-f', '/abs/docker-compose.yml', '-f', ...]
 */
export function getComposeArgs(root) {
  return getComposeFiles(root).flatMap((f) => ["-f", f]);
}
