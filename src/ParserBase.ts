import { Token } from "./Token";
import { TokenType } from "./TokenType";
import { Statement } from "./statements/Statement";

export const EOL_TOKEN = [TokenType.BR, TokenType.EOF];
export const SPACE_TOKEN = [TokenType.SPACE, TokenType.TAB];

export type tokenMatch = TokenType | TokenType[] | undefined;

/**
 * Flattens a multi-dimensional array of Tokens into a one-dimensional array of Tokens.
 * @param matches The matches, which are either a Token or an array of Tokens.
 * @returns All tokens in a one-dimensional array.
 */
export function flattenTokenMatchesToArray(matches: tokenMatch[]): TokenType[] {
	const flatMatches: TokenType[] = [];

	for (const match of matches) {
		if (match instanceof Array) {
			flatMatches.push(...match);
		} else if (match !== undefined) {
			flatMatches.push(match);
		}
	}

	return flatMatches;
}

export abstract class ParserBase {
	public tokens: Token[];
	protected token: Token;
	protected queuedIndex = 0;
	protected cursorIndex = 0;

	public constructor(tokens: Token[]) {
		this.tokens = tokens;
		this.moveCursor(0);
	}

	protected chomp(match: tokenMatch): Token {
		const matches = flattenTokenMatchesToArray([match]);

		for (const m of matches) {
			if (this.is(m)) {
				const token = this.token;
				this.next();
				return token;
			}
		}

		throw new Error(
			`Error at ${this.token.line}:${this.token.column}: Expected token: ${match}. Token found: ${this.token.type}, "${this.token.lexeme}"`
		);
	}

	protected chompWhile(match: tokenMatch): Token[] {
		const matches = flattenTokenMatchesToArray([match]);
		const tokens: Token[] = [];

		while (this.is(...matches)) {
			tokens.push(this.chomp(match));
		}

		return tokens;
	}

	/**
	 * Returns true if the current token is one of the given tokens.
	 * @param matches The tokens to check for.
	 * @returns True if the current token is one of the given tokens.
	 */
	protected is(...matches: tokenMatch[]): boolean {
		for (const match of flattenTokenMatchesToArray(matches)) {
			if (this.token.type === match) return true;
		}

		return false;
	}

	maybeChomp(match: tokenMatch, noMatch?: Token): Token | undefined {
		if (this.is(match)) {
			return this.chomp(match);
		}

		return noMatch;
	}

	/**
	 * Moves the cursor forward by the given number of tokens.
	 * @param offset Positive number of tokens to move the cursor forward.
	 */
	protected moveCursor(offset: number): void {
		if (offset < 0) throw new Error("Offset must be greater than 0.");

		this.cursorIndex += offset;
		this.token = this.tokenAt(this.cursorIndex);
	}

	/**
	 * Move the cursor forward one token.
	 * @returns this
	 */
	protected next(): this {
		this.moveCursor(1);
		return this;
	}

	/**
	 * Check to see if the next token is one of the given tokens.
	 * @param matches The tokens to check for.
	 * @returns True if the next token is one of the given tokens.
	 */
	protected nextIs(...matches: tokenMatch[]): boolean {
		return (
			flattenTokenMatchesToArray(matches).filter((match) => {
				return match !== undefined && this.peek().type === match;
			}).length > 0
		);
	}

	/**
	 * Return a tree of statements from the tokens.
	 */
	public abstract parse(): Statement[];

	/**
	 * Check the next token in the stream after this.token
	 * @param len The number of tokens to peek ahead.
	 * @returns A single token (if no len is specified) or an array of tokens.
	 */
	protected peek(): Token {
		return this.tokenAt(this.cursorIndex + 1);
	}

	/**
	 * Returns the token at the given index, or the last token if the index is out of bounds.
	 * @param index The index of the token to return.
	 * @returns the token at the given index, or the last token if the index is out of bounds.
	 */
	protected tokenAt(index: number): Token {
		if (index < 0) throw new Error("Index must be greater than 0.");
		if (index >= this.tokens.length)
			return this.tokenAt(this.tokens.length - 1);
		return this.tokens[index] as Token;
	}
}
