import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";

export class ListItemValueStatement extends Statement {
	public accept(visitor: IVisitor): void {
		visitor.visitListItemValue(this);
	}
}
