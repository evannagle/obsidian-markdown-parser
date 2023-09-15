import { Token, TokenLiteral } from "./Token";

export class TokenTable {
	constructor(public tokens: Token[]) {}

	private escapeLexeme(lexeme: string): string {
		return '"' + lexeme.replace(/\n/g, "\\n") + '"';
	}

	private escapeLiteral(literal: TokenLiteral) {
		if (literal === null) {
			return "null";
		} else if (typeof literal === "string") {
			return (
				'"' + literal.replace(/\n/g, "\\n").replace("\0", "\\0") + '"'
			);
		} else {
			return literal.toString();
		}
	}

	public print(): void {
		console.log(this.toString());
	}

	public toString(): string {
		const minColumnWidth = 10;

		const cells: string[][] = [
			["No", "Type", "Lexeme", "Literal", "Line", "Column"],
		];

		let index = 0;
		let cellSizes: number[] = Array((cells[0] as string[]).length).fill(
			minColumnWidth
		);

		for (const token of this.tokens) {
			const rowCells: string[] = [
				(index++).toString(),
				token.type,
				this.escapeLexeme(token.lexeme),
				this.escapeLiteral(token.literal),
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
			"-".repeat(cell.length)
		);

		paddedCells.splice(1, 0, hrs);

		const rows = paddedCells.map((row) => row.join(" | "));
		const table = rows.join("\n");
		return table;
	}
}

export function printTokens(tokens: Token[]): void {
	new TokenTable(tokens).print();
}
