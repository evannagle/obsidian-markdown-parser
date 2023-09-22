import { PlainTextStatement } from "../statements";
import { Block } from "./Block";

export class PlainTextBlock extends Block<PlainTextStatement> {
	/**
	 * Creates a new plain text block.
	 * @param text The text of the plain text block.
	 * @returns A new plain text block.
	 */
	public static create(text: string): PlainTextBlock {
		return new PlainTextBlock(PlainTextStatement.create(text));
	}
}
