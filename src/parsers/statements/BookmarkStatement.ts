import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";
import { Token } from "src/tokens/Token";
import { PlainTextStatement } from "./PlainTextStatement";

export class BookmarkStatement extends Statement {
	public constructor(
		public braceOnLeft: Token,
		public content: PlainTextStatement,
		public braceOnRight: Token
	) {
		super([braceOnLeft, content, braceOnRight]);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitBookmark(this);
	}
}
