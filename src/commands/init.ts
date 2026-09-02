import { join } from "node:path";
import { ensureDir, writeFileIfMissing } from "../lib/fs.js";
import {
  CLAUDE_MD,
  findClaudeMd,
  getProjectClaudeDir,
  getProjectSettingsPath,
  getProjectSkillsDir,
} from "../lib/paths.js";
import { DEFAULT_CLAUDE_MD } from "../templates/claude-md.js";
import { EXAMPLE_SKILL_MD, EXAMPLE_SKILL_NAME } from "../templates/example-skill.js";
import { DEFAULT_SETTINGS_JSON } from "../templates/settings.js";

export interface InitOptions {
  cwd?: string;
  force?: boolean;
}

export interface InitResult {
  created: string[];
  overwritten: string[];
  skipped: string[];
}

export function initProject(options: InitOptions = {}): InitResult {
  const cwd = options.cwd ?? process.cwd();
  const force = Boolean(options.force);
  const result: InitResult = { created: [], overwritten: [], skipped: [] };

  const claudeDir = getProjectClaudeDir(cwd);
  ensureDir(claudeDir);
  ensureDir(getProjectSkillsDir(cwd));

  const existingClaudeMd = findClaudeMd(cwd);
  const claudeMdPath = join(claudeDir, CLAUDE_MD);
  if (existingClaudeMd && !force) {
    result.skipped.push(existingClaudeMd);
  } else {
    record(result, writeFileIfMissing(claudeMdPath, DEFAULT_CLAUDE_MD, force), claudeMdPath);
  }

  const settingsPath = getProjectSettingsPath(cwd);
  record(result, writeFileIfMissing(settingsPath, DEFAULT_SETTINGS_JSON, force), settingsPath);

  const skillFile = join(getProjectSkillsDir(cwd), EXAMPLE_SKILL_NAME, "SKILL.md");
  record(result, writeFileIfMissing(skillFile, EXAMPLE_SKILL_MD, force), skillFile);

  return result;
}

function record(
  result: InitResult,
  status: "created" | "overwritten" | "skipped",
  path: string,
): void {
  result[status].push(path);
}

export function printInitResult(result: InitResult): void {
  for (const path of result.created) {
    console.log(`✓ created ${path}`);
  }
  for (const path of result.overwritten) {
    console.log(`✓ overwritten ${path}`);
  }
  for (const path of result.skipped) {
    console.log(`• skipped ${path} (already exists; pass --force to overwrite)`);
  }
  if (result.created.length === 0 && result.overwritten.length === 0) {
    console.log("Nothing to do. .claude/ is already initialized.");
  }
}
