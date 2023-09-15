import { FrontMatterTokenizer } from "./FrontmatterTokenizer";
import { expect, test } from "vitest";
import { TokenType } from "./TokenType";
import { nl } from "./TokenizerBase";
import { TokenTable } from "./TokenTable";

test("scans empty frontmatter", () => {
	const tokenizer = new FrontMatterTokenizer("");
	const tokens = tokenizer.tokenize();
	expect(tokens.length).toBe(0);
});

test("scans frontmatter key", () => {
	const tokenizer = new FrontMatterTokenizer("foo: bar");
	const tokens = tokenizer.tokenize();
	expect(tokens[0]?.type).toBe(TokenType.FRONTMATTER_KEY);
});

test("scans frontmatter value", () => {
	const tokenizer = new FrontMatterTokenizer("foo: bar");
	const tokens = tokenizer.tokenize();
	expect(tokens[3]?.type).toBe(TokenType.FRONTMATTER_VALUE);
});

test("scans frontmatter key lexeme", () => {
	const tokenizer = new FrontMatterTokenizer("foo: bar");
	const tokens = tokenizer.tokenize();
	expect(tokens[0]?.lexeme).toBe("foo");
});

test("scans frontmatter value lexeme", () => {
	const tokenizer = new FrontMatterTokenizer("foo: bar");
	const tokens = tokenizer.tokenize();
	expect(tokens[3]?.lexeme).toBe("bar");
});

test("scans frontmater value lexeme with internal spaces", () => {
	const tokenizer = new FrontMatterTokenizer("foo: bar baz");
	const tokens = tokenizer.tokenize();
	expect(tokens[3]?.lexeme).toBe("bar baz");
});

test("scans frontmatter value lexeme while omitting leading spaces", () => {
	const tokenizer = new FrontMatterTokenizer("foo:   bar");
	const tokens = tokenizer.tokenize();
	expect(tokens[3]?.lexeme).toBe("bar");
});

test("scans frontmatter value lexeme with no spaces", () => {
	const tokenizer = new FrontMatterTokenizer("foo:bar");
	const tokens = tokenizer.tokenize();
	expect(tokens[2]?.lexeme).toBe("bar");
});

test("scans multiple frontmatter keys", () => {
	const tokenizer = new FrontMatterTokenizer(nl("foo: bar", "baz: qux"));
	const tokens = tokenizer.tokenize();
	expect(tokens[8]?.type).toBe(TokenType.FRONTMATTER_VALUE);
});

test("scans multiple frontmatter key lexemes", () => {
	const tokenizer = new FrontMatterTokenizer(nl("foo: bar", "baz: qux"));
	const tokens = tokenizer.tokenize();
	expect(tokens[8]?.lexeme).toBe("qux");
});

test("scans multiple frontmater keys with blank lines", () => {
	const tokenizer = new FrontMatterTokenizer(nl("foo: bar", "", "baz: qux"));
	const tokens = tokenizer.tokenize();
	expect(tokens[8]?.type).toBe(TokenType.FRONTMATTER_VALUE);
});

test("scans list items", () => {
	const tokenizer = new FrontMatterTokenizer(
		nl("one:", "- foo", "- bar", "qux: one", "baz: jam")
	);
	const tokens = tokenizer.tokenize();
	expect(tokens[3]?.type).toBe(TokenType.FRONTMATTER_BULLET);
});

test("scans list items with extra spaces before bullets", () => {
	const tokenizer = new FrontMatterTokenizer(
		nl("one:", "  - foo", "  - bar", "qux: one", "baz: jam")
	);
	const tokens = tokenizer.tokenize();
	expect(tokens[4]?.type).toBe(TokenType.FRONTMATTER_BULLET);
});

test("scans list items with extra spaces after bullets", () => {
	const tokenizer = new FrontMatterTokenizer(
		nl("one:", "-  foo", "-  bar", "qux: one", "baz: jam")
	);
	const tokens = tokenizer.tokenize();
	expect(tokens[3]?.type).toBe(TokenType.FRONTMATTER_BULLET);
});
