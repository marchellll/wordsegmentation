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

| Script | Purpose |
| --- | --- |
| `npm run build` | Typecheck + production bundle |
| `npm run lint` | ESLint (`eslint-plugin-obsidianmd`) |
| `npm test` | `node:test` on `tests/` |

## PRs

- Keep diffs small and scoped.
- Add or update unit tests for logic in `segment.ts` when you touch boundaries or locales.
- Do not commit `main.js` / `node_modules`.
