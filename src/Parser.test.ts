import { test } from "vitest";
import { parse } from "./Parser";
import { debugStatements } from "./visitors/DebugVisitor";
import { nl } from "./TokenizerBase";

test("parses section expression", () => {
	const statement = parse(
		nl(
			"## Hello there [[boy|kid one]] genius [google is the jam!](https://google.com) [[and another]] woah",
			"### another line [[kid wonder]]",
			"and some regular rich text [[woo]]"
		)
	);
	// console.log(expression[0]?.text.statements[1].label);
	// printTokens(tokens);
	debugStatements(statement);
});
