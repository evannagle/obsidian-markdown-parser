import { Token } from "src/tokens/Token";
import { RichTextBlock, createRichTextBlock } from "./RichTextBlock";
import { TokenBlock, createTokenBlock } from "./TokenBlock";
import { TokenType } from "src/tokens/TokenType";
import { HeadingStatement } from "src/parsers/statements/SectionStatement";
import { spawnFromContentAndCreate } from "./BlockFactory";
import { RichContentBlock } from "./RichContentBlock";

export type HeadingContent = HeadingBlock | HeadingStatement | string;

export class HeadingBlock extends RichContentBlock {
	public static allowedChildren = [TokenBlock, RichTextBlock];
	public static childCount = 4;
	private hashIndex = 0;
	protected contentIndex = 2;
	protected brIndex = 3;

	public constructor(
		hash: TokenBlock,
		space: TokenBlock,
		content: RichTextBlock,
		br: TokenBlock
	) {
		super(hash, space, content, br);
	}

	public get level(): number {
		return this.get<TokenBlock>(this.hashIndex).toNumber() ?? 0;
	}

	public set level(level: number) {
		this.set(
			this.hashIndex,
			createTokenBlock(
				Token.create(TokenType.HHASH, "#".repeat(level), level)
			)
		);
	}
}

export function createHeadingBlock(
	level: number,
	content: HeadingContent
): HeadingBlock {
	// return spawnFromContent<HeadingBlock>(content, HeadingStatement);
	return spawnFromContentAndCreate<HeadingBlock, HeadingStatement>(
		content,
		(c) => HeadingStatement.create(c, level)
	);
}
