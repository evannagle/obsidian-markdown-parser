import { IVisitor } from "src/visitors/Visitor";
import { RichTextStatement } from "./RichTextStatement";
import { Token } from "src/tokens/Token";
import { Statement, StatementPart } from "./Statement";

export class QuoteStatement extends Statement {
	public constructor(
		public gtOnLeft: Token,
		public space: Token | undefined,
		public content: RichTextStatement,
		public br: Token
	) {
		super();
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	protected getParts(): StatementPart[] {
		return [this.gtOnLeft, this.space, this.content, this.br];
	}

	public accept(visitor: IVisitor): void {
		visitor.visitQuote(this);
	}
}
