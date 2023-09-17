import { Token } from "src/Token";
import { ListItemStatement } from "./ListItemStatement";
import { IVisitor } from "src/visitors/Visitor";
import { ListItemKeyStatement } from "./ListItemKeyStatement";
import { ListItemValueStatement } from "./ListItemValueStatement";
import { ListItemDelimStatement } from "./ListItemDelimStatement";

export class NumberedListItemStatement extends ListItemStatement {
	constructor(
		public key: ListItemKeyStatement,
		public delim: ListItemDelimStatement,
		public value: ListItemValueStatement,
		public br: Token
	) {
		super(key, delim, value, br);
	}

	accept(visitor: IVisitor): void {
		visitor.visitNumberedListItem(this);
	}
}
