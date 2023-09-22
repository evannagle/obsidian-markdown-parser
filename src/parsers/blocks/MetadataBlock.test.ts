import { expect, describe, it } from "vitest";
import { MetadataListBlock, MetadataTagBlock } from "./MetadataBlock";

describe("MetadataListBlock", () => {
	it("creates a metadata block", () => {
		const block = MetadataListBlock.create({
			foo: "bar",
			moo: "zar",
		});

		expect(block.toString().split("\n")).toEqual([
			"foo:: bar",
			"moo:: zar",
			"",
		]);
	});

	it("can add an item", () => {
		const block = MetadataListBlock.create({
			foo: "bar",
			moo: "zar",
		});

		block.set("baz", "dar");

		expect(block.toString().split("\n")).toEqual([
			"foo:: bar",
			"moo:: zar",
			"baz:: dar",
			"",
		]);
	});

	it("can get the value of a metadata item", () => {
		const block = MetadataListBlock.create({
			foo: "bar",
			moo: "zar",
		});

		expect(block.get("foo")).toBe("bar");
		expect(block.get("baz")).toBeUndefined();
		expect(block.get("baz", "xx")).toBe("xx");
	});

	it("can update an item", () => {
		const block = MetadataListBlock.create({
			foo: "bar",
			moo: "zar",
		});

		block.set("foo", "dar");

		expect(block.toString().split("\n")).toEqual([
			"foo:: dar",
			"moo:: zar",
			"",
		]);
	});

	it("can remove an item", () => {
		const block = MetadataListBlock.create({
			foo: "bar",
			moo: "zar",
		});

		block.remove("foo");

		expect(block.toString().split("\n")).toEqual(["moo:: zar", ""]);
	});

	it("can return a dictionary of all items", () => {
		const block = MetadataListBlock.create({
			foo: "bar",
			moo: "zar",
		});

		expect(block.getDict()).toEqual({
			foo: "bar",
			moo: "zar",
		});
	});

	it("can create a metadata tag", () => {
		const tag = MetadataTagBlock.create("foo", "bar");
		expect(tag.toString()).toBe("[foo:: bar]");
	});

	it("can update the key of a metadata tag", () => {
		const tag = MetadataTagBlock.create("foo", "bar");
		tag.key = "baz";
		expect(tag.toString()).toBe("[baz:: bar]");
	});

	it("can update the value of a metadata tag", () => {
		const tag = MetadataTagBlock.create("foo", "bar");
		tag.value = "baz";
		expect(tag.toString()).toBe("[foo:: baz]");
	});

	it("sorts keys alphabetically", () => {
		const block = MetadataListBlock.create({
			foo: "bar",
			moo: "zar",
			aaa: "bbb",
		});

		block.sortKeys();

		expect(block.toString().split("\n")).toEqual([
			"aaa:: bbb",
			"foo:: bar",
			"moo:: zar",
			"",
		]);
	});

	it("moves a key to the top", () => {
		const block = MetadataListBlock.create({
			moo: "zar",
			aaa: "bbb",
			foo: "bar",
		});

		block.moveToTop("foo");

		expect(block.toString().split("\n")).toEqual([
			"foo:: bar",
			"moo:: zar",
			"aaa:: bbb",
			"",
		]);
	});

	it("moves a key to the bottom", () => {
		const block = MetadataListBlock.create({
			moo: "zar",
			aaa: "bbb",
			foo: "bar",
		});

		block.moveToBottom("moo");

		expect(block.toString().split("\n")).toEqual([
			"aaa:: bbb",
			"foo:: bar",
			"moo:: zar",
			"",
		]);
	});
});
