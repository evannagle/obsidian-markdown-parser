import { describe, expect, it } from "vitest";
import { TableBlock } from "./TableBlock";

describe("TableBlock", () => {
	it("creates a table block", () => {
		const block = TableBlock.create([
			["foo", "bar"],
			["moo", "zar"],
		]);

		expect(block.toString().split("\n")).toEqual([
			"|foo|bar|",
			"|moo|zar|",
			"",
		]);
	});

	it("can autocreate the spacer row", () => {
		const block = TableBlock.create([
			["foo", "bar"],
			["moo", "zar"],
		]).insertSpacerRow();

		expect(block.toString().split("\n")).toEqual([
			"|foo|bar|",
			"|---|---|",
			"|moo|zar|",
			"",
		]);
	});

	it("gets row", () => {
		const block = TableBlock.create([
			["foo", "bar"],
			["moo", "zar"],
		]);

		expect(block.getRow(0)).toEqual(["foo", "bar"]);
	});

	it("creates a dictionary from columns", () => {
		const block = TableBlock.create([
			["foo", "bar"],
			["moo", "zar"],
			["dar", "car"],
		]);

		expect(block.toDict()).toEqual({
			foo: ["moo", "dar"],
			bar: ["zar", "car"],
		});
	});

	it("removes the separator row if it exists", () => {
		const block = TableBlock.create([
			["foo", "bar"],
			["---", "---"],
			["moo", "zar"],
			["dar", "car"],
		]);

		expect(block.toDict()).toEqual({
			foo: ["moo", "dar"],
			bar: ["zar", "car"],
		});
	});

	it("returns a column", () => {
		const block = TableBlock.create([
			["foo", "bar", "a"],
			["---", "---", "---"],
			["moo", "zar", "b"],
			["dar", "car", "c"],
		]);

		expect(block.getColumn(2)).toEqual(["b", "c"]);
	});

	it("returns a column by name", () => {
		const block = TableBlock.create([
			["foo", "bar", "a"],
			["---", "---", "---"],
			["moo", "zar", "b"],
			["dar", "car", "c"],
		]);

		expect(block.getColumnByName("a")).toEqual(["b", "c"]);
	});

	it("can update a row", () => {
		const block = TableBlock.create([
			["foo", "bar", "a"],
			["---", "---", "---"],
			["moo", "zar", "b"],
			["dar", "car", "c"],
		]);

		block.setRow(2, ["dar", "car", "c"]);

		expect(block.toString().split("\n")).toEqual([
			"|foo|bar|a|",
			"|---|---|---|",
			"|dar|car|c|",
			"|dar|car|c|",
			"",
		]);
	});

	it("can remove a row", () => {
		const block = TableBlock.create([
			["foo", "bar", "a"],
			["---", "---", "---"],
			["moo", "zar", "b"],
			["dar", "car", "c"],
		]);

		block.removeRow(2);

		expect(block.toString().split("\n")).toEqual([
			"|foo|bar|a|",
			"|---|---|---|",
			"|dar|car|c|",
			"",
		]);
	});

	it("can add a row", () => {
		const block = TableBlock.create([
			["foo", "bar", "a"],
			["---", "---", "---"],
			["moo", "zar", "b"],
			["dar", "car", "c"],
		]);

		block.addRow(["dar", "car", "c"]);

		expect(block.toString().split("\n")).toEqual([
			"|foo|bar|a|",
			"|---|---|---|",
			"|moo|zar|b|",
			"|dar|car|c|",
			"|dar|car|c|",
			"",
		]);
	});

	it("can add a row to the top of a table", () => {
		const block = TableBlock.create([
			["foo", "bar", "a"],
			["---", "---", "---"],
			["moo", "zar", "b"],
			["dar", "car", "c"],
		]);

		// block.addRow(["dar", "car", "c"], 2);
		block.addRowBelowHeader(["dar", "car", "c"]);

		expect(block.toString().split("\n")).toEqual([
			"|foo|bar|a|",
			"|---|---|---|",
			"|dar|car|c|",
			"|moo|zar|b|",
			"|dar|car|c|",
			"",
		]);
	});

	it("can add a row to the top of a table, no separator", () => {
		const block = TableBlock.create([
			["foo", "bar", "a"],
			["moo", "zar", "b"],
			["dar", "car", "c"],
		]);

		// block.addRow(["dar", "car", "c"], 2);
		block.addRowBelowHeader(["dar", "car", "c"]);

		expect(block.toString().split("\n")).toEqual([
			"|foo|bar|a|",
			"|dar|car|c|",
			"|moo|zar|b|",
			"|dar|car|c|",
			"",
		]);
	});

	it("can sort rows", () => {
		const block = TableBlock.create([
			["foo", "bar", "a"],
			["---", "---", "---"],
			["moo", "zar", "b"],
			["dar", "car", "c"],
		]);

		block.sortBy((a, b) => {
			return b[2]!.localeCompare(a[2]!);
		});

		expect(block.toString().split("\n")).toEqual([
			"|foo|bar|a|",
			"|---|---|---|",
			"|dar|car|c|",
			"|moo|zar|b|",
			"",
		]);
	});

	it("can remove a column", () => {
		const block = TableBlock.create([
			["foo", "bar", "a"],
			["---", "---", "---"],
			["moo", "zar", "b"],
			["dar", "car", "c"],
		]);

		block.removeColumn(2);

		expect(block.toString().split("\n")).toEqual([
			"|foo|bar|",
			"|---|---|",
			"|moo|zar|",
			"|dar|car|",
			"",
		]);
	});
});
