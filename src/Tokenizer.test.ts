import { expect, test } from "vitest";
import { Tokenizer, getTokens } from "./Tokenizer";
import { nl } from "./TokenizerBase";
import { TokenType } from "./TokenType";

test("employs FrontmatterTokenizer to scan frontmatter section", () => {
	const tokenizer = new Tokenizer(nl("---", "foo: bar", "baz: qux", "---"));
	const tokens = tokenizer.tokenize();
	expect(tokens[12]?.type).toBe(TokenType.FRONTMATTER_END);
});

test("scans header", () => {
	const tokens = getTokens("### Foo Bar Hammer");
	expect(tokens[0]?.type).toBe(TokenType.HHASH);
});

test("scans tags", () => {
	const tokens = getTokens("Foo #bar");
	expect(tokens[2]?.type).toBe(TokenType.TAG);
});

test("scans tag literal, which is the tag value minus the hash", () => {
	const tokens = getTokens("Foo #bar");
	expect(tokens[2]?.literal).toBe("bar");
});

test("scans tag with dash", () => {
	const tokens = getTokens("Foo #bar-far");
	expect(tokens[2]?.literal).toBe("bar-far");
});

test("scans tag with dash in first position", () => {
	const tokens = getTokens("Foo #-bar");
	expect(tokens[2]?.literal).toBe("-bar");
});

test("does not scan tag in the middle of a word", () => {
	const tokens = getTokens("Foo bar#far");
	expect(tokens[2]?.type).toBe(TokenType.RUNE);
});

test("scans for asterisks", () => {
	const tokens = getTokens("Foo *bar*");
	expect(tokens[2]?.type).toBe(TokenType.ASTERISKS);
});

test("scans asterisks literal, setting the value to the count of asterisks", () => {
	const tokens = getTokens("Foo ***bar***");
	expect(tokens[2]?.literal).toBe(3);
});

test("scans double tildes", () => {
	const tokens = getTokens("Foo ~~bar~~");
	expect(tokens[2]?.type).toBe(TokenType.TILDES);
});

test("scans double tildes at end of word", () => {
	const tokens = getTokens("Foo ~~bar~~");
	expect(tokens[4]?.type).toBe(TokenType.TILDES);
});

test("scans for a simple number", () => {
	const tokens = getTokens("Foo 1");
	expect(tokens[2]?.literal).toBe(1);
});

test("scans for a floating point number", () => {
	const tokens = getTokens("Foo 1.0");
	expect(tokens[2]?.literal).toBe(1.0);
});

test("scans for a floating point number with a positive exponent", () => {
	const tokens = getTokens("Foo 1.0e1");
	expect(tokens[2]?.literal).toBe(10.0);
});

test("scans for a negative number", () => {
	const tokens = getTokens("Foo -1");
	expect(tokens[2]?.literal).toBe(-1);
});

test("scans for a negative floating point number", () => {
	const tokens = getTokens("Foo -1.0");
	expect(tokens[2]?.literal).toBe(-1.0);
});

test("scans for a negative floating point number with a positive exponent", () => {
	const tokens = getTokens("Foo -1.0e1");
	expect(tokens[2]?.literal).toBe(-10.0);
});

test("scans for a positive number with a plus sign", () => {
	const tokens = getTokens("Foo +1");
	expect(tokens[2]?.literal).toBe(1);
});

test("scans a number starting with a decimal point", () => {
	const tokens = getTokens("Foo .123");
	expect(tokens[2]?.literal).toBe(0.123);
});

test("scans an ordinal number and sets literal value to an integer", () => {
	const tokens = getTokens("Foo 1st");
	expect(tokens[2]?.literal).toBe(1);
});

test("scans double colons", () => {
	const tokens = getTokens("Foo:: bar");
	expect(tokens[1]?.type).toBe(TokenType.COLONS);
});

test("ignores double colons in the middle of a word", () => {
	const tokens = getTokens("Foo:bar");
	expect(tokens[0]?.type).toBe(TokenType.RUNE);
});

test("ignores single colons", () => {
	const tokens = getTokens("Foo: bar");
	expect(tokens[0]?.type).toBe(TokenType.RUNE);
});

test("scans for ![[", () => {
	const tokens = getTokens("Foo ![[thing one]]");
	expect(tokens[2]?.type).toBe(TokenType.ILL_BRACKET);
});

test("scans for escape sequences", () => {
	const tokens = getTokens("Foo \\![[bar");
	expect(tokens[2]?.type).toBe(TokenType.ESCAPE);
});

test("escape literal is the escaped character", () => {
	const tokens = getTokens("Foo \\![[bar");
	expect(tokens[2]?.literal).toBe("!");
});

test("scans left paren", () => {
	const tokens = getTokens("Foo (bar");
	expect(tokens[2]?.type).toBe(TokenType.L_PAREN);
});

test("scans right paren", () => {
	const tokens = getTokens("Foo )bar");
	expect(tokens[2]?.type).toBe(TokenType.R_PAREN);
});

test("scans single backtick", () => {
	const tokens = getTokens("Foo `bar");
	expect(tokens[2]?.type).toBe(TokenType.BACKTICKS);
});

test("scans double backticks", () => {
	const tokens = getTokens("Foo ``bar");
	expect(tokens[2]?.type).toBe(TokenType.BACKTICKS);
});

test("scans triple backticks", () => {
	const tokens = getTokens("Foo ```bar");
	expect(tokens[2]?.type).toBe(TokenType.CODE_START);
});

test("scans double dollars", () => {
	const tokens = getTokens("Foo $$bar");
	expect(tokens[2]?.type).toBe(TokenType.DOLLARS);
});

