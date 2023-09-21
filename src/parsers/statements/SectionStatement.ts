import { IVisitor } from "src/visitors/Visitor";
import { ContentStatement } from "./ContentStatement";
import { Statement, StatementPart } from "./Statement";
import { Token } from "src/tokens/Token";
import { RichTextStatement } from "./RichTextStatement";

export class SectionStatement extends Statement {
	public constructor(
		public heading: HeadingStatement,
		public lede: ContentStatement | undefined,
		public sections: SectionStatement[]
	) {
		super();
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	protected getParts(): StatementPart[] {
		return [this.heading, this.lede, ...this.sections];
	}

	public accept(visitor: IVisitor): void {
		visitor.visitSection(this);
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

	protected getParts(): StatementPart[] {
		return [this.hhash, this.space, this.content, this.br];
	}

	public accept(visitor: IVisitor): void {
		visitor.visitHeading(this);
	}
}
