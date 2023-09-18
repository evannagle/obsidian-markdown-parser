import { describe, it } from "vitest";
import { TokenType } from "../tokens/TokenType";
import { CodeBlockScanner } from "./CodeBlockScanner";
import { nl } from "./ScannerBase";
import { expectTokenType, expectToken } from "./ScannerTestHelpers";

describe("CodeBlockScanner", () => {
	it("scans code key", () => {
		const tokens = new CodeBlockScanner("foo: bar").scan();
		expectTokenType(tokens[0], TokenType.CODE_KEY);
	});

	it("scans code key lexeme", () => {
		const tokens = new CodeBlockScanner("foo: bar").scan();
		expectToken(tokens[0], { type: TokenType.CODE_KEY, lexeme: "foo" });
	});

	it("scans code value", () => {
		const tokens = new CodeBlockScanner("foo: bar").scan();
		expectTokenType(tokens[3], TokenType.CODE_VALUE);
	});

	it("scans code value lexeme", () => {
		const tokens = new CodeBlockScanner("foo: bar").scan();
		expectToken(tokens[3], { type: TokenType.CODE_VALUE, lexeme: "bar" });
	});

	it("scans multiple lines of keys and values", () => {
		const tokens = new CodeBlockScanner(nl("foo: bar", "baz: qux")).scan();
		expectTokenType(tokens[8], TokenType.CODE_VALUE);
	});

	it("scans code source", () => {
		const tokens = new CodeBlockScanner("console.log('hello')").scan();
		expectTokenType(tokens[0], TokenType.CODE_SOURCE);
	});

	it("scans code source and code key", () => {
		const tokens = new CodeBlockScanner(
			nl(
				"foo: bar",
				"moo: moo",
				"console.log('hello');",
				"console.log('world');"
			)
		).scan();

		expectTokenType(tokens[0], TokenType.CODE_KEY);
		expectTokenType(tokens[10], TokenType.CODE_SOURCE);
		expectTokenType(tokens[12], TokenType.CODE_SOURCE);
	});
});
