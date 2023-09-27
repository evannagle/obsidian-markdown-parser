import { IVisitor } from "src/visitors/Visitor";
import { Statement, StatementPart } from "./Statement";
import { Token } from "src/tokens/Token";
import { TokenType } from "src/tokens/TokenType";
import { scanTokens } from "src/scanners/Scanner";

export enum InlineCodeType {
	Code = "code",
	Latex = "latex",
}

/**
 * Represents an inline code statement.
 *
 * @example
 * `console.log("Hello, world!");` is an inline code statement.
 *
 * @example
 * `$\frac{1}{2}$` is an inline LaTeX statement.
 */
export class InlineCodeStatement extends Statement {
	public type = InlineCodeType.Code;

	public constructor(
		public backtickOnLeft: Token,
		public content: Token[],
		public backtickOnRight: Token
	) {
		super();
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	public getParts(): StatementPart[] {
		return [this.backtickOnLeft, ...this.content, this.backtickOnRight];
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitInlineCode(this);
	}

	/**
	 * Creates an inline code statement.
	 * @param content The content of the inline code statement.
	 * @returns The generated inline code statement.
	 */
	public static create(content: string): InlineCodeStatement {
		return new InlineCodeStatement(
			Token.create(TokenType.BACKTICK),
			// scanTokens(content),
			[Token.create(TokenType.CODE_SOURCE, content)],
			Token.create(TokenType.BACKTICK)
		);
	}
}

/**
 * Represents an inline LaTeX statement.
 *
 * @example
 * `$\frac{1}{2}$` is an inline LaTeX statement.
 */
export class InlineLatexStatement extends InlineCodeStatement {
	public type = InlineCodeType.Latex;

	/**
	 * Creates an inline LaTeX statement.
	 * @param content The content of the inline LaTeX statement.
	 * @returns The generated inline LaTeX statement.
	 */
	public static create(content: string): InlineLatexStatement {
		return new InlineLatexStatement(
			Token.create(TokenType.DOLLAR),
			scanTokens(content),
			Token.create(TokenType.DOLLAR)
		);
	}
}
