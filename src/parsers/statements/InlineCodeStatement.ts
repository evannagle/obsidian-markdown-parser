import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";
import { Token } from "src/tokens/Token";

export enum InlineCodeType {
	Code = "code",
	Latex = "latex",
}

export class InlineCodeStatement extends Statement {
	public type = InlineCodeType.Code;

	public constructor(
		public backtickOnLeft: Token,
		public content: Token[],
		public backtickOnRight: Token
	) {
		super([backtickOnLeft, ...content, backtickOnRight]);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitInlineCode(this);
	}
}

export class InlineLatexStatement extends InlineCodeStatement {
	public type = InlineCodeType.Latex;
}
