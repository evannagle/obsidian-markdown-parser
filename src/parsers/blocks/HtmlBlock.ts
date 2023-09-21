import { HtmlStatement } from "../statements";
import { Block } from "./Block";

export class HtmlBlock extends Block<HtmlStatement> {
	/**
	 * Create a new HTML block.
	 * @param source The source of the HTML block.
	 * @returns A new HTML block.
	 */
	public static create(source: string): HtmlBlock {
		return new HtmlBlock(HtmlStatement.create(source));
	}
}
