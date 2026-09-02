import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { validateSkillMarkdown } from "../src/lib/frontmatter.js";
import { listPackSkills } from "../src/lib/skills.js";

describe("starter pack", () => {
  it("ships three valid skills", () => {
    const skills = listPackSkills();
    const names = skills.map((s) => s.name).sort();
    expect(names).toEqual(["commit-message", "pr-review", "typescript-hygiene"]);
    for (const skill of skills) {
      expect(skill.valid, skill.diagnostics.map((d) => d.message).join("; ")).toBe(true);
      const content = readFileSync(skill.skillFile, "utf8");
      const { issues } = validateSkillMarkdown(content, skill.name);
      expect(issues).toEqual([]);
    }
  });
});
