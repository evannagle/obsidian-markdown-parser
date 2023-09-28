import { Token, TokenLiteral } from "src/tokens/Token";
import { Block } from "./Block";

export type TokenContent = TokenBlock | Token | string;

/**
 * A block that contains only text.
 * This text is usually a wrapper around a token.
 */
export class TokenBlock extends Block {
	protected allowedChildren = []; // no child blocks
	protected lexeme: string;
	protected literal: TokenLiteral;

	public static create(value: string, literal?: TokenLiteral): TokenBlock {
		const block = new TokenBlock();
		block.lexeme = value;
		block.literal = literal || value;
		return block;
	}

	public toNumber(): number | undefined {
		if (typeof this.literal === "number") {
			return Number(this.literal);
		} else {
			return undefined;
		}
	}

	public toString() {
		return this.lexeme;
	}
}

/**
 * Create a new content block.
 * @param value The source value of the content block.
 * @returns A new content block.
 */
export function createTokenBlock(
	value: TokenContent,
	literal?: TokenLiteral
): TokenBlock {
	if (typeof value === "string") {
		return TokenBlock.create(value, literal);
	} else if (value instanceof Token) {
		return TokenBlock.create(value.lexeme, value.literal);
	} else {
		return value;
	}
}
