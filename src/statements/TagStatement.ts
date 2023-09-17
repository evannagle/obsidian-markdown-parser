import { Token } from "src/Token";
import { Statement } from "./Statement";
import { IVisitor } from "src/visitors/Visitor";

export class TagStatement extends Statement {
	constructor(public token: Token) {
		super(...arguments);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitTag(this);
	}
}
