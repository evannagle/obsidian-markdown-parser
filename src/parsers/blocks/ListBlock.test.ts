import { describe, expect, it } from "vitest";
import {
	CheckboxBlock,
	ListBlock,
	ListItemBlock,
	NumberedListBlock,
	NumberedListItemBlock,
} from "./ListBlock";

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

		listBlock.remove(1);

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
});
