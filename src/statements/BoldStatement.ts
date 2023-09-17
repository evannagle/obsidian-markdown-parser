import { Token } from "src/Token";
import { RichTextStatement } from "./RichTextStatement";
import { Statement } from "./Statement";
import { IVisitor } from "src/visitors/Visitor";

export class BoldStatement extends Statement {
	constructor(
		public left: Token,
		public content: RichTextStatement,
		public right: Token
	) {
		super(...arguments);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitBold(this);
	}
}
