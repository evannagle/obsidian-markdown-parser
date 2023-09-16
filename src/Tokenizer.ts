import { CodeTokenizer } from "./CodeTokenizer";
import { FrontMatterTokenizer } from "./FrontmatterTokenizer";
import { Token } from "./Token";
import { TokenType } from "./TokenType";
import {
	EOF,
	EOL,
	SPACE,
	TokenizerBase,
	isAlpha,
	isAlphaNumeric,
	isNumber,
} from "./TokenizerBase";

export const RUNE_DELIMITERS = [
	...SPACE,
	...EOL,
	"[",
	"]",
	"|",
	"*",
	"~~",
	"::",
	"(",
	")",
];

export class Tokenizer extends TokenizerBase {
	constructor(source: string) {
		super(source);
	}

	getTokenTypeFromKeywordOrSymbol(
		symbol: string
	): [TokenType, literalValue: any] {
		switch (symbol.toLowerCase()) {
			case "true":
			case "false":
				return [TokenType.BOOLEAN, symbol.toLowerCase() === "true"];
			case "january":
			case "february":
			case "march":
			case "april":
			case "may":
			case "june":
			case "july":
			case "august":
			case "september":
			case "october":
			case "november":
			case "december":
				return [TokenType.MONTH, symbol];
			case "monday":
			case "tuesday":
			case "wednesday":
			case "thursday":
			case "friday":
			case "saturday":
			case "sunday":
				return [TokenType.DAY, symbol];
			default:
				return [TokenType.SYMBOL, symbol];
		}
	}

	getTokenTypeFromKeywordOrRune(
		rune: string
	): [TokenType, literalValue: any] {
		const runeLower = rune.toLowerCase();

		if (
			runeLower.startsWith("http://") ||
			runeLower.startsWith("https://") ||
			runeLower.startsWith("ftp://") ||
			runeLower.startsWith("ftps://")
		) {
			return [TokenType.URL, rune];
		}

		return [TokenType.RUNE, rune];
	}

	protected scanBackticks(): void {
		while (this.nextIs("`")) {
			this.next();
		}

		const backticks = this.getQueuedChars();

		if (backticks.length >= 3) {
			this.add(TokenType.CODE_START);

			if (this.nextIs(EOF)) {
				return;
			}

			if (!this.is(EOL)) {
				this.moveCursorToEndOfLine();
				this.add(TokenType.CODE_LANGUAGE);
				if (this.is(EOL)) {
					this.add(TokenType.BR);
				}

				this.nextUntil("```", EOF);
				this.tokenizeQueuedChars(CodeTokenizer);

				if (this.is("```")) {
					this.moveCursor(2).add(TokenType.CODE_END);
				}
			}
		} else {
			this.add(TokenType.BACKTICKS, backticks.length);
		}
	}

	/**
	 * Scans for a markdown comment.
	 * @example
	 *
	 * %% This is a comment
	 * %% This is also a comment with an endtag %%
	 * @returns void
	 */
	protected scanCommentPart(): void {
		if (!this.is("%%")) {
			return;
		}

		this.next();
		this.add(TokenType.PERCENT_PERCENT);
		this.nextOnLineUntil("%%");
		this.add(TokenType.COMMENT);

		if (this.is("%%")) {
			this.next();
			this.add(TokenType.PERCENT_PERCENT);
		}
	}

	/**
	 * Scans for a bullet list item.
	 * Scans for a checkbox list item.
	 *
	 * @example
	 * - foo <-- this is a bullet list item
	 * * foo <-- this is a bullet list item
	 * + foo <-- this is a bullet list item
	 * - [ ] foo <-- this is a checkbox list item
	 * - [x] foo <-- this is a checkbox list item
	 *
	 * @returns
	 */
	protected scanDashAtStartOfLine(): void {
		if (this.nextIs(" [ ]", " [x]")) {
			this.moveCursor(4);
			const x = this.getQueuedChars();
			this.add(TokenType.CHECKBOX, x[3] === "x");
		} else if (this.nextIs(SPACE)) {
			this.add(TokenType.BULLET);
		} else if (this.nextIs("--")) {
			this.moveCursor(2);
			if (this.nextIs(EOL)) {
				this.add(TokenType.HR);
			} else {
				this.scanSymbolOrRunePart();
			}
		}

		return this.scanLinePart();
	}

