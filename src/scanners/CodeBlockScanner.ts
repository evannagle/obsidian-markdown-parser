import { Token } from "../tokens/Token";
import { TokenType } from "../tokens/TokenType";
import { EOF, ScannerBase } from "./ScannerBase";

export class CodeBlockScanner extends ScannerBase {
	/**
	 * Scans key-value pairs at the top of a code block.
	 *
	 * @example
	 * ```
	 * foo: bar <-- this is a key-value pair
	 * moo: moo <-- this is a key-value pair
	 * ```
	 * @returns
	 */
	protected scanKeyValues(): void {
		this.nextOnLineUntil(":");

		if (this.nextIs(": ")) {
			this.add(TokenType.CODE_KEY);
			this.add(TokenType.COLON);
			this.scanSpaces();
			this.moveCursorToEndOfLine();
			this.add(TokenType.CODE_VALUE);
			this.scanBrs();
			this.scanKeyValues();
		} else {
			return;
		}
	}

	/**
	 * Scans the source string for code source.
	 *
	 * @example
	 * ```
	 * console.log('hello'); <-- this is code source
	 * console.log('world'); <-- this is code source
	 * ```
	 */
	protected scanSource(): void {
		while (!this.is(EOF)) {
			this.moveCursorToEndOfLine();
			this.add(TokenType.CODE_SOURCE);
			this.scanBrs();
		}
	}

	/**
	 * Scans a code block and returns a list of tokens.
	 * @returns a list of tokens
	 */
	public scan(): Token[] {
		this.scanKeyValues();
		this.scanSource();
		return this.tokens;
	}
}
