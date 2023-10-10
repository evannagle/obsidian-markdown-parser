import { describe, expect, it } from "vitest";
import { block } from "../BlockFactory";
import { nl } from "src/scanners/ScannerBase";

describe("MetadataSpan", () => {
	it("creates a new MetadataSpan", () => {
		const span = block(
			nl(
				"# Section 1",
				"",
				"Foo:: Bar",
				"## Subsection 1",
				"",
				"Qux:: Baz",
				"Moof:: Car",
				"",
				"### Subsubsection 1",
				"",
				"Quux:: Qaz"
			)
		);

		expect(span.getMetadata().toDictionary()).toEqual({
			Foo: "Bar",
			Qux: "Baz",
			Moof: "Car",
			Quux: "Qaz",
		});
	});

	it("includes frontmatter items", () => {
		const span = block(
			nl(
				"---",
				"Frontmatter: Item",
				"---",
				"# Section 1",
				"",
				"Foo:: Bar",
				"## Subsection 1",
				"",
				"Qux:: Baz",
				"Moof:: Car",
				"",
				"### Subsubsection 1",
				"",
				"Quux:: Qaz"
			)
		);

		expect(span.getMetadata().toDictionary()).toEqual({
			Frontmatter: "Item",
			Foo: "Bar",
			Qux: "Baz",
			Moof: "Car",
			Quux: "Qaz",
		});
	});

	it("creates arrays when a metadata key is duplicated", () => {
		const span = block(nl("# Section 1", "", "Foo:: Bar", "Foo:: Bar2"));

		const dict = span.getMetadata().toDictionary();
		expect(dict.Foo).toEqual(["Bar", "Bar2"]);
	});

	it("can modify a key", () => {
		const span = block(nl("# Section 1", "", "Foo:: Bar"));
		const metadata = span.getMetadata();

		metadata.set("Foo", "Baz");
		expect(span.toString()).toEqual(
			nl("# Section 1", "", "Foo:: Baz").toString()
		);
	});

	it("can find a key using a regex", () => {
		const span = block(
			nl("# Section 1", "Foo:: Bar", "# Section 2", "Foo2:: Baz")
		);
		const metadata = span.getMetadata();
		const foos = metadata.findAll(/^Foo.*/);
		expect(foos.length).toEqual(2);
	});

	it("can find an item using a function", () => {
		const span = block(
			nl("# Section 1", "Foo:: Bar", "# Section 2", "Foo2:: Baz")
		);
		const metadata = span.getMetadata();
		const foos = metadata.findAll((block) => block.value.startsWith("Ba"));
		expect(foos.length).toEqual(2);
	});

	it("can delete a key", () => {
		const span = block(nl("# Section 1", "Foo:: Bar"));
		const metadata = span.getMetadata();
		metadata.remove("Foo");

		expect(span.toString()).toEqual(nl("# Section 1", "").toString());
	});

	it("can change a key", () => {
		const span = block(nl("# Section 1", "Foo:: Bar"));
		const metadata = span.getMetadata();
		metadata.single("Foo").key = "Moo";
		expect(span.toString()).toEqual(nl("# Section 1", "Moo:: Bar"));
	});

	it("can change a frontmatter value", () => {
		const span = block(
			nl(
				"---",
				"Frontmatter: Item",
				"---",
				"# Section 1",
				"",
				"Foo:: Bar"
			)
		);

		const metadata = span.getMetadata();
		metadata.single("Frontmatter").value = ["Item1", "Item2"];

		expect(span.toString()).toEqual(
			nl(
				"---",
				"Frontmatter:",
				"  - Item1",
				"  - Item2",
				"---",
				"# Section 1",
				"",
				"Foo:: Bar"
			)
		);
	});
});
