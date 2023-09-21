import { expect, describe, it } from "vitest";
import { CodeBlock } from "./CodeBlock";

describe("CodeBlock", () => {
	it("creates a CodeBlock", () => {
		const codeBlock = CodeBlock.create({
			language: "javascript",
			metadata: {
				foo: "bar",
			},
			source: ["console.log('Hello World!');"],
		});

		expect(codeBlock.toString().split("\n")).toEqual([
			"```javascript",
			"foo: bar",
			"",
			"console.log('Hello World!');",
			"```",
		]);
	});

	it("updates the code block language", () => {
		const codeBlock = CodeBlock.create({
			language: "javascript",
			metadata: {
				foo: "bar",
			},
			source: ["console.log('Hello World!');"],
		});

		codeBlock.language = "typescript";

		expect(codeBlock.toString().split("\n")).toEqual([
			"```typescript",
			"foo: bar",
			"",
			"console.log('Hello World!');",
			"```",
		]);
	});

	it("gets code block metadata", () => {
		const codeBlock = CodeBlock.create({
			language: "javascript",
			metadata: {
				foo: "bar",
			},
			source: ["console.log('Hello World!');"],
		});

		expect(codeBlock.metadata.get("foo")).toBe("bar");
	});

	it("gets default value from code block metadata", () => {
		const codeBlock = CodeBlock.create({
			language: "javascript",
			metadata: {
				foo: "bar",
			},
			source: ["console.log('Hello World!');"],
		});

		expect(codeBlock.metadata.get("foo2", "bar")).toBe("bar");
	});

	it("updates the code block metadata", () => {
		const codeBlock = CodeBlock.create({
			language: "javascript",
			metadata: {
				foo: "bar",
			},
			source: ["console.log('Hello World!');"],
		});

		// codeBlock.setMetadataItem("moose", "goose");
		codeBlock.metadata.set("moose", "goose");

		expect(codeBlock.toString().split("\n")).toEqual([
			"```javascript",
			"foo: bar",
			"moose: goose",
			"",
			"console.log('Hello World!');",
			"```",
		]);
	});

	it("updates many code block metadata items", () => {
		const codeBlock = CodeBlock.create({
			language: "javascript",
			metadata: {
				foo: "bar",
			},
			source: ["console.log('Hello World!');"],
		});

		codeBlock.metadata.setMany({
			moose: "goose",
			goose: "moose",
		});

		expect(codeBlock.toString().split("\n")).toEqual([
			"```javascript",
			"foo: bar",
			"moose: goose",
			"goose: moose",
			"",
			"console.log('Hello World!');",
			"```",
		]);
	});

	it("deletes a metadata item", () => {
		const codeBlock = CodeBlock.create({
			language: "javascript",
			metadata: {
				foo: "bar",
			},
			source: ["console.log('Hello World!');"],
		});

		codeBlock.metadata.remove("foo");

		expect(codeBlock.toString().split("\n")).toEqual([
			"```javascript",
			"",
			"console.log('Hello World!');",
			"```",
		]);
	});

	it("updates the source code", () => {
		const codeBlock = CodeBlock.create({
			language: "javascript",
			metadata: {
				foo: "bar",
			},
			source: ["console.log('Hello World!');"],
		});

		codeBlock.source += " // Hello World!";

		expect(codeBlock.toString().split("\n")).toEqual([
			"```javascript",
			"foo: bar",
			"",
			"console.log('Hello World!'); // Hello World!",
			"```",
		]);
	});
});
