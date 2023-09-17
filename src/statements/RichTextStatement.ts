import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";

export class RichTextStatement extends Statement {
	public accept(visitor: IVisitor): void {
		visitor.visitRichText(this);
	}
}
