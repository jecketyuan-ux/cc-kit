import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runDoctor } from "../src/commands/doctor.js";
import { initProject } from "../src/commands/init.js";
import { addSkill, removeSkill } from "../src/commands/skill.js";
import { getStarterPackDir } from "../src/lib/paths.js";

function tempProject(): string {
  return mkdtempSync(join(tmpdir(), "cc-kit-doctor-"));
}

describe("runDoctor", () => {
  it("warns on an empty project and still passes (no broken skills)", () => {
    const cwd = tempProject();
    const report = runDoctor({ cwd, packs: false });
    expect(report.ok).toBe(true);
    expect(report.diagnostics.some((d) => d.code === "missing-claude-dir")).toBe(true);
    expect(report.diagnostics.some((d) => d.code === "missing-claude-md")).toBe(true);
  });

  it("passes after init", () => {
    const cwd = tempProject();
    initProject({ cwd });
    const report = runDoctor({ cwd, packs: false });
    expect(report.ok).toBe(true);
    expect(report.skills.some((s) => s.name === "hello-cc-kit" && s.valid)).toBe(true);
  });

  it("fails when a skill is missing description", () => {
    const cwd = tempProject();
    initProject({ cwd });
    const brokenDir = join(cwd, ".claude", "skills", "broken-skill");
    mkdirSync(brokenDir, { recursive: true });
    writeFileSync(
      join(brokenDir, "SKILL.md"),
      "---\nname: broken-skill\n---\n\n# No description\n",
      "utf8",
    );

    const report = runDoctor({ cwd, packs: false });
    expect(report.ok).toBe(false);
    expect(report.diagnostics.some((d) => d.code === "missing-description")).toBe(true);
    expect(report.skills.some((s) => s.name === "broken-skill" && !s.valid)).toBe(true);
  });

  it("fails on invalid hooks JSON shape", () => {
    const cwd = tempProject();
    initProject({ cwd });
    writeFileSync(
      join(cwd, ".claude", "settings.json"),
      JSON.stringify({ hooks: { PreToolUse: "not-an-array" } }),
      "utf8",
    );
    const report = runDoctor({ cwd, packs: false });
    expect(report.ok).toBe(false);
    expect(report.diagnostics.some((d) => d.code === "hook-event-not-array")).toBe(true);
  });

  it("does not overwrite CLAUDE.md without --force", () => {
    const cwd = tempProject();
    initProject({ cwd });
    const path = join(cwd, ".claude", "CLAUDE.md");
    writeFileSync(path, "# keep me\n", "utf8");
    const again = initProject({ cwd });
    expect(again.skipped.some((p) => p.endsWith("CLAUDE.md"))).toBe(true);
    expect(readUtf8(path)).toBe("# keep me\n");
  });
});

describe("skill add/remove", () => {
  it("installs a starter pack skill into the project and removes it", () => {
    const cwd = tempProject();
    initProject({ cwd });
    const source = join(getStarterPackDir(), "pr-review");
    const added = addSkill(source, { cwd });
    expect(added.installed[0]?.name).toBe("pr-review");
    expect(runDoctor({ cwd, packs: false }).ok).toBe(true);

    const dest = removeSkill("pr-review", { cwd });
    expect(dest).toContain("pr-review");
    expect(runDoctor({ cwd, packs: false }).skills.some((s) => s.name === "pr-review")).toBe(
      false,
    );
  });
});

function readUtf8(path: string): string {
  return readFileSync(path, "utf8");
}
