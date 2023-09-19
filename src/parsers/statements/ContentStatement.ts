import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";

export class ContentStatement extends Statement {
	public accept(visitor: IVisitor): void {
		visitor.visitContent(this);
	}
}
