import { Token } from "src/tokens/Token";
import { Statement, StatementPart } from "./Statement";
import { IVisitor } from "src/visitors/Visitor";

export class TagStatement extends Statement {
	public constructor(public tag: Token) {
		super();
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	protected getParts(): StatementPart[] {
		return [this.tag];
	}

	public accept(visitor: IVisitor): void {
		visitor.visitTag(this);
	}
}
