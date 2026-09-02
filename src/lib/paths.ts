import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const PROJECT_CLAUDE_DIR = ".claude";
export const SKILLS_DIRNAME = "skills";
export const SETTINGS_FILENAME = "settings.json";
export const CLAUDE_MD = "CLAUDE.md";
export const SKILL_FILENAME = "SKILL.md";

export function getHomeDir(): string {
  return process.env.HOME || process.env.USERPROFILE || homedir();
}

/** Honors CLAUDE_CONFIG_DIR the same way Claude Code does. */
export function getClaudeConfigDir(): string {
  const override = process.env.CLAUDE_CONFIG_DIR;
  if (override && override.trim()) {
    return resolveUserPath(override);
  }
  return join(getHomeDir(), ".claude");
}

export function resolveUserPath(input: string, cwd: string = process.cwd()): string {
  const trimmed = input.trim();
  if (trimmed === "~") {
    return getHomeDir();
  }
  if (trimmed.startsWith("~/") || trimmed.startsWith("~\\")) {
    return join(getHomeDir(), trimmed.slice(2));
  }
  if (isAbsolute(trimmed)) {
    return trimmed;
  }
  return resolve(cwd, trimmed);
}

export function getProjectClaudeDir(cwd: string = process.cwd()): string {
  return join(resolve(cwd), PROJECT_CLAUDE_DIR);
}

export function getProjectSkillsDir(cwd: string = process.cwd()): string {
  return join(getProjectClaudeDir(cwd), SKILLS_DIRNAME);
}

export function getPersonalSkillsDir(): string {
  return join(getClaudeConfigDir(), SKILLS_DIRNAME);
}

export function getProjectSettingsPath(cwd: string = process.cwd()): string {
  return join(getProjectClaudeDir(cwd), SETTINGS_FILENAME);
}

export function findClaudeMd(cwd: string = process.cwd()): string | undefined {
  const root = join(resolve(cwd), CLAUDE_MD);
  if (existsSync(root)) {
    return root;
  }
  const nested = join(getProjectClaudeDir(cwd), CLAUDE_MD);
  if (existsSync(nested)) {
    return nested;
  }
  return undefined;
}

export function getPackageRoot(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  let dir = here;
  for (let i = 0; i < 8; i++) {
    const pkgPath = join(dir, "package.json");
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { name?: string };
        if (pkg.name === "cc-kit") {
          return dir;
        }
      } catch {
        // keep walking
      }
    }
    const parent = dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  return process.cwd();
}

export function getPacksRoot(): string {
  return join(getPackageRoot(), "packs");
}

export function getStarterPackDir(): string {
  return join(getPacksRoot(), "starter");
}
