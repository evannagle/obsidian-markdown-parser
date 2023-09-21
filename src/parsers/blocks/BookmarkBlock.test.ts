import { expect, describe, it } from "vitest";
import { BookmarkBlock } from "./BookmarkBlock";
import { BookmarkStatement } from "../statements";

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

	it("creates a BookmarkBlock from a BookmarkStatement", () => {
		const bookmarkStmt = BookmarkStatement.create("bookmark");
		const bookmarkBlock = new BookmarkBlock(bookmarkStmt);
		expect(bookmarkBlock.toString()).toBe("{{bookmark}}");
	});
});
