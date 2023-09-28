import { QuoteStatement } from "src/parsers/statements/QuoteStatement";
import { TokenBlock } from "./TokenBlock";
import { RichTextBlock } from "./RichTextBlock";
import { spawnFromContent } from "./BlockFactory";
import { RichContentBlock } from "./RichContentBlock";

export type QuoteContent = QuoteBlock | QuoteStatement | string;

export class QuoteBlock extends RichContentBlock {
	protected static override allowedChildren = [TokenBlock, RichTextBlock];
	protected static override childCount = 4;
	protected contentIndex = 2;
	protected brIndex = 3;
}

/**
 * Creates a quote block
 * @param content The quote content
 * @returns A quote block
 */
export function createQuoteBlock(content: QuoteContent): QuoteBlock {
	return spawnFromContent<QuoteBlock>(content, QuoteStatement);
}
