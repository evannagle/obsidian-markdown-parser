import { describe, expect, it } from "vitest";
import { QuoteBlock } from "./QuoteBlock";

describe("QuoteBlock", () => {
	it("creates a quote block", () => {
		const block = QuoteBlock.create("foo");
		expect(block.toString()).toBe("> foo\n");
	});

	it("gets the quote content", () => {
		const block = QuoteBlock.create("foo");
		expect(block.content).toBe("foo");
	});

	it("updates the quote content", () => {
		const block = QuoteBlock.create("foo");
		block.content = "bar";
		expect(block.toString()).toBe("> bar\n");
	});
});
