import { IVisitor } from "src/visitors/Visitor";
import { Statement, StatementPart } from "./Statement";
import { Parser } from "../Parser";

/**
 * Represents a content statement. Content statements are used to represent
 * Content *below* a header in a given section.
 *
 * Content statements are often referred to as "ledes" as they appear below a heading
 * And *before* a child heading is encountered.
 *
 */
export class ContentStatement extends Statement {
	public constructor(public parts: StatementPart[]) {
		super();
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	protected getParts(): StatementPart[] {
		return this.parts;
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitContent(this);
	}

	/**
	 *
	 * @param content The content of the content statement.
	 * @returns
	 */
	public static create(content: string): ContentStatement {
		return new Parser(content).content() as ContentStatement;
	}
}
