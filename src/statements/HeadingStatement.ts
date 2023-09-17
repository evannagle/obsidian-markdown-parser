import { Token } from "src/Token";
import { Statement } from "./Statement";
import { IVisitor } from "src/visitors/Visitor";
import { RichTextStatement } from "./RichTextStatement";

export class HeadingStatement extends Statement {
	constructor(
		public hash: Token,
		public space: Token,
		public content: RichTextStatement,
		public br: Token
	) {
		super(...arguments);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitHeading(this);
	}
}
