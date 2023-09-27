import { InlineCodeStatement } from "src/parsers/statements/InlineCodeStatement";
import { Block } from "./Block";
import { TokenBlock, createTokenBlock } from "./TokenBlock";
import { spawnFromContent } from "./BlockFactory";

export type InlineCodeContent = InlineCodeBlock | InlineCodeStatement | string;

/**
 * Represents a block of inline code.
 *
 * @example
 * Here is a block of `inline code` inside a sentence.
 */
export class InlineCodeBlock extends Block {
	public static override allowedChildren = [TokenBlock];
	contentIndex = 1;

	public constructor(...blocks: Block[]) {
		super(
			blocks.shift(),
			createTokenBlock(blocks.splice(0, blocks.length - 1).join("")),
			blocks.shift()
		);
	}

	public get content(): string {
		return this.str(this.contentIndex);
	}

	public set content(content: string) {
		this.set(this.contentIndex, createTokenBlock(content));
	}
}

export function createInlineCodeBlock(
	content: InlineCodeContent
): InlineCodeBlock {
	return spawnFromContent<InlineCodeBlock>(content, InlineCodeStatement);
}
