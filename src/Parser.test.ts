import { getTokens } from "./Tokenizer";
import { printTokens } from "./TokenTable";
import { debugStatements } from "./visitors/DebugVisitor";

import { expect, test } from "vitest";
import { parse } from "./Parser";
import { BoldStatement } from "./statements/BoldStatement";
import { ItalicStatement } from "./statements/ItalicStatement";
import { StrikethroughStatement } from "./statements/StrikethroughStatement";
import { InternalLinkStatement } from "./statements/InternalLinkStatement";
import { ExternalLinkStatement } from "./statements/ExternalLinkStatement";
import { RichTextStatement } from "./statements/RichTextStatement";
import { PlainTextStatement } from "./statements/PlainTextStatement";
import { HeadingStatement } from "./statements/HeadingStatement";
import { CheckboxStatement } from "./statements/CheckBoxStatement";
import { ImageLinkStatement } from "./statements/ImageLink";
import { ListStatement } from "./statements/ListStatement";
import { ListItemStatement } from "./statements/ListItemStatement";
import { nl } from "./TokenizerBase";
import { NumberedListStatement } from "./statements/NumberedListStatement";
import { NumberedListItemStatement } from "./statements/NumberedListItemStatement";
import { TagStatement } from "./statements/TagStatement";
import { MetadataStatement } from "./statements/MetadataStatement";
import { FrontmatterStatement } from "./statements/FrontmatterStatement";
import { FrontmatterDictItemStatement } from "./statements/FrontmatterDictItemStatement";
import { DictItemValueStatement } from "./statements/DictItemValueStatement";
import { DictItemListValueStatement } from "./statements/DictItemListValueStatement";

function typeCheck(s: string, type: any) {
	const parsed = parse(s);
	expect(parsed[0]).toBeInstanceOf(type);
}

function firstChildTypeCheck(s: string, type: any) {
	const parsed = parse(s);
	expect(parsed[0]?.parts[0]).toBeInstanceOf(type);
}

test("parses a richtext statement", () => {
	typeCheck("hello", RichTextStatement);
});

test("parses a plaintext statement", () => {
	firstChildTypeCheck("hello", PlainTextStatement);
});

test("parses a bold statement", () => {
	firstChildTypeCheck("**hello**", BoldStatement);
});

test("parses an italic statement", () => {
	firstChildTypeCheck("*hello*", ItalicStatement);
});

test("parses a strikethrough statement", () => {
	firstChildTypeCheck("~~hello~~", StrikethroughStatement);
});

test("parses an internal link", () => {
	firstChildTypeCheck("[[hello]]", InternalLinkStatement);
});

test("parses an internal link with a label", () => {
	firstChildTypeCheck("[[hello|world]]", InternalLinkStatement);
});

test("parses an external link", () => {
	firstChildTypeCheck(
		"[google](https://www.google.com)",
		ExternalLinkStatement
	);
});

test("parses a heading", () => {
	typeCheck("## hello", HeadingStatement);
});

test("parses a checkbox statement", () => {
	firstChildTypeCheck("- [ ] hello", CheckboxStatement);
});

test("parses a checkbox statement with a checked checkbox", () => {
	firstChildTypeCheck("- [x] hello", CheckboxStatement);
});

test("parses an image link", () => {
	firstChildTypeCheck("![[file one]]", ImageLinkStatement);
});

test("parses a list", () => {
	typeCheck("- hello", ListStatement);
});

test("parses a list item", () => {
	firstChildTypeCheck("- hello", ListItemStatement);
});

test("parses multiple list items", () => {
	const parsed = parse(nl("- hello", "- world"));
	const list = parsed[0] as ListStatement;
	expect(list.items.length).toBe(2);
});

test("parses hybrid list items", () => {
	const parsed = parse(nl("- hello", "- [ ] world"));
	const list = parsed[0] as ListStatement;
	expect(list.items.length).toBe(2);
	expect(list.items[0]).toBeInstanceOf(ListItemStatement);
	expect(list.items[1]).toBeInstanceOf(CheckboxStatement);
});

test("parses a numbered list", () => {
	typeCheck("1. hello", NumberedListStatement);
});

test("parses a numbered list item", () => {
	firstChildTypeCheck("1. hello", NumberedListItemStatement);
});

test("parses multiple numbered list items", () => {
	const parsed = parse(nl("1. hello", "2. world"));
	const list = parsed[0] as NumberedListStatement;
	expect(list.items.length).toBe(2);
});

test("parses a tag", () => {
	firstChildTypeCheck("#hello", TagStatement);
});

test("scans metadata", () => {
	typeCheck("foo:: bar", MetadataStatement);
});

test("scans metadata key", () => {
	const parsed = parse("foo:: bar");
	const metadata = parsed[0] as MetadataStatement;
	expect(metadata.key.lexeme).toBe("foo");
});

test("ignores double colons midline", () => {
	const parsed = parse("# hello:: world");
	const heading = parsed[0] as HeadingStatement;
	expect(heading.content.toString()).toBe("hello:: world");
});

test("parses frontmatter key", () => {
	const parsed = parse(nl("---", "foo: bar", "---"));
	const frontmatter = parsed[0] as FrontmatterStatement;
	const kvp = frontmatter.dictionary.items[0] as FrontmatterDictItemStatement;
	expect(kvp.key.toString()).toBe("foo");
});

test("parses frontmatter value", () => {
	const parsed = parse(nl("---", "foo: bar", "---"));
	const frontmatter = parsed[0] as FrontmatterStatement;
	const kvp = frontmatter.dictionary.items[0] as FrontmatterDictItemStatement;
	expect(kvp.value?.toString()).toBe("bar");
});

test("parses frontmatter delim", () => {
	const parsed = parse(nl("---", "foo: bar", "---"));
	const frontmatter = parsed[0] as FrontmatterStatement;
	const kvp = frontmatter.dictionary.items[0] as FrontmatterDictItemStatement;
	expect(kvp.delim?.toString()).toBe(": ");
});

test("parses frontmatter value with spaces", () => {
	const parsed = parse(nl("---", "foo: bar car", "---"));
	const frontmatter = parsed[0] as FrontmatterStatement;
	const kvp = frontmatter.dictionary.items[0] as FrontmatterDictItemStatement;
	expect(kvp.value?.toString()).toBe("bar car");
});

test("parses frontmatter value that is a list", () => {
	const parsed = parse(nl("---", "foo:", "- bar", "- zar", "- mook", "---"));
	const frontmatter = parsed[0] as FrontmatterStatement;
	const kvp = frontmatter.dictionary.items[0] as FrontmatterDictItemStatement;
	const value = kvp.value as DictItemListValueStatement;
	expect(value.list.items.length).toBe(3);
});

test("parses frontmatter with blank lines", () => {
	const parsed = parse(
		nl(
			"---",
			"",
			"",
			"foo: bar",
			"",
			"",
			"",
			"coo:",
			"- one",
			"",
			"",
			"who: bear",
			"",
			"---"
		)
	);

	const frontmatter = parsed[0] as FrontmatterStatement;
	const kvp = frontmatter.dictionary.items[2] as FrontmatterDictItemStatement;
	expect(kvp.value?.toString()).toBe("bear");
});
