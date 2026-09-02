---
name: pr-review
description: Review a pull request against a structured checklist covering correctness, tests, security, and docs. Use when the user asks to review a PR, inspect a diff, or prepare review comments.
license: MIT
compatibility: Designed for Claude Code (or similar products). Requires git.
---

# PR review checklist

Review the current branch against its merge base. Ground every comment in the diff.

## Gather context

1. Identify the default branch (`main` or `master`) and the merge base.
2. Read the PR title, body, and linked issue if present.
3. Inspect `git diff <base>...HEAD` and the commit list. Do not review files that are not in the diff unless they are required to understand a change.

## Checklist

Work through each item. Skip with a reason if it does not apply.

### Correctness

- [ ] The change does what the PR claims.
- [ ] Edge cases (empty input, errors, retries, cancellation) are handled.
- [ ] Public APIs, types, and error messages stay consistent with existing code.
- [ ] No leftover debug logging, TODOs that should be tickets, or commented-out code.

### Tests

- [ ] New behavior has tests, or the PR explains why not.
- [ ] Existing tests that should change were updated.
- [ ] Assertions check behavior, not implementation accidents.

### Security and secrets

- [ ] No secrets, tokens, or credentials in the diff.
- [ ] User input is validated at trust boundaries.
- [ ] File, shell, and SQL uses are safe (no injection, no unexpected path traversal).

### Docs and ops

- [ ] README / CHANGELOG / public docs updated when user-facing behavior changed.
- [ ] Migrations, feature flags, and rollout notes are present when needed.

## Output

Write the review as:

1. **Summary** — one paragraph of what the PR does and overall risk.
2. **Findings** — a numbered list. Each finding has severity (`blocker` | `should-fix` | `nit`), file + line if possible, and a concrete suggestion.
3. **Checklist** — pass / fail / n/a for the sections above.
4. **Verdict** — approve, approve-with-nits, or request-changes.

Do not invent issues that are not in the diff. Prefer fewer, higher-signal comments.
