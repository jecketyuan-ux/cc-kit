# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2026-09-02

### Added

- `cc-kit init` — scaffold `.claude/` with `CLAUDE.md`, example hooks in `settings.json`, and an example skill. Idempotent; refuses to overwrite `CLAUDE.md` without `--force`.
- `cc-kit skill list|add|remove` — list project and personal skills; add from a local path, starter pack name, or git URL; remove by name. `--global` targets `~/.claude/skills/`.
- `cc-kit doctor` — validate `SKILL.md` YAML frontmatter (`name`, `description`), check hooks JSON shape, report missing pieces. Exits non-zero when skills or settings are broken.
- Starter pack under `packs/starter/`: `pr-review`, `commit-message`, `typescript-hygiene`.
- GitHub Actions CI on Node 20 and 22.

[0.1.0]: https://github.com/jecketyuan-ux/cc-kit/releases/tag/v0.1.0