test("scans single dollar", () => {
	const tokens = getTokens("Foo $bar");
	expect(tokens[2]?.type).toBe(TokenType.DOLLARS);
});

test("scans for comments", () => {
	const tokens = getTokens("here %% is a comment");
	expect(tokens[3]?.type).toBe(TokenType.COMMENT);
});

test("scans for comments end", () => {
	const tokens = getTokens("here %% is a comment %% with more content");
	expect(tokens[3]?.type).toBe(TokenType.COMMENT);
});

test("scans comments and sets literal to the comment content", () => {
	const tokens = getTokens("here %% is a comment %% with more content");
	expect(tokens[3]?.literal).toBe(" is a comment ");
});

test("scans an html tag", () => {
	const tokens = getTokens("here <div>");
	expect(tokens[2]?.type).toBe(TokenType.HTML_TAG);
});

test("scans an html tag with properties", () => {
	const tokens = getTokens('here <div class="foo">');
	expect(tokens[2]?.literal).toBe('<div class="foo">');
});

test("scans tabs at start of the line", () => {
	const tokens = getTokens("\tFoo");
	expect(tokens[0]?.type).toBe(TokenType.TAB);
});

test("scans for hr at start of line", () => {
	const tokens = getTokens(nl("xx", "---"));
	expect(tokens[2]?.type).toBe(TokenType.HR);
});

test("doesn't scan an hr if more content is on the line", () => {
	const tokens = getTokens(nl("xx", "--- yy"));
	expect(tokens[2]?.type).toBe(TokenType.RUNE);
});

test("scans for a list item", () => {
	const tokens = getTokens("- Foo");
	expect(tokens[0]?.type).toBe(TokenType.BULLET);
});

test("scans for a tab and a list item", () => {
	const tokens = getTokens("\t\t- Foo");
	expect(tokens[0]?.type).toBe(TokenType.TAB);
	expect(tokens[1]?.type).toBe(TokenType.BULLET);
});

test("scans for a checkbox", () => {
	const tokens = getTokens("- [ ] Foo");
	expect(tokens[0]?.type).toBe(TokenType.CHECKBOX);
});

test("scans for checked checkbox", () => {
	const tokens = getTokens("- [x] Foo");
	expect(tokens[0]?.type).toBe(TokenType.CHECKBOX);
});

test("scans for checked checkbox, setting literal to true", () => {
	const tokens = getTokens("- [x] Foo");
	expect(tokens[0]?.literal).toBe(true);
});

test("scans for unchecked checkbox, setting literal to false", () => {
	const tokens = getTokens("- [ ] Foo");
	expect(tokens[0]?.literal).toBe(false);
});

test("does not scan for checkboxes mid-line", () => {
	const tokens = getTokens("Foo - [ ]");
	expect(tokens[4]?.type).toBe(TokenType.L_BRACKET);
});

test("scans for a quote block", () => {
	const tokens = getTokens("> Foo");
	expect(tokens[0]?.type).toBe(TokenType.HGTHAN);
});

test("scans for a double quote block", () => {
	const tokens = getTokens("> > Foo");
	expect(tokens[0]?.type).toBe(TokenType.HGTHAN);
	expect(tokens[2]?.type).toBe(TokenType.HGTHAN);
});

test("scans for a numbered bullet", () => {
	const tokens = getTokens("1. Foo");
	expect(tokens[0]?.type).toBe(TokenType.N_BULLET);
});

test("scans for a number if no period suffix is found", () => {
	const tokens = getTokens("111 Foo");
	expect(tokens[0]?.type).toBe(TokenType.NUMBER);
});

test("scans a numbered bullet, setting literal to the number", () => {
	const tokens = getTokens("123. Foo");
	expect(tokens[0]?.literal).toBe(123);
});

test("scans a number if no period suffix is found, setting literal to the number", () => {
	const tokens = getTokens("123 Foo");
	expect(tokens[0]?.literal).toBe(123);
});

test("scans for an underscore hr", () => {
	const tokens = getTokens("___");
	expect(tokens[0]?.type).toBe(TokenType.HR);
});

test("does not scan an hr if other content is on the line", () => {
	const tokens = getTokens("___ h");
	expect(tokens[0]?.type).toBe(TokenType.RUNE);
});

test("returns month keyword", () => {
	const tokens = getTokens("january");
	expect(tokens[0]?.type).toBe(TokenType.MONTH);
});

test("returns day keyword", () => {
	const tokens = getTokens("monday");
	expect(tokens[0]?.type).toBe(TokenType.DAY);
});

test("emplys CodeTokenizer to scan code block for code language", () => {
	const tokens = getTokens(nl("```js", "```"));

	expect(tokens[1]?.type).toBe(TokenType.CODE_LANGUAGE);
	expect(tokens[1]?.literal).toBe("js");
});

test("scans code block for code language with spaces", () => {
	const tokens = getTokens(nl("```js berry", "```"));

	expect(tokens[1]?.literal).toBe("js berry");
});

test("scans to end of code block", () => {
	const tokens = getTokens(
		nl(
			"```js",
			"foo: bar",
			"",
			"console.log('hello');",
			"console.log('world');",
			"```"
		)
	);

	expect(tokens[12]?.type).toBe(TokenType.CODE_END);
});

test("handles non-utf8 characters", () => {
	const tokens = getTokens("foo 😄 bar");
	expect(tokens[2]?.type).toBe(TokenType.RUNE);
});

test("scans an https URL", () => {
	const tokens = getTokens("foo https://google.com bar");
	expect(tokens[2]?.type).toBe(TokenType.URL);
});

test("scans an http URL", () => {
	const tokens = getTokens("foo http://google.com bar");
	expect(tokens[2]?.type).toBe(TokenType.URL);
});
