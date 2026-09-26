import { EditorSelection } from '@codemirror/state';
import { EditorView, type MouseSelectionStyle } from '@codemirror/view';
import { wordAt } from './segment';

/**
 * Double-click (desktop) and double-tap (mobile) select one segmented word.
 *
 * CodeMirror ignores mouse events for ~2s after a touch, so touch cannot reuse
 * the mouse path — we listen for touchend ourselves.
 */

/** Word under a document position, or null → leave Obsidian’s default alone. */
function rangeAtPos(view: EditorView, pos: number) {
	const line = view.state.doc.lineAt(pos);
	return wordAt(line.text, line.from, pos);
}

/**
 * Double-click selection style for CodeMirror.
 * Returning null means “not our click” — CodeMirror keeps its own groupAt.
 * While the button is held, `get` re-runs on move so the selection can grow
 * by whole words under the pointer.
 */
function mouseWordStyle(view: EditorView, event: MouseEvent): MouseSelectionStyle | null {
	// Left button, second click only (not single- or triple-click).
	if (event.button !== 0 || event.detail !== 2) return null;

	const startPos = view.posAtCoords({ x: event.clientX, y: event.clientY });
	if (startPos == null) return null;

	// No segmented word here → fall through to default double-click.
	const startWord = rangeAtPos(view, startPos);
	if (!startWord) return null;

	let startSel = view.state.selection;

	return {
		// Called on the initial click and again while dragging.
		get(curEvent, extend, multiple) {
			const curPos =
				view.posAtCoords({ x: curEvent.clientX, y: curEvent.clientY }) ?? startPos;
			// Prefer the word under the cursor; stay on the start word if none.
			const curWord = rangeAtPos(view, curPos) ?? startWord;
			// Span from the first word through the current one (word-sized drag).
			const from = Math.min(startWord.from, curWord.from);
			const to = Math.max(startWord.to, curWord.to);
			let range = EditorSelection.range(from, to);

			// Shift-double-click: grow from the existing selection anchor/head.
			if (extend) {
				const main = startSel.main;
				range = EditorSelection.range(
					Math.min(main.anchor, range.from),
					Math.max(main.head, range.to),
				);
			}

			// Cmd/Ctrl-click: add a range instead of replacing the selection.
			if (multiple) {
				return startSel.addRange(range);
			}
			return EditorSelection.create([range]);
		},
		// Keep the original selection mapped if the doc changes mid-gesture.
		update(update) {
			if (update.docChanged) {
				startSel = startSel.map(update.changes);
			}
			return true;
		},
	};
}

const DOUBLE_TAP_MS = 350;
const DOUBLE_TAP_PX = 24;

function touchDoubleTapHandlers() {
	let lastTap = 0;
	let lastX = 0;
	let lastY = 0;

	return EditorView.domEventHandlers({
		touchend(event, view) {
			// Need a single finger; multi-touch is not a double-tap.
			if (event.changedTouches.length !== 1) return false;
			const touch = event.changedTouches[0]!;
			const now = Date.now();
			const dt = now - lastTap;
			const dx = Math.abs(touch.clientX - lastX);
			const dy = Math.abs(touch.clientY - lastY);

			// Always record this tap so the *next* one can pair with it.
			lastTap = now;
			lastX = touch.clientX;
			lastY = touch.clientY;

			// Too slow or too far from the previous tap → treat as a new first tap.
			if (dt > DOUBLE_TAP_MS || dx > DOUBLE_TAP_PX || dy > DOUBLE_TAP_PX) {
				return false;
			}

			const pos = view.posAtCoords({
				x: touch.clientX,
				y: touch.clientY,
			});
			if (pos == null) return false;

			// Only take over for scripts we segment; else leave Obsidian alone.
			const word = rangeAtPos(view, pos);
			if (!word) return false;

			event.preventDefault();
			view.dispatch({
				selection: EditorSelection.range(word.from, word.to),
				userEvent: 'select.pointer',
			});
			// Reset so a third tap does not select again immediately.
			lastTap = 0;
			return true;
		},
	});
}

export function wordPointerExtension() {
	return [EditorView.mouseSelectionStyle.of(mouseWordStyle), touchDoubleTapHandlers()];
}
