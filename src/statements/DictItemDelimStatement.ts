import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";

export class DictItemDelimStatement extends Statement {
	accept(visitor: IVisitor) {
		visitor.visitDictItemDelim(this);
	}
}
