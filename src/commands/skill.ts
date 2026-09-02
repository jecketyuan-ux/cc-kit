import { existsSync } from "node:fs";
import { basename, join } from "node:path";
import { NAME_PATTERN } from "../lib/frontmatter.js";
import { copySkillDirectory, isDirectory, removeDirectory } from "../lib/fs.js";
import { cloneGitSource, isGitSource, splitGitSource } from "../lib/git.js";
import { resolveUserPath, SKILL_FILENAME } from "../lib/paths.js";
import {
  findPackSkill,
  findSkillsInTree,
  listPackSkills,
  listPersonalSkills,
  listProjectSkills,
  readSkill,
  skillDestination,
} from "../lib/skills.js";

export interface SkillListOptions {
  cwd?: string;
  global?: boolean;
  project?: boolean;
  json?: boolean;
}

export function listSkills(options: SkillListOptions = {}): void {
  const cwd = options.cwd ?? process.cwd();
  const showProject = !options.global || options.project;
  const showPersonal = !options.project || options.global;
  // Default: both. --global only personal. --project only project.
  const project = options.project ? true : options.global ? false : showProject;
  const personal = options.global ? true : options.project ? false : showPersonal;

  const rows = [
    ...(project ? listProjectSkills(cwd) : []),
    ...(personal ? listPersonalSkills() : []),
  ];

  if (options.json) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }

  if (project) {
    printSkillSection("Project skills (.claude/skills/)", listProjectSkills(cwd));
  }
  if (personal) {
    printSkillSection("Personal skills (~/.claude/skills/)", listPersonalSkills());
  }

  if (project && !options.global && !options.project) {
    const packs = listPackSkills();
    if (packs.length > 0) {
      printSkillSection("Bundled starter pack (cc-kit skill add <name>)", packs);
    }
  }

  if (rows.length === 0 && !options.json) {
    console.log("No installed skills found.");
  }
}

function printSkillSection(title: string, skills: ReturnType<typeof listProjectSkills>): void {
  console.log(title);
  if (skills.length === 0) {
    console.log("  (none)");
    console.log("");
    return;
  }
  const width = Math.max(...skills.map((s) => s.name.length), 8);
  for (const skill of skills) {
    const flag = skill.valid ? " " : "!";
    const desc = skill.description ?? "(missing description)";
    console.log(` ${flag} ${skill.name.padEnd(width)}  ${desc}`);
  }
  console.log("");
}

export interface SkillAddOptions {
  cwd?: string;
  global?: boolean;
  name?: string;
  force?: boolean;
}

export interface SkillAddResult {
  installed: { name: string; dest: string }[];
}

export function addSkill(source: string, options: SkillAddOptions = {}): SkillAddResult {
  const cwd = options.cwd ?? process.cwd();
  const resolved = resolveSkillSource(source, cwd);
  const skillDirs = resolved.directories;
  if (skillDirs.length === 0) {
    throw new Error(`No SKILL.md found in "${source}"`);
  }

  if (options.name && skillDirs.length > 1) {
    throw new Error("`--name` can only be used when adding a single skill");
  }

  const installed: { name: string; dest: string }[] = [];

  for (const dir of skillDirs) {
    const name = options.name ?? basename(dir);
    assertSkillName(name);
    const dest = skillDestination(name, { global: options.global, cwd });
    if (existsSync(dest) && !options.force) {
      throw new Error(
        `Skill "${name}" already exists at ${dest}. Pass --force to overwrite.`,
      );
    }
    if (existsSync(dest) && options.force) {
      removeDirectory(dest);
    }

    const skill = readSkill(dir, "pack");
    if (skill && !skill.valid) {
      const details = skill.diagnostics.map((d) => `  - ${d.message}`).join("\n");
      throw new Error(`Refusing to install invalid skill "${name}":\n${details}`);
    }

    copySkillDirectory(dir, dest);
    installed.push({ name, dest });
  }

  if (resolved.cleanup) {
    removeDirectory(resolved.cleanup);
  }

  return { installed };
}

export function printAddResult(result: SkillAddResult, global: boolean): void {
  const scope = global ? "personal (~/.claude/skills/)" : "project (.claude/skills/)";
  for (const item of result.installed) {
    console.log(`✓ installed ${item.name} → ${item.dest} [${scope}]`);
  }
}

export interface SkillRemoveOptions {
  cwd?: string;
  global?: boolean;
}

export function removeSkill(name: string, options: SkillRemoveOptions = {}): string {
  assertSkillName(name);
  const dest = skillDestination(name, options);
  if (!existsSync(dest)) {
    const scope = options.global ? "~/.claude/skills/" : ".claude/skills/";
    throw new Error(`Skill "${name}" not found in ${scope}`);
  }
  if (!existsSync(join(dest, SKILL_FILENAME))) {
    throw new Error(`${dest} does not look like a skill directory (missing SKILL.md)`);
  }
  removeDirectory(dest);
  return dest;
}

function assertSkillName(name: string): void {
  if (!NAME_PATTERN.test(name)) {
    throw new Error(
      `Invalid skill name "${name}". Use lowercase letters, numbers, and single hyphens.`,
    );
  }
}

interface ResolvedSource {
  directories: string[];
  cleanup?: string;
}

function resolveSkillSource(source: string, cwd: string): ResolvedSource {
  if (isGitSource(source)) {
    const spec = splitGitSource(source);
    const cloned = cloneGitSource(spec);
    const root = spec.subpath ? join(cloned, spec.subpath) : cloned;
    if (!existsSync(root)) {
      removeDirectory(cloned);
      throw new Error(`Path "${spec.subpath}" does not exist in ${spec.url}`);
    }
    return { directories: findSkillsInTree(root), cleanup: cloned };
  }

  const pack = findPackSkill(source);
  if (pack) {
    return { directories: [pack] };
  }

  const local = resolveUserPath(source, cwd);
  if (isDirectory(local)) {
    return { directories: findSkillsInTree(local) };
  }

  throw new Error(
    `Cannot resolve skill source "${source}". Expected a local path, starter pack name (pr-review, commit-message, typescript-hygiene), or git URL.`,
  );
}
