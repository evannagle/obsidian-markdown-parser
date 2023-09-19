import { parseMarkdown } from "./Parser";
import { nl } from "src/scanners/ScannerBase";
import { describe, expect, it } from "vitest";
import {
	BookmarkStatement,
	FrontmatterItemStatement,
	FrontmatterListStatement,
	ListStatement,
	ParagraphStatement,
	RichTextStatement,
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
		// it("xx", () => {
		// 	const parsed = parseMarkdown(
		// 		nl(
		// 			"```text",
		// 			"thing: one",
		// 			"thing2: two boo bear",
		// 			"",
		// 			"foo",
		// 			"bar",
		// 			"```"
		// 		)
		// 	);
		// 	// const parser = new CodeBlockParser(tokens);
		// 	// const parsed = parser.parse();
		// 	printStatement(parsed);
		// });
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
});
