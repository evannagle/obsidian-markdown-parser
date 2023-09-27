import { spawnFromContent } from "./BlockFactory";

import {
	BoldStatement,
	HighlightStatement,
	ItalicStatement,
	StrikethroughStatement,
} from "src/parsers/statements/FormattingStatement";
import {
	RichTextBlock,
	RichTextContent,
	createRichTextBlock,
} from "./RichTextBlock";
import { Block } from "./Block";
import { TokenBlock } from "./TokenBlock";

export type BoldContent = BoldBlock | BoldStatement | string;
export type HighlightContent = HighlightBlock | HighlightStatement | string;
export type ItalicContent = ItalicBlock | ItalicStatement | string;
export type StrikethroughContent =
	| StrikethroughBlock
	| StrikethroughStatement
	| string;

export class FormattingBlock extends Block {
	protected static override childCount = 3;
	// TODO: resolve RichTextBlock returning undefined
	// protected static override allowedChildren = [TokenBlock, RichTextBlock];
	private contentIndex = 1;

	public set content(source: RichTextContent) {
		this.set(this.contentIndex, createRichTextBlock(source));
	}

	public get content(): string {
		return this.str(this.contentIndex);
	}
}

export class BoldBlock extends FormattingBlock {}
export class HighlightBlock extends FormattingBlock {}
export class ItalicBlock extends FormattingBlock {}
export class StrikethroughBlock extends FormattingBlock {}

/**
 * Creates a bold block
 * @param content The bold content
 * @returns A bold block
 */
export function createBoldBlock(content: BoldContent): BoldBlock {
	return spawnFromContent<BoldBlock>(content, BoldStatement);
}

/**
 * Creates an italic block
 * @param content The italic content
 * @returns An italic block
 */
export function createItalicBlock(content: ItalicContent): ItalicBlock {
	return spawnFromContent<ItalicBlock>(content, ItalicStatement);
}

/**
 * Creates a strikethrough block
 * @param content The strikethrough content
 * @returns A strikethrough block
 */
export function createStrikethroughBlock(
	content: StrikethroughContent
): StrikethroughBlock {
	return spawnFromContent<StrikethroughBlock>(
		content,
		StrikethroughStatement
	);
}

/**
 * Creates a highlight block
 * @param content The highlight content
 * @returns A highlight block
 */
export function createHighlightBlock(
	content: HighlightContent
): HighlightBlock {
	return spawnFromContent<HighlightBlock>(content, HighlightStatement);
}
