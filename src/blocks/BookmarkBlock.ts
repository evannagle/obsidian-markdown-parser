import { Block } from "./Block";
import { spawnFromContent } from "./BlockFactory";
import { BookmarkStatement } from "src/parsers/statements/BookmarkStatement";
import {
	PlainTextBlock,
	PlainTextContent,
	createPlainTextBlock,
} from "./PlainTextBlock";
import { TokenBlock } from "./TokenBlock";

export type BookmarkContent = BookmarkBlock | BookmarkStatement | string;

export class BookmarkBlock extends Block {
	public static override allowedChildren = [PlainTextBlock, TokenBlock];
	public static override childCount = 3;
	private nameIndex = 1;

	public get name(): string {
		return this.str(this.nameIndex);
	}

	public set name(name: PlainTextContent) {
		this.set(this.nameIndex, createPlainTextBlock(name));
	}
}

export function createBookmarkBlock(name: string): BookmarkBlock {
	return spawnFromContent<BookmarkBlock>(name, BookmarkStatement);
}
