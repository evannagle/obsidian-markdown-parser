import { TokenizerBase, isAlpha, isNumber } from "src/TokenizerBase";
import { expect, test } from "vitest";
import { Token } from "./Token";

export class MockTokenizer extends TokenizerBase {
	public char: string;

	public clearQueuedChars(): string {
		return super.clearQueuedChars();
	}

	public getQueuedChars(): string {
		return super.getQueuedChars();
	}

	public moveCursor(offset: number): this {
		super.moveCursor(offset);
		return this;
	}

	public nextIs(c: string): boolean {
		return super.nextIs(c);
	}

	public peak(len = 1): string {
		return super.peak(len);
	}

	public tokenize(): Token[] {
		return [];
	}
}

const chars =
	"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ~!@#$%^&*()_+`1234567890-=[]{}\\|;':\",./<>?";

test("returns source when toString() is called", () => {
	const tokenizer = new MockTokenizer(chars);
	expect(tokenizer.toString()).toBe(chars);
});

test("returns first character when char is called", () => {
	const tokenizer = new MockTokenizer(chars);
	expect(tokenizer.char).toBe("a");
});

test("moveCursor(1) moves the cursor to the next char", () => {
	const tokenizer = new MockTokenizer(chars);
	tokenizer.moveCursor(1);
	expect(tokenizer.char).toBe("b");
});

test("moveCursor(1) updates queued chars", () => {
	const tokenizer = new MockTokenizer(chars);
	tokenizer.moveCursor(1);
	expect(tokenizer.getQueuedChars()).toBe("ab");
});

test("peak returns the next character", () => {
	const tokenizer = new MockTokenizer(chars);
	expect(tokenizer.peak()).toBe("b");
});

test("peak(2) returns the next two characters", () => {
	const tokenizer = new MockTokenizer(chars);
	expect(tokenizer.peak(2)).toBe("bc");
});

test("clearQueuedChars() clears the queued chars", () => {
	const tokenizer = new MockTokenizer(chars);
	tokenizer.moveCursor(1);
	tokenizer.clearQueuedChars();
	expect(tokenizer.getQueuedChars()).toBe("c");
});

test("isAlpha() returns true for a-z", () => {
	for (let i = 0; i < 26; i++) {
		const char = String.fromCharCode(97 + i);
		expect(isAlpha(char)).toBe(true);
	}
});

test("isAlpha() returns true for A-Z", () => {
	for (let i = 0; i < 26; i++) {
		const char = String.fromCharCode(65 + i);
		expect(isAlpha(char)).toBe(true);
	}
});

test("isAlpha() returns false for non-alpha characters", () => {
	for (let i = 52; i < chars.length; i++) {
		expect(isAlpha(chars[i]), "char: " + chars[i]).toBe(false);
	}
});

test("isNumber() returns true for 0-9", () => {
	for (let i = 0; i < 10; i++) {
		const char = String.fromCharCode(48 + i);
		expect(isNumber(char)).toBe(true);
	}
});

test("isNumber() returns false for non-numeric characters", () => {
	for (let i = 10; i < 52; i++) {
		expect(isNumber(chars[i]), "char: " + chars[i]).toBe(false);
	}
});

test("nextIs() returns true if the next character is the given character", () => {
	const tokenizer = new MockTokenizer(chars);
	expect(tokenizer.nextIs("b")).toBe(true);
});
