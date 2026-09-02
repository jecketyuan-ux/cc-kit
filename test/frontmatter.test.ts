import { describe, expect, it } from "vitest";
import {
  FrontmatterParseError,
  parseSkillMarkdown,
  validateFrontmatter,
  validateSkillMarkdown,
} from "../src/lib/frontmatter.js";

const VALID = `---
name: pr-review
description: Review a pull request against a checklist. Use when reviewing diffs.
---

# Body
`;

describe("parseSkillMarkdown", () => {
  it("parses YAML frontmatter and body", () => {
    const parsed = parseSkillMarkdown(VALID);
    expect(parsed.frontmatter.name).toBe("pr-review");
    expect(parsed.frontmatter.description).toContain("Review a pull request");
    expect(parsed.body).toContain("# Body");
  });

  it("rejects files without opening ---", () => {
    expect(() => parseSkillMarkdown("# just markdown\n")).toThrow(FrontmatterParseError);
  });

  it("rejects invalid YAML", () => {
    expect(() =>
      parseSkillMarkdown("---\nname: [unterminated\n---\n"),
    ).toThrow(FrontmatterParseError);
  });

  it("rejects empty frontmatter", () => {
    expect(() => parseSkillMarkdown("---\n---\nbody\n")).toThrow(/empty/i);
  });
});

describe("validateFrontmatter", () => {
  it("accepts a spec-compliant name and description", () => {
    expect(
      validateFrontmatter({ name: "pr-review", description: "Review PRs. Use when reviewing." }, "pr-review"),
    ).toEqual([]);
  });

  it("requires name and description", () => {
    const issues = validateFrontmatter({});
    expect(issues.map((i) => i.code)).toEqual(
      expect.arrayContaining(["missing-name", "missing-description"]),
    );
  });

  it("rejects uppercase and consecutive hyphens", () => {
    const issues = validateFrontmatter({
      name: "PR--Review",
      description: "ok description for testing name rules",
    });
    expect(issues.some((i) => i.code === "invalid-name")).toBe(true);
  });

  it("rejects a name that does not match the directory", () => {
    const issues = validateFrontmatter(
      { name: "pr-review", description: "Review PRs. Use when reviewing diffs." },
      "other-name",
    );
    expect(issues.some((i) => i.code === "name-mismatch")).toBe(true);
  });

  it("rejects a description over 1024 characters", () => {
    const issues = validateFrontmatter({
      name: "ok-name",
      description: "x".repeat(1025),
    });
    expect(issues.some((i) => i.code === "description-too-long")).toBe(true);
  });

  it("rejects a name over 64 characters", () => {
    const issues = validateFrontmatter({
      name: "a".repeat(65),
      description: "short description that is valid",
    });
    expect(issues.some((i) => i.code === "name-too-long")).toBe(true);
  });
});

describe("validateSkillMarkdown", () => {
  it("returns no issues for a valid skill file", () => {
    const { issues } = validateSkillMarkdown(VALID, "pr-review");
    expect(issues).toEqual([]);
  });

  it("surfaces parse errors as issues instead of throwing", () => {
    const { issues, parsed } = validateSkillMarkdown("no frontmatter here");
    expect(parsed).toBeUndefined();
    expect(issues[0]?.code).toBe("missing-frontmatter");
  });
});
