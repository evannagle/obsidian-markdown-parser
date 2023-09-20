import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";
import { Token } from "src/tokens/Token";
import { PlainTextStatement } from "./PlainTextStatement";
import { TokenType } from "src/tokens/TokenType";

/**
 * A bookmark statement.
 *
 * @example
 * Here is a {{bookmark}} inside of a sentence.
 */
export class BookmarkStatement extends Statement {
	public constructor(
		public braceOnLeft: Token,
		public content: PlainTextStatement,
		public braceOnRight: Token
	) {
		super([braceOnLeft, content, braceOnRight]);
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitBookmark(this);
	}

	public static create(content: string): BookmarkStatement {
		return new BookmarkStatement(
			Token.create(TokenType.LL_BRACE),
			PlainTextStatement.create(content),
			Token.create(TokenType.RR_BRACE)
		);
	}
}
