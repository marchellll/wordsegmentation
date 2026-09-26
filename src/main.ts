import { Plugin } from 'obsidian';
import { wordMotionExtension } from './motion';
import { wordPointerExtension } from './pointer';
import { hasSegmenter } from './segment';

export default class WordSegmentationPlugin extends Plugin {
	async onload() {
		// No Segmenter → nothing to register; Obsidian keeps its defaults.
		if (!hasSegmenter()) return;

		this.registerEditorExtension([
			wordMotionExtension(),
			...wordPointerExtension(),
		]);
	}
}
