import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";
import { FrontmatterStatement } from "./FrontmatterStatement";
import { ContentStatement } from "./ContentStatement";
import { SectionStatement } from "./SectionStatement";

export class DocumentStatement extends Statement {
	constructor(
		public frontmatter: FrontmatterStatement | undefined,
		public lede: ContentStatement | undefined,
		public sections: SectionStatement[] = []
	) {
		super([frontmatter, lede, ...sections]);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitDocument(this);
	}
}
