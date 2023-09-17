import { IVisitor } from "src/visitors/Visitor";
import { ListItemValueStatement } from "./ListItemValueStatement";
import { Token } from "src/Token";
import { ListStatement } from "./ListStatement";

export class DictItemListValueStatement extends ListItemValueStatement {
	constructor(
		public frontBr: Token,
		public list: ListStatement,
		public endBr?: Token
	) {
		super(...arguments);
	}

	public accept(visitor: IVisitor) {
		visitor.visitDictItemListValue(this);
	}
}
