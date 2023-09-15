import { expect, test } from "vitest";
import { TokenType } from "./TokenType";
import { CodeTokenizer } from "./CodeTokenizer";
import { TokenTable } from "./TokenTable";
import { nl } from "./TokenizerBase";

test("scans code key", () => {
	const tokenizer = new CodeTokenizer("foo: bar");
	const tokens = tokenizer.tokenize();
	expect(tokens[0]?.type).toBe(TokenType.CODE_KEY);
});

test("scans code key lexeme", () => {
	const tokenizer = new CodeTokenizer("foo: bar");
	const tokens = tokenizer.tokenize();
	expect(tokens[0]?.lexeme).toBe("foo");
});

test("scans code value", () => {
	const tokenizer = new CodeTokenizer("foo: bar");
	const tokens = tokenizer.tokenize();
	expect(tokens[3]?.type).toBe(TokenType.CODE_VALUE);
});

test("scans code value lexeme", () => {
	const tokenizer = new CodeTokenizer("foo: bar");
	const tokens = tokenizer.tokenize();
	expect(tokens[3]?.lexeme).toBe("bar");
});

test("scans multiple lines of keys and values", () => {
	const tokenizer = new CodeTokenizer(nl("foo: bar", "baz: qux"));
	const tokens = tokenizer.tokenize();
	expect(tokens[8]?.type).toBe(TokenType.CODE_VALUE);
});

test("scans code source", () => {
	const tokenizer = new CodeTokenizer("console.log('hello')");
	const tokens = tokenizer.tokenize();
	expect(tokens[0]?.type).toBe(TokenType.CODE_SOURCE);
});

test("scans code source and code key", () => {
	const tokenizer = new CodeTokenizer(
		nl(
			"foo: bar",
			"moo: moo",
			"console.log('hello');",
			"console.log('world');"
		)
	);
	const tokens = tokenizer.tokenize();
	expect(tokens[0]?.type).toBe(TokenType.CODE_KEY);
	expect(tokens[10]?.type).toBe(TokenType.CODE_SOURCE);
	expect(tokens[12]?.type).toBe(TokenType.CODE_SOURCE);
});
