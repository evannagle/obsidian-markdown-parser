import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";
import { FrontmatterStatement } from "./FrontmatterStatement";

export class DocumentStatement extends Statement {
	constructor(public frontmatter: FrontmatterStatement | undefined) {
		super([frontmatter]);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitDocument(this);
	}
}
