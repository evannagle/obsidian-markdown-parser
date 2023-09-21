import { describe, expect, it } from "vitest";
import { HrBlock, HrType } from "./HrBlock";

describe("HrBlock", () => {
	it("creates a HrBlock", () => {
		const hrBlock = HrBlock.create();
		expect(hrBlock.toString()).toBe("---\n");
	});

	it("creates a HrBlock with underscores", () => {
		const hrBlock = HrBlock.create(HrType.Underscore);
		expect(hrBlock.toString()).toBe("___\n");
	});

	it("updates the hr block type", () => {
		const hrBlock = HrBlock.create();
		hrBlock.type = HrType.Underscore;
		expect(hrBlock.toString()).toBe("___\n");
	});

	it("returns the hr block type", () => {
		const hrBlock = HrBlock.create();
		expect(hrBlock.type).toBe(HrType.Dash);
	});
});
