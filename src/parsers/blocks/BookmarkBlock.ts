import { BookmarkStatement, PlainTextStatement } from "../statements";
import { Block } from "./Block";

export class BookmarkBlock extends Block<BookmarkStatement> {
	/**
	 * Create a new bookmark block.
	 * @param content The bookmark name.
	 * @returns A new bookmark block.
	 */
	public static create(content: string): BookmarkBlock {
		return new BookmarkBlock(BookmarkStatement.create(content));
	}

	/**
	 * Get the name of the bookmark.
	 */
	public get name(): string {
		return this.stmt.content.toString();
	}

	/**
	 * Set the name of the bookmark.
	 */
	public set name(content: string) {
		this.stmt.content = PlainTextStatement.create(content);
	}
}
