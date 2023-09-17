import { Token } from "src/Token";
import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";
import { ListItemDelimStatement } from "./ListItemDelimStatement";
import { ListItemKeyStatement } from "./ListItemKeyStatement";
import { ListItemValueStatement } from "./ListItemValueStatement";

export class ListItemStatement extends Statement {
	constructor(
		public key: ListItemKeyStatement,
		public delim: ListItemDelimStatement | null,
		public value: ListItemValueStatement | null,
		public br: Token
	) {
		super(...arguments);
	}

	accept(visitor: IVisitor) {
		visitor.visitListItem(this);
	}
}
