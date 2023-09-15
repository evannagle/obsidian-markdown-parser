import { Token } from "./Token";
import { TokenType } from "./TokenType";
import { DASH, EOF, EOL, SPACE, TokenizerBase } from "./TokenizerBase";

export class FrontMatterTokenizer extends TokenizerBase {
	constructor(source: string) {
		super(source);
	}

	/**
	 * Scans a frontmatter list item.
	 *
	 * @example
	 * ---
	 * foo:
	 *  - bar <-- this is a list item
	 *  - baz <-- this is a list item
	 * ---
	 */
	protected scanListItem(): void {
		this.add(TokenType.FRONTMATTER_BULLET);
		this.scanSpaces();
		this.moveCursorToEndOfLine();
		this.add(TokenType.FRONTMATTER_VALUE);
	}

	/**
	 * Scans a frontmatter key-value pair.
	 *
	 * @example
	 * ---
	 * foo: bar <-- this is a key-value pair, where "foo" is the key and "bar" is the value
	 * ---
	 */
	protected scanKeyValue(): void {
		this.nextOnLineUntil(":");
		this.add(TokenType.FRONTMATTER_KEY);

		if (this.is(":")) {
			this.add(TokenType.COLON);
		}

		this.scanSpaces();

		if (!this.is(EOL)) {
			this.moveCursorToEndOfLine();
			this.add(TokenType.FRONTMATTER_VALUE);
		}

		this.scanBrs();
	}

	/**
	 * Scans the source string and returns a list of tokens.
	 * @returns a list of tokens
	 */
	public tokenize(): Token[] {
		while (!this.is(EOF)) {
			if (this.is(EOL)) {
				this.add(TokenType.BR);
			} else if (this.is(DASH)) {
				this.scanListItem();
			} else if (this.is(SPACE)) {
				this.scanSpaces();
			} else {
				this.scanKeyValue();
			}
		}

		return this.tokens;
	}
}
