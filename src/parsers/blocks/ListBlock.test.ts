import { describe, expect, it } from "vitest";
import {
	CheckboxBlock,
	ListBlock,
	ListItemBlock,
	NumberedListBlock,
	NumberedListItemBlock,
} from "./ListBlock";
import { parse } from "../Parser";
import { nl } from "src/scanners/ScannerBase";
import { NumberedListStatement } from "../statements";

describe("ListBlock", () => {
	it("creates a ListBlock", () => {
		const listBlock = ListBlock.create("foo", "bar", "baz");

		expect(listBlock.toString().split("\n")).toEqual([
			"- foo",
			"- bar",
			"- baz",
			"",
		]);
	});

	it("creates a numbered list block", () => {
		const listBlock = NumberedListBlock.create("foo", "bar", "baz");

		expect(listBlock.toString().split("\n")).toEqual([
			"1. foo",
			"2. bar",
			"3. baz",
			"",
		]);
	});

	it("creates a numbered list block that does not start at 1", () => {
		const listBlock = NumberedListBlock.create("foo", "bar", "baz");

		listBlock.startAt(3);
		listBlock.add("dung");

		expect(listBlock.toString().split("\n")).toEqual([
			"3. foo",
			"4. bar",
			"5. baz",
			"6. dung",
			"",
		]);
	});

	it("removes an item from the list", () => {
		const listBlock = NumberedListBlock.create("foo", "bar", "baz", "dung");

		listBlock.removeItem(1);

		expect(listBlock.toString().split("\n")).toEqual([
			"1. foo",
			"2. baz",
			"3. dung",
			"",
		]);
	});

	it("creates an empty ListBox that can be added to", () => {
		const listBlock = ListBlock.create();
		listBlock.add("one");

		expect(listBlock.toString().split("\n")).toEqual(["- one", ""]);
	});

	it("creates a ListBlock with checkboxes", () => {
		const listBlock = ListBlock.create("foo", "bar", "baz", "one");

		listBlock.add(CheckboxBlock.create("two"));

		expect(listBlock.toString().split("\n")).toEqual([
			"- foo",
			"- bar",
			"- baz",
			"- one",
			"- [ ] two",
			"",
		]);
	});

	it("creates a ListBlock with numbered items", () => {
		const listBlock = ListBlock.create("foo", "bar", "baz", "one");

		listBlock.add(NumberedListItemBlock.create(1, "two"));

		expect(listBlock.toString().split("\n")).toEqual([
			"- foo",
			"- bar",
			"- baz",
			"- one",
			"1. two",
			"",
		]);
	});

	it("creates ListItems", () => {
		const listBlock = ListBlock.create("foo", "bar", "baz");
		const listItem = listBlock.get(1);
		expect(listItem).toBeInstanceOf(ListItemBlock);
		expect(listItem.content).toBe("bar");
	});

	it("modifies ListItems", () => {
		const listBlock = ListBlock.create("foo", "bar", "baz");

		listBlock.get(1).content = "not bar";

		expect(listBlock.toString().split("\n")).toEqual([
			"- foo",
			"- not bar",
			"- baz",
			"",
		]);
	});

	it("adds ListItems", () => {
		const listBlock = ListBlock.create("foo", "bar", "baz");

		listBlock.add("moo");

		expect(listBlock.toString().split("\n")).toEqual([
			"- foo",
			"- bar",
			"- baz",
			"- moo",
			"",
		]);
	});

	it("allows for tabbing", () => {
		const listBlock = ListBlock.create("foo", "bar", "baz");
		listBlock.tab = 1;

		expect(listBlock.toString().split("\n")).toEqual([
			"  - foo",
			"  - bar",
			"  - baz",
			"",
		]);
	});

	it("adds ListItems and sublists", () => {
		const listBlock = ListBlock.create("foo", "bar", "baz");

		listBlock.add("moo", ListBlock.create("zar", "car", "dar"));

		expect(listBlock.toString().split("\n")).toEqual([
			"- foo",
			"- bar",
			"- baz",
			"- moo",
			"  - zar",
			"  - car",
			"  - dar",
			"",
		]);
	});

	it("adds extra sublist items after instantiation", () => {
		const listBlock = ListBlock.create("foo", "bar", "baz");

		const listItemA = listBlock.get(1) as ListItemBlock;
		listItemA.sublist = ListBlock.create("moo", "zar", "car");

		const listItemB = listItemA.sublist?.get(1) as ListItemBlock;

		listItemB.sublist = ListBlock.create("dar");

		expect(listBlock.toString().split("\n")).toEqual([
			"- foo",
			"- bar",
			"  - moo",
			"  - zar",
			"    - dar",
			"  - car",
			"- baz",
			"",
		]);
	});

	it("parses and modifies a list block statement", () => {
		const listStatement = parse(
			nl("1. foo", "2. bar", "3. baz", "")
		).list() as NumberedListStatement;

		const listBlock = new NumberedListBlock(listStatement);

		listBlock.removeItem(1).startAt(3);

		expect(listStatement.toString().split("\n")).toEqual([
			"3. foo",
			"4. baz",
			"",
		]);
	});

	it("adds list items at the same tab level", () => {
		const listStatement = parse(
			nl("- foo", "  - bar", "")
		).list() as NumberedListStatement;

		const listBlock = new NumberedListBlock(listStatement);

		listBlock.get(0).sublist?.add("baz");

		expect(listStatement.toString().split("\n")).toEqual([
			"- foo",
			"  - bar",
			"  - baz",
			"",
		]);
	});

	it("parses and modifies a nested list", () => {
		const listStatement = parse(
			nl(
				"1. foo",
				"2. bar",
				"  1. moo",
				"  2. zar",
				"    1. dar",
				"  3. car",
				"3. baz",
				""
			)
		).list() as NumberedListStatement;

		const listBlock = new NumberedListBlock(listStatement);

		listBlock.get(1).sublist?.get(1).sublist?.add("woah");

		expect(listStatement.toString().split("\n")).toEqual([
			"1. foo",
			"2. bar",
			"  1. moo",
			"  2. zar",
			"    1. dar",
			"    - woah",
			"  3. car",
			"3. baz",
			"",
		]);
	});

	it("sorts list items", () => {
		const listBlock = ListBlock.create("foo", "bar", "baz");

		listBlock.sort();

		expect(listBlock.toString().split("\n")).toEqual([
			"- bar",
			"- baz",
			"- foo",
			"",
		]);
	});

	it("allows querying and editing using single", () => {
		const listBlock = ListBlock.create("foo", "bar", "baz");

		const bar = listBlock.singleItemWhere((item) => item.content === "bar");
		bar.content = "not bar";

		expect(listBlock.toString().split("\n")).toEqual([
			"- foo",
			"- not bar",
			"- baz",
			"",
		]);
	});
});
