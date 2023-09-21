import { describe, expect, it } from "vitest";
import { InlineCodeBlock } from "./InlineCodeBlock";

describe("InlineCodeBlock", () => {
	it("creates an InlineCodeBlock", () => {
		const inlineCodeBlock = InlineCodeBlock.create(
			"console.log('Hello World!');"
		);

		expect(inlineCodeBlock.toString()).toBe(
			"`console.log('Hello World!');`"
		);
	});

	it("updates the inline code block source", () => {
		const inlineCodeBlock = InlineCodeBlock.create(
			"console.log('Hello World!');"
		);

		inlineCodeBlock.source = "console.log('Hello again, World!');";

		expect(inlineCodeBlock.toString()).toBe(
			"`console.log('Hello again, World!');`"
		);
	});
});
