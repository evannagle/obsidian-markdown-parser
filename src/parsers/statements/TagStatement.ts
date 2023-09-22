import { Token } from "src/tokens/Token";
import { Statement, StatementPart } from "./Statement";
import { IVisitor } from "src/visitors/Visitor";
import { TokenType } from "src/tokens/TokenType";

export class TagStatement extends Statement {
	public constructor(public tag: Token) {
		super();
	}

	/**
	 * Creates a new tag statement.
	 * @param tag The value of the tag.
	 * @returns A new tag statement.
	 */
	public static create(tag: string): TagStatement {
		return new TagStatement(Token.create(TokenType.TAG, "#" + tag, tag));
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	protected getParts(): StatementPart[] {
		return [this.tag];
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitTag(this);
	}
}
