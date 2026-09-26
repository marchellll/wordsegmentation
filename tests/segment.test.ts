import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	localeForChar,
	nextWordBoundary,
	wordAt,
} from '../src/segment.ts';

describe('localeForChar', () => {
	it('returns null for Latin', () => {
		assert.equal(localeForChar('h', 'hello'), null);
	});

	it('detects Thai', () => {
		assert.equal(localeForChar('ส', 'สวัสดี'), 'th');
	});

	it('detects Japanese kana', () => {
		assert.equal(localeForChar('こ', 'こんにちは'), 'ja');
	});

	it('uses ja for han when the line also has kana', () => {
		assert.equal(localeForChar('日', '日本語です'), 'ja');
	});

	it('uses zh for han when the line has no kana', () => {
		assert.equal(localeForChar('中', '中文测试'), 'zh');
	});
});

describe('nextWordBoundary', () => {
	it('returns null inside English words', () => {
		const line = 'hello world';
		assert.equal(nextWordBoundary(line, 0, 3, false), null);
		assert.equal(nextWordBoundary(line, 0, 3, true), null);
	});

	it('splits a Japanese phrase into more than one word', () => {
		const line = '私は猫です';
		const end = line.length;
		const mid = nextWordBoundary(line, 0, end, false);
		assert.notEqual(mid, null);
		assert.ok(mid! > 0);
		assert.ok(mid! < end);

		const words: string[] = [];
		let pos = end;
		while (pos > 0) {
			const prev = nextWordBoundary(line, 0, pos, false);
			if (prev == null) break;
			words.push(line.slice(prev, pos));
			pos = prev;
		}
		assert.ok(words.length >= 2, `expected ≥2 words, got ${words.join('|')}`);
	});

	it('finds a boundary inside Thai, not the whole line', () => {
		const line = 'ฉันรักภาษาไทย';
		const end = line.length;
		const mid = nextWordBoundary(line, 0, end, false);
		assert.notEqual(mid, null);
		assert.ok(mid! > 0);
		assert.ok(mid! < end);
	});

	it('finds a boundary inside a Chinese-only line', () => {
		const line = '我喜欢中文';
		const end = line.length;
		const mid = nextWordBoundary(line, 0, end, false);
		assert.notEqual(mid, null);
		assert.ok(mid! > 0);
		assert.ok(mid! < end);
	});
});

describe('wordAt', () => {
	it('returns null for English', () => {
		assert.equal(wordAt('hello', 0, 2), null);
	});

	it('selects one Japanese word, not the whole sentence', () => {
		const line = '私は猫です';
		const range = wordAt(line, 0, 0);
		assert.notEqual(range, null);
		assert.ok(range!.to - range!.from < line.length);
		assert.ok(range!.to - range!.from >= 1);
	});
});
