import { expect, describe, it } from "vitest";
import { SectionBlock } from "./SectionBlock";

describe("SectionBlock", () => {
	it("creates a section block", () => {
		const block = SectionBlock.create(
			"Section 1",
			"Here is some lede text."
		);

		expect(block.toString().split("\n")).toEqual([
			"# Section 1",
			"",
			"Here is some lede text.",
		]);
	});

	it("updates the heading level", () => {
		const block = SectionBlock.create(
			"Section 1",
			"Here is some lede text."
		);

		block.level = 3;

		expect(block.toString().split("\n")).toEqual([
			"### Section 1",
			"",
			"Here is some lede text.",
		]);
	});
});
