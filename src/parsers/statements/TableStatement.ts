import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";
import { RichTextStatement } from "./RichTextStatement";
import { Token } from "src/tokens/Token";

export class TableStatement extends Statement {
	constructor(public rows: TableRowStatement[]) {
		super(rows);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitTable(this);
	}
}

export class TableRowStatement extends Statement {
	constructor(public cells: TableCellStatement[], public br: Token) {
		super([...cells, br]);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitTableRow(this);
	}
}

export class TableCellStatement extends Statement {
	constructor(
		public barOnLeft: Token,
		public content: RichTextStatement,
		public barOnRight: Token | undefined
	) {
		super([barOnLeft, content, barOnRight]);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitTableCell(this);
	}
}
