import { QuoteStatement, RichTextStatement } from "../statements";
import { Block } from "./Block";

export class QuoteBlock extends Block<QuoteStatement> {
	/**
	 * Creates a new quote block.
	 * @param text The text of the quote.
	 * @returns A new quote block.
	 */
	public static create(text: string): QuoteBlock {
		return new QuoteBlock(QuoteStatement.create(text));
	}

	/**
	 * Gets the text of the quote.
	 * @returns The text of the quote.
	 */
	public get content(): string {
		return this.stmt.content.toString();
	}

	/**
	 * Sets the text of the quote.
	 * @param text The text of the quote.
	 */
	public set content(text: string) {
		this.stmt.content = RichTextStatement.create(text);
	}
}
