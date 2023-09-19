import { parseMarkdown } from "./Parser";
import { nl } from "src/scanners/ScannerBase";
import { describe, expect, it } from "vitest";
import {
	BookmarkStatement,
	CodeBlockStatement,
	FrontmatterItemStatement,
	FrontmatterListStatement,
	HtmlStatement,
	LatexBlockStatement,
	ListStatement,
	NumberedListItemStatement,
	NumberedListStatement,
	ParagraphStatement,
	QuoteStatement,
	RichTextStatement,
	TableStatement,
} from "./statements";
import { printStatement } from "src/visitors/DebugVisitor";
import { printTokens } from "src/tokens/TokenTable";
import { scanTokens } from "src/scanners/Scanner";
import { CodeBlockParser } from "./CodeBlockParser";

describe("Parser", () => {
	describe("symbols", () => {
		it("parses a group of symbols as a paragraph", () => {
			const parsed = parseMarkdown("foo bar baz");
			expect(parsed.lede?.parts[0]).toBeInstanceOf(ParagraphStatement);
		});

		it("parses symbols as plain text", () => {
			const parsed = parseMarkdown("foo bar baz");
			expect(parsed.lede?.parts[0]?.toString()).toBe("foo bar baz");
		});
	});

	describe("runes", () => {
		it("parses a group of runes as a paragraph", () => {
			const parsed = parseMarkdown("f$oo ba/r b;az");
			expect(parsed.lede?.parts[0]).toBeInstanceOf(ParagraphStatement);
		});

		it("parses runes as plain text", () => {
			const parsed = parseMarkdown("f$oo ba/r b;az");
			expect(parsed.lede?.parts[0]?.toString()).toBe("f$oo ba/r b;az");
		});
	});

	describe("numbers", () => {
		it("parses a group of numbers as a paragraph", () => {
			const parsed = parseMarkdown("123 456 789");
			expect(parsed.lede?.parts[0]).toBeInstanceOf(ParagraphStatement);
		});

		it("parses numbers as plain text", () => {
			const parsed = parseMarkdown("123");
			expect(parsed.lede?.parts[0]?.toString()).toBe("123");
		});
	});

	describe("spaces", () => {
		it("parses spaces as a paragraph", () => {
			const parsed = parseMarkdown("   ");
			expect(parsed.lede?.parts[0]).toBeInstanceOf(ParagraphStatement);
		});

		it("parses spaces as plain text", () => {
			const parsed = parseMarkdown("   ");
			expect(parsed.lede?.parts[0]?.toString()).toBe("   ");
		});
	});

	describe("tabs", () => {
		it("parses tabs as a paragraph", () => {
			const parsed = parseMarkdown("\t\t\t");
			expect(parsed.lede?.parts[0]).toBeInstanceOf(ParagraphStatement);
		});
	});

	describe("code blocks", () => {
		it("parses a code block", () => {
			const parsed = parseMarkdown(
				nl("```text", "thing1: one", "thing2: two", "", "foo", "```")
			);
			const codeblock = parsed.lede?.parts[0];
			expect(codeblock).toBeInstanceOf(CodeBlockStatement);
		});

		it("parses a latex code block", () => {
			// const tokens = scanTokens(nl("$$", "foo", "bar", "baz", "$$"));
			// printTokens(tokens);
			const parsed = parseMarkdown(nl("$$", "foo", "boo", "$$"));
			const paragraph = parsed.lede?.parts[0] as ParagraphStatement;
			const richtext = paragraph?.parts[0] as RichTextStatement;
			const latex = richtext?.parts[0];
			expect(latex).toBeInstanceOf(LatexBlockStatement);
		});
	});

	describe("html", () => {
		it("parses html", () => {
			const parsed = parseMarkdown(nl("<div>", "</div>"));
			const paragraph = parsed.lede?.parts[0] as ParagraphStatement;
			const richtext = paragraph?.parts[0] as RichTextStatement;
			const html = richtext?.parts[0];
			expect(html).toBeInstanceOf(HtmlStatement);
		});

		it("recursively parses html", () => {
			// const tokens = scanTokens(
			// 	nl("<div>", "<i>foo</i>", "</div> outside of div")
			// );
			// printTokens(tokens);
			const parsed = parseMarkdown(
				nl(
					"<div class='foo'>",
					"<i>foo</i>",
					"<div><div></div></div>",
					"<span>another</span>",
					"</div> outside of div"
				)
			);

			const paragraph = parsed.lede?.parts[0] as ParagraphStatement;
			const richtext = paragraph?.parts[0] as RichTextStatement;
			const html = richtext?.parts[0] as HtmlStatement;

			expect(html).toBeInstanceOf(HtmlStatement);
			expect(html.parts).toHaveLength(9);
		});
	});

	describe("lists", () => {
		it("parses a one-dimensional list", () => {
			const parsed = parseMarkdown(nl("- foo", "- bar", "- baz"));
			const list = parsed.lede?.parts[0] as ListStatement;
			expect(list.items.length).toBe(3);
		});

		it("parses a two-dimensional list", () => {
			const parsed = parseMarkdown(
				nl("- foo", "- bar", "  - moo", "  - bah", "- baz")
			);
			const list = parsed.lede?.parts[0] as ListStatement;
			expect(list.items.length).toBe(3);
			expect(list.items[1]?.list?.items.length).toBe(2);
		});

		it("parses a three-dimensional list", () => {
			const parsed = parseMarkdown(
				nl("- foo", "- bar", "  - moo", "    - bah", "  - zar", "- baz")
			);

			/**
			 * foo
			 * bar
			 * -- moo
			 * ---- bah
			 * -- zar
			 * baz
			 *
			 * [0] foo
			 * [1] bar
			 *   [0] moo
			 *    	[0] bah
			 *   [1] zar
			 * [2] moo
			 **/
			// printStatement(parsed.lede);
			const list = parsed.lede?.parts[0] as ListStatement;
			expect(list.items.length).toBe(3);
			expect(list.items[1]?.list?.items.length).toBe(2);
			expect(list.items[1]?.list?.items[0]?.list?.items.length).toBe(1);
			expect(
				list.items[1]?.list?.items[0]?.list?.items[0]?.content?.toString()
			).toBe("bah");
		});

		it("parses a two-dimensional list with a checkbox", () => {
			const parsed = parseMarkdown(nl("- tomorrow", "\t- [ ] foo"));
			const list = parsed.lede?.parts[0] as ListStatement;
			expect(list.items[0]?.list?.items.length).toBe(1);
		});

		it("parses a hybrid numbered an unnumbered list", () => {
			const parsed = parseMarkdown(
				nl("- foo", "- bar", "  1. moo", "  2. bah", "- baz")
			);

			const list = parsed.lede?.parts[0] as ListStatement;
			expect(list.items.length).toBe(3);
			expect(list.items[1]?.list).toBeInstanceOf(NumberedListStatement);
			expect(list.items[1]?.list?.items.length).toBe(2);
		});

		it("parses a hybrid numbered, unnumbered, and checkbox list", () => {
			const parsed = parseMarkdown(
				nl(
					"- foo",
					"- bar",
					"  1. moo",
					"  2. bah",
					"  - [ ] zar",
					"- baz"
				)
			);

			const list = parsed.lede?.parts[0] as ListStatement;
			expect(list.items.length).toBe(3);
			expect(list.items[1]?.list).toBeInstanceOf(NumberedListStatement);
			expect(list.items[1]?.list?.items.length).toBe(3);
		});
	});

	describe("numbered lists", () => {
		it("parses a one-dimensional numbered list", () => {
			const parsed = parseMarkdown(nl("1. foo", "2. bar", "3. baz"));
			const list = parsed.lede?.parts[0] as NumberedListStatement;
			expect(list.items.length).toBe(3);
		});

		it("parses a two-dimensional numbered list", () => {
			const parsed = parseMarkdown(
				nl("1. foo", "2. bar", "  1. moo", "  2. bah", "3. baz")
			);
			const list = parsed.lede?.parts[0] as NumberedListStatement;
			expect(list.items.length).toBe(3);
			expect(list.items[1]?.list?.items.length).toBe(2);
		});

		it("parses a three-dimensional numbered list", () => {
			const parsed = parseMarkdown(
				nl(
					"1. foo",
					"2. bar",
					"  1. moo",
					"    1. bah",
					"  2. zar",
					"3. baz"
				)
			);

			const list = parsed.lede?.parts[0] as NumberedListStatement;
			expect(list.items.length).toBe(3);
			expect(list.items[1]?.list?.items.length).toBe(2);
			expect(list.items[1]?.list?.items[0]?.list?.items.length).toBe(1);
			expect(
				list.items[1]?.list?.items[0]?.list?.items[0]?.content?.toString()
			).toBe("bah");
		});

		it("parses a hybrid numbered an unnumbered list", () => {
			const parsed = parseMarkdown(
				nl("1. foo", "2. bar", "  - moo", "  - bah", "3. baz")
			);

			const list = parsed.lede?.parts[0] as NumberedListStatement;
			expect(list.items.length).toBe(3);
			expect(list.items[1]?.list).toBeInstanceOf(ListStatement);
			expect(list.items[1]?.list?.items.length).toBe(2);
		});
	});

	describe("frontmatter", () => {
		it("parses frontmatter key", () => {
			const parsed = parseMarkdown(nl("---", "foo: bar", "---"));

			expect(parsed.frontmatter).toBeDefined();
			expect(parsed.frontmatter?.items.length).toBe(1);
			expect(parsed.frontmatter?.items[0]?.key.toString()).toBe("foo");
		});

		it("parses frontmatter value", () => {
			const parsed = parseMarkdown(nl("---", "foo: bar", "---"));
			const items = parsed.frontmatter
				?.items as FrontmatterItemStatement[];
			expect(items[0]?.value?.toString()).toBe("bar");
		});

		it("parses a frontmatter list value", () => {
			const parsed = parseMarkdown(
				nl("---", "foo:", "- bar", "- zar", "---")
			);

			const items = parsed.frontmatter
				?.items as FrontmatterItemStatement[];
			const list = items[0]?.value as FrontmatterListStatement;
			expect(list.items.length).toBe(2);
			expect(list.items[0]?.value?.toString()).toBe("bar");
			expect(list.items[1]?.value?.toString()).toBe("zar");
		});

		it("parses frontmatter lists and scalars", () => {
			const parsed = parseMarkdown(
				nl("---", "foo:", "- bar", "- zar", "coo: moo", "---")
			);

			expect(parsed.frontmatter?.items.length).toBe(2);
		});

		it("handles extra lines in frontmatter", () => {
			const parsed = parseMarkdown(
				nl("---", "foo: bar", "", "", "coo: moo", "", "", "---")
			);

			expect(parsed.frontmatter?.items.length).toBe(2);
		});

		it("handles tabs in front of list items", () => {
			const parsed = parseMarkdown(
				nl("---", "foo:", "  - bar", "  - zar", "---")
			);

			expect(parsed.frontmatter?.items.length).toBe(1);
			expect(parsed.frontmatter?.items[0]?.value?.toString()).toBe(
				nl("  - bar", "  - zar", "")
			);
		});

		it("handles trailing spaces in list items", () => {
			const parsed = parseMarkdown(
				nl("---", "foo: ", "- bar", "- zar", "coo: moo", "---")
			);

			expect(parsed.frontmatter?.items.length).toBe(2);
			expect(parsed.frontmatter?.items[0]?.value?.toString()).toBe(
				nl("- bar", "- zar", "")
			);
		});

		it("parses fugly frontmatter", () => {
			const parsed = parseMarkdown(
				nl(
					"---",
					"",
					"foo: bar",
					"zoo:",
					"",
					"moo: mar",
					"",
					"who:",
					"- one",
					" - two",
					" - three",
					"car:",
					"",
					"---"
				)
			);

			expect(parsed.frontmatter!.items).toHaveLength(5);
		});
	});

	describe("bookmarks", () => {
		it("parses a bookmark", () => {
			const parsed = parseMarkdown("here is a {{bookmark}}");
			const paragraph = parsed.lede?.parts[0] as ParagraphStatement;
			const richtext = paragraph?.parts[0] as RichTextStatement;
			const bookmark = richtext.parts[1];
			expect(bookmark).toBeInstanceOf(BookmarkStatement);
		});

		it("parses a bookmark with more than one symbol", () => {
			const parsed = parseMarkdown(
				"here is a {{bookmark with more symbols}}"
			);
			const paragraph = parsed.lede?.parts[0] as ParagraphStatement;
			const richtext = paragraph?.parts[0] as RichTextStatement;
			const bookmark = richtext.parts[1] as BookmarkStatement;
			expect(bookmark).toBeInstanceOf(BookmarkStatement);
			expect(bookmark.content.toString()).toBe(
				"bookmark with more symbols"
			);
		});
	});

	describe("sections", () => {
		it("parses nested sections", () => {
			const parsed = parseMarkdown(nl("## Section 1", "### Section 1.1"));
			expect(parsed.sections).toHaveLength(1);
			expect(parsed.sections[0]?.sections).toHaveLength(1);
		});

		it("parses more than one nested section", () => {
			const parsed = parseMarkdown(
				nl(
					"## Section 1",
					"### Section 1.1",
					"## Section 2",
					"### Section 2.2"
				)
			);
			expect(parsed.sections).toHaveLength(2);
			expect(parsed.sections[0]?.sections).toHaveLength(1);
			expect(parsed.sections[1]?.sections).toHaveLength(1);
		});

		it("parses section content", () => {
			const parsed = parseMarkdown(nl("# Section 1", "foo"));
			expect(parsed.sections[0]?.lede?.toString()).toBe("foo");
		});

		it("parses section content before subheading", () => {
			const parsed = parseMarkdown(
				nl("# Section 1", "foo", "## Section 2")
			);
			expect(parsed.sections[0]?.lede?.toString()).toBe("foo\n");
		});
	});

	describe("quotes", () => {
		it("parses a quote", () => {
			const parsed = parseMarkdown(nl("> foo"));
			const quote = parsed.lede?.parts[0] as QuoteStatement;
			expect(quote).toBeInstanceOf(QuoteStatement);
			expect(quote.content.toString()).toBe("foo");
		});
	});

	describe("tables", () => {
		it("parses a table", () => {
			const parsed = parseMarkdown(
				nl(
					"| foo | bar |",
					"| --- | --- |",
					"| moo | bah |",
					"| zar | coo |"
				)
			);

			const table = parsed.lede?.parts[0] as TableStatement;
			expect(table.rows.length).toBe(4);
			expect(table.rows[0]?.cells.length).toBe(2);
			expect(table.rows[1]?.cells.length).toBe(2);
			expect(table.rows[2]?.cells.length).toBe(2);
			expect(table.rows[3]?.cells.length).toBe(2);
		});
	});
});
