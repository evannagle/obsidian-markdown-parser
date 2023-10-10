import { nl } from "src/scanners/ScannerBase";
import { describe, expect, it } from "vitest";
import { block } from "../BlockFactory";

describe("MetadataTreeSpan", () => {
	it("creates a new MetadataTreeSpan", () => {
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

		const tree = span.getMetadataTree();
		expect(tree.toDictionary()).toEqual({
			"Section 1": {
				Foo: "Bar",
				"Subsection 1": {
					Qux: "Baz",
					Moof: "Car",
					"Subsubsection 1": {
						Quux: "Qaz",
					},
				},
			},
		});
	});

	it("steps back from a node when a lower-level heading is found", () => {
		const span = block(
			nl(
				"# A",
				"",
				"Foo:: Bar",
				"## AA",
				"",
				"Qux:: Baz",
				"Moof:: Car",
				"",
				"### AAA",
				"Moo:: Car",
				"",
				"# B",
				"",
				"Quux:: Qaz"
			)
		);

		const tree = span.getMetadataTree();
		expect(tree.toDictionary()).toEqual({
			A: {
				Foo: "Bar",
				AA: {
					Qux: "Baz",
					Moof: "Car",
					AAA: {
						Moo: "Car",
					},
				},
			},
			B: {
				Quux: "Qaz",
			},
		});
	});

	it("can delete a metadata item in the tree", () => {
		const span = block(
			nl(
				"# A",
				"",
				"Foo:: Bar",
				"## AA",
				"",
				"Qux:: Baz",
				"Moof:: Car",
				"",
				"### AAA",
				"Moo:: Car",
				"",
				"# B",
				"",
				"Quux:: Qaz"
			)
		);

		const tree = span.getMetadataTree();
		tree.remove("B");
		tree.remove("Moof");

		expect(tree.toDictionary()).toEqual({
			A: {
				Foo: "Bar",
				AA: {
					Qux: "Baz",
					AAA: {
						Moo: "Car",
					},
				},
			},
		});
	});

	it("handles a lower level header after first header at higher level", () => {
		const span = block(
			nl(
				"## A",
				"",
				"Foo:: Bar",
				"### AA",
				"",
				"Qux:: Baz",
				"# B",
				"",
				"Quux:: Qaz"
			)
		);

		const tree = span.getMetadataTree();

		expect(tree.toDictionary()).toEqual({
			A: {
				Foo: "Bar",
				AA: {
					Qux: "Baz",
				},
			},
			B: {
				Quux: "Qaz",
			},
		});
	});
});
