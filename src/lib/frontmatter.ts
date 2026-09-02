import { parse as parseYaml } from "yaml";
import type { FrontmatterIssue, ParsedSkillMarkdown, SkillFrontmatter } from "./types.js";

const FRONTMATTER_RE = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

export const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const NAME_MAX_LENGTH = 64;
export const DESCRIPTION_MAX_LENGTH = 1024;
export const COMPATIBILITY_MAX_LENGTH = 500;

export function extractFrontmatterBlock(content: string): {
  raw: string;
  body: string;
} | null {
  if (!content.startsWith("---")) {
    return null;
  }
  const empty = /^---[ \t]*\r?\n---[ \t]*(?:\r?\n|$)/.exec(content);
  if (empty) {
    return { raw: "", body: content.slice(empty[0].length) };
  }
  const match = FRONTMATTER_RE.exec(content);
  if (!match) {
    return null;
  }
  return {
    raw: match[1] ?? "",
    body: content.slice(match[0].length),
  };
}

export function parseSkillMarkdown(content: string): ParsedSkillMarkdown {
  const extracted = extractFrontmatterBlock(content);
  if (!extracted) {
    throw new FrontmatterParseError(
      "SKILL.md must start with YAML frontmatter delimited by --- lines",
      "missing-frontmatter",
    );
  }

  let parsed: unknown;
  try {
    parsed = parseYaml(extracted.raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new FrontmatterParseError(`Invalid YAML frontmatter: ${message}`, "invalid-yaml");
  }

  if (parsed == null) {
    throw new FrontmatterParseError("YAML frontmatter is empty", "empty-frontmatter");
  }
  if (typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new FrontmatterParseError(
      "YAML frontmatter must be a mapping of keys to values",
      "frontmatter-not-mapping",
    );
  }

  return {
    frontmatter: parsed as SkillFrontmatter,
    body: extracted.body,
    rawFrontmatter: extracted.raw,
  };
}

export class FrontmatterParseError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "FrontmatterParseError";
    this.code = code;
  }
}

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Validate Agent Skills / Claude Code SKILL.md frontmatter.
 * Requires `name` and `description` (Agent Skills spec).
 */
export function validateFrontmatter(
  frontmatter: SkillFrontmatter,
  directoryName?: string,
): FrontmatterIssue[] {
  const issues: FrontmatterIssue[] = [];

  const name = asNonEmptyString(frontmatter.name);
  if (frontmatter.name == null || frontmatter.name === "") {
    issues.push({ code: "missing-name", message: "frontmatter is missing required field `name`" });
  } else if (typeof frontmatter.name !== "string") {
    issues.push({ code: "invalid-name-type", message: "`name` must be a string" });
  } else if (!name) {
    issues.push({ code: "empty-name", message: "`name` must be a non-empty string" });
  } else {
    if (name.length > NAME_MAX_LENGTH) {
      issues.push({
        code: "name-too-long",
        message: `\`name\` must be at most ${NAME_MAX_LENGTH} characters (got ${name.length})`,
      });
    }
    if (!NAME_PATTERN.test(name)) {
      issues.push({
        code: "invalid-name",
        message:
          "`name` must be lowercase letters, numbers, and single hyphens (no leading, trailing, or consecutive hyphens)",
      });
    }
    if (directoryName && name !== directoryName) {
      issues.push({
        code: "name-mismatch",
        message: `\`name\` (${name}) must match the parent directory name (${directoryName})`,
      });
    }
  }

  const description = asNonEmptyString(frontmatter.description);
  if (frontmatter.description == null || frontmatter.description === "") {
    issues.push({
      code: "missing-description",
      message: "frontmatter is missing required field `description`",
    });
  } else if (typeof frontmatter.description !== "string") {
    issues.push({ code: "invalid-description-type", message: "`description` must be a string" });
  } else if (!description) {
    issues.push({
      code: "empty-description",
      message: "`description` must be a non-empty string",
    });
  } else if (description.length > DESCRIPTION_MAX_LENGTH) {
    issues.push({
      code: "description-too-long",
      message: `\`description\` must be at most ${DESCRIPTION_MAX_LENGTH} characters (got ${description.length})`,
    });
  }

  if (frontmatter.compatibility != null) {
    if (typeof frontmatter.compatibility !== "string") {
      issues.push({
        code: "invalid-compatibility-type",
        message: "`compatibility` must be a string",
      });
    } else if (frontmatter.compatibility.length > COMPATIBILITY_MAX_LENGTH) {
      issues.push({
        code: "compatibility-too-long",
        message: `\`compatibility\` must be at most ${COMPATIBILITY_MAX_LENGTH} characters`,
      });
    }
  }

  if (frontmatter.metadata != null) {
    if (typeof frontmatter.metadata !== "object" || Array.isArray(frontmatter.metadata)) {
      issues.push({
        code: "invalid-metadata-type",
        message: "`metadata` must be a mapping of string keys to values",
      });
    }
  }

  return issues;
}

export function validateSkillMarkdown(
  content: string,
  directoryName?: string,
): { parsed?: ParsedSkillMarkdown; issues: FrontmatterIssue[] } {
  try {
    const parsed = parseSkillMarkdown(content);
    return { parsed, issues: validateFrontmatter(parsed.frontmatter, directoryName) };
  } catch (error) {
    if (error instanceof FrontmatterParseError) {
      return { issues: [{ code: error.code, message: error.message }] };
    }
    const message = error instanceof Error ? error.message : String(error);
    return { issues: [{ code: "parse-error", message }] };
  }
}
