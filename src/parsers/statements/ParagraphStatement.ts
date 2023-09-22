import { IVisitor } from "src/visitors/Visitor";
import { RichTextStatement } from "./RichTextStatement";
import { Token } from "src/tokens/Token";
import { Statement, StatementPart } from "./Statement";

/**
 * A paragraph statement is a line of content that contains plain text and rich text.
 */
export class ParagraphStatement extends Statement {
	public constructor(public content: RichTextStatement, public br: Token) {
		super();
	}

	/**
	 * Creates a new paragraph statement.
	 * @param content The content of the paragraph.
	 * @returns A new paragraph statement.
	 */
	public static create(content: string): ParagraphStatement {
		return new ParagraphStatement(
			RichTextStatement.create(content),
			Token.createBr()
		);
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	protected getParts(): StatementPart[] {
		return [this.content, this.br];
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitParagraph(this);
	}
}
