import { ParagraphStatement } from "src/parsers/statements/ParagraphStatement";
import { spawnFromContent } from "./BlockFactory";
import {
	RichTextBlock,
	RichTextContent,
	createRichTextBlock,
} from "./RichTextBlock";
import { TokenBlock, createTokenBlock } from "./TokenBlock";
import { MutableBlock } from "./MutableBlock";
import { Token } from "src/tokens/Token";

export type ParagraphContent = ParagraphBlock | ParagraphStatement | string;

export class ParagraphBlock extends MutableBlock {
	public static override allowedChildren = [RichTextBlock, TokenBlock];
	public static override childCount = 2;
	private contentIndex = 0;
	private brIndex = 1;

	/**
	 * Get the number of line breaks at the end of the block.
	 */
	public get bottomMargin(): number {
		return this.get<TokenBlock>(this.brIndex).toNumber() ?? 0;
	}

	/**
	 * Set the number of line breaks at the end of the block.
	 */
	public set bottomMargin(margin: number) {
		this.set(this.brIndex, createTokenBlock(Token.createBr(margin)));
	}

	public get content(): string {
		return this.str(this.contentIndex);
	}

	public set content(content: RichTextContent) {
		this.set(this.contentIndex, createRichTextBlock(content));
	}
}

/**
 * Creates a paragraph block
 * @param content The paragraph content
 * @returns A paragraph block
 */
export function createParagraphBlock(
	content: ParagraphContent
): ParagraphBlock {
	return spawnFromContent<ParagraphBlock>(content, ParagraphStatement);
}
