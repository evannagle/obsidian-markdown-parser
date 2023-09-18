import { Token } from "src/tokens/Token";
import { TokenType } from "src/tokens/TokenType";
import { expect } from "vitest";

export function expectToken(token: Token | undefined, expected: any) {
	expect(token).toBeDefined();

	token = token as Token;

	if (expected.type) {
		expect(token.type).toBe(expected.type);
	}
	if (expected.literal) {
		expect(token.literal).toBe(expected.literal);
	}
	if (expected.lexeme) {
		expect(token.lexeme).toBe(expected.lexeme);
	}
}

export function expectTokenType(token: Token | undefined, expected: TokenType) {
	expect(token).toBeDefined();
	token = token as Token;
	expect(token.type).toBe(expected);
}
