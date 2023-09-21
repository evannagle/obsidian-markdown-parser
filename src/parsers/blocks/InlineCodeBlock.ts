import { InlineCodeStatement } from "../statements";
import { Block } from "./Block";
import { Token } from "src/tokens/Token";
import { TokenType } from "src/tokens/TokenType";

export class InlineCodeBlock extends Block<InlineCodeStatement> {
	/**
	 * Create a new inline code block.
	 * @param content The content of the inline code block.
	 * @returns A new inline code block.
	 */
	public static create(content: string): InlineCodeBlock {
		return new InlineCodeBlock(InlineCodeStatement.create(content));
	}

	/**
	 * Get the source of the inline code block.
	 */
	public get source(): string {
		return this.stmt.content.toString();
	}

	/**
	 * Set the source of the inline code block.
	 */
	public set source(source: string) {
		// this.stmt.content = scanTokens(source);
		this.stmt.content = [Token.create(TokenType.CODE_SOURCE, source)];
	}
}
