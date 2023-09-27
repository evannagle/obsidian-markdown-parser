import { ParagraphStatement } from "src/parsers/statements/ParagraphStatement";
import { spawnFromContent } from "./BlockFactory";
import {
	RichTextBlock,
	RichTextContent,
	createRichTextBlock,
} from "./RichTextBlock";
import { TokenBlock } from "./TokenBlock";
import { MutableBlock } from "./MutableBlock";

export type ParagraphContent = ParagraphBlock | ParagraphStatement | string;

export class ParagraphBlock extends MutableBlock {
	public static override allowedChildren = [RichTextBlock, TokenBlock];
	public static override childCount = 2;
	private contentIndex = 1;

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
