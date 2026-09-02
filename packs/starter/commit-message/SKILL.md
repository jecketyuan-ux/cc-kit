---
name: commit-message
description: Draft a conventional commit message from the current git diff and status. Use when the user asks for a commit message, wants to commit, or needs a changelog-style summary of staged changes.
license: MIT
compatibility: Designed for Claude Code (or similar products). Requires git.
---

# Commit message helper

Write a commit message from the working tree. Prefer staged changes; if nothing is staged, use the unstaged diff and say so.

## Gather

Run:

- `git status --short`
- `git diff --cached`
- `git diff` (only if the index is empty)
- `git log -8 --oneline` to match this repo's recent style

Do not commit unless the user explicitly asks you to commit.

## Style

Use Conventional Commits:

```
<type>(<optional-scope>): <imperative summary, ≤72 chars>

<optional body: what changed and why, not how>

<optional footers: BREAKING CHANGE, Fixes #123>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.

Rules:

- Subject is imperative ("add", not "added" or "adds").
- Do not mention Claude, Copilot, or that an agent wrote the change.
- Do not list every file. Group related edits into one message.
- If the diff mixes unrelated concerns, propose splitting into more than one commit and give a message for each.

## Output

1. The recommended message in a fenced code block, ready to paste.
2. A one-line reason if you chose a type or scope that might be surprising.
3. If the tree looks empty, say so and stop.
