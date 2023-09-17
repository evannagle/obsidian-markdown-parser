import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";
import { Token } from "src/Token";
import { FrontmatterDictStatement } from "./FrontmatterDictStatement";

export class FrontmatterStatement extends Statement {
	constructor(
		public start: Token,
		public br: Token,
		public dictionary: FrontmatterDictStatement,
		public end: Token
	) {
		super(start, br, dictionary, end);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitFrontmatter(this);
	}
}