	/**
	 * Scan frontmatter
	 * @link https://jekyllrb.com/docs/front-matter/
	 */
	protected scanFrontmatter(): void {
		if (this.is("---")) {
			this.moveCursor(2).add(TokenType.FRONTMATTER_START);
			this.nextUntil("---", EOF);
			this.tokenizeQueuedChars(FrontMatterTokenizer);

			if (this.is("---")) {
				this.moveCursor(2).add(TokenType.FRONTMATTER_END);
			}
		}
	}

	/**
	 * Scans for a quote block that starts with a ">" character.
	 *
	 * @example
	 * > This is a quote block
	 * > > This is a nested quote block
	 */
	protected scanGreaterThanAtStartOfLine(): void {
		this.add(TokenType.HGTHAN);
		this.scanSpaces();

		if (this.is(">")) {
			this.scanGreaterThanAtStartOfLine();
		} else {
			this.scanLinePart();
		}
	}

	/**
	 * Scans for a hash tag at the start of a line.
	 *
	 * @example
	 * # This is a header
	 * ## This is a header
	 * ### This is a header
	 * #### This is a header
	 * ##### This is a header
	 * ###### This is a header
	 */
	protected scanHashAtStartOfLine(): void {
		if (!this.nextIs("#", " ")) {
			return this.scanLinePart();
		}

		this.nextOnLineUntil(SPACE);

		const hash = this.getQueuedChars();
		const hashSize = hash.length;

		if (hashSize > 6 || hash !== "#".repeat(hash.length)) {
			this.add(TokenType.RUNE);
		} else {
			this.add(TokenType.HHASH, hashSize);
		}

		return this.scanLinePart();
	}

	/**
	 * Scans for an HTML tag.
	 */
	protected scanHtmlTagPart(): void {
		if (!this.is("<")) {
			return;
		}

		this.nextOnLineUntil(">");
		if (this.nextIs(">")) {
			this.next();
			this.add(TokenType.HTML_TAG);
		} else {
			this.add(TokenType.RUNE);
		}
	}

	/**
	 * Scans for a "[" or "[[" token
	 */
	protected scanLeftBracketPart(): void {
		if (this.nextIs("[")) {
			this.next().add(TokenType.LL_BRACKET);
		} else {
			this.add(TokenType.L_BRACKET);
		}
	}

	/**
	 * Scans an entire line.
	 *
	 * `this.char` is the first character of the line.
	 *
	 * Methods suffixed with `StartOfLine()` are called by this method.
	 *
	 * @example
	 * - foo
	 * ^ this.char = "-"
	 *   this.scanDashAtStartOfLine() is called
	 */
	protected scanLine(): void {
		switch (this.char) {
			case "\n":
				return this.scanBrs();
			case "#":
				return this.scanHashAtStartOfLine();
			case "-":
			case "+":
			case "*":
				return this.scanDashAtStartOfLine();
			case ">":
				return this.scanGreaterThanAtStartOfLine();
			case "_":
				return this.scanUnderscoreAtStartOfLine();
			case " ":
			case "\t":
				return this.scanSpacesAtStartOfLine();
			default:
				if (isNumber(this.char)) {
					return this.scanNumberAtStartOfLine();
				} else {
					return this.scanLinePart();
				}
		}
	}

