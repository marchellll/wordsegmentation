# Codebase map

Where to look. This file is the **start** map.

## Start here

1. [`src/main.ts`](../src/main.ts) — plugin boot only: register the editor extension when `Intl.Segmenter` exists.
2. [`src/segment.ts`](../src/segment.ts) — pure helpers: script → locale, word boundaries, word under cursor.
3. Pick one path:
   - **Keyboard:** `motion.ts` keymap → `segment.nextWordBoundary` → move / select / delete
   - **Pointer:** `pointer.ts` double-click or double-tap → `segment.wordAt` → select range

```
Key / click / tap
        │
        ▼
  segment.ts          (locale? → boundaries on this line)
        │
        ├─ motion.ts  → Option/Ctrl word keys
        └─ pointer.ts → double-click / double-tap
```

English and other space-delimited text: helpers return `null`, and Obsidian’s default handler runs.

## Folder cheat sheet

| Path | Job |
| --- | --- |
| `src/main.ts` | Lifecycle. Keep thin. |
| `src/segment.ts` | Locale detection + `Intl.Segmenter` on one line. |
| `src/motion.ts` | Highest-precedence keymap for word move / select / delete. |
| `src/pointer.ts` | Double-click (`mouseSelectionStyle`) + mobile double-tap. |
| `tests/` | Pure-logic checks for `segment.ts`. |
| `docs/` | Human guides. |
| `img/demo.gif` | README demo placeholder. |

## Locales

| Script | Locale | Notes |
| --- | --- | --- |
| Hiragana / Katakana | `ja` | |
| Han + kana on the line | `ja` | |
| Han only | `zh` | |
| Thai | `th` | |
| Lao | `lo` | |
| Khmer | `km` | |
| Myanmar | `my` | |

Korean and Latin stay on Obsidian’s defaults (spaces already separate words).

## Mental model

1. Look at the character before (backward) or after (forward) the cursor.
2. If it is not a dictionary script → do nothing (`null`).
3. Segment **this line only** with `Intl.Segmenter`.
4. Skip non-`isWordLike` pieces (spaces, punctuation).
5. Move, extend, or delete to that boundary — or select the word under the pointer.
