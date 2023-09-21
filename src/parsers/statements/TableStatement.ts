import { IVisitor } from "src/visitors/Visitor";
import { Statement, StatementPart } from "./Statement";
import { RichTextStatement } from "./RichTextStatement";
import { Token } from "src/tokens/Token";

export class TableStatement extends Statement {
	constructor(public rows: TableRowStatement[]) {
		super();
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	protected getParts(): StatementPart[] {
		return this.rows;
	}

	public accept(visitor: IVisitor): void {
		visitor.visitTable(this);
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

	protected getParts(): StatementPart[] {
		return [...this.cells, this.br];
	}

	public accept(visitor: IVisitor): void {
		visitor.visitTableRow(this);
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

	protected getParts(): StatementPart[] {
		return [this.barOnLeft, this.content, this.barOnRight];
	}
	public accept(visitor: IVisitor): void {
		visitor.visitTableCell(this);
	}
}
