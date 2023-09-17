import { Token } from "src/Token";
import { Statement } from "./Statement";
import { RichTextStatement } from "./RichTextStatement";
import { IVisitor } from "src/visitors/Visitor";

export class StrikethroughStatement extends Statement {
	constructor(
		public left: Token,
		public content: RichTextStatement,
		public right: Token
	) {
		super(...arguments);
	}

	accept(visitor: IVisitor) {
		visitor.visitStrikethrough(this);
	}
}
