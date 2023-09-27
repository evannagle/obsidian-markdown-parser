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
	public getParts(): StatementPart[] {
		return this.parts;
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitRichText(this);
	}

	/**
	 * Creates a new rich text statement.
	 * @param content The content of the rich text statement.
	 * @returns The rich text statement.
	 */
	public static create(content: string): RichTextStatement {
		return parse(content).richText();
	}
}
