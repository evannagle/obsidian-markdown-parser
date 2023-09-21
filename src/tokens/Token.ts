import { TokenType, TokenTypeToLiteralMap } from "./TokenType";

export type TokenLiteral = string | number | boolean | null;

export class Token {
	constructor(
		public type: TokenType,
		public lexeme: string,
		public literal: TokenLiteral,
		public line: number,
		public column: number
	) {}

	public toString(): string {
		return this.lexeme;
	}

	public static create(
		type: TokenType,
		lexeme?: string,
		literal?: TokenLiteral
	): Token {
		if (lexeme === undefined) {
			lexeme = TokenTypeToLiteralMap.get(type);
			if (lexeme === undefined) {
				throw new Error(`No lexeme for token type ${type}`);
			}
		}

		return new Token(type, lexeme, literal || lexeme, 0, 0);
	}

	public static createBr(lineBreakCount = 1) {
		return Token.create(
			TokenType.BR,
			"\n".repeat(lineBreakCount),
			lineBreakCount
		);
	}

	public static createSpace(spaceCount = 1) {
		return Token.create(
			TokenType.SPACE,
			" ".repeat(spaceCount),
			spaceCount
		);
	}

	public static createTab(tabCount = 1) {
		return Token.create(TokenType.TAB, "  ".repeat(tabCount), tabCount);
	}

	public static toString(tokens: Token[]): string {
		return tokens.map((token) => token.lexeme).join("");
	}
}
