import { TokenType } from "./TokenType";

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
}
