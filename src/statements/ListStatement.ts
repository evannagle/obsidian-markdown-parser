import { IVisitor } from "src/visitors/Visitor";
import { ListItemStatement } from "./ListItemStatement";
import { Statement } from "./Statement";

export class ListStatement extends Statement {
	public items: ListItemStatement[] = [];

	constructor(...listItems: ListItemStatement[]) {
		super(...arguments);
		this.items = listItems;
	}

	accept(visitor: IVisitor) {
		visitor.visitList(this);
	}
}
