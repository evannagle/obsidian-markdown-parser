import { describe, expect, it } from "vitest";
import { ListBlock, ListItemBlock } from "./ListBlock";

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

	it("creates a ListBlock from ListItemBlocks", () => {
		const listBlock = ListBlock.create(
			ListItemBlock.create("foo"),
			ListItemBlock.create("bar"),
			ListItemBlock.create("baz")
		);

		expect(listBlock.toString().split("\n")).toEqual([
			"- foo",
			"- bar",
			"- baz",
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
});
