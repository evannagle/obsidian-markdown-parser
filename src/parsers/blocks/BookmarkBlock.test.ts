import { expect, describe, it } from "vitest";
import { BookmarkBlock } from "./BookmarkBlock";

describe("BookmarkBlock", () => {
	it("creates a BookmarkBlock", () => {
		const bookmarkBlock = BookmarkBlock.create("bookmark");
		expect(bookmarkBlock.toString()).toBe("{{bookmark}}");
	});

	it("updates the bookmark", () => {
		const bookmarkBlock = BookmarkBlock.create("bookmark");
		bookmarkBlock.name = "updated";
		expect(bookmarkBlock.toString()).toBe("{{updated}}");
	});

	it("gets the bookmark", () => {
		const bookmarkBlock = BookmarkBlock.create("bookmark");
		expect(bookmarkBlock.name).toBe("bookmark");
	});
});
