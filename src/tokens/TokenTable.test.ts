import { afterAll, describe, it, expect, vi } from "vitest";
import { printTokens } from "./TokenTable";

describe("TokenTable", () => {
	const consoleMock = vi
		.spyOn(console, "log")
		.mockImplementation(() => undefined);

	afterAll(() => {
		consoleMock.mockReset();
	});

	it("printTokens takes a string and prints tokens", () => {
		printTokens("hello");
		expect(consoleMock).toHaveBeenCalledTimes(1);
	});
});
