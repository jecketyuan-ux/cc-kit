export const DEFAULT_CLAUDE_MD = `# Project instructions

This file is loaded by Claude Code as project memory. Keep it short, factual, and specific to this repository.

## What this project is

- Describe the product in one or two sentences.
- Note the primary languages, package manager, and how to run the app.

## How to work here

- Prefer small, focused changes over large rewrites.
- Match existing style, naming, and directory layout.
- Run the project's lint/test/build commands before considering work done.
- Do not add telemetry, analytics, or network calls that the repo does not already use.

## Commands

Fill these in for your stack:

\`\`\`bash
# install
# npm install

# test
# npm test

# build
# npm run build
\`\`\`

## Skills and hooks

Project skills live in \`.claude/skills/\` (each directory has a \`SKILL.md\`).
Personal skills live in \`~/.claude/skills/\`.
Hooks are configured in \`.claude/settings.json\`.

Use \`cc-kit doctor\` to validate frontmatter and hook shape. Use \`cc-kit skill add <source>\` to install a skill from a local path, a starter pack name, or a git URL.

## Do not

- Commit secrets, \`.env\` files, or API keys.
- Treat this toolkit as an Anthropic API proxy or login bypass — it is local filesystem only.
`;
