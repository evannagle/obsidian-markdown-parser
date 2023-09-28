import { ContentStatement } from "src/parsers/statements/ContentStatement";
import { spawnFromContentAndCreate } from "./BlockFactory";
import { LineBlock } from "./LineBlock";
import { createParagraphBlock } from "./ParagraphBlock";

export type LedeContent = LedeBlock | ContentStatement | string;

export class LedeBlock extends LineBlock {
	protected paragraphIndex = 0;
	protected brIndex = 1;

	public get content(): string {
		return this.str(this.paragraphIndex);
	}

	public set content(content: string) {
		this.set(this.paragraphIndex, createParagraphBlock(content));
	}
}

export function createLedeBlock(
	content: LedeContent,
	bottomMargin = 2
): LedeBlock {
	return spawnFromContentAndCreate<LedeBlock, ContentStatement>(
		content,
		(c) => {
			return ContentStatement.create(c, bottomMargin);
		}
	);
}
