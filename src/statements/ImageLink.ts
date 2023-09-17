import { Token } from "src/Token";
import { Statement } from "./Statement";
import { IVisitor } from "src/visitors/Visitor";
import { FileStatement } from "./FileStatement";

export class ImageLinkStatement extends Statement {
	constructor(
		public left: Token,
		public image: FileStatement,
		public right: Token
	) {
		super(...arguments);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitImageLink(this);
	}
}
