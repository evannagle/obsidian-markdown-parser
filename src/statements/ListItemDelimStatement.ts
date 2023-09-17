import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";

export class ListItemDelimStatement extends Statement {
	accept(visitor: IVisitor) {
		visitor.visitListItemDelim(this);
	}
}
