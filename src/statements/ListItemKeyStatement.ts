import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";

export class ListItemKeyStatement extends Statement {
	public accept(visitor: IVisitor): void {
		visitor.visitListItemKey(this);
	}
}
