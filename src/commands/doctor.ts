import { existsSync, readFileSync } from "node:fs";
import { parseSettingsJson, SettingsParseError, validateHooksShape } from "../lib/hooks.js";
import { join } from "node:path";
import { findClaudeMd, getPacksRoot, getProjectClaudeDir, getProjectSettingsPath } from "../lib/paths.js";
import { countBySeverity, formatDiagnostic, hasErrors } from "../lib/report.js";
import {
  listPackSkills,
  listPersonalSkills,
  listProjectSkills,
} from "../lib/skills.js";
import type { Diagnostic, SkillInfo } from "../lib/types.js";

export interface DoctorOptions {
  cwd?: string;
  global?: boolean;
  packs?: boolean;
}

export interface DoctorReport {
  diagnostics: Diagnostic[];
  skills: SkillInfo[];
  ok: boolean;
}

export function runDoctor(options: DoctorOptions = {}): DoctorReport {
  const cwd = options.cwd ?? process.cwd();
  const diagnostics: Diagnostic[] = [];
  const skills: SkillInfo[] = [];

  const claudeDir = getProjectClaudeDir(cwd);
  if (!existsSync(claudeDir)) {
    diagnostics.push({
      severity: "warning",
      code: "missing-claude-dir",
      message: "no .claude/ directory — run `cc-kit init` to scaffold one",
      path: claudeDir,
    });
  }

  const claudeMd = findClaudeMd(cwd);
  if (!claudeMd) {
    diagnostics.push({
      severity: "warning",
      code: "missing-claude-md",
      message: "no CLAUDE.md found at ./CLAUDE.md or ./.claude/CLAUDE.md",
    });
  } else {
    diagnostics.push({
      severity: "info",
      code: "claude-md-ok",
      message: `found project memory at ${claudeMd}`,
      path: claudeMd,
    });
  }

  const settingsPath = getProjectSettingsPath(cwd);
  if (!existsSync(settingsPath)) {
    diagnostics.push({
      severity: "warning",
      code: "missing-settings",
      message: "no .claude/settings.json — hooks will not run for this project",
      path: settingsPath,
    });
  } else {
    try {
      const text = readFileSync(settingsPath, "utf8");
      const { document } = parseSettingsJson(text);
      diagnostics.push(...validateHooksShape(document.hooks, settingsPath));
    } catch (error) {
      const message =
        error instanceof SettingsParseError
          ? error.message
          : error instanceof Error
            ? error.message
            : String(error);
      diagnostics.push({
        severity: "error",
        code: "invalid-settings-json",
        message,
        path: settingsPath,
      });
    }
  }

  const projectSkills = listProjectSkills(cwd);
  skills.push(...projectSkills);
  if (projectSkills.length === 0) {
    diagnostics.push({
      severity: "warning",
      code: "no-project-skills",
      message: "no project skills in .claude/skills/",
    });
  }
  for (const skill of projectSkills) {
    diagnostics.push(...skill.diagnostics);
    if (skill.valid) {
      diagnostics.push({
        severity: "info",
        code: "skill-ok",
        message: `skill "${skill.name}" looks valid`,
        path: skill.skillFile,
      });
    }
  }

  if (options.global) {
    const personal = listPersonalSkills();
    skills.push(...personal);
    if (personal.length === 0) {
      diagnostics.push({
        severity: "info",
        code: "no-personal-skills",
        message: "no personal skills in ~/.claude/skills/",
      });
    }
    for (const skill of personal) {
      diagnostics.push(...skill.diagnostics);
      if (skill.valid) {
        diagnostics.push({
          severity: "info",
          code: "skill-ok",
          message: `personal skill "${skill.name}" looks valid`,
          path: skill.skillFile,
        });
      }
    }
  }

  const checkPacks = options.packs ?? true;
  if (checkPacks) {
    const localPacks = join(cwd, "packs");
    const bundled = getPacksRoot();
    const packRoots = new Set<string>([localPacks]);
    if (bundled !== localPacks) {
      // When doctor runs inside the cc-kit repo, cwd/packs is the bundled pack.
      // Elsewhere, still validate the packaged starter skills so `skill add` sources stay honest.
      packRoots.add(bundled);
    }
    for (const root of packRoots) {
      const packs = listPackSkills(root);
      skills.push(...packs);
      for (const skill of packs) {
        diagnostics.push(...skill.diagnostics);
        if (skill.valid) {
          diagnostics.push({
            severity: "info",
            code: "pack-skill-ok",
            message: `pack skill "${skill.name}" looks valid`,
            path: skill.skillFile,
          });
        }
      }
    }
  }

  return {
    diagnostics,
    skills,
    ok: !hasErrors(diagnostics),
  };
}

export function printDoctorReport(report: DoctorReport): void {
  const visible = report.diagnostics.filter((d) => d.severity !== "info");
  const infos = report.diagnostics.filter((d) => d.severity === "info");

  for (const diag of visible) {
    console.log(formatDiagnostic(diag));
  }
  for (const diag of infos) {
    console.log(formatDiagnostic(diag));
  }

  const counts = countBySeverity(report.diagnostics);
  const skillErrors = report.skills.filter((s) => !s.valid).length;
  console.log("");
  console.log(
    `Checked ${report.skills.length} skill(s): ${report.skills.length - skillErrors} ok, ${skillErrors} broken.`,
  );
  console.log(
    `${counts.error} error(s), ${counts.warning} warning(s).`,
  );

  if (!report.ok) {
    console.log("Doctor failed. Fix broken skills (and hook/settings errors) and re-run.");
  } else {
    console.log("Doctor passed.");
  }
}
