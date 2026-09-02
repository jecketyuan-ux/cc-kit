export { runDoctor } from "./commands/doctor.js";
export { initProject } from "./commands/init.js";
export { addSkill, listSkills, removeSkill } from "./commands/skill.js";
export {
  DESCRIPTION_MAX_LENGTH,
  FrontmatterParseError,
  NAME_MAX_LENGTH,
  NAME_PATTERN,
  parseSkillMarkdown,
  validateFrontmatter,
  validateSkillMarkdown,
} from "./lib/frontmatter.js";
export {
  parseSettingsJson,
  SettingsParseError,
  validateHooksShape,
} from "./lib/hooks.js";
export {
  findClaudeMd,
  getClaudeConfigDir,
  getPersonalSkillsDir,
  getProjectSkillsDir,
} from "./lib/paths.js";
export { listPackSkills, listPersonalSkills, listProjectSkills } from "./lib/skills.js";
export { VERSION } from "./version.js";
export type {
  Diagnostic,
  ParsedSkillMarkdown,
  SkillFrontmatter,
  SkillInfo,
} from "./lib/types.js";
