import { IVisitor } from "src/visitors/Visitor";
import { RichTextStatement } from "./RichTextStatement";
import { Token } from "src/tokens/Token";
import { Statement, StatementPart } from "./Statement";
import { TokenType } from "src/tokens/TokenType";

export class QuoteStatement extends Statement {
	public constructor(
		public gtOnLeft: Token,
		public space: Token | undefined,
		public content: RichTextStatement,
		public br: Token
	) {
		super();
	}

	/**
	 * Creates a new quote statement.
	 * @param content The content of the quote.
	 * @returns A new quote statement.
	 */
	public static create(content: string): QuoteStatement {
		return new QuoteStatement(
			Token.create(TokenType.HGTHAN),
			Token.createSpace(),
			RichTextStatement.create(content),
			Token.createBr()
		);
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	public getParts(): StatementPart[] {
		return [this.gtOnLeft, this.space, this.content, this.br];
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitQuote(this);
	}
}
