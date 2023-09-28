import { IVisitor } from "src/visitors/Visitor";
import { ContentStatement } from "./ContentStatement";
import { Statement, StatementPart } from "./Statement";
import { Token } from "src/tokens/Token";
import { RichTextStatement } from "./RichTextStatement";
import { TokenType } from "src/tokens/TokenType";

export class SectionStatement extends Statement {
	public constructor(
		public heading: HeadingStatement,
		public lede: ContentStatement | undefined = undefined,
		public sections: SectionStatement[] = []
	) {
		super();
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	public getParts(): StatementPart[] {
		return [this.heading, this.lede, ...this.sections];
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitSection(this);
	}

	/**
	 *
	 * @param heading The heading of the section.
	 * @param lede The lede of the section.
	 * @param sections The sections of the section.
	 * @returns
	 */
	public static create(
		heading: HeadingStatement,
		lede: ContentStatement | undefined,
		sections: SectionStatement[]
	): SectionStatement {
		return new SectionStatement(heading, lede, sections);
	}
}

export class HeadingStatement extends Statement {
	public constructor(
		public hhash: Token,
		public space: Token,
		public content: RichTextStatement,
		public br: Token
	) {
		super();
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	public getParts(): StatementPart[] {
		return [this.hhash, this.space, this.content, this.br];
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitHeading(this);
	}

	/**
	 * Creates a new heading.
	 * @param content The content of the heading.
	 * @param level The level of the heading.
	 * @returns The generated heading.
	 */
	public static create(content: string, level = 1): HeadingStatement {
		return new HeadingStatement(
			Token.create(TokenType.HHASH, "#".repeat(level), level),
			Token.createSpace(),
			RichTextStatement.create(content),
			Token.createBr(2)
		);
	}
}
