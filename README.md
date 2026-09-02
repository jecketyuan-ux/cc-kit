# cc-kit

**Claude Code Kit** — a local CLI to bootstrap, install, and validate [Claude Code](https://code.claude.com/docs/en/custom-skills) skills, hooks, and `CLAUDE.md`.

It only reads and writes files on disk. There is no telemetry, no API key, and no Anthropic login. It is not an API proxy.

## Install

```bash
# one-shot
npx cc-kit --help

# or global
npm install -g cc-kit
cc-kit --help
```

From a clone of this repo:

```bash
npm install
npm run build
node dist/cli.js --help
```

Requires Node.js 20+. `skill add` from a git URL also needs `git`.

## Quickstart

```bash
cd your-project
npx cc-kit init
npx cc-kit skill add pr-review
npx cc-kit doctor
```

`init` is idempotent. It will not overwrite an existing `CLAUDE.md` (repo root or `.claude/CLAUDE.md`) unless you pass `--force`.

## Commands

| Command | What it does |
| --- | --- |
| `cc-kit init` | Create `.claude/`, a starter `CLAUDE.md`, example hooks in `settings.json`, and `.claude/skills/hello-cc-kit/` |
| `cc-kit skill list` | List project skills (`.claude/skills/`) and personal skills (`~/.claude/skills/`) |
| `cc-kit skill add <source>` | Copy a skill from a local path, starter pack name, or git URL |
| `cc-kit skill remove <name>` | Delete an installed skill directory |
| `cc-kit doctor` | Validate `SKILL.md` frontmatter and hooks JSON; exit `1` if a skill or settings file is broken |

Useful flags:

```bash
cc-kit init --force
cc-kit skill add pr-review --global          # ~/.claude/skills/
cc-kit skill add ./my-skill --name my-skill
cc-kit skill add https://github.com/org/repo.git#path/to/skill
cc-kit skill remove hello-cc-kit
cc-kit doctor --global                       # also check personal skills
```

Honor `CLAUDE_CONFIG_DIR` the same way Claude Code does when resolving `~/.claude`.

## Skills and hooks (as Claude Code sees them)

A skill is a directory with a `SKILL.md` file: YAML frontmatter plus markdown instructions ([Agent Skills spec](https://agentskills.io/specification), [Claude Code skills](https://code.claude.com/docs/en/custom-skills)).

| Scope | Path |
| --- | --- |
| Project | `.claude/skills/<name>/SKILL.md` |
| Personal | `~/.claude/skills/<name>/SKILL.md` |

Required frontmatter for `cc-kit doctor`:

- `name` — kebab-case, ≤64 characters, must match the directory name
- `description` — what the skill does and when to use it, ≤1024 characters

Project memory can live at `./CLAUDE.md` or `.claude/CLAUDE.md`. Shared hooks live under `hooks` in `.claude/settings.json`: event name → matcher groups → handlers (`type` + `command` / `url` / …). See the [hooks reference](https://code.claude.com/docs/en/hooks).

## Starter pack

Curated skills in `packs/starter/`, installable by name:

| Name | Use when |
| --- | --- |
| `pr-review` | Reviewing a pull request or diff |
| `commit-message` | Writing a conventional commit message |
| `typescript-hygiene` | Editing TypeScript with strict hygiene |

```bash
npx cc-kit skill add pr-review
npx cc-kit skill add commit-message
npx cc-kit skill add typescript-hygiene
```

## Develop

```bash
npm install
npm test
npm run build
node dist/cli.js doctor
```

See [CONTRIBUTING.md](CONTRIBUTING.md). Changelog: [CHANGELOG.md](CHANGELOG.md).

## 中文

cc-kit 是给 Claude Code 用的本地工具：`init` 生成 `.claude/`（`CLAUDE.md`、示例 hooks、示例 skill）；`skill list|add|remove` 管理项目或个人 skill（默认 `.claude/skills/`，`--global` 写到 `~/.claude/skills/`）；`doctor` 检查 `SKILL.md` 的 YAML 头信息（`name`、`description`）和 hooks JSON 结构，skill 损坏时返回非 0。`packs/starter/` 里有 pr-review、commit-message、typescript-hygiene。不采集数据、不需要 API Key 或 Anthropic 登录，只动本地文件。

```bash
npx cc-kit init
npx cc-kit skill add pr-review
npx cc-kit doctor
```

## License

[MIT](LICENSE)
