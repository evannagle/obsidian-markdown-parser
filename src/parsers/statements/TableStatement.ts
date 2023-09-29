import { IVisitor } from "src/visitors/Visitor";
import { Statement, StatementPart } from "./Statement";
import { RichTextStatement } from "./RichTextStatement";
import { Token } from "src/tokens/Token";
import { TokenType } from "src/tokens/TokenType";

export class TableStatement extends Statement {
	constructor(public rows: TableRowStatement[]) {
		super();
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	public getParts(): StatementPart[] {
		return this.rows;
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitTable(this);
	}

	/**
	 * Creates a new table statement.
	 * @param rows The rows of the table.
	 * @returns A new table statement.
	 */
	public static create(rows: string[][]): TableStatement {
		return new TableStatement(rows.map(TableRowStatement.create));
	}
}

export class TableRowStatement extends Statement {
	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	constructor(public cells: TableCellStatement[], public br: Token) {
		super();
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	public getParts(): StatementPart[] {
		return [...this.cells, this.br];
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitTableRow(this);
	}

	/**
	 * Creates a new table row statement.
	 * @param cells The cells of the row.
	 * @returns A new table row statement.
	 */
	public static create(cells: string[]): TableRowStatement {
		return new TableRowStatement(
			cells.map((cell, index) =>
				TableCellStatement.create(cell, index === cells.length - 1)
			),
			Token.createBr()
		);
	}
}

export class TableCellStatement extends Statement {
	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	constructor(
		public barOnLeft: Token,
		public content: RichTextStatement,
		public barOnRight: Token | undefined
	) {
		super();
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	public getParts(): StatementPart[] {
		return [this.barOnLeft, this.content, this.barOnRight];
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitTableCell(this);
	}

	/**
	 * Pads the cell value with spaces.
	 * @param cell The cell value to pad.
	 * @returns The padded cell value.
	 */
	static pad(cell: string): string {
		const cellPad = " ".repeat(1);
		return cellPad + cell.trim() + cellPad;
	}

	/**
	 * Creates a new table cell statement.
	 * @param content The content of the cell.
	 * @param lastCellOnRow Whether this is the last cell on the row.
	 * @returns A new table cell statement.
	 */
	public static create(
		content: string,
		lastCellOnRow = false
	): TableCellStatement {
		return new TableCellStatement(
			Token.create(TokenType.PIPE),
			RichTextStatement.create(this.pad(content)),
			lastCellOnRow ? Token.create(TokenType.PIPE) : undefined
		);
	}
}
