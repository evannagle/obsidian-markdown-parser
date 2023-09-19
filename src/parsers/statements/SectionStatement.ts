import { IVisitor } from "src/visitors/Visitor";
import { ContentStatement } from "./ContentStatement";
import { Statement } from "./Statement";
import { Token } from "src/tokens/Token";
import { RichTextStatement } from "./RichTextStatement";

export class SectionStatement extends Statement {
	public constructor(
		public heading: HeadingStatement,
		public lede: ContentStatement | undefined,
		public sections: SectionStatement[]
	) {
		super([heading, lede, ...sections]);
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
		super([hhash, space, content, br]);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitHeading(this);
	}
}