	/**
	 * Scans a line part.
	 * Unlike `scanLine()`, `this.char` might be any character on the line and not just the first character.
	 * We can presume that either
	 * (a.) `this.char` is the first letter of the line but the line does not start with a special token, or
	 * (b.) `this.char` is not the first letter of the line.
	 *
	 * @example
	 * - foo
	 *   ^ this.char = "f"
	 *     this.scanSymbolOrRunePart() is called
	 */
	protected scanLinePart(): void {
		while (!this.is(EOL)) {
			switch (this.char) {
				case "\\":
					this.next();
					this.add(TokenType.ESCAPE, this.char);
					break;
				case " ":
				case "\t":
					this.scanSpaces();
					break;
				case "[":
					this.scanLeftBracketPart();
					break;
				case "]":
					this.scanRightBracketPart();
					break;
				case "|":
					this.add(TokenType.PIPE);
					break;
				case "#":
					this.scanTagPart();
					break;
				case "*":
					this.scanRepeatedChar("*", TokenType.ASTERISKS);
					break;
				case "`":
					this.scanBackticks();
					break;
				case "$":
					this.scanRepeatedChar("$", TokenType.DOLLARS);
					break;
				case "~":
					if (this.nextIs("~")) {
						this.scanRepeatedChar("~", TokenType.TILDES);
					} else {
						this.scanSymbolOrRunePart();
					}
					break;
				case ":":
					if (this.nextIs(": ")) {
						this.moveCursor(1).add(TokenType.COLONS, 2);
					} else {
						this.scanSymbolOrRunePart();
					}
					break;
				case "(":
					this.add(TokenType.L_PAREN);
					break;
				case ")":
					this.add(TokenType.R_PAREN);
					break;
				case "!":
					if (this.nextIs("[[")) {
						this.moveCursor(2).add(TokenType.ILL_BRACKET);
					} else {
						this.scanSymbolOrRunePart();
					}
					break;
				case "-":
				case "+":
				case ".":
					if (isNumber(this.peek())) {
						this.scanNumberPart();
					} else {
						this.scanSymbolOrRunePart();
					}
					break;
				case "%":
					if (this.nextIs("%")) {
						this.scanCommentPart();
					} else {
						this.scanSymbolOrRunePart();
					}
				case "<":
					this.scanHtmlTagPart();
					break;
				default:
					if (isNumber(this.char)) {
						this.scanNumberPart();
					} else {
						this.scanSymbolOrRunePart();
					}
			}
		}
	}

	/**
	 * Scans a number at the start of a line.
	 *
	 * @example
	 * 1. foo <-- this is an ordered list item
	 * 124 foo <-- this is a number
	 */
	protected scanNumberAtStartOfLine(): void {
		while (isNumber(this.peek())) {
			this.next();
		}

		if (this.nextIs(".")) {
			this.next();
			this.add(TokenType.N_BULLET, parseInt(this.getQueuedChars(), 10));
		} else {
			this.scanNumberPart();
		}
	}

	/**
	 * Scans a number.
	 * Also scans for ordinal numbers.
	 *
	 * @example
	 * 1
	 * 1.0
	 * +1
	 * -1
	 * 1.0e1
	 * 1.0e+1
	 * 1.0e-1
	 * 1.0E1
	 * 1st
	 * 2nd
	 * 123rd
	 */
	protected scanNumberPart(): void {
		let tokenType = TokenType.NUMBER;

		while (isNumber(this.peek())) {
			this.next();
		}

		if (this.nextIs(".")) {
			this.next();
		}

		while (isNumber(this.peek())) {
			this.next();
		}

		if (this.nextIs("e", "E")) {
			this.next();
		}

		if (this.nextIs("+", "-")) {
			this.next();
		}

		while (isNumber(this.peek())) {
			this.next();
		}

		const floatValue = parseFloat(this.getQueuedChars());

		// check if number is an int
		if (floatValue % 1 === 0) {
			// get last digit
			const lastDigit = this.getQueuedChars().slice(-1);
			let isOrdinal = false;

			switch (lastDigit) {
				case "1":
					isOrdinal = this.nextIs("st");
					break;
				case "2":
					isOrdinal = this.nextIs("nd");
					break;
				case "3":
					isOrdinal = this.nextIs("rd");
					break;
				default:
					isOrdinal = this.nextIs("th");
					break;
			}

			if (isOrdinal) {
				this.moveCursor(2);
				tokenType = TokenType.ORDINAL;
			}
		}

		this.add(tokenType, floatValue);
	}

