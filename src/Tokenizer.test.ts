import { expect, test } from "vitest";
import { Tokenizer } from "./Tokenizer";
import { TokenType } from "./TokenType";
import { TokenTable } from "./TokenTable";

test("scans a header lexeme", () => {
	const tokenizer = new Tokenizer("## Section 1");
	const tokens = tokenizer.getTokens();
	expect(tokens[0]?.type).toBe(TokenType.HEADER);
});

test("scans a tag in a header", () => {
	const tokenizer = new Tokenizer("## Section #tag");
	const tokens = tokenizer.getTokens();
	expect(tokens[2]?.type).toBe(TokenType.TAG);
});

test("scans for tabs", () => {
	const tokenizer = new Tokenizer("\tone");
	const tokens = tokenizer.getTokens();
	expect(tokens[0]?.type).toBe(TokenType.TAB);
});

test("scans for a number", () => {
	const tokenizer = new Tokenizer("1");
	const tokens = tokenizer.getTokens();
	expect(tokens[0]?.type).toBe(TokenType.NUMBER);
});

test("scans for a number in a sentence", () => {
	const tokenizer = new Tokenizer("here is a 1 in a sentence");
	const tokens = tokenizer.getTokens();

	expect(tokens[1]?.type).toBe(TokenType.NUMBER);
});

test("scans for tabs as spaces", () => {
	const tokenizer = new Tokenizer(" one");
	const tokens = tokenizer.getTokens();
	expect(tokens[0]?.type).toBe(TokenType.TAB);
});

test("sets tab literal to the number of tabs", () => {
	const tokenizer = new Tokenizer("\t\tone");
	const tokens = tokenizer.getTokens();
	expect(tokens[0]?.literal).toBe(2);
});

test("sets tab literal to the number of tabs as spaces", () => {
	const tokenizer = new Tokenizer("  one");
	const tokens = tokenizer.getTokens();
	expect(tokens[0]?.literal).toBe(2);
});

test("scans a header literal, setting the value to the count of hashes", () => {
	const tokenizer = new Tokenizer("## Section 1");
	const tokens = tokenizer.getTokens();
	expect(tokens[0]?.literal).toBe(2);
});

test("scans the EOF", () => {
	const tokenizer = new Tokenizer("");
	const tokens = tokenizer.getTokens();
	expect(tokens[0]?.type).toBe(TokenType.EOF);
});

test("the EOF has a \\0 literal", () => {
	const tokenizer = new Tokenizer("## Section");
	const tokens = tokenizer.getTokens();
	expect(tokens[2]?.literal).toBe("\0");
});

test("scans for left bracket", () => {
	const tokens = new Tokenizer("[link]").getTokens();
	expect(tokens[0]?.type).toBe(TokenType.L_BRACKET);
});

test("scans for right bracket", () => {
	const tokens = new Tokenizer("[link]").getTokens();
	expect(tokens[2]?.type).toBe(TokenType.R_BRACKET);
});

test("scans for double left brackets", () => {
	const tokens = new Tokenizer("[[link]]").getTokens();
	expect(tokens[0]?.type).toBe(TokenType.LL_BRACKET);
});

test("scans for double right brackets", () => {
	const tokens = new Tokenizer("[[link]]").getTokens();
	expect(tokens[2]?.type).toBe(TokenType.RR_BRACKET);
});

test("scans for tags", () => {
	const tokens = new Tokenizer("here is a #tag in a sentence").getTokens();
	expect(tokens[1]?.type).toBe(TokenType.TAG);
});

test("scans for left parenthesis", () => {
	const tokens = new Tokenizer("(link)").getTokens();
	expect(tokens[0]?.type).toBe(TokenType.L_PAREN);
});

test("scans for double stars", () => {
	const tokens = new Tokenizer("**link**").getTokens();
	expect(tokens[0]?.type).toBe(TokenType.STAR_STAR);
});

test("scans for stars mid-sentence", () => {
	const tokens = new Tokenizer(
		"here is a **star** in a sentence"
	).getTokens();
	expect(tokens[1]?.type).toBe(TokenType.STAR_STAR);
});

