import { describe, expect, it } from "vitest";
import {
	ExternalLinkBlock,
	ImageLinkBlock,
	InternalLinkBlock,
} from "./LinkBlock";

describe("InternalLinkBlock", () => {
	it("creates a link block", () => {
		const block = InternalLinkBlock.create("file");
		expect(block.toString()).toBe("[[file]]");
	});

	it("updates a link block", () => {
		const block = InternalLinkBlock.create("file");
		block.file = "newFile";
		expect(block.toString()).toBe("[[newFile]]");
	});

	it("updates an alias", () => {
		const block = InternalLinkBlock.create("file");
		block.alias = "alias";
		expect(block.toString()).toBe("[[file|alias]]");
	});

	it("creates an external link", () => {
		const block = ExternalLinkBlock.create("google", "https://google.com/");
		expect(block.toString()).toBe("[google](https://google.com/)");
	});

	it("sanitizes url string", () => {
		const block = ExternalLinkBlock.create("google", "https://google.com");
		expect(block.url.toString()).toBe("https://google.com/");
	});

	it("updates an external link", () => {
		const block = ExternalLinkBlock.create("google", "https://google.com");
		block.url = "https://bing.com";
		expect(block.toString()).toBe("[google](https://bing.com)");
	});

	it("updates an external link alias", () => {
		const block = ExternalLinkBlock.create("google", "https://google.com");
		block.alias = "bing";
		expect(block.toString()).toBe("[bing](https://google.com/)");
	});

	it("creates an image link", () => {
		const block = ImageLinkBlock.create("image.png");
		expect(block.toString()).toBe("![[image.png]]");
	});

	it("updates an image link", () => {
		const block = ImageLinkBlock.create("image.png");
		block.file = "newImage.png";
		expect(block.toString()).toBe("![[newImage.png]]");
	});
});
