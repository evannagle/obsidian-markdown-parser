import { Token } from "src/tokens/Token";
import { Statement } from "./Statement";
import { IVisitor } from "src/visitors/Visitor";

export class TagStatement extends Statement {
	public constructor(public tag: Token) {
		super([tag]);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitTag(this);
	}
}
