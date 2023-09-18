import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";
import { Token } from "src/tokens/Token";

/**
 * ---
 * alias: value <-- this is a frontmatter item (FrontmatterScalarAttrStatement)
 * foo: <-- this is a frontmatter item (FrontmatterListAttrStatement)
 *  - bar
 *  - baz
 * ---
 */
export class FrontmatterItemStatement extends Statement {
	constructor(
		public key: Token,
		public colon: Token,
		public space: Token | undefined,
		public value: Token | Statement | undefined,
		public br: Token | undefined
	) {
		super([key, colon, space, value, br]);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitFrontmatterItem(this);
	}
}

export class FrontmatterScalarAttrStatement extends FrontmatterItemStatement {}

export class FrontmatterListAttrStatement extends FrontmatterItemStatement {
	constructor(
		public key: Token,
		public colon: Token,
		public space: Token | undefined,
		public list: FrontmatterListStatement,
		public br: Token | undefined
	) {
		super(key, colon, space, list, br);
	}
}

export class FrontmatterListStatement extends Statement {
	constructor(public items: FrontmatterListItemStatement[]) {
		super(items);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitFrontmatterList(this);
	}
}

export class FrontmatterListItemStatement extends Statement {
	constructor(
		public bullet: Token,
		public space: Token | undefined,
		public value: Token | undefined,
		public br: Token
	) {
		super([bullet, space, value, br]);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitFrontmatterListItem(this);
	}
}

export class FrontmatterStatement extends Statement {
	constructor(
		public opening: Token,
		public br: Token,
		public items: FrontmatterItemStatement[],
		public closing: Token
	) {
		super([opening, ...items, closing]);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitFrontmatter(this);
	}
}
