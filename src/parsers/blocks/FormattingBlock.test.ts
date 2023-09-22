import { describe, expect, it } from "vitest";
import {
	BoldBlock,
	HighlightBlock,
	ItalicBlock,
	StrikethroughBlock,
} from "./FormattingBlock";

describe("FormattingBlock", () => {
	it("creates a bold block", () => {
		const block = BoldBlock.create("content");
		expect(block.toString()).toBe("**content**");
	});

	it("updates a bold block", () => {
		const block = BoldBlock.create("content");
		block.content = "newContent";
		expect(block.toString()).toBe("**newContent**");
	});

	it("creates an italic block", () => {
		const block = ItalicBlock.create("content");
		expect(block.toString()).toBe("*content*");
	});

	it("updates an italic block", () => {
		const block = ItalicBlock.create("content");
		block.content = "newContent";
		expect(block.toString()).toBe("*newContent*");
	});

	it("creates a strikethrough block", () => {
		const block = StrikethroughBlock.create("content");
		expect(block.toString()).toBe("~~content~~");
	});

	it("updates a strikethrough block", () => {
		const block = StrikethroughBlock.create("content");
		block.content = "newContent";
		expect(block.toString()).toBe("~~newContent~~");
	});

	it("creates a highlight block", () => {
		const block = HighlightBlock.create("content");
		expect(block.toString()).toBe("==content==");
	});

	it("updates a highlight block", () => {
		const block = HighlightBlock.create("content");
		block.content = "newContent";
		expect(block.toString()).toBe("==newContent==");
	});
});
