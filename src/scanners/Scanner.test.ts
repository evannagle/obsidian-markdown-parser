import { describe, it } from "vitest";
import { scanTokens } from "./Scanner";
import { nl } from "./ScannerBase";
import { TokenType } from "../tokens/TokenType";
import { expectTokenType, expectToken } from "./ScannerTestHelpers";

describe("Scanner", () => {
	it("employs FrontmatterTokenizer to scan frontmatter section", () => {
		const tokens = scanTokens(nl("---", "foo: bar", "baz: qux", "---"));
		expectTokenType(tokens[12], TokenType.FRONTMATTER_END);
	});

	it("scans header", () => {
		const tokens = scanTokens("### Foo Bar Hammer");
		expectTokenType(tokens[0], TokenType.HHASH);
	});

	it("scans tags", () => {
		const tokens = scanTokens("Foo #bar");
		expectTokenType(tokens[2], TokenType.TAG);
	});

	it("scans tag literal, which is the tag value minus the hash", () => {
		const tokens = scanTokens("Foo #bar");
		expectToken(tokens[2], { literal: "bar" });
	});

	it("scans tag with dash", () => {
		const tokens = scanTokens("Foo #bar-far");
		expectToken(tokens[2], { literal: "bar-far" });
	});

	it("scans tag with dash in first position", () => {
		const tokens = scanTokens("Foo #-bar");
		expectToken(tokens[2], { literal: "-bar" });
	});

	it("does not scan tag in the middle of a word", () => {
		const tokens = scanTokens("Foo bar#far");
		expectTokenType(tokens[2], TokenType.RUNE);
	});

	it("scans for asterisks", () => {
		const tokens = scanTokens("Foo *bar*");
		expectTokenType(tokens[2], TokenType.ASTERISK);
	});

	it("scans double asterisks", () => {
		const tokens = scanTokens("Foo **bar**");
		expectTokenType(tokens[2], TokenType.ASTERISK_ASTERISK);
	});

	it("scans double tildes", () => {
		const tokens = scanTokens("Foo ~~bar~~");
		expectTokenType(tokens[2], TokenType.TILDE_TILDE);
	});

	it("scans double tildes at end of word", () => {
		const tokens = scanTokens("Foo ~~bar~~");
		expectTokenType(tokens[4], TokenType.TILDE_TILDE);
	});

	it("scans tildes mid-word", () => {
		const tokens = scanTokens("Foo bar~~baz~~x");
		expectTokenType(tokens[3], TokenType.TILDE_TILDE);
	});

	it("scans double equals", () => {
		const tokens = scanTokens("Foo ==bar==");
		expectTokenType(tokens[2], TokenType.EQUALS_EQUALS);
	});

	it("scans for a simple number", () => {
		const tokens = scanTokens("Foo 1");
		expectToken(tokens[2], { type: TokenType.NUMBER, literal: 1 });
	});

	it("scans for a floating point number", () => {
		const tokens = scanTokens("Foo 1.0");
		expectToken(tokens[2], { type: TokenType.NUMBER, literal: 1.0 });
	});

	it("scans for a floating point number with a positive exponent", () => {
		const tokens = scanTokens("Foo 1.0e1");
		expectToken(tokens[2], { type: TokenType.NUMBER, literal: 10.0 });
	});

	it("scans for a negative number", () => {
		const tokens = scanTokens("Foo -1");
		expectToken(tokens[2], { type: TokenType.NUMBER, literal: -1 });
	});

	it("scans for a negative floating point number", () => {
		const tokens = scanTokens("Foo -1.0");
		expectToken(tokens[2], { type: TokenType.NUMBER, literal: -1.0 });
	});

	it("scans for a negative floating point number with a positive exponent", () => {
		const tokens = scanTokens("Foo -1.0e1");
		expectToken(tokens[2], { type: TokenType.NUMBER, literal: -10.0 });
	});

	it("scans for a positive number with a plus sign", () => {
		const tokens = scanTokens("Foo +1");
		expectToken(tokens[2], { type: TokenType.NUMBER, literal: 1 });
	});

	it("scans a number starting with a decimal point", () => {
		const tokens = scanTokens("Foo .123");
		expectToken(tokens[2], { type: TokenType.NUMBER, literal: 0.123 });
	});

	it("scans an ordinal number and sets literal value to an integer", () => {
		const tokens = scanTokens("Foo 1st");
		expectToken(tokens[2], { type: TokenType.ORDINAL, literal: 1 });
	});

	it("scans double colons", () => {
		const tokens = scanTokens("Foo:: bar");
		expectTokenType(tokens[1], TokenType.COLON_COLON);
	});

	it("ignores double colons in the middle of a word", () => {
		const tokens = scanTokens("Foo:bar");
		expectTokenType(tokens[0], TokenType.RUNE);
	});

	it("ignores single colons", () => {
		const tokens = scanTokens("Foo: bar");
		expectTokenType(tokens[0], TokenType.RUNE);
	});

	it("scans for ![[", () => {
		const tokens = scanTokens("Foo ![[thing one]]");
		expectTokenType(tokens[2], TokenType.ILL_BRACKET);
	});

	it("scans for escape sequences", () => {
		const tokens = scanTokens("Foo \\![[bar");
		expectTokenType(tokens[2], TokenType.ESCAPE);
	});

	it("escape literal is the escaped character", () => {
		const tokens = scanTokens("Foo \\![[bar");
		expectToken(tokens[2], { literal: "!" });
	});

	it("scans left paren", () => {
		const tokens = scanTokens("Foo (bar");
		expectTokenType(tokens[2], TokenType.L_PAREN);
	});

	it("scans right paren", () => {
		const tokens = scanTokens("Foo )bar");
		expectTokenType(tokens[2], TokenType.R_PAREN);
	});

	it("scans single backtick", () => {
		const tokens = scanTokens("Foo `bar");
		expectTokenType(tokens[2], TokenType.BACKTICK);
	});

	it("scans double backticks", () => {
		const tokens = scanTokens("Foo ``bar");
		expectTokenType(tokens[2], TokenType.BACKTICK);
		expectTokenType(tokens[3], TokenType.BACKTICK);
	});

	it("scans triple backticks", () => {
		const tokens = scanTokens("Foo ```bar");
		expectTokenType(tokens[2], TokenType.CODE_START);
	});

	it("scans double dollars", () => {
		const tokens = scanTokens("Foo $$bar");
		expectTokenType(tokens[2], TokenType.DOLLAR_DOLLAR);
	});

	it("scans single dollar", () => {
		const tokens = scanTokens("Foo $bar");
		expectTokenType(tokens[2], TokenType.DOLLAR);
	});

	it("scans for comments", () => {
		const tokens = scanTokens("here %% is a comment");
		expectTokenType(tokens[3], TokenType.COMMENT);
	});

	it("scans for comments end", () => {
		const tokens = scanTokens("here %% is a comment %% with more content");
		expectTokenType(tokens[3], TokenType.COMMENT);
	});

	it("scans comments and sets literal to the comment content", () => {
		const tokens = scanTokens("here %% is a comment %% with more content");
		expectToken(tokens[3], { literal: " is a comment " });
	});

	it("scans an html tag", () => {
		const tokens = scanTokens("here <div>");
		expectTokenType(tokens[2], TokenType.HTML_TAG);
	});

	it("scans an html tag with properties", () => {
		const tokens = scanTokens('here <div class="foo">');
		expectToken(tokens[2], { literal: '<div class="foo">' });
	});

	it("scans tabs at start of the line", () => {
		const tokens = scanTokens("\tFoo");
		expectTokenType(tokens[0], TokenType.TAB);
	});

	it("scans for hr at start of line", () => {
		const tokens = scanTokens(nl("xx", "---"));
		expectTokenType(tokens[2], TokenType.HR);
	});

	it("doesn't scan an hr if more content is on the line", () => {
		const tokens = scanTokens(nl("xx", "--- yy"));
		expectTokenType(tokens[2], TokenType.RUNE);
	});

	it("scans for a list item", () => {
		const tokens = scanTokens("- Foo");
		expectTokenType(tokens[0], TokenType.BULLET);
	});

	it("scans for a tab and a list item", () => {
		const tokens = scanTokens("\t\t- Foo");
		expectTokenType(tokens[0], TokenType.TAB);
		expectTokenType(tokens[1], TokenType.BULLET);
	});

	it("scans for a checkbox", () => {
		const tokens = scanTokens("- [ ] Foo");
		expectTokenType(tokens[0], TokenType.CHECKBOX);
	});

	it("scans for checked checkbox", () => {
		const tokens = scanTokens("- [x] Foo");
		expectTokenType(tokens[0], TokenType.CHECKBOX);
	});

	it("scans for checked checkbox, setting literal to true", () => {
		const tokens = scanTokens("- [x] Foo");
		expectToken(tokens[0], { literal: true });
	});

	it("scans for unchecked checkbox, setting literal to false", () => {
		const tokens = scanTokens("- [ ] Foo");
		expectToken(tokens[0], { literal: false });
	});

	it("does not scan for checkboxes mid-line", () => {
		const tokens = scanTokens("Foo - [ ]");
		expectTokenType(tokens[4], TokenType.L_BRACKET);
	});

	it("scans for a quote block", () => {
		const tokens = scanTokens("> Foo");
		expectTokenType(tokens[0], TokenType.HGTHAN);
	});

	it("scans for a double quote block", () => {
		const tokens = scanTokens("> > Foo");
		expectTokenType(tokens[0], TokenType.HGTHAN);
		expectTokenType(tokens[2], TokenType.HGTHAN);
	});

	it("scans for a numbered bullet", () => {
		const tokens = scanTokens("1. Foo");
		expectTokenType(tokens[0], TokenType.N_BULLET);
	});

	it("scans for a number if no period suffix is found", () => {
		const tokens = scanTokens("111 Foo");
		expectTokenType(tokens[0], TokenType.NUMBER);
	});

	it("scans a numbered bullet, setting literal to the number", () => {
		const tokens = scanTokens("123. Foo");
		expectToken(tokens[0], { literal: 123 });
	});

	it("scans a number if no period suffix is found, setting literal to the number", () => {
		const tokens = scanTokens("123 Foo");
		expectToken(tokens[0], { literal: 123 });
	});

	it("scans for an underscore hr", () => {
		const tokens = scanTokens("___");
		expectTokenType(tokens[0], TokenType.HR);
	});

	it("does not scan an hr if other content is on the line", () => {
		const tokens = scanTokens("___ h");
		expectTokenType(tokens[0], TokenType.RUNE);
	});

	it("employs a CodeTokenizer to scan code block for code language", () => {
		const tokens = scanTokens(nl("```js", "```"));
		expectToken(tokens[1], {
			type: TokenType.CODE_LANGUAGE,
			literal: "js",
		});
	});

	it("scans code block for code language with spaces", () => {
		const tokens = scanTokens(nl("```js berry", "```"));
		expectToken(tokens[1], {
			type: TokenType.CODE_LANGUAGE,
			literal: "js berry",
		});
	});

	it("scans to end of code block", () => {
		const tokens = scanTokens(
			nl(
				"```js",
				"foo: bar",
				"",
				"console.log('hello');",
				"console.log('world');",
				"```"
			)
		);

		expectTokenType(tokens[0], TokenType.CODE_START);
		expectTokenType(tokens[1], TokenType.CODE_LANGUAGE);
		expectTokenType(tokens[12], TokenType.CODE_END);
	});

	it("handles non-utf8 characters", () => {
		const tokens = scanTokens("foo 😄 bar");
		expectTokenType(tokens[2], TokenType.RUNE);
	});

	it("scans an https URL", () => {
		const tokens = scanTokens("foo https://google.com bar");
		expectTokenType(tokens[2], TokenType.URL);
	});

	it("scans an http URL", () => {
		const tokens = scanTokens("foo http://google.com bar");
		expectTokenType(tokens[2], TokenType.URL);
	});
});
