import { ParagraphStatement } from "../statements";
import { Block } from "./Block";

export class ParagraphBlock extends Block<ParagraphStatement> {
	/**
	 * Creates a new paragraph block.
	 * @param content The content of the paragraph.
	 * @returns A new paragraph block.
	 */
	public static create(content: string): ParagraphBlock {
		return new ParagraphBlock(ParagraphStatement.create(content));
	}
}
