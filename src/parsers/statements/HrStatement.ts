import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";
import { Token } from "src/tokens/Token";

export class HrStatement extends Statement {
	constructor(public hr: Token, public br: Token) {
		super([hr, br]);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitHr(this);
	}
}
