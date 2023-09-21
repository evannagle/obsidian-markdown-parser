import { IVisitor } from "src/visitors/Visitor";
import { Statement, StatementPart } from "./Statement";
import { FrontmatterStatement } from "./FrontmatterStatement";
import { ContentStatement } from "./ContentStatement";
import { SectionStatement } from "./SectionStatement";
import { parseMarkdownDoc } from "../Parser";

export class DocumentStatement extends Statement {
	constructor(
		public frontmatter: FrontmatterStatement | undefined,
		public lede: ContentStatement | undefined,
		public sections: SectionStatement[] = []
	) {
		super();
	}

	/**
	 *
	 * @param documentSource The source of the document.
	 * @returns The document, represented as a tree of statements.
	 */
	public static create(documentSource: string): DocumentStatement {
		return parseMarkdownDoc(documentSource);
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	protected getParts(): StatementPart[] {
		return [this.frontmatter, this.lede, ...this.sections];
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitDocument(this);
	}
}
