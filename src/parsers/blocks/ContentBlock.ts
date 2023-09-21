import { ContentStatement } from "../statements";
import { Block } from "./Block";

export class ContentBlock extends Block<ContentStatement> {
	/**
	 * Create a new content block.
	 * @param content The content of the block.
	 * @returns A new content block.
	 */
	public static create(content: string): ContentBlock {
		return new ContentBlock(ContentStatement.create(content));
	}

	// I don't know what to do with this yet
}
