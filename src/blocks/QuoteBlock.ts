import { QuoteStatement } from "src/parsers/statements/QuoteStatement";
import { Block } from "./Block";
import { TokenBlock } from "./TokenBlock";
import {
	RichTextBlock,
	RichTextContent,
	createRichTextBlock,
} from "./RichTextBlock";
import { spawnFromContent } from "./BlockFactory";

export type QuoteContent = QuoteBlock | QuoteStatement | string;

export class QuoteBlock extends Block {
	public static override allowedChildren = [TokenBlock, RichTextBlock];
	public static override childCount = 4;
	private contentIndex = 2;

	public get content(): string {
		return this.str(this.contentIndex);
	}

	public set content(content: RichTextContent) {
		this.set(this.contentIndex, createRichTextBlock(content));
	}
}

export function createQuoteBlock(content: QuoteContent): QuoteBlock {
	return spawnFromContent<QuoteBlock>(content, QuoteStatement);
}
