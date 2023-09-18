import { parseMarkdown } from "./Parser";
import { nl } from "src/scanners/ScannerBase";
import { describe, expect, it } from "vitest";
import {
	FrontmatterItemStatement,
	FrontmatterListStatement,
} from "./statements";
import { printStatement } from "src/visitors/DebugVisitor";
import { scanTokens } from "src/scanners/Scanner";
import { printTokens } from "src/tokens/TokenTable";

describe("Parser", () => {
	it("parses frontmatter key", () => {
		const parsed = parseMarkdown(nl("---", "foo: bar", "---"));

		expect(parsed.frontmatter).toBeDefined();
		expect(parsed.frontmatter?.items.length).toBe(1);
		expect(parsed.frontmatter?.items[0]?.key.toString()).toBe("foo");
	});

	it("parses frontmatter value", () => {
		const parsed = parseMarkdown(nl("---", "foo: bar", "---"));
		const items = parsed.frontmatter?.items as FrontmatterItemStatement[];
		expect(items[0]?.value?.toString()).toBe("bar");
	});

	it("parses a frontmatter list value", () => {
		const parsed = parseMarkdown(
			nl("---", "foo:", "- bar", "- zar", "---")
		);

		const items = parsed.frontmatter?.items as FrontmatterItemStatement[];
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
