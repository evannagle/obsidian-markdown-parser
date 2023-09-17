import { IVisitor } from "src/visitors/Visitor";
import { ListItemKeyStatement } from "./ListItemKeyStatement";

export class DictItemKeyStatement extends ListItemKeyStatement {
	public accept(visitor: IVisitor): void {
		visitor.visitDictItemKey(this);
	}
}
