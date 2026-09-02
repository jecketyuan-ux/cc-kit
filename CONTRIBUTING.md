# Contributing to cc-kit

Thanks for helping improve Claude Code Kit. This repo is a small TypeScript CLI. Changes should stay local-filesystem-only: no telemetry, no API keys, no Anthropic login, and no proxying of the Claude API.

## Prerequisites

- Node.js 20 or 22
- npm 10+
- git (needed to add skills from a git URL)

## Setup

```bash
git clone https://github.com/jecketyuan-ux/cc-kit.git
cd cc-kit
npm install
npm test
npm run build
node dist/cli.js --help
```

## Project layout

| Path | Purpose |
| --- | --- |
| `src/cli.ts` | Commander entry |
| `src/commands/` | `init`, `skill`, `doctor` |
| `src/lib/` | Frontmatter, hooks shape, paths, git clone |
| `src/templates/` | Files written by `init` |
| `packs/starter/` | Curated skills installable via `skill add` |
| `test/` | Vitest unit tests |

## Adding or changing a skill in the starter pack

1. Create `packs/starter/<kebab-name>/SKILL.md`.
2. Frontmatter must include `name` (same as the directory) and `description` (what + when). Follow the [Agent Skills spec](https://agentskills.io/specification): lowercase kebab-case name ≤64 chars, description ≤1024 chars.
3. Keep the body short. Put long notes in `references/`.
4. Run `npx cc-kit doctor` and `npm test`.

## Tests

```bash
npm test
npm run typecheck
```

Cover frontmatter parsing and hook-shape validation when you change those modules. Doctor tests should use a temp directory, not the repo checkout.

## Pull requests

- Branch from `main`.
- Keep the diff focused. Do not add formatters, telemetry, or extra frameworks unless they are required for the change.
- Update `CHANGELOG.md` under an `Unreleased` heading (or the next version) and README if the CLI surface changes.
- Make sure `npm run build` and `npm test` pass.

## Release notes (maintainers)

1. Bump `version` in `package.json` and `src/version.ts`.
2. Update `CHANGELOG.md`.
3. Tag `vX.Y.Z` after merge to `main`.
