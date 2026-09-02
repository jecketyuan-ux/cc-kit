---
name: typescript-hygiene
description: Audit and improve TypeScript hygiene — no implicit any, narrowing, unused exports, and safe DOM/Node APIs. Use when editing .ts/.tsx files, fixing type errors, or the user asks for a TypeScript cleanup.
license: MIT
compatibility: Designed for Claude Code (or similar products). Requires a TypeScript project.
---

# TypeScript hygiene

Apply these rules when writing or reviewing TypeScript in this repository. Prefer the project's existing `tsconfig` over inventing new compiler flags.

## Defaults

- Keep `strict` on. Do not add `// @ts-ignore` or `as any` to silence a real error. If a workaround is unavoidable, add a one-line comment explaining why and how to remove it.
- Do not use implicit `any`. Give parameters, public APIs, and exported functions explicit types when inference is unclear.
- Prefer `unknown` + narrowing over `any`. Prefer discriminated unions over optional bags of fields.
- Use `type` or `interface` consistently with the surrounding file. Do not export types that are only used once locally.

## Narrowing and safety

- Exhaust `switch` on unions (`never` in the default branch).
- Check `array[index]` and map lookups; with `noUncheckedIndexedAccess`, handle `undefined`.
- Avoid non-null assertions (`!`) except at a documented invariant.
- Do not cast through `as unknown as T` unless interfacing with an untyped boundary.

## Modules and ESM

- Match the project's module setting (`NodeNext` / ESM). Include the `.js` or `.ts` extension in relative imports if the repo already does.
- Use `import type` for type-only imports when `verbatimModuleSyntax` or `isolatedModules` is on.
- Do not default-export unless the surrounding code already does.

## When changing files

1. Read the nearest `tsconfig` and follow it.
2. After edits, run the project's typecheck (`tsc --noEmit` or `npm run typecheck`) if it exists.
3. Fix errors you introduced. Do not expand the change into a repo-wide any-hunt unless asked.

## Output

If asked to audit, list findings as file + line + problem + a small fix. If asked to implement, apply the fixes and summarize what changed.
