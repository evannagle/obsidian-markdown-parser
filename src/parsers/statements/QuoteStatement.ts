import { IVisitor } from "src/visitors/Visitor";
import { RichTextStatement } from "./RichTextStatement";
import { Token } from "src/tokens/Token";
import { Statement } from "./Statement";

export class QuoteStatement extends Statement {
	public constructor(
		public gtOnLeft: Token,
		public space: Token | undefined,
		public content: RichTextStatement,
		public br: Token
	) {
		super([gtOnLeft, space, content, br]);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitQuote(this);
	}
}
