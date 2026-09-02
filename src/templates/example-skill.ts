export const EXAMPLE_SKILL_NAME = "hello-cc-kit";

export const EXAMPLE_SKILL_MD = `---
name: hello-cc-kit
description: Explains how this project uses Claude Code skills, hooks, and CLAUDE.md. Use when onboarding, asking how cc-kit works, or adding a new skill.
license: MIT
---

# Hello from cc-kit

You are working in a repository that was scaffolded with [cc-kit](https://github.com/jecketyuan-ux/cc-kit).

## Layout

- Project memory: \`.claude/CLAUDE.md\` (or \`CLAUDE.md\` at the repo root)
- Shared settings and hooks: \`.claude/settings.json\`
- Project skills: \`.claude/skills/<name>/SKILL.md\`
- Personal skills: \`~/.claude/skills/<name>/SKILL.md\`

## When adding a skill

1. Create a directory named in kebab-case.
2. Add \`SKILL.md\` with YAML frontmatter. Required fields: \`name\` (must match the directory) and \`description\` (what it does and when to use it).
3. Keep the body concise. Put long reference material in \`references/\`.
4. Run \`cc-kit doctor\` and fix any errors.

## Starter pack

Install curated skills from the cc-kit starter pack:

\`\`\`bash
npx cc-kit skill add pr-review
npx cc-kit skill add commit-message
npx cc-kit skill add typescript-hygiene
\`\`\`
`;
