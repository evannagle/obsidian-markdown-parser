import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";
import { Token } from "src/tokens/Token";

export class ListStatement extends Statement {
	constructor(public items: ListItemStatement[]) {
		super(items);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitList(this);
	}
}

export class ListItemStatement extends Statement {
	constructor(
		public bullet: Token,
		public space: Token | undefined,
		public content: Statement | undefined,
		public br: Token
	) {
		super([bullet, space, content, br]);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitListItem(this);
	}
}
