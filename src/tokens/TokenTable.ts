import { Token, TokenLiteral } from "./Token";
import { Scanner } from "../scanners/Scanner";

export function escapeLinebreaks(text: string): string {
	return text.replace(/\n/g, "\\n");
}

export function escapeLiteral(literal: TokenLiteral) {
	if (literal === null) {
		return "null";
	} else if (typeof literal === "string") {
		return wrap(escapeLinebreaks(literal), '"');
	} else {
		return literal.toString();
	}
}

export function wrap(s: string, bookends: string): string {
	return bookends + s + bookends;
}

/**
 * @example
 * No         | Type       | Lexeme     | Literal    | Line       | Column
 * ---------- | ---------- | ---------- | ---------- | ---------- | ----------
 * 0          | SYMBOL     | "Foo"      | "Foo"      | 0          | 0
 * 1          | SPACE      | " "        | 1          | 0          | 3
 * 2          | TAG        | "#-bar"    | "-bar"     | 0          | 4
 * 3          | EOF        | ""         | ""         | 0          | 9
 */
export class TokenTable {
	public minColumnWidth = 10;
	public bar = " | ";
	public hr = "-";

	constructor(public tokens: Token[]) {}

	/**
	 * Prints the token table to the console.
	 */
	public print(): void {
		console.log(this.toString());
	}

	/**
	 * Returns a string representation of the token table.
	 * @returns A string representation of the token table.
	 */
	public toString(): string {
		const cells: string[][] = [
			["No", "Type", "Lexeme", "Literal", "Line", "Column"],
		];

		let index = 0;
		let cellSizes: number[] = Array((cells[0] as string[]).length).fill(
			this.minColumnWidth
		);

		for (const token of this.tokens) {
			const rowCells: string[] = [
				(index++).toString(),
				token.type,
				wrap(escapeLinebreaks(token.lexeme), '"'),
				escapeLiteral(token.literal),
				token.line.toString(),
				token.column.toString(),
			];

			cellSizes = rowCells.map((cell, index) =>
				Math.max(cellSizes[index] as number, cell.length)
			);

			cells.push(rowCells);
		}

		const paddedCells = cells.map((row) =>
			row.map((cell, index) => cell.padEnd(cellSizes[index] as number))
		);

		const hrs = (paddedCells[0] as string[]).map((cell) =>
			this.hr.repeat(cell.length)
		);

		paddedCells.splice(1, 0, hrs);

		const rows = paddedCells.map((row) => row.join(this.bar));
		const table = rows.join("\n");
		return table;
	}
}

export function printTokens(tokens: string | Token[]): void {
	if (typeof tokens === "string") {
		tokens = new Scanner(tokens).scan();
	}
	new TokenTable(tokens).print();
}
