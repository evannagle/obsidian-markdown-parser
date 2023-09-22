import { RichTextStatement } from "../statements";
import { Block } from "./Block";

export class RichTextBlock extends Block<RichTextStatement> {
	/**
	 * Creates a new rich text block.
	 * @param text The text of the rich text block.
	 * @returns A new rich text block.
	 */
	public static create(text: string): RichTextBlock {
		return new RichTextBlock(RichTextStatement.create(text));
	}
}
