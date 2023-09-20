import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";
import { Token } from "src/tokens/Token";
import { TokenType } from "src/tokens/TokenType";

/**
 * Markdown frontmatter is a YAML block at the top of a markdown document.
 * It is used to store metadata about the document.
 *
 * @link https://jekyllrb.com/docs/front-matter/
 *
 * @example parsed from a string:
 * const frontmatter = new Parser(nl(
 * 		"---",
 * 		"alias: value",
 * 		"foo:",
 * 		" - bar",
 * 		" - baz",
 * 		"---"
 * )).frontmatter();
 *
 * @example from code:
 * const frontmatter = FrontmatterStatement.create({
 * 		alias: "value",
 * 		foo: ["bar", "baz"]
 * });
 */
export class FrontmatterStatement extends Statement {
	constructor(
		public opening: Token,
		public br: Token,
		public items: FrontmatterItemStatement[],
		public closing: Token
	) {
		super([opening, br, ...items, closing]);
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitFrontmatter(this);
	}

	/**
	 * Creates a frontmatter statement.
	 * @param items The metadata items to create.
	 * @returns The generated frontmatter statement.
	 */
	public static create(items: Record<string, string | string[]>) {
		return new FrontmatterStatement(
			Token.create(TokenType.FRONTMATTER_START),
			Token.createBr(1),
			FrontmatterItemStatement.createMany(items),
			Token.create(TokenType.FRONTMATTER_END)
		);
	}
}

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

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitFrontmatterItem(this);
	}

	/**
	 * Creates a frontmatter item.
	 * @param key The key of the frontmatter item.
	 * @param value The value of the frontmatter item, either a string or an array of strings.
	 * @returns The generated frontmatter item.
	 */
	public static create(key: string, value: string | string[]) {
		if (typeof value === "string") {
			return FrontmatterScalarAttrStatement.create(key, value);
		} else {
			return FrontmatterListAttrStatement.create(key, value);
		}
	}

	/**
	 *
	 * @param dictionary A dictionary of frontmatter items.
	 * @returns A generated array of frontmatter items.
	 */
	public static createMany(
		dictionary: Record<string, string | string[]>
	): FrontmatterItemStatement[] {
		return Object.entries(dictionary).map(([key, value]) =>
			FrontmatterItemStatement.create(key, value)
		);
	}
}

/**
 * ---
 * alias: value <-- this is a frontmatter item (FrontmatterScalarAttrStatement)
 * ---
 */
export class FrontmatterScalarAttrStatement extends FrontmatterItemStatement {
	/**
	 * Creates a frontmatter item.
	 * @param key The key of the frontmatter item.
	 * @param value The value of the frontmatter item.
	 * @returns The generated frontmatter item.
	 */
	public static create(key: string, value: string) {
		return new FrontmatterScalarAttrStatement(
			Token.create(TokenType.FRONTMATTER_KEY, key),
			Token.create(TokenType.COLON),
			Token.createSpace(),
			Token.create(TokenType.FRONTMATTER_VALUE, value),
			Token.createBr()
		);
	}

	/**
	 * Creates many frontmatter items.
	 * @param dictionary The dictionary of frontmatter items.
	 * @returns A generated array of frontmatter items.
	 */
	public static createMany(dictionary: Record<string, string>) {
		return Object.entries(dictionary).map(([key, value]) =>
			FrontmatterScalarAttrStatement.create(key, value)
		);
	}
}

/**
 * ---
 * foo:  <--|
 * - bar    |
 * - baz <--| these lines are a single frontmatter item (FrontmatterListAttrStatement)
 */
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

	/**
	 * Creates a frontmatter item.
	 * @param key The key of the frontmatter item.
	 * @param items The items of the frontmatter item.
	 * @returns The generated frontmatter item.
	 */
	public static create(key: string, items: string[]) {
		return new FrontmatterListAttrStatement(
			Token.create(TokenType.FRONTMATTER_KEY, key),
			Token.create(TokenType.COLON),
			Token.createBr(1),
			FrontmatterListStatement.create(items),
			undefined
		);
	}
}

/**
 * ---
 * foo:
 * - bar <--|
 * - baz <--| these two lines are a FrontmatterListStatement
 */
export class FrontmatterListStatement extends Statement {
	constructor(public items: FrontmatterListItemStatement[]) {
		super(items);
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitFrontmatterList(this);
	}

	/**
	 * Creates a frontmatter list.
	 * @param items The items of the frontmatter list.
	 * @returns The generated frontmatter list.
	 */
	public static create(items: string[]) {
		return new FrontmatterListStatement(
			items.map((item) => FrontmatterListItemStatement.create(item))
		);
	}
}

/**
 * ---
 * foo:
 * - bar <-- this line is a FrontmatterListItemStatement
 * ---
 */
export class FrontmatterListItemStatement extends Statement {
	constructor(
		public bullet: Token,
		public space: Token | undefined,
		public value: Token | undefined,
		public br: Token
	) {
		super([bullet, space, value, br]);
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitFrontmatterListItem(this);
	}

	/**
	 * Creates a frontmatter list item.
	 * @param value The value of the frontmatter list item.
	 * @returns The generated frontmatter list item.
	 */
	public static create(value: string) {
		return new FrontmatterListItemStatement(
			Token.create(TokenType.FRONTMATTER_BULLET),
			Token.createSpace(),
			Token.create(TokenType.FRONTMATTER_VALUE, value),
			Token.createBr()
		);
	}
}