test("scans for double underscores", () => {
	const tokens = new Tokenizer("__link__").getTokens();
	expect(tokens[0]?.type).toBe(TokenType.DUNDERSCORE);
});

test("scans for bullets", () => {
	const tokens = new Tokenizer("- bullet").getTokens();
	expect(tokens[0]?.type).toBe(TokenType.BULLET);
});

test("scans for numbered bullets", () => {
	const tokens = new Tokenizer("11. bullet").getTokens();
	expect(tokens[0]?.type).toBe(TokenType.N_BULLET);
});

test("returns number of numbered bullet as literal", () => {
	const tokens = new Tokenizer("112. bullet").getTokens();
	expect(tokens[0]?.literal).toBe(112);
});

test("scans for double colon", () => {
	const tokens = new Tokenizer("foo:: bar").getTokens();
	expect(tokens[1]?.type).toBe(TokenType.COLON_COLON);
});

test("scans for checkbox", () => {
	const tokens = new Tokenizer("- [ ] checkbox").getTokens();
	expect(tokens[0]?.type).toBe(TokenType.CHECKBOX);
});

test("scans for completed checkbox", () => {
	const tokens = new Tokenizer("- [x] checkbox").getTokens();
	expect(tokens[0]?.type).toBe(TokenType.CHECKBOX);
});

test("completed checkbox has literal value of true", () => {
	const tokens = new Tokenizer("- [x] checkbox").getTokens();
	expect(tokens[0]?.literal).toBe(true);
});

test("scans for backticks", () => {
	const tokens = new Tokenizer("`code`").getTokens();
	expect(tokens[0]?.type).toBe(TokenType.BACKTICK);
});

test("scans for mid-word backticks", () => {
	const tokens = new Tokenizer("foo`bar`").getTokens();
	expect(tokens[1]?.type).toBe(TokenType.BACKTICK);
});

test("scans for triple backticks", () => {
	const tokens = new Tokenizer("```code```").getTokens();
	expect(tokens[0]?.type).toBe(TokenType.TRIPLE_BACKTICK);
});

test("scans for a triple dash", () => {
	const tokens = new Tokenizer("---").getTokens();
	expect(tokens[0]?.type).toBe(TokenType.TRIPLE_DASH);
});

test("scans for a dollar", () => {
	const tokens = new Tokenizer("$").getTokens();
	expect(tokens[0]?.type).toBe(TokenType.DOLLAR);
});

test("scans for a mid-word dollar", () => {
	const tokens = new Tokenizer("foo$bar").getTokens();
	expect(tokens[1]?.type).toBe(TokenType.DOLLAR);
});

test("scans for triple dollar", () => {
	const tokens = new Tokenizer("$$$").getTokens();
	expect(tokens[0]?.type).toBe(TokenType.TRIPLE_DOLLAR);
});

test("scans for a ![[ bracket", () => {
	const tokens = new Tokenizer("![[link]]").getTokens();
	expect(tokens[0]?.type).toBe(TokenType.ILL_BRACKET);
});

test("scans for a quote", () => {
	const tokens = new Tokenizer("> quote").getTokens();
	expect(tokens[0]?.type).toBe(TokenType.QUOTE);
});

test("does not scan a quote when no space is present", () => {
	const tokens = new Tokenizer(">quote").getTokens();
	expect(tokens[0]?.type).not.toBe(TokenType.QUOTE);
});

test("scans for a bar", () => {
	const tokens = new Tokenizer("|").getTokens();
	expect(tokens[0]?.type).toBe(TokenType.BAR);
});

test("scans for a task", () => {
	const tokens = new Tokenizer("- [ ] pick up something").getTokens();
	expect(tokens[0]?.type).toBe(TokenType.CHECKBOX);
});

test("scans for a table row", () => {
	const row = new Tokenizer("| foo | 1 | baz |").getTokens();

	expect(row[0]?.type).toBe(TokenType.BAR);
	expect(row[1]?.type).toBe(TokenType.TEXT);
});

test("scans numbers in a table row", () => {
	const row = new Tokenizer("| foo | 1 | baz |").getTokens();

	expect(row[3]?.type).toBe(TokenType.NUMBER);
});

