import { describe, expect, it } from "vitest";
import { FrontmatterBlock } from "./FrontmatterBlock";

describe("FrontmatterBlock", () => {
	it("creates a frontmatter block", () => {
		const block = FrontmatterBlock.create({
			foo: "bar",
			moo: "zar",
		});

		expect(block.toString().split("\n")).toEqual([
			"---",
			"foo: bar",
			"moo: zar",
			"---",
		]);
	});

	it("creates a frontmatter block with a list", () => {
		const block = FrontmatterBlock.create({
			foo: ["bar", "baz"],
			moo: "zar",
		});

		expect(block.toString().split("\n")).toEqual([
			"---",
			"foo:",
			"- bar",
			"- baz",
			"moo: zar",
			"---",
		]);
	});

	it("gets a value", () => {
		const block = FrontmatterBlock.create({
			foo: "bar",
			moo: "zar",
		});

		expect(block.get("foo")).toBe("bar");
		expect(block.get("baz")).toBeUndefined();
		expect(block.get("baz", "xx")).toBe("xx");
	});

	it("gets a value from a list", () => {
		const block = FrontmatterBlock.create({
			foo: ["bar", "baz"],
			moo: "zar",
		});

		expect(block.get("foo")).toEqual(["bar", "baz"]);
		expect(block.get("foo", "xx")).toEqual(["bar", "baz"]);
		expect(block.get("foo1", ["xx"])).toEqual(["xx"]);
	});

	it("sets a value", () => {
		const block = FrontmatterBlock.create({
			foo: "bar",
			moo: "zar",
		});

		block.set("qux", "dar");

		expect(block.toString().split("\n")).toEqual([
			"---",
			"foo: bar",
			"moo: zar",
			"qux: dar",
			"---",
		]);
	});

	it("updates a value", () => {
		const block = FrontmatterBlock.create({
			foo: "bar",
			moo: "zar",
		});

		block.set("foo", "dar");

		expect(block.toString().split("\n")).toEqual([
			"---",
			"foo: dar",
			"moo: zar",
			"---",
		]);
	});

	it("removes a value", () => {
		const block = FrontmatterBlock.create({
			foo: "bar",
			moo: "zar",
		});

		block.removeKey("foo");

		expect(block.toString().split("\n")).toEqual([
			"---",
			"moo: zar",
			"---",
		]);
	});

	it("converts a scalar value to a list", () => {
		const block = FrontmatterBlock.create({
			foo: "bar",
			moo: "zar",
		});

		block.set("foo", ["dar"]);

		expect(block.toString().split("\n")).toEqual([
			"---",
			"foo:",
			"- dar",
			"moo: zar",
			"---",
		]);
	});

	it("converts a scalar to a list using convertToList", () => {
		const block = FrontmatterBlock.create({
			foo: "bar",
			moo: "zar",
		});

		block.convertKeyToList("foo");

		expect(block.toString().split("\n")).toEqual([
			"---",
			"foo:",
			"- bar",
			"moo: zar",
			"---",
		]);
	});

	it("converts a scalar to a list using convertToScalar", () => {
		const block = FrontmatterBlock.create({
			foo: ["bar", "car"],
			moo: "zar",
		});

		block.convertKeyToScalar("foo", ";");

		expect(block.toString().split("\n")).toEqual([
			"---",
			"foo: bar;car",
			"moo: zar",
			"---",
		]);
	});

	it("gets a dictionary", () => {
		const block = FrontmatterBlock.create({
			foo: "bar",
			moo: "zar",
			qux: ["dar", "car"],
		});

		expect(block.getDict()).toEqual({
			foo: "bar",
			moo: "zar",
			qux: ["dar", "car"],
		});
	});

	it("sorts keys", () => {
		const block = FrontmatterBlock.create({
			foo: "bar",
			qux: ["dar", "car"],
			moo: "zar",
		});

		block.sort();

		expect(block.toString().split("\n")).toEqual([
			"---",
			"foo: bar",
			"moo: zar",
			"qux:",
			"- dar",
			"- car",
			"---",
		]);
	});

	it("moves a key to the top", () => {
		const block = FrontmatterBlock.create({
			foo: "bar",
			qux: ["dar", "car"],
			moo: "zar",
		});

		block.moveKeyToTop("moo");

		expect(block.toString().split("\n")).toEqual([
			"---",
			"moo: zar",
			"foo: bar",
			"qux:",
			"- dar",
			"- car",
			"---",
		]);
	});

	it("moves a key to the bottom", () => {
		const block = FrontmatterBlock.create({
			foo: "bar",
			qux: ["dar", "car"],
			moo: "zar",
		});

		block.moveKeyToBottom("foo");

		expect(block.toString().split("\n")).toEqual([
			"---",
			"qux:",
			"- dar",
			"- car",
			"moo: zar",
			"foo: bar",
			"---",
		]);
	});
});
