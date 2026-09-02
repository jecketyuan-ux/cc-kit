import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { validateSkillMarkdown } from "./frontmatter.js";
import { isDirectory, listSubdirectories } from "./fs.js";
import {
  SKILL_FILENAME,
  getPacksRoot,
  getPersonalSkillsDir,
  getProjectSkillsDir,
  getStarterPackDir,
} from "./paths.js";
import type { Diagnostic, SkillInfo, SkillScope } from "./types.js";

export function discoverSkills(dir: string, scope: SkillScope): SkillInfo[] {
  if (!isDirectory(dir)) {
    return [];
  }
  return listSubdirectories(dir)
    .map((directory) => readSkill(directory, scope))
    .filter((skill): skill is SkillInfo => skill != null);
}

export function readSkill(directory: string, scope: SkillScope): SkillInfo | undefined {
  const name = basename(directory);
  const skillFile = join(directory, SKILL_FILENAME);
  if (!existsSync(skillFile)) {
    return undefined;
  }

  const content = readFileSync(skillFile, "utf8");
  const { parsed, issues } = validateSkillMarkdown(content, name);
  const diagnostics: Diagnostic[] = issues.map((issue) => ({
    severity: "error",
    code: issue.code,
    message: issue.message,
    path: skillFile,
  }));

  const description =
    typeof parsed?.frontmatter.description === "string"
      ? parsed.frontmatter.description.trim()
      : undefined;

  return {
    name,
    directory,
    skillFile,
    scope,
    description,
    valid: diagnostics.length === 0,
    diagnostics,
  };
}

export function listProjectSkills(cwd: string = process.cwd()): SkillInfo[] {
  return discoverSkills(getProjectSkillsDir(cwd), "project");
}

export function listPersonalSkills(): SkillInfo[] {
  return discoverSkills(getPersonalSkillsDir(), "personal");
}

export function listPackSkills(root: string = getPacksRoot()): SkillInfo[] {
  if (!isDirectory(root)) {
    return [];
  }
  const skills: SkillInfo[] = [];
  for (const packDir of listSubdirectories(root)) {
    skills.push(...discoverSkills(packDir, "pack"));
  }
  return skills;
}

export function findPackSkill(name: string): string | undefined {
  const direct = join(getStarterPackDir(), name);
  if (isDirectory(direct) && existsSync(join(direct, SKILL_FILENAME))) {
    return direct;
  }
  const packs = getPacksRoot();
  if (!isDirectory(packs)) {
    return undefined;
  }
  for (const packDir of listSubdirectories(packs)) {
    const candidate = join(packDir, name);
    if (isDirectory(candidate) && existsSync(join(candidate, SKILL_FILENAME))) {
      return candidate;
    }
  }
  return undefined;
}

export function findSkillsInTree(root: string): string[] {
  if (existsSync(join(root, SKILL_FILENAME))) {
    return [root];
  }
  const found: string[] = [];
  if (!isDirectory(root)) {
    return found;
  }
  for (const child of listSubdirectories(root)) {
    if (existsSync(join(child, SKILL_FILENAME))) {
      found.push(child);
    } else {
      for (const nested of listSubdirectories(child)) {
        if (existsSync(join(nested, SKILL_FILENAME))) {
          found.push(nested);
        }
      }
    }
  }
  return found;
}

export function skillDestination(
  name: string,
  options: { global?: boolean; cwd?: string },
): string {
  const base = options.global ? getPersonalSkillsDir() : getProjectSkillsDir(options.cwd);
  return join(base, name);
}
