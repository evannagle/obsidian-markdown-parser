import { IVisitor } from "src/visitors/Visitor";
import { Statement, StatementPart } from "./Statement";
import { parse } from "../Parser";

export class RichTextStatement extends Statement {
	constructor(public parts: StatementPart[]) {
		super();
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	protected getParts(): StatementPart[] {
		return this.parts;
	}

	public accept(visitor: IVisitor): void {
		visitor.visitRichText(this);
	}

	public static create(content: string): RichTextStatement {
		return parse(content).richText();
	}
}
