import { FrontMatterScanner } from "./FrontmatterScanner";
import { describe, it, expect } from "vitest";
import { TokenType } from "../tokens/TokenType";
import { nl } from "./ScannerBase";
import { expectTokenType, expectToken } from "./ScannerTestHelpers";

describe("FrontmatterScanner", () => {
	it("scans empty frontmatter", () => {
		const tokens = new FrontMatterScanner("").scan();
		expect(tokens.length).toBe(0);
	});

	it("scans frontmatter key", () => {
		const tokens = new FrontMatterScanner("foo: bar").scan();
		expectTokenType(tokens[0], TokenType.FRONTMATTER_KEY);
	});

	it("scans frontmatter value", () => {
		const tokens = new FrontMatterScanner("foo: bar").scan();
		expectTokenType(tokens[3], TokenType.FRONTMATTER_VALUE);
	});

	it("scans frontmatter key lexeme", () => {
		const tokens = new FrontMatterScanner("foo: bar").scan();
		expectToken(tokens[0], {
			type: TokenType.FRONTMATTER_KEY,
			lexeme: "foo",
		});
	});

	it("scans frontmatter value lexeme", () => {
		const tokens = new FrontMatterScanner("foo: bar").scan();
		expectToken(tokens[3], {
			type: TokenType.FRONTMATTER_VALUE,
			lexeme: "bar",
		});
	});

	it("scans frontmater value lexeme with internal spaces", () => {
		const tokens = new FrontMatterScanner("foo: bar baz").scan();
		expectToken(tokens[3], {
			type: TokenType.FRONTMATTER_VALUE,
			lexeme: "bar baz",
		});
	});

	it("scans frontmatter value lexeme while omitting leading spaces", () => {
		const tokens = new FrontMatterScanner("foo:   bar").scan();
		expectToken(tokens[3], {
			type: TokenType.FRONTMATTER_VALUE,
			lexeme: "bar",
		});
	});

	it("scans frontmatter value lexeme with no spaces", () => {
		const tokens = new FrontMatterScanner("foo:bar").scan();
		expectToken(tokens[2], {
			type: TokenType.FRONTMATTER_VALUE,
			lexeme: "bar",
		});
	});

	it("scans multiple frontmatter keys", () => {
		const tokens = new FrontMatterScanner(
			nl("foo: bar", "baz: qux")
		).scan();
		expectTokenType(tokens[8], TokenType.FRONTMATTER_VALUE);
	});

	it("scans multiple frontmatter key lexemes", () => {
		const tokens = new FrontMatterScanner(
			nl("foo: bar", "baz: qux")
		).scan();
		expectToken(tokens[8], {
			type: TokenType.FRONTMATTER_VALUE,
			lexeme: "qux",
		});
	});

	it("scans multiple frontmater keys with blank lines", () => {
		const tokens = new FrontMatterScanner(
			nl("foo: bar", "", "baz: qux")
		).scan();
		expectTokenType(tokens[8], TokenType.FRONTMATTER_VALUE);
	});

	it("scans list items", () => {
		const tokens = new FrontMatterScanner(
			nl("one:", "- foo", "- bar", "qux: one", "baz: jam")
		).scan();
		expectTokenType(tokens[3], TokenType.FRONTMATTER_BULLET);
	});

	it("scans list items with extra spaces before bullets", () => {
		const tokens = new FrontMatterScanner(
			nl("one:", "  - foo", "  - bar", "qux: one", "baz: jam")
		).scan();
		expectTokenType(tokens[4], TokenType.FRONTMATTER_BULLET);
	});

	it("scans list items with extra spaces after bullets", () => {
		const tokens = new FrontMatterScanner(
			nl("one:", "-  foo", "-  bar", "qux: one", "baz: jam")
		).scan();
		expectTokenType(tokens[3], TokenType.FRONTMATTER_BULLET);
	});
});
