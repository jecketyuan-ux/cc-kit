import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, sep } from "node:path";

export function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true });
}

export function writeFileIfMissing(
  path: string,
  contents: string,
  force: boolean,
): "created" | "overwritten" | "skipped" {
  const exists = existsSync(path);
  if (exists && !force) {
    return "skipped";
  }
  ensureDir(dirname(path));
  writeFileSync(path, contents, "utf8");
  return exists ? "overwritten" : "created";
}

export function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

export function isFile(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

export function listSubdirectories(dir: string): string[] {
  if (!isDirectory(dir)) {
    return [];
  }
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => join(dir, entry.name))
    .sort();
}

function shouldCopy(src: string): boolean {
  const parts = src.split(sep);
  return !parts.includes(".git") && !parts.includes("node_modules");
}

export function copySkillDirectory(src: string, dest: string): void {
  ensureDir(dirname(dest));
  cpSync(src, dest, {
    recursive: true,
    filter: (source) => shouldCopy(source),
  });
}

export function removeDirectory(path: string): void {
  rmSync(path, { recursive: true, force: true });
}
