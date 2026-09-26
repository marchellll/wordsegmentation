# Contributing

New to the tree? Read [architecture.md](architecture.md) first.

## Requirements

- Node.js 18+
- npm

## Setup

```bash
npm i
npm run dev
```

Reload Obsidian and enable **Word Segmentation**.

## Scripts

| Script                            | Purpose                                     |
| --------------------------------- | ------------------------------------------- |
| `npm run build`                   | Typecheck + production bundle               |
| `npm run lint`                    | ESLint (`eslint-plugin-obsidianmd`)         |
| `npm test`                        | `node:test` on `tests/`                     |
| `npm run format` / `format:check` | Prettier                                    |
| `npm run spellcheck`              | cspell on `src/`, `docs/`, `tests/`, README |

## Husky

After `npm i`, Husky installs a **pre-push** hook that runs format check, lint, test, and spellcheck. Push fails if any fail.

## PRs

- Keep diffs small and scoped.
- Add or update unit tests for logic in `segment.ts` when you touch boundaries or locales.
- Do not commit `main.js` / `node_modules`.
