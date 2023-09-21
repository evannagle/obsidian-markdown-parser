import { expect, describe, it } from "vitest";
import { CodeBlock } from "./CodeBlock";
import { parse } from "../Parser";
import { nl } from "src/scanners/ScannerBase";
import { scanTokens } from "src/scanners/Scanner";
import { printTokens } from "src/tokens/TokenTable";

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

	it("creates a mutatable CodeBlock from a statement", () => {
		const codeStatement = parse(
			nl(
				"```javascript",
				"foo: bar",
				"",
				"// Hello World!",
				"console.log('Hello World!');",
				"```"
			)
		).code();

		const codeBlock = new CodeBlock(codeStatement);

		codeBlock.metadata.setMany({
			moose: "goose",
			long: "john",
		});

		codeBlock.source += "// Hello again, World!\n";

		expect(codeBlock.toString().split("\n")).toEqual([
			"```javascript",
			"foo: bar",
			"moose: goose",
			"long: john",
			"",
			"// Hello World!",
			"console.log('Hello World!');",
			"// Hello again, World!",
			"```",
		]);
	});

	it("creates a new metadata section if none exists", () => {
		const codeStatement = parse(
			nl("```javascript", "console.log('Hello World!');", "```")
		).code();

		const codeBlock = new CodeBlock(codeStatement);

		codeBlock.metadata.set("foo", "bar");

		expect(codeBlock.toString().split("\n")).toEqual([
			"```javascript",
			"foo: bar",
			"",
			"console.log('Hello World!');",
			"```",
		]);
	});

	it("sets a language if none exists", () => {
		const codeStatement = parse(
			nl("```", "console.log('Hello World!');", "```")
		).code();

		const codeBlock = new CodeBlock(codeStatement);

		codeBlock.language = "javascript";
		expect(codeBlock.toString().split("\n")).toEqual([
			"```javascript",
			"console.log('Hello World!');",
			"```",
		]);
	});
});
