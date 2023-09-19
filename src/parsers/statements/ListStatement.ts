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
		public tab: Token | undefined,
		public bullet: Token,
		public space: Token | undefined,
		public content: Statement | undefined,
		public br: Token,
		public list: ListStatement | undefined = undefined
	) {
		super([bullet, space, content, br, list]);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitListItem(this);
	}
}

export class CheckboxStatement extends ListItemStatement {
	constructor(
		public tab: Token | undefined,
		public checkbox: Token,
		public space: Token | undefined,
		public content: Statement | undefined,
		public br: Token,
		public list: ListStatement | undefined = undefined
	) {
		super(tab, checkbox, space, content, br);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitCheckbox(this);
	}
}

export class NumberedListStatement extends ListStatement {}

export class NumberedListItemStatement extends ListItemStatement {
	constructor(
		public tab: Token | undefined,
		public number: Token,
		public space: Token | undefined,
		public content: Statement | undefined,
		public br: Token,
		public list: ListStatement | undefined = undefined
	) {
		super(tab, number, space, content, br, list);
	}
}
