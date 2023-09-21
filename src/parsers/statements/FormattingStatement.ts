import { Token } from "src/tokens/Token";
import { Statement, StatementPart } from "./Statement";
import { IVisitor } from "src/visitors/Visitor";
import { RichTextStatement } from "./RichTextStatement";
import { TokenType } from "src/tokens/TokenType";
import { Parser } from "../Parser";

/**
 * A formatting statement is a statement that has a decorator on the left and
 * right side of the content. For example, a bold statement has **two asterisks**,
 * an italic statement has *one asterisk*, and a strikethrough statement has
 * ~~two tildes~~.
 *
 * @example parsing from a string
 * const bold = new Parser("**world**").bold();
 *
 * @example parsing from code
 * const bold = BoldStatement.create("world");
 *
 */
export class FormattingStatement extends Statement {
	constructor(
		public decoratorOnLeft: Token,
		public content: RichTextStatement,
		public decoratorOnRight: Token
	) {
		super();
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	protected getParts(): StatementPart[] {
		return [this.decoratorOnLeft, this.content, this.decoratorOnRight];
	}

	public accept(visitor: IVisitor): void {
		visitor.visitFormatting(this);
	}
}

/**
 * A statement with italic formatting.
 * The content is wrapped in asterisks.
 */
export class ItalicStatement extends FormattingStatement {
	public static create(content: string) {
		return new ItalicStatement(
			Token.create(TokenType.ASTERISK),
			new Parser(content).richText(),
			Token.create(TokenType.ASTERISK)
		);
	}
}

/**
 * A statement with bold formatting.
 * The content is wrapped in two asterisks.
 */
export class BoldStatement extends FormattingStatement {
	public static create(content: string) {
		return new BoldStatement(
			Token.create(TokenType.ASTERISK_ASTERISK),
			new Parser(content).richText(),
			Token.create(TokenType.ASTERISK_ASTERISK)
		);
	}
}

/**
 * A statement with strikethrough formatting.
 * The content is wrapped in two tildes.
 */
export class StrikethroughStatement extends FormattingStatement {
	public static create(content: string) {
		return new StrikethroughStatement(
			Token.create(TokenType.TILDE_TILDE),
			new Parser(content).richText(),
			Token.create(TokenType.TILDE_TILDE)
		);
	}
}

/**
 * A statement with highlight formatting.
 * The content is wrapped in two equal signs.
 */
export class HighlightStatement extends FormattingStatement {
	public static create(content: string) {
		return new HighlightStatement(
			Token.create(TokenType.EQUALS_EQUALS),
			new Parser(content).richText(),
			Token.create(TokenType.EQUALS_EQUALS)
		);
	}
}