test("scans multi-word text in a table row", () => {
	const row = new Tokenizer("| foo | 1 | baz bar 123 |").getTokens();
	expect(row[6]?.type).toBe(TokenType.TEXT);
});

test("respects escape sequences", () => {
	const tokens = new Tokenizer("\\#").getTokens();
	expect(tokens[0]?.type).toBe(TokenType.ESCAPE);
});

test("respects escaped bar in a table row", () => {
	const row = new Tokenizer("| a\\| |").getTokens();
	expect(row[2]?.type).toBe(TokenType.ESCAPE);
});

test("respects lone escaped bar in a table row", () => {
	const row = new Tokenizer("| \\| |").getTokens();
	expect(row[1]?.literal).toBe("\\|");
});

test("parses empty code block", () => {
	const tokens = new Tokenizer(["```", "```"].join("\n")).getTokens();
	expect(tokens.length).toBe(4);
});

test("parses code block language", () => {
	const tokens = new Tokenizer(["```ad-info", "```"].join("\n")).getTokens();
	expect(tokens[1]?.type).toBe(TokenType.CODE_SYMBOL);
});

test("parses code block language lexeme", () => {
	const tokens = new Tokenizer(["```ad-info", "```"].join("\n")).getTokens();
	expect(tokens[1]?.lexeme).toBe("ad-info");
});

test("parses code text", () => {
	const tokens = new Tokenizer(
		["```ad-info", "code, code", "more code", "```"].join("\n")
	).getTokens();

	expect(tokens[5]?.type).toBe(TokenType.CODE);
});

test("parses code text, multiple line breaks", () => {
	const tokens = new Tokenizer(
		["```ad-info", "code, code", "bode fode", "", "mo mo", "```"].join("\n")
	).getTokens();
	expect(tokens[3]?.type).toBe(TokenType.CODE);
});

test("parses code metadata symbol", () => {
	const tokens = new Tokenizer(
		["```ad-info", "foo: bar", "", "code, code", "more code", "```"].join(
			"\n"
		)
	).getTokens();
	expect(tokens[3]?.type).toBe(TokenType.CODE_SYMBOL);
});

test("parses code metadata value type", () => {
	const tokens = new Tokenizer(
		[
			"```ad-info",
			"foo: bar code mode",
			"",
			"code, code",
			"more code",
			"```",
		].join("\n")
	).getTokens();

	expect(tokens[6]?.type).toBe(TokenType.TEXT);
});

test("parses code metadata value lexeme", () => {
	const tokens = new Tokenizer(
		[
			"```ad-info",
			"foo: bar code mode",
			"",
			"code, code",
			"more code",
			"```",
		].join("\n")
	).getTokens();

	expect(tokens[6]?.lexeme).toBe("bar code mode");
});

test("parses multiple metadata values", () => {
	const tokens = new Tokenizer(
		[
			"```ad-info",
			"xar: jam bam",
			"foo: bar code mode",
			"",
			"code, code",
			"more code",
			"and more code",
			"",
			"and a line break",
			"```",
		].join("\n")
	).getTokens();

	expect(tokens[11]?.lexeme).toBe("bar code mode");
});

test("parses metadata symbol and value with no spaces", () => {
	const tokens = new Tokenizer(
		["```ad-info", "xar:jam bam", "```"].join("\n")
	).getTokens();

	expect(tokens[3]?.type).toBe(TokenType.CODE);
});

test("parses metadata symbol with multiple spaces", () => {
	const tokens = new Tokenizer(
		["```ad-info", "xar:    jam bam", "```"].join("\n")
	);

	expect(tokens.getTokens()[6]?.type).toBe(TokenType.TEXT);
});

test("parses a month keyword", () => {
	const tokens = new Tokenizer("january").getTokens();
	expect(tokens[0]?.type).toBe(TokenType.MONTH);
});

test("parses a day keyword", () => {
	const tokens = new Tokenizer("monday").getTokens();
	expect(tokens[0]?.type).toBe(TokenType.DAY);
});
