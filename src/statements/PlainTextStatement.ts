import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";

export class PlainTextStatement extends Statement {
	public accept(visitor: IVisitor): void {
		visitor.visitPlainText(this);
	}
}
