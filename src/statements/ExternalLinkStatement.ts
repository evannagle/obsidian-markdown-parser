import { Token } from "src/Token";
import { Statement } from "./Statement";
import { IVisitor } from "src/visitors/Visitor";
import { PlainTextStatement } from "./PlainTextStatement";

export class ExternalLinkStatement extends Statement {
	constructor(
		public leftParen: Token,
		public label: PlainTextStatement,
		public rightParen: Token,
		public leftBracket: Token,
		public url: Token,
		public rightBracket: Token
	) {
		super(...arguments);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitExternalLink(this);
	}
}
