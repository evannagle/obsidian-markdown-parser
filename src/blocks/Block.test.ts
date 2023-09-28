import { describe, expect, it } from "vitest";

import { Block } from "./Block";
import { ItalicBlock, StrikethroughBlock } from "./FormattingBlock";
import { BookmarkBlock } from "./BookmarkBlock";
import { HrType } from "./HrBlock";
import { InlineCodeBlock } from "./InlineCodeBlock";
import { TagBlock } from "./TagBlock";
import { ListItemStatement } from "src/parsers/statements/ListStatement";
import { nl } from "src/scanners/ScannerBase";
import { md } from "./MarkdownGenerator";
import { MutableBlock } from "./MutableBlock";
import { parse } from "src/parsers/Parser";
import { printStatement } from "src/visitors/DebugVisitor";
import { spawnBlock } from "./BlockFactory";
import { FrontmatterBlock } from "./FrontmatterBlock";

class TestContentBlock extends MutableBlock {
	public static override allowedChildren = [];

	constructor(public content = "", ...children: Block[]) {
		super(...children);
	}

	public toString() {
		return this.content;
	}
}

describe("Block", () => {
	it("should have no parent and no children by default", () => {
		const block = new Block();

		expect(block.parent).toBe(undefined);
		expect(block.getChildren()).toEqual([]);
	});

	it("should have a parent and children when added to a block", () => {
		const parent = new MutableBlock();
		const child = new Block();

		parent.add(child);

		expect(child.parent).toBe(parent);
		expect(parent.getChildren()).toEqual([child]);
	});

	it("restricts adding a child to allowed children", () => {
		const parent = new TestContentBlock();
		expect(() => parent.add(new TestContentBlock())).toThrow();
	});

	it("restricts adding a child to allowed children in constructor", () => {
		expect(
			() => new TestContentBlock("", new TestContentBlock())
		).toThrow();
	});

	it("returns the aggregate content of all children", () => {
		const parent = new MutableBlock();
		parent.add(new TestContentBlock("foo"));
		parent.add(new TestContentBlock("bar"));
		parent.add(new TestContentBlock("baz"));

		expect(parent.toString()).toBe("foobarbaz");
	});

	it("allows children to be removed", () => {
		const parent = new MutableBlock();
		const child = new Block();

		parent.add(child);
		parent.remove(child);
		expect(parent.getChildren()).toEqual([]);
	});

	it("allows children to be replaced", () => {
		const parent = new MutableBlock();
		const bar = new TestContentBlock("bar");
		parent.add(new TestContentBlock("foo"));
		parent.add(bar);
		parent.add(new TestContentBlock("baz"));

		parent.replace(bar, new TestContentBlock("qux"));

		expect(parent.toString()).toBe("fooquxbaz");
	});

	it("allows children to be added after siblings", () => {
		const parent = new MutableBlock();
		const bar = new TestContentBlock("bar");
		const foo = new TestContentBlock("foo");

		parent.add(foo);
		parent.addAfter(foo, bar);

		expect(parent.toString()).toBe("foobar");
	});

	it("allows children to be added before siblings", () => {
		const parent = new MutableBlock();
		const bar = new TestContentBlock("bar");
		const foo = new TestContentBlock("foo");

		parent.add(bar);
		parent.addBefore(bar, foo);

		expect(parent.toString()).toBe("foobar");
	});

	it("allows children to be moved", () => {
		const parent = new MutableBlock();
		const bar = new TestContentBlock("bar");
		const foo = new TestContentBlock("foo");

		parent.add(bar, foo);
		parent.move(bar, 1);

		expect(parent.toString()).toBe("foobar");
	});

	it("gets next sibling", () => {
		const parent = new MutableBlock();
		const bar = new TestContentBlock("bar");
		const foo = new TestContentBlock("foo");

		parent.add(bar, foo);

		expect(bar.nextSibling()).toBe(foo);
		expect(foo.nextSibling()).toBe(undefined);
	});

	it("gets prev sibling", () => {
		const parent = new MutableBlock();
		const bar = new TestContentBlock("bar");
		const foo = new TestContentBlock("foo");

		parent.add(bar, foo);

		expect(bar.prevSibling()).toBe(undefined);
		expect(foo.prevSibling()).toBe(bar);
	});

	it("finds children by type", () => {
		const parent = new MutableBlock();
		const bar = new TestContentBlock("bar");
		const foo = new TestContentBlock("foo");

		parent.add(bar, foo);

		expect(parent.all(TestContentBlock)).toEqual([bar, foo]);
	});

	it("finds first child by type", () => {
		const parent = new MutableBlock();
		const bar = new TestContentBlock("bar");
		const foo = new TestContentBlock("foo");

		parent.add(bar, foo);

		expect(parent.first(TestContentBlock)).toEqual(bar);
	});

	describe("FormattingBlock", () => {
		it("nests formatting blocks, har har", () => {
			const block = md.bold("foo *bar ~~mar~~* car");
			const i = block.single(ItalicBlock);
			const strike = block.single(StrikethroughBlock);

			strike.content = md.rich("har har");

			expect(i?.toString()).toBe("*bar ~~har har~~*");
			expect(strike?.toString()).toBe("~~har har~~");
		});
	});

	describe("BookmarkBlock", () => {
		it("returns the bookmark name", () => {
			const block = md.rich("foo bar {{book}} car");
			const bookmark = block.single(md.a.bookmark);

			// how to handle this?
			// bookmark.get(0).remove();
			expect(bookmark?.name).toBe("book");
		});

		it("allows the bookmark name to be changed", () => {
			const block = md.rich("foo bar {{book}} car");
			const bookmark = block.single(BookmarkBlock);
			bookmark.name = md.text("book2");
			expect(block.toString()).toBe("foo bar {{book2}} car");
		});
	});

	describe("hr", () => {
		it("creates an hr block", () => {
			const block = md.hr();
			expect(block.toString()).toBe("---\n");
		});

		it("can change the hr block type", () => {
			const block = md.hr();
			block.type = HrType.Underscore;
			expect(block.toString()).toBe("___\n");
		});
	});

	describe("quote", () => {
		it("creates a quote block", () => {
			const block = md.quote("foo bar");
			expect(block.toString()).toBe("> foo bar\n");
		});

		it("can change the quote block content", () => {
			const block = md.quote("foo bar");
			block.content = "bar baz";

			expect(block.toString()).toBe("> bar baz\n");
		});
	});

	describe("inline code", () => {
		it("creates an inline code block", () => {
			const block = md.inlineCode("foo bar");
			expect(block.toString()).toBe("`foo bar`");
		});

		it("can change the inline code block content", () => {
			const block = md.inlineCode("foo bar");
			block.content = "bar baz";
			expect(block.toString()).toBe("`bar baz`");
		});

		it("can be queried and modified from inside of a RichTextBlock", () => {
			const block = md.rich(
				"here is a `piece of code` in some rich text"
			);
			const code = block.single(InlineCodeBlock);
			code.content = "new bit of code";
			expect(block.toString()).toBe(
				"here is a `new bit of code` in some rich text"
			);
		});

		it("can be queried and replaced", () => {
			const block = md.rich(
				"here is a `piece of code` in some rich text"
			);
			const code = block.single(md.a.inlineCode);

			block.replace(code, md.tag("foo"));

			expect(block.toString()).toBe("here is a #foo in some rich text");
		});
	});

	describe("tag", () => {
		it("creates a tag block", () => {
			const block = md.tag("foo");
			expect(block.toString()).toBe("#foo");
		});

		it("throws error if tag has an invalid character", () => {
			expect(() => md.tag("foo bar")).toThrow();
		});

		it("can change the tag block content", () => {
			const block = md.tag("foo");
			block.name = "bar";
			expect(block.toString()).toBe("#bar");
		});

		it("can be queried and modified from inside of a RichTextBlock", () => {
			const block = md.rich("here is a #tag in some rich text");
			const tag = block.single(TagBlock);
			tag.name = "new";
			expect(block.toString()).toBe("here is a #new in some rich text");
		});
	});

	describe("list", () => {
		it("creates a list item", () => {
			const i = md.li("foo");
			expect(i.toString()).toBe("- foo\n");
		});

		it("creates a list from list items", () => {
			const l = md.list([
				"one",
				"two",
				md.li("three"),
				ListItemStatement.create(0, "four"),
			]);
			// const l = list("one", "two", "three");

			expect(l.toString()).toBe(
				nl("- one", "- two", "- three", "- four", "")
			);
		});

		it("creates sublists", () => {
			const l = md.list("one");
			l.item(0).list = md.list("two");
			l.item(0).list.item(0).list = md.list("three");

			expect(l.toString()).toBe(
				nl("- one", "  - two", "    - three", "")
			);
		});

		it("tabs sublists", () => {
			const l = md.list("one");
			l.item(0).list = md.list("two");
			l.item(0).list.item(0).list = md.list("three");
			l.tab++;

			expect(l.toString()).toBe(
				nl("  - one", "    - two", "      - three", "")
			);
		});

		it("creates checkboxes", () => {
			const l = md.list([
				md.li("one"),
				md.checkbox("two").sublist([md.checkbox("three", true)]),
			]);

			// console.log(l.toString());
			// l.item(1).list = md.list([md.checkbox("three", true)]);

			expect(l.toString()).toBe(
				nl("- one", "- [ ] two", "  - [x] three", "")
			);
		});

		it("creates numbered lists", () => {
			const l = md.numbers([
				md.nli("one"),
				md.nli("two"),
				md.nli("three"),
				md.nli("four"),
			]);

			expect(l.toString()).toBe(
				nl("1. one", "2. two", "3. three", "4. four", "")
			);
		});

		it("creates numbered lists that contain checkboxes", () => {
			const l = md.numbers([
				md.nli("one"),
				md.nli("two"),
				md.nli("three"),
				md.nli("four"),
			]);

			l.item(3).list = md.list([
				md.checkbox("eight"),
				md.checkbox("nine", true),
			]);

			l.item(3).list.item(0).list = md.numbers([
				md.nli("ten"),
				md.checkbox("twelve"),
			]);

			const checkboxes = l.all(md.a.checkbox);
			expect(checkboxes.length).toBe(3);
		});
	});

	describe("latex", () => {
		it("creates a latex block", () => {
			const latex = md.latex("foo bar");
			expect(latex.toString()).toBe("$$foo bar$$");
		});
	});

	describe("code", () => {
		it("creates a metadata item", () => {
			const code = md.code("foo bar", "js", { john: "doe", jane: "qux" });

			expect(code.toString()).toBe(
				nl("```js", "john: doe", "jane: qux", "", "foo bar", "```")
			);
		});

		it("can remove a metadata item", () => {
			const code = md.code("foo bar", "js", { john: "doe", jane: "qux" });

			code.metadata.removeKey("jane");

			expect(code.toString()).toBe(
				nl("```js", "john: doe", "", "foo bar", "```")
			);
		});

		it("can remove a metadata item from item instance", () => {
			const code = md.code("foo bar", "js", { john: "doe", jane: "qux" });

			code.metadata.item("jane")?.removeFromParent();

			expect(code.toString()).toBe(
				nl("```js", "john: doe", "", "foo bar", "```")
			);
		});

		it("can update a metadata value", () => {
			const code = md.code("foo bar", "js", { john: "doe", jane: "qux" });

			code.metadata.item("jane")!.value = "qux2";

			expect(code.toString()).toBe(
				nl("```js", "john: doe", "jane: qux2", "", "foo bar", "```")
			);
		});

		it("can add a metadata item", () => {
			const code = md.code("foo bar", "js", { john: "doe", jane: "qux" });

			code.metadata.setKey("foo", "bar2");

			expect(code.toString()).toBe(
				nl(
					"```js",
					"john: doe",
					"jane: qux",
					"foo: bar2",
					"",
					"foo bar",
					"```"
				)
			);
		});

		it("can sort keys", () => {
			const code = md.code("foo bar", "js", { john: "doe", jane: "qux" });

			code.metadata.setKey("foo", "bar2").sortKeys();

			expect(code.toString()).toBe(
				nl(
					"```js",
					"foo: bar2",
					"jane: qux",
					"john: doe",
					"",
					"foo bar",
					"```"
				)
			);
		});
		it("can replace metadata", () => {
			const code = md.code("foo bar", "js", { john: "doe", jane: "qux" });
			code.metadata = md.codeMetadata({ foo2: "bar", car: 3 });

			expect(code.toString()).toBe(
				nl("```js", "foo2: bar", "car: 3", "", "foo bar", "```")
			);
		});
	});

	describe("heading", () => {
		it("creates a heading", () => {
			const heading = md.heading(1, "foo bar");
			expect(heading.toString()).toBe("# foo bar\n\n");
		});

		it("can change the heading level", () => {
			const heading = md.heading(1, "foo bar");
			heading.level = 2;
			expect(heading.toString()).toBe("## foo bar\n\n");
		});

		it("can change the heading content", () => {
			const heading = md.heading(1, "foo bar");
			heading.content = "bar baz";
			expect(heading.toString()).toBe("# bar baz\n\n");
		});

		it("can change the heading bottom margin", () => {
			const heading = md.heading(1, "foo bar");
			heading.bottomMargin = 2;
			expect(heading.toString()).toBe("# foo bar\n\n");
		});
	});

	describe("lede", () => {
		it("creates a lede", () => {
			const lede = md.lede("foo bar", 2);

			expect(lede.toString()).toBe("foo bar\n\n");
		});
	});

	describe("link", () => {
		it("creates a link", () => {
			const link = md.link("Document Name");
			expect(link.toString()).toBe("[[Document Name]]");
		});

		it("sets alias", () => {
			const link = md.link("Document Name", "doc");
			expect(link.toString()).toBe("[[Document Name|doc]]");
		});

		it("sets alias after creation", () => {
			const link = md.link("Document Name");
			link.alias = "doc";
			expect(link.toString()).toBe("[[Document Name|doc]]");
		});

		it("deletes an alias", () => {
			const link = md.link("Document Name", "doc");
			link.removeAlias();
			expect(link.toString()).toBe("[[Document Name]]");
		});

		it("creates an external link", () => {
			const link = md.urlLink("https://example.com", "example");
			expect(link.toString()).toBe("[example](https://example.com)");
		});

		it("udpates a link url", () => {
			const link = md.urlLink("https://example.com", "example");
			link.url = "https://example2.com";
			expect(link.toString()).toBe("[example](https://example2.com)");
		});

		it("udpates a link title", () => {
			const link = md.urlLink("https://example.com", "example");
			link.title = "example2";
			expect(link.toString()).toBe("[example2](https://example.com)");
		});

		it("creates an image link", () => {
			const link = md.image("foo.png");
			expect(link.toString()).toBe("![[foo.png]]");
		});

		it("udpates an image link", () => {
			const link = md.image("foo.png");
			link.file = "bar.png";
			expect(link.toString()).toBe("![[bar.png]]");
		});
	});

	describe("section", () => {
		it("creates a section", () => {
			const section = md.section("foo bar");
			expect(section.toString()).toBe("# foo bar\n\n");
		});

		it("creates a section with a lede", () => {
			const section = md.section("Almost a Section", "With some content");
			expect(section.toString()).toBe(
				"# Almost a Section\n\nWith some content\n\n"
			);
		});

		it("creates a section with a level", () => {
			const section = md.section("Section 2", "...").atLevel(2);
			expect(section.toString()).toBe("## Section 2\n\n...\n\n");
		});

		it("creates nested sections", () => {
			const section = md.section("Section 2", "...").atLevel(2);
			const section2 = md.section("Section 3", "...").atLevel(3);

			section.add(section2);
		});

		it("creates nested sections in section call", () => {
			const section = md
				.section(
					"Section 2",
					"Here is my content which is interesting",
					[
						md.section(
							"Section 2.1",
							"some content in this section",
							[
								md.section("Section 2.1.1", undefined, [
									md.section("Section 2.1.1.1"),
								]),
								md.section("Section 2.1.2"),
								md.section("Section 2.1.3"),
							]
						),
						md.section("Section 2.2"),
						md.section("Section 2.3"),
					]
				)
				.atLevel(3);

			expect(section.toString()).toBe(
				nl(
					"### Section 2",
					"",
					"Here is my content which is interesting",
					"",
					"#### Section 2.1",
					"",
					"some content in this section",
					"",
					"##### Section 2.1.1",
					"",
					"###### Section 2.1.1.1",
					"",
					"##### Section 2.1.2",
					"",
					"##### Section 2.1.3",
					"",
					"#### Section 2.2",
					"",
					"#### Section 2.3",
					"",
					""
				)
			);
		});
	});

	describe("frontmatter", () => {
		it("creates a frontmatter list item", () => {
			const item = md.frontmatterListItem("foo");
			expect(item.toString()).toBe("- foo\n");
		});

		it("can change a frontmatter list item value", () => {
			const item = md.frontmatterListItem("foo");
			item.content = "bar";
			expect(item.toString()).toBe("- bar\n");
		});

		it("creates a frontmatter list", () => {
			// TODO -- how to handle sublists?
			const list = md.frontmatterList([
				"foo",
				"bar",
				md.frontmatterListItem("baz"),
			]);
			expect(list.toString()).toBe(
				nl("  - foo", "  - bar", "  - baz", "")
			);
		});

		it("creates a frontmatter list and controls list tabbing", () => {
			const list = md.frontmatterList([
				"foo",
				"bar",
				md.frontmatterListItem("baz"),
			]);
			list.tab = 0;
			expect(list.toString()).toBe(nl("- foo", "- bar", "- baz", ""));
		});

		it("creates a frontmatter item", () => {
			const item = md.frontmatterItem("foo", "bar");
			expect(item.toString()).toBe("foo: bar\n");
		});

		it("creates a frontmatter item with a list", () => {
			const item = md.frontmatterItem("foo", ["bar", "baz"]);
			expect(item.toString()).toBe(nl("foo:", "  - bar", "  - baz", ""));
		});

		it("gets a frontmatter list as an array", () => {
			const item = md.frontmatterItem("foo", ["bar", "baz"]);
			expect(item.value).toEqual(["bar", "baz"]);
		});

		it("converts a frontmatter list to a scalar", () => {
			const item = md.frontmatterItem("foo", ["bar", "baz"]);
			item.value = "bar2";
			expect(item.toString()).toBe("foo: bar2\n");
		});

		it("converts a frontmatter scalar into a list", () => {
			const item = md.frontmatterItem("foo", "bar");
			item.value = ["bar", "baz"];
			expect(item.toString()).toBe(nl("foo:", "  - bar", "  - baz", ""));
		});

		it("creates a frontmatter section", () => {
			const frontmatter = md.frontmatter({
				foo: "bar",
				baz: ["car", "dar"],
			});

			expect(frontmatter.toString()).toBe(
				nl("---", "foo: bar", "baz:", "  - car", "  - dar", "---")
			);
		});

		it("can update frontmatter", () => {
			const frontmatter = md.frontmatter({
				foo: "bar",
				baz: ["car", "dar"],
			});

			frontmatter.setKey("foo", "bar2");

			expect(frontmatter.toString()).toBe(
				nl("---", "foo: bar2", "baz:", "  - car", "  - dar", "---")
			);
		});

		it("can remove frontmatter", () => {
			const frontmatter = md.frontmatter({
				foo: "bar",
				baz: ["car", "dar"],
			});

			frontmatter.removeKey("baz");

			expect(frontmatter.toString()).toBe(nl("---", "foo: bar", "---"));
		});

		it("can update frontmatter key to a list", () => {
			const frontmatter = md.frontmatter({
				foo: "bar",
				baz: ["car", "dar"],
			});

			frontmatter.setKey("baz", ["car2", "dar2"]);

			expect(frontmatter.toString()).toBe(
				nl("---", "foo: bar", "baz:", "  - car2", "  - dar2", "---")
			);
		});

		it("can update a frontmatter list item to a scalar value", () => {
			const frontmatter = md.frontmatter({
				foo: "bar",
				baz: ["car", "dar"],
			});

			frontmatter.item("baz")!.value = "car2";

			expect(frontmatter.toString()).toBe(
				nl("---", "foo: bar", "baz: car2", "---")
			);
		});

		it("can update a frontmatter scalar value to a list", () => {
			const frontmatter = md.frontmatter({
				foo: "bar",
				baz: ["car", "dar"],
			});

			frontmatter.item("foo")!.value = ["bar2", "baz2"];

			expect(frontmatter.toString()).toBe(
				nl(
					"---",
					"foo:",
					"  - bar2",
					"  - baz2",
					"baz:",
					"  - car",
					"  - dar",
					"---"
				)
			);
		});

		it("can modify a parsed frontmatter block", () => {
			const frontmatter = parse(
				nl(
					"---",
					"title: Hello, word!",
					"tags:",
					"  - foo",
					"  - bar",
					"date: 2021-01-01",
					"---"
				)
			).frontmatter();

			const block = spawnBlock(frontmatter) as FrontmatterBlock;

			block.setKey("title", "Hello again, world!");
			block.addToKey("tags", ["baz", "jazz"]);
			block.setKey("another", ["bites", "the", "dust"]);

			expect(block.toString()).toEqual(
				nl(
					"---",
					"title: Hello again, world!",
					"tags:",
					"  - foo",
					"  - bar",
					"  - baz",
					"  - jazz",
					"date: 2021-01-01",
					"another:",
					"  - bites",
					"  - the",
					"  - dust",
					"---"
				)
			);
		});
	});
});
