import { ScannerBase, isAlpha, isNumber } from "src/scanners/ScannerBase";
import { describe, expect, it } from "vitest";
import { Token } from "../tokens/Token";

export class MockTokenizer extends ScannerBase {
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

	public peek(len = 1): string {
		return super.peek(len);
	}

	public scan(): Token[] {
		return [];
	}
}

const chars =
	"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ~!@#$%^&*()_+`1234567890-=[]{}\\|;':\",./<>?";

describe("ScannerBase", () => {
	it("returns source when toString() is called", () => {
		const tokenizer = new MockTokenizer(chars);
		expect(tokenizer.toString()).toBe(chars);
	});

	it("returns first character when char is called", () => {
		const tokenizer = new MockTokenizer(chars);
		expect(tokenizer.char).toBe("a");
	});

	it("moveCursor(1) moves the cursor to the next char", () => {
		const tokenizer = new MockTokenizer(chars);
		tokenizer.moveCursor(1);
		expect(tokenizer.char).toBe("b");
	});

	it("moveCursor(1) updates queued chars", () => {
		const tokenizer = new MockTokenizer(chars);
		tokenizer.moveCursor(1);
		expect(tokenizer.getQueuedChars()).toBe("ab");
	});

	it("peak returns the next character", () => {
		const tokenizer = new MockTokenizer(chars);
		expect(tokenizer.peek()).toBe("b");
	});

	it("peak(2) returns the next two characters", () => {
		const tokenizer = new MockTokenizer(chars);
		expect(tokenizer.peek(2)).toBe("bc");
	});

	it("clearQueuedChars() clears the queued chars", () => {
		const tokenizer = new MockTokenizer(chars);
		tokenizer.moveCursor(1);
		tokenizer.clearQueuedChars();
		expect(tokenizer.getQueuedChars()).toBe("c");
	});

	it("isAlpha() returns true for a-z", () => {
		for (let i = 0; i < 26; i++) {
			const char = String.fromCharCode(97 + i);
			expect(isAlpha(char)).toBe(true);
		}
	});

	it("isAlpha() returns true for A-Z", () => {
		for (let i = 0; i < 26; i++) {
			const char = String.fromCharCode(65 + i);
			expect(isAlpha(char)).toBe(true);
		}
	});

	it("isAlpha() returns false for non-alpha characters", () => {
		for (let i = 52; i < chars.length; i++) {
			expect(isAlpha(chars[i]), "char: " + chars[i]).toBe(false);
		}
	});

	it("isNumber() returns true for 0-9", () => {
		for (let i = 0; i < 10; i++) {
			const char = String.fromCharCode(48 + i);
			expect(isNumber(char)).toBe(true);
		}
	});

	it("isNumber() returns false for non-numeric characters", () => {
		for (let i = 10; i < 52; i++) {
			expect(isNumber(chars[i]), "char: " + chars[i]).toBe(false);
		}
	});

	it("nextIs() returns true if the next character is the given character", () => {
		const tokenizer = new MockTokenizer(chars);
		expect(tokenizer.nextIs("b")).toBe(true);
	});
});