	/**
	 * Scans for the ] or ]] token
	 */
	protected scanRightBracketPart(): void {
		if (this.nextIs("]")) {
			this.next().add(TokenType.RR_BRACKET);
		} else {
			this.add(TokenType.R_BRACKET);
		}
	}

	/**
	 * Scans for tabs at the start of a line.
	 */
	protected scanSpacesAtStartOfLine(): void {
		this.scanRepeatedChar(SPACE, TokenType.TAB);
		this.scanLine();
	}

	/**
	 * Scans for a symbol or a rune.
	 *
	 * Symbols start with a letter, contain only letters, dashes and underscores, and end with a letter
	 * - foo
	 * - foo-bar
	 * - foo_bar
	 *
	 * Runes are a sequence of characters that contain punctuation not allowed in symbols
	 * - foo#
	 * - foo-bar#
	 * - fo!mar
	 */
	protected scanSymbolOrRunePart(): void {
		let isSymbol = isAlpha(this.char);

		while (!this.nextIs(RUNE_DELIMITERS)) {
			this.next();
			isSymbol =
				isSymbol &&
				(isAlphaNumeric(this.char) ||
					this.char === "-" ||
					this.char === "_");
		}

		const fullSymbol = this.getQueuedChars();
		isSymbol = isSymbol && isAlpha(fullSymbol[fullSymbol.length - 1]);

		if (isSymbol) {
			const [symbolType, literalValue] =
				this.getTokenTypeFromKeywordOrSymbol(fullSymbol);
			this.add(symbolType, literalValue);
		} else {
			const [symbolType, literalValue] =
				this.getTokenTypeFromKeywordOrRune(fullSymbol);
			this.add(symbolType, literalValue);
		}
		// this.add(isSymbol ? TokenType.SYMBOL : TokenType.RUNE);
	}

	/**
	 * Scans for a tag in the form of #foo
	 *
	 * @example
	 * #foo
	 * #foo-bar
	 * #foo_bar
	 */
	scanTagPart(): void {
		if (!this.is("#")) {
			return this.scanSymbolOrRunePart();
		}

		this.next();

		if (!(isAlpha(this.char) || this.char === "_" || this.char === "-")) {
			return this.scanSymbolOrRunePart();
		}

		while (
			isAlpha(this.peek()) ||
			isNumber(this.peek()) ||
			this.nextIs("_", "-")
		) {
			this.next();
		}

		this.add(TokenType.TAG, this.getQueuedChars().slice(1));
	}

	/**
	 * Scans for a ___ token at the start of a line.
	 * If any other characters are on the line, or if the underscore is not triplicated, then scan for a symbol or rune.
	 */
	scanUnderscoreAtStartOfLine(): void {
		if (this.nextIs("__")) {
			this.moveCursor(2);
			if (this.nextIs(EOL)) {
				this.moveCursor(2).add(TokenType.HR);
			} else {
				this.scanSymbolOrRunePart();
			}
		}
	}

	/**
	 * Scans the source string for tokens.
	 * @returns a list of tokens
	 */
	public tokenize(): Token[] {
		let overflowValve = 2000;
		this.scanFrontmatter();

		while (!this.is(EOF) && overflowValve-- > 0) {
			this.scanLine();
		}

		this.add(TokenType.EOF);
		return this.tokens;
	}
}

export function getTokens(source: string): Token[] {
	return new Tokenizer(source).tokenize();
}
