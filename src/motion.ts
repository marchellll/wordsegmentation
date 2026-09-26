import { EditorSelection, Prec, type SelectionRange } from '@codemirror/state';
import { EditorView, keymap, type KeyBinding } from '@codemirror/view';
import { nextWordBoundary } from './segment';

/**
 * Word motion / delete for scripts without spaces.
 *
 * Same bindings as CodeMirror’s group keymap:
 * - macOS: Option+Left/Right, Option+Shift+Left/Right, Option+Backspace, Option+Delete
 * - Win/Linux: Ctrl+Left/Right, Ctrl+Shift+Left/Right, Ctrl+Backspace, Ctrl+Delete
 *
 * Returning false lets Obsidian’s default handler run (English and other
 * space-delimited text).
 */

enum WordDir {
	Backward,
	Forward,
}

enum WordSelect {
	Move,
	Extend,
}

function moveByWord(view: EditorView, dir: WordDir, select: WordSelect): boolean {
	const forward = dir === WordDir.Forward;
	const extend = select === WordSelect.Extend;
	const { state } = view;
	const nextRanges: SelectionRange[] = [];

	for (const range of state.selection.ranges) {
		const head = range.head;
		const line = state.doc.lineAt(head);
		const next = nextWordBoundary(line.text, line.from, head, forward);
		if (next == null) return false;
		nextRanges.push(
			extend ? EditorSelection.range(range.anchor, next) : EditorSelection.cursor(next),
		);
	}

	view.dispatch({
		selection: EditorSelection.create(nextRanges),
		scrollIntoView: true,
		userEvent: 'select',
	});
	return true;
}

function deleteByWord(view: EditorView, dir: WordDir): boolean {
	const forward = dir === WordDir.Forward;
	const { state } = view;
	// Non-empty selection: leave to default (it already deletes the selection).
	if (state.selection.ranges.some((r) => !r.empty)) return false;

	const changes: { from: number; to: number }[] = [];
	const newHeads: number[] = [];

	for (const range of state.selection.ranges) {
		const head = range.head;
		const line = state.doc.lineAt(head);
		const next = nextWordBoundary(line.text, line.from, head, forward);
		if (next == null) return false;
		const from = Math.min(head, next);
		const to = Math.max(head, next);
		changes.push({ from, to });
		newHeads.push(from);
	}

	view.dispatch({
		changes,
		selection: EditorSelection.create(newHeads.map((h) => EditorSelection.cursor(h))),
		scrollIntoView: true,
		userEvent: 'delete.word',
	});
	return true;
}

const cursorWordLeft = (view: EditorView) => moveByWord(view, WordDir.Backward, WordSelect.Move);
const cursorWordRight = (view: EditorView) => moveByWord(view, WordDir.Forward, WordSelect.Move);
const selectWordLeft = (view: EditorView) => moveByWord(view, WordDir.Backward, WordSelect.Extend);
const selectWordRight = (view: EditorView) => moveByWord(view, WordDir.Forward, WordSelect.Extend);
const deleteWordBackward = (view: EditorView) => deleteByWord(view, WordDir.Backward);
const deleteWordForward = (view: EditorView) => deleteByWord(view, WordDir.Forward);

const wordKeymap: readonly KeyBinding[] = [
	{
		key: 'Mod-ArrowLeft',
		mac: 'Alt-ArrowLeft',
		run: cursorWordLeft,
		shift: selectWordLeft,
		preventDefault: true,
	},
	{
		key: 'Mod-ArrowRight',
		mac: 'Alt-ArrowRight',
		run: cursorWordRight,
		shift: selectWordRight,
		preventDefault: true,
	},
	{
		key: 'Mod-Backspace',
		mac: 'Alt-Backspace',
		run: deleteWordBackward,
		preventDefault: true,
	},
	{
		key: 'Mod-Delete',
		mac: 'Alt-Delete',
		run: deleteWordForward,
		preventDefault: true,
	},
];

export function wordMotionExtension() {
	return Prec.highest(keymap.of(wordKeymap));
}
