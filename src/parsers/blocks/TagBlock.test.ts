import { describe, expect, it } from "vitest";
import { TagBlock } from "./TagBlock";

describe("TagBlock", () => {
	it("creates a tag block", () => {
		const block = TagBlock.create("tag");
		expect(block.toString()).toBe("#tag");
	});

	it("updates the tag name", () => {
		const block = TagBlock.create("tag");
		block.name = "newtag";
		expect(block.toString()).toBe("#newtag");
	});
});
