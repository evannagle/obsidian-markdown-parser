import { Token } from "src/Token";
import { PlainTextStatement } from "./PlainTextStatement";
import { Statement } from "./Statement";
import { IVisitor } from "src/visitors/Visitor";
import { FileStatement } from "./FileStatement";

export class InternalLinkStatement extends Statement {
	constructor(
		public left: Token,
		public document: FileStatement,
		public bar: Token | undefined,
		public label: PlainTextStatement | undefined,
		public right: Token
	) {
		super(...arguments);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitInternalLink(this);
	}
}
