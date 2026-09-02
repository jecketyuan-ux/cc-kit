export { runDoctor } from "./commands/doctor.ts";
export { initProject } from "./commands/init.ts";
export { addSkill, listSkills, removeSkill } from "./commands/skill.ts";
export {
  DESCRIPTION_MAX_LENGTH,
  FrontmatterParseError,
  NAME_MAX_LENGTH,
  NAME_PATTERN,
  parseSkillMarkdown,
  validateFrontmatter,
  validateSkillMarkdown,
} from "./lib/frontmatter.ts";
export {
  parseSettingsJson,
  SettingsParseError,
  validateHooksShape,
} from "./lib/hooks.ts";
export {
  findClaudeMd,
  getClaudeConfigDir,
  getPersonalSkillsDir,
  getProjectSkillsDir,
} from "./lib/paths.ts";
export { listPackSkills, listPersonalSkills, listProjectSkills } from "./lib/skills.ts";
export { VERSION } from "./version.ts";
export type {
  Diagnostic,
  ParsedSkillMarkdown,
  SkillFrontmatter,
  SkillInfo,
} from "./lib/types.ts";
