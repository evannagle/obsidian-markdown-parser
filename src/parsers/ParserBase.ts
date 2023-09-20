import { scanTokens } from "src/scanners/Scanner";
import { Token } from "../tokens/Token";
import { TokenType } from "../tokens/TokenType";
import { Statement } from "./statements";

export const EOL_TOKENS = [TokenType.BR, TokenType.EOF];
export const SPACE_TOKENS = [TokenType.SPACE, TokenType.TAB];

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
	protected tokens: Token[];
	protected token: Token;
	protected queuedIndex = 0;
	protected cursorIndex = 0;
	private _snapQueuedIndex = 0;
	private _snapCursorIndex = 0;

	public constructor(tokens: string | Token[]) {
		if (typeof tokens === "string") {
			tokens = scanTokens(tokens);
		}

		this.tokens = tokens;
		this.moveCursor(0);
	}

	/**
	 * Called if the tokens need to be parsed to a given point before being checked in.
	 * If the parser doesn't find the closing token or token pattern it expects,
	 * `this.revertCheckout()` should be called.
	 */
	protected checkout(): void {
		this._snapQueuedIndex = this.queuedIndex;
		this._snapCursorIndex = this.cursorIndex;
	}

	/**
	 * Chomps the current token and returns it if it matches the given token.
	 * @param match The token to chomp. If the current token is not this token, an error is thrown.
	 *				If an error should not be thrown, use `maybeChomp()` instead.
	 * @returns
	 */
	protected chomp(match?: tokenMatch): Token {
		if (!match) return this.chomp(this.token.type);

		const matches = flattenTokenMatchesToArray([match]);

		for (const m of matches) {
			if (this.is(m)) {
				const token = this.token;
				this.next();
				this.clearQueuedTokens();
				return token;
			}
		}

		throw new Error(
			`Error at ${this.token.line}:${this.token.column}: Expected token: ${match}. Token found: ${this.token.type}, "${this.token.lexeme}"`
		);
	}

	/**
	 * Chomps tokens until the current token does not match.
	 * @param match The token types to chomp.
	 * @returns
	 */
	protected chompWhile(match: tokenMatch): Token[] {
		const matches = flattenTokenMatchesToArray([match]);
		const tokens: Token[] = [];

		while (this.is(...matches)) {
			tokens.push(this.chomp(match));
		}

		return tokens;
	}

	/**
	 * Chomps tokens until the current token matches.
	 * @param match The token types NOT to chomp.
	 * @returns
	 */
	protected chompWhileNot(match: tokenMatch): Token[] {
		const matches = flattenTokenMatchesToArray([match]);
		const tokens: Token[] = [];

		while (!this.is(...matches)) {
			tokens.push(this.chomp(this.token.type));
		}

		return tokens;
	}

	/**
	 * Returns the tokens in the queue that have not yet been chomped.
	 * @returns The tokens passed using "next" since the last chomp.
	 * @example
	 *
	 * this.nextUntil(TokenType.BR);
	 * this.clearQueuedTokens(); // returns all tokens up to the BR
	 */
	protected clearQueuedTokens(): Token[] {
		const source = this.tokens.slice(this.queuedIndex, this.cursorIndex);
		this.queuedIndex = this.cursorIndex;
		return source;
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

	/**
	 * Chomps the current token if it matches, returns noMatch if it doesn't.
	 * @param match The token to chomp. If the current token is not this token, noMatch is returned.
	 * @param noMatch The token to return if the current token does not match.
	 * @returns
	 */
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

	protected nextWhile(...matches: tokenMatch[]): this {
		while (this.nextIs(...matches)) {
			this.next();
		}
		return this;
	}

	protected nextUntil(...matches: tokenMatch[]): this {
		while (!this.is(...matches)) {
			this.next();
		}
		return this;
	}

	/**
	 * Return a tree of statements from the tokens.
	 */
	public abstract parse(): Statement;

	/**
	 * Check the next token in the stream after this.token
	 * @param len The number of tokens to peek ahead.
	 * @returns A single token (if no len is specified) or an array of tokens.
	 */
	protected peek(): Token {
		return this.tokenAt(this.cursorIndex + 1);
	}

	/**
	 * Returns the token an index ahead of the current token.
	 * @param index The index of the token to return.
	 * @returns
	 */
	protected peekAt(index: number): Token {
		return this.tokenAt(this.cursorIndex + index);
	}

	/**
	 * Called after this.checkout() if the parser did not find the closing token or token pattern it expected.
	 * Returns the parser back to the state it was in before this.checkout() was called.
	 */
	protected revertCheckout(): void {
		this.queuedIndex = this._snapQueuedIndex;
		this.cursorIndex = this._snapCursorIndex;
		this.token = this.tokenAt(this.cursorIndex);
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
