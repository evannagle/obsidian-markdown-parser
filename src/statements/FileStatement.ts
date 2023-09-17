import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";

export class FileStatement extends Statement {
	public accept(visitor: IVisitor): void {
		visitor.visitFile(this);
	}
}
