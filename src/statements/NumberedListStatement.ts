import { IVisitor } from "src/visitors/Visitor";
import { ListStatement } from "./ListStatement";
import { NumberedListItemStatement } from "./NumberedListItemStatement";

export class NumberedListStatement extends ListStatement {
	constructor(...listItems: NumberedListItemStatement[]) {
		super(...listItems);
	}

	accept(visitor: IVisitor) {
		visitor.visitNumberedList(this);
	}
}
