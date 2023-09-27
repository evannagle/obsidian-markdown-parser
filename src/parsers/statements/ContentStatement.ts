import { IVisitor } from "src/visitors/Visitor";
import { Statement, StatementPart } from "./Statement";
import { ParagraphStatement } from "./ParagraphStatement";
import { Token } from "src/tokens/Token";

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
	public getParts(): StatementPart[] {
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
	public static create(content: string, margin = 0): ContentStatement {
		return new ContentStatement([
			ParagraphStatement.create(content),
			margin > 0 ? Token.createBr(margin) : undefined,
		]);
	}
}
