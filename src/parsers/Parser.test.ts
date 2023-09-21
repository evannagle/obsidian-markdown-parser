import { parse, parseMarkdownDoc } from "./Parser";
import { nl } from "src/scanners/ScannerBase";
import { describe, expect, it } from "vitest";
import {
	BoldStatement,
	BookmarkStatement,
	CodeStatement,
	ContentStatement,
	ExternalLinkStatement,
	FrontmatterItemStatement,
	FrontmatterListStatement,
	FrontmatterStatement,
	HighlightStatement,
	HrStatement,
	HtmlStatement,
	ImageLinkStatement,
	InlineCodeStatement,
	InlineLatexStatement,
	InternalLinkStatement,
	ItalicStatement,
	LatexStatement,
	ListStatement,
	MetadataListStatement,
	MetadataItemStatement,
	MetadataTagStatement,
	NumberedListStatement,
	ParagraphStatement,
	PlainTextStatement,
	QuoteStatement,
	RichTextStatement,
	StrikethroughStatement,
	TableStatement,
} from "./statements";
import { printStatement } from "src/visitors/DebugVisitor";

describe("Parser", () => {
	describe("bookmarks", () => {
		it("parses a bookmark", () => {
			const parsed = parseMarkdownDoc("here is a {{bookmark}}");
			const paragraph = parsed.lede?.parts[0] as ParagraphStatement;
			const bookmark = paragraph.content.parts[1];
			expect(bookmark).toBeInstanceOf(BookmarkStatement);
		});

		it("parses a bookmark with more than one symbol", () => {
			const parsed = parseMarkdownDoc(
				"here is a {{bookmark with more symbols}}"
			);
			const paragraph = parsed.lede?.parts[0] as ParagraphStatement;
			const bookmark = paragraph.content.parts[1] as BookmarkStatement;
			expect(bookmark).toBeInstanceOf(BookmarkStatement);
			expect(bookmark.content.toString()).toBe(
				"bookmark with more symbols"
			);
		});

		it("creates a bookmark", () => {
			const bookmark = BookmarkStatement.create("foo bar");
			expect(bookmark.toString()).toBe("{{foo bar}}");
		});
	});

	describe("code blocks", () => {
		it("parses a code block", () => {
			const parsed = parseMarkdownDoc(
				nl("```text", "thing1: one", "thing2: two", "", "foo", "```")
			);
			const codeblock = parsed.lede?.parts[0];
			expect(codeblock).toBeInstanceOf(CodeStatement);
		});

		it("parses a latex code block", () => {
			// const tokens = scanTokens(nl("$$", "foo", "bar", "baz", "$$"));
			// printTokens(tokens);
			const parsed = parseMarkdownDoc(nl("$$", "foo", "boo", "$$"));
			const paragraph = parsed.lede?.parts[0] as ParagraphStatement;
			const latex = paragraph.content.parts[0];
			expect(latex).toBeInstanceOf(LatexStatement);
		});

		it("creates a code block", () => {
			const codeBlock = CodeStatement.create(
				"js",
				{
					foo: "bar",
					baz: "zar",
				},
				nl("foo", "bar", "baz")
			);

			expect(codeBlock.toString().split("\n")).toEqual([
				"```js",
				"foo: bar",
				"baz: zar",
				"",
				"foo",
				"bar",
				"baz",
				"```",
			]);
		});
	});

	describe("content", () => {
		it("parses content as the lede", () => {
			const parsed = parseMarkdownDoc("foo bar baz");
			expect(parsed.lede).toBeInstanceOf(ContentStatement);
		});

		it("creates content", () => {
			const parsed = parseMarkdownDoc("foo bar baz");
			const content = ContentStatement.create("foo bar baz");
			expect(content.toString()).toBe(parsed.lede?.toString());
		});
	});

	describe("formatting", () => {
		it("parses bold formatting", () => {
			const s = parse("foo **boo** car").richText();
			expect(s.parts[1]).toBeInstanceOf(BoldStatement);
		});

		it("parses italic formatting", () => {
			const s = parse("foo *boo* car").richText();
			expect(s.parts[1]).toBeInstanceOf(ItalicStatement);
		});

		it("parses strikethrough formatting", () => {
			const s = parse("foo ~~boo~~ car").richText();
			expect(s.parts[1]).toBeInstanceOf(StrikethroughStatement);
		});

		it("parses highlighted formatting", () => {
			const s = parse("foo ==boo== car").richText();
			expect(s.parts[1]).toBeInstanceOf(HighlightStatement);
		});

		it("parses a combination of formatting", () => {
			const s = parse("==foo **boo** *car*==").richText();
			expect(s.parts[0]).toBeInstanceOf(HighlightStatement);

			const highlight = s.parts[0] as HighlightStatement;
			expect(highlight.content.parts[0]).toBeInstanceOf(
				PlainTextStatement
			);
			expect(highlight.content.parts[1]).toBeInstanceOf(BoldStatement);
			expect(highlight.content.parts[2]).toBeInstanceOf(
				PlainTextStatement
			); // space
			expect(highlight.content.parts[3]).toBeInstanceOf(ItalicStatement);
		});

		it("creates a bold statement", () => {
			const bold = BoldStatement.create("foo bar");
			expect(bold.toString()).toBe("**foo bar**");
		});

		it("creates an italic statement", () => {
			const italic = ItalicStatement.create("foo bar");
			expect(italic.toString()).toBe("*foo bar*");
		});

		it("creates a strikethrough statement", () => {
			const strikethrough = StrikethroughStatement.create("foo bar");
			expect(strikethrough.toString()).toBe("~~foo bar~~");
		});

		it("creates a highlight statement", () => {
			const highlight = HighlightStatement.create("foo bar");
			expect(highlight.toString()).toBe("==foo bar==");
		});
	});

	describe("frontmatter", () => {
		it("parses frontmatter key", () => {
			const parsed = parseMarkdownDoc(nl("---", "foo: bar", "---"));

			expect(parsed.frontmatter).toBeDefined();
			expect(parsed.frontmatter?.items.length).toBe(1);
			expect(parsed.frontmatter?.items[0]?.key.toString()).toBe("foo");
		});

		it("parses frontmatter value", () => {
			const parsed = parseMarkdownDoc(nl("---", "foo: bar", "---"));
			const items = parsed.frontmatter
				?.items as FrontmatterItemStatement[];
			expect(items[0]?.value?.toString()).toBe("bar");
		});

		it("parses a frontmatter list value", () => {
			const parsed = parseMarkdownDoc(
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
			const parsed = parseMarkdownDoc(
				nl("---", "foo:", "- bar", "- zar", "coo: moo", "---")
			);

			expect(parsed.frontmatter?.items.length).toBe(2);
		});

		it("handles extra lines in frontmatter", () => {
			const parsed = parseMarkdownDoc(
				nl("---", "foo: bar", "", "", "coo: moo", "", "", "---")
			);

			expect(parsed.frontmatter?.items.length).toBe(2);
		});

		it("handles tabs in front of list items", () => {
			const parsed = parseMarkdownDoc(
				nl("---", "foo:", "  - bar", "  - zar", "---")
			);

			expect(parsed.frontmatter?.items.length).toBe(1);
			expect(parsed.frontmatter?.items[0]?.value?.toString()).toBe(
				nl("  - bar", "  - zar", "")
			);
		});

		it("handles trailing spaces in list items", () => {
			const parsed = parseMarkdownDoc(
				nl("---", "foo: ", "- bar", "- zar", "coo: moo", "---")
			);

			expect(parsed.frontmatter?.items.length).toBe(2);
			expect(parsed.frontmatter?.items[0]?.value?.toString()).toBe(
				nl("- bar", "- zar", "")
			);
		});

		it("parses fugly frontmatter", () => {
			const parsed = parseMarkdownDoc(
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

		it("creates a frontmatter block", () => {
			const frontmatter = FrontmatterStatement.create({
				foo: "bar",
				car: ["qux", "lux one"],
				dar: "mar",
			});

			expect(frontmatter.toString().split("\n")).toEqual([
				"---",
				"foo: bar",
				"car:",
				"- qux",
				"- lux one",
				"dar: mar",
				"---",
			]);
		});
	});

	describe("hr", () => {
		it("parses an hr", () => {
			const content = parse("___").content();
			expect(content?.parts[0]).toBeInstanceOf(HrStatement);
		});

		it("creates an underscore hr", () => {
			const hr = HrStatement.create("_");
			expect(hr).toBeInstanceOf(HrStatement);
			expect(hr.toString()).toBe("___\n");
		});

		it("creates a dash hr", () => {
			const hr = HrStatement.create("-");
			expect(hr).toBeInstanceOf(HrStatement);
			expect(hr.toString()).toBe("---\n");
		});
	});

	describe("html", () => {
		it("parses html", () => {
			const parsed = parseMarkdownDoc(nl("<div>", "</div>"));
			const paragraph = parsed.lede?.parts[0] as ParagraphStatement;
			const html = paragraph.content.parts[0];
			expect(html).toBeInstanceOf(HtmlStatement);
		});

		it("recursively parses html", () => {
			// const tokens = scanTokens(
			// 	nl("<div>", "<i>foo</i>", "</div> outside of div")
			// );
			// printTokens(tokens);
			const parsed = parseMarkdownDoc(
				nl(
					"<div class='foo'>",
					"<i>foo</i>",
					"<div><div></div></div>",
					"<span>another</span>",
					"</div> outside of div"
				)
			);

			const paragraph = parsed.lede?.parts[0] as ParagraphStatement;
			const html = paragraph.content.parts[0] as HtmlStatement;

			expect(html).toBeInstanceOf(HtmlStatement);
			expect(html.parts).toHaveLength(9);
		});

		it("creates an HTML statement", () => {
			const html = HtmlStatement.create(
				'<div><span class="be">foo</span></div>'
			);
			expect(html).toBeInstanceOf(HtmlStatement);
			expect(html.parts[0]?.toString()).toBe("<div>");
			expect(html.parts[1]?.toString()).toBe(
				'<span class="be">foo</span>'
			);
			expect(html.parts[2]?.toString()).toBe("</div>");
		});
	});

	describe("inline code", () => {
		it("parses inline code", () => {
			const parsed = parse("`foo`").inlineCode();
			expect(parsed.content.toString()).toBe("foo");
		});

		it("parses inline code in richtext", () => {
			const parsed = parse(
				"here is a paragraph `with this` in it"
			).richText();
			expect(parsed.parts[1]).toBeInstanceOf(InlineCodeStatement);
			expect(parsed.parts[1]?.toString()).toBe("`with this`");
		});

		it("parses inline latex", () => {
			const parsed = parse("$1 + 1 = 2$").richText();
			expect(parsed.parts[0]).toBeInstanceOf(InlineLatexStatement);
			expect(parsed.parts[0]?.toString()).toBe("$1 + 1 = 2$");
		});

		it("creates an inline code statement", () => {
			const inlineCode = InlineCodeStatement.create("foo bar");
			expect(inlineCode.toString()).toBe("`foo bar`");
		});

		it("creates an inline latex statement", () => {
			const inlineLatex = InlineLatexStatement.create("foo bar");
			expect(inlineLatex.toString()).toBe("$foo bar$");
		});
	});

	describe("links", () => {
		it("parses internal links", () => {
			const parsed = parse("[[file]]").richText();
			const link = parsed.parts[0];
			expect(link).toBeInstanceOf(InternalLinkStatement);
			expect(link?.toString()).toBe("[[file]]");
		});

		it("creates internal links", () => {
			const link = InternalLinkStatement.create("file");
			expect(link.toString()).toBe("[[file]]");
		});

		it("creates internal links with aliases", () => {
			const link = InternalLinkStatement.create("file", "alias");
			expect(link.toString()).toBe("[[file|alias]]");
		});

		it("parses external links", () => {
			const parsed = parse("[foo](https://example.com)").richText();
			const link = parsed.parts[0];
			expect(link).toBeInstanceOf(ExternalLinkStatement);
		});

		it("creates external links", () => {
			const link = ExternalLinkStatement.create(
				"foo",
				"https://example.com"
			);
			expect(link.toString()).toBe("[foo](https://example.com)");
		});

		it("parses image links", () => {
			const parsed = parse("![[image path]]").richText();
			const link = parsed.parts[0];
			expect(link).toBeInstanceOf(ImageLinkStatement);
		});

		it("creates image links", () => {
			const link = ImageLinkStatement.create("image path");
			expect(link.toString()).toBe("![[image path]]");
		});
	});

	describe("lists", () => {
		it("parses a one-dimensional list", () => {
			const parsed = parseMarkdownDoc(nl("- foo", "- bar", "- baz"));
			const list = parsed.lede?.parts[0] as ListStatement;
			expect(list.items.length).toBe(3);
		});

		it("parses a two-dimensional list", () => {
			const parsed = parseMarkdownDoc(
				nl("- foo", "- bar", "  - moo", "  - bah", "- baz")
			);
			const list = parsed.lede?.parts[0] as ListStatement;
			expect(list.items.length).toBe(3);
			expect(list.items[1]?.list?.items.length).toBe(2);
		});

		it("parses a three-dimensional list", () => {
			const parsed = parseMarkdownDoc(
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
			const parsed = parseMarkdownDoc(nl("- tomorrow", "\t- [ ] foo"));
			const list = parsed.lede?.parts[0] as ListStatement;
			expect(list.items[0]?.list?.items.length).toBe(1);
		});

		it("parses a hybrid numbered an unnumbered list", () => {
			const parsed = parseMarkdownDoc(
				nl("- foo", "- bar", "  1. moo", "  2. bah", "- baz")
			);

			const list = parsed.lede?.parts[0] as ListStatement;
			expect(list.items.length).toBe(3);
			expect(list.items[1]?.list).toBeInstanceOf(NumberedListStatement);
			expect(list.items[1]?.list?.items.length).toBe(2);
		});

		it("parses a hybrid numbered, unnumbered, and checkbox list", () => {
			const parsed = parseMarkdownDoc(
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

		it("creates a list", () => {
			const list = ListStatement.createDim("foo", "bar", "baz");
			expect(list.toString()).toBe("- foo\n- bar\n- baz\n");
		});

		it("creates a two-dimensional list", () => {
			const list = ListStatement.create(
				["foo"],
				["bar"],
				["baz", ["moo"]],
				["zar", ["car", ["dar"]]]
			);

			expect(list.toString()).toBe(
				nl(
					"- foo",
					"- bar",
					"- baz",
					"  - moo",
					"- zar",
					"  - car",
					"    - dar",
					""
				)
			);
		});

		it("creates a two-dimensional numbered list", () => {
			const list = NumberedListStatement.create(
				["foo"],
				["bar"],
				["baz", ["moo"]],
				["zar", ["car", ["dar"]]]
			);

			expect(list.toString()).toBe(
				nl(
					"1. foo",
					"2. bar",
					"3. baz",
					"  1. moo",
					"4. zar",
					"  1. car",
					"    1. dar",
					""
				)
			);
		});
	});

	describe("metadata", () => {
		it("parses metadata", () => {
			const parsed = parse("Foo:: Bar").content();
			const list = parsed?.parts[0] as MetadataListStatement;
			expect(list).toBeInstanceOf(MetadataListStatement);
			expect(list.items[0]).toBeInstanceOf(MetadataItemStatement);
		});

		it("parses a metadata list", () => {
			const parsed = parse(nl("Foo:: Bar", "Zoo:: Zar")).content();
			const list = parsed?.parts[0] as MetadataListStatement;
			expect(list).toBeInstanceOf(MetadataListStatement);
			expect(list.items[0]).toBeInstanceOf(MetadataItemStatement);
			expect(list.items[1]).toBeInstanceOf(MetadataItemStatement);
		});

		it("parses a metadata tag", () => {
			const parsed = parse("- a list item [flag:: 5]").list();
			expect(parsed?.items[0]?.content?.parts[1]).toBeInstanceOf(
				MetadataTagStatement
			);
		});

		it("creates a metadata statement", () => {
			const metadata = MetadataItemStatement.create("foo", "bar");
			expect(metadata.toString()).toBe("foo:: bar\n");
		});

		it("creates a metadata tag statement", () => {
			const metadata = MetadataTagStatement.create("foo", "bar");
			expect(metadata.toString()).toBe("[foo:: bar]");
		});
	});

	describe("symbols", () => {
		it("parses a group of symbols as a paragraph", () => {
			const parsed = parseMarkdownDoc("foo bar baz");
			expect(parsed.lede?.parts[0]).toBeInstanceOf(ParagraphStatement);
		});

		it("parses symbols as plain text", () => {
			const parsed = parseMarkdownDoc("foo bar baz");
			expect(parsed.lede?.parts[0]?.toString()).toBe("foo bar baz");
		});
	});

	describe("runes", () => {
		it("parses a group of runes as a paragraph", () => {
			const parsed = parseMarkdownDoc("f$oo ba/r b;az");
			expect(parsed.lede?.parts[0]).toBeInstanceOf(ParagraphStatement);
		});

		it("parses runes as plain text", () => {
			const parsed = parseMarkdownDoc("f$oo ba/r b;az");
			expect(parsed.lede?.parts[0]?.toString()).toBe("f$oo ba/r b;az");
		});
	});

	describe("numbers", () => {
		it("parses a group of numbers as a paragraph", () => {
			const parsed = parseMarkdownDoc("123 456 789");
			expect(parsed.lede?.parts[0]).toBeInstanceOf(ParagraphStatement);
		});

		it("parses numbers as plain text", () => {
			const parsed = parseMarkdownDoc("123");
			expect(parsed.lede?.parts[0]?.toString()).toBe("123");
		});
	});

	describe("spaces", () => {
		it("parses spaces as a paragraph", () => {
			const parsed = parseMarkdownDoc("   ");
			expect(parsed.lede?.parts[0]).toBeInstanceOf(ParagraphStatement);
		});

		it("parses spaces as plain text", () => {
			const parsed = parseMarkdownDoc("   ");
			expect(parsed.lede?.parts[0]?.toString()).toBe("   ");
		});
	});

	describe("tabs", () => {
		it("parses tabs as a paragraph", () => {
			const parsed = parseMarkdownDoc("\t\t\t");
			expect(parsed.lede?.parts[0]).toBeInstanceOf(ParagraphStatement);
		});
	});

	describe("numbered lists", () => {
		it("parses a one-dimensional numbered list", () => {
			const parsed = parseMarkdownDoc(nl("1. foo", "2. bar", "3. baz"));
			const list = parsed.lede?.parts[0] as NumberedListStatement;
			expect(list.items.length).toBe(3);
		});

		it("parses a two-dimensional numbered list", () => {
			const parsed = parseMarkdownDoc(
				nl("1. foo", "2. bar", "  1. moo", "  2. bah", "3. baz")
			);
			const list = parsed.lede?.parts[0] as NumberedListStatement;
			expect(list.items.length).toBe(3);
			expect(list.items[1]?.list?.items.length).toBe(2);
		});

		it("parses a three-dimensional numbered list", () => {
			const parsed = parseMarkdownDoc(
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
			const parsed = parseMarkdownDoc(
				nl("1. foo", "2. bar", "  - moo", "  - bah", "3. baz")
			);

			const list = parsed.lede?.parts[0] as NumberedListStatement;
			expect(list.items.length).toBe(3);
			expect(list.items[1]?.list).toBeInstanceOf(ListStatement);
			expect(list.items[1]?.list?.items.length).toBe(2);
		});
	});

	describe("sections", () => {
		it("parses nested sections", () => {
			const parsed = parseMarkdownDoc(
				nl("## Section 1", "### Section 1.1")
			);
			expect(parsed.sections).toHaveLength(1);
			expect(parsed.sections[0]?.sections).toHaveLength(1);
		});

		it("parses more than one nested section", () => {
			const parsed = parseMarkdownDoc(
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
			const parsed = parseMarkdownDoc(nl("# Section 1", "foo"));
			expect(parsed.sections[0]?.lede?.toString()).toBe("foo");
		});

		it("parses section content before subheading", () => {
			const parsed = parseMarkdownDoc(
				nl("# Section 1", "foo", "## Section 2")
			);
			expect(parsed.sections[0]?.lede?.toString()).toBe("foo\n");
		});
	});

	describe("quotes", () => {
		it("parses a quote", () => {
			const parsed = parseMarkdownDoc(nl("> foo"));
			const quote = parsed.lede?.parts[0] as QuoteStatement;
			expect(quote).toBeInstanceOf(QuoteStatement);
			expect(quote.content.toString()).toBe("foo");
		});
	});

	describe("tables", () => {
		it("parses a table", () => {
			const parsed = parseMarkdownDoc(
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
