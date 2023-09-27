import { describe, expect, it } from "vitest";
import { RichTextBlock, createRichTextBlock } from "./RichTextBlock";

describe("BlockFactory", () => {
	it("should return a block with the given name", () => {
		const block = createRichTextBlock("foo bar car");
		expect(block).toBeInstanceOf(RichTextBlock);
	});

	it("returns string of block", () => {
		const block = createRichTextBlock("foo *bar* car");
		expect(block.toString()).toBe("foo *bar* car");
	});
});
