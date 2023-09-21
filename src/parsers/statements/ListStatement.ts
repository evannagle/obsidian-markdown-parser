import { IVisitor } from "src/visitors/Visitor";
import { Statement, StatementPart } from "./Statement";
import { Token } from "src/tokens/Token";
import { RichTextStatement } from "./RichTextStatement";
import { TokenType } from "src/tokens/TokenType";

/**
 * A list statement.
 *
 * Which can be unordered:
 * - item 1
 * - item 2
 *   - item 2.1
 *
 * Ordered:
 * 1. item 1
 * 2. item 2
 *   1. item 2.1
 *
 * Checkboxes:
 * - [ ] item 1
 * - [x] item 2
 *
 * Hybrids:
 *
 * - [ ] item 1
 * - [x] item 2
 *  - item 2.1
 *    1. item 2.1.1
 *    2. item 2.1.2
 */
export class ListStatement extends Statement {
	public constructor(public items: ListItemStatement[]) {
		super();
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	protected getParts(): StatementPart[] {
		return this.items;
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitList(this);
	}

	/**
	 *
	 * @param tab Indentation level.
	 * @param items The items to add to the list. 
	 * @returns The generated list statement.
	 * 
	 * @example
	 * ```
	 * const list = ListStatement.create(
	 * 	["foo"],
	 * 	["bar"],
	 * 	["baz", ["moo"]],
	 * 	["zar", ["car", ["dar"]]]
	 * );

	 * - foo
	 * - bar
	 * - baz
	 *   - moo
	 * - zar
	 *   - car
	 *     - dar
	 * 
	 */
	public static createAtTab(
		tab: number,
		items: (string | string[])[]
	): ListStatement {
		if (!items || items.length === 0) {
			return new ListStatement([]);
		}

		const listItems = items.map((item) => {
			if (item instanceof ListItemStatement) {
				return item;
			} else if (typeof item === "string") {
				return ListItemStatement.create(tab, item);
			} else {
				return ListItemStatement.create(
					tab,
					item.shift() as string,
					ListStatement.createAtTab(tab + 1, item)
				);
			}
		});

		return new ListStatement(listItems);
	}

	/**
	 *
	 * @param tab Indentation level.
	 * @param items The items to add to the list. 
	 * @returns The generated list statement.
	 * 
	 * @example
	 * ```
	 * const list = ListStatement.create(
	 * 	["foo"],
	 * 	["bar"],
	 * 	["baz", ["moo"]],
	 * 	["zar", ["car", ["dar"]]]
	 * );

	 * - foo
	 * - bar
	 * - baz
	 *   - moo
	 * - zar
	 *   - car
	 *     - dar
	 * 
	 */
	public static create(...items: any[]): ListStatement {
		return ListStatement.createAtTab(0, items);
	}

	/**
	 * Create a simple one-dimensional list.
	 * @param items The items to add to the list.
	 * @returns The generated list statement.
	 */
	public static createDim(...items: string[]) {
		return ListStatement.createAtTab(
			0,
			items.map((item) => [item])
		);
	}
}

/**
 * Represents a list item.
 *
 * @example
 * - item 1  <-- This is a list item.
 * - item 2  <-- This is a list item.
 *   - item 2.1  <-- This is a list item.
 *
 * @example
 * 1. item 1  <-- This is a list item.
 * 2. item 2  <-- This is a list item.
 *   1. item 2.1  <-- This is a list item.
 *
 * @example
 * - [ ] item 1  <-- This is a list item.
 */
export abstract class ListItemBaseStatement extends Statement {
	constructor(
		public tab: Token | undefined,
		public bullet: Token,
		public space: Token | undefined,
		public content: RichTextStatement | undefined,
		public br: Token,
		public list: ListStatement | undefined = undefined
	) {
		super();
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	protected getParts(): StatementPart[] {
		return [
			this.tab,
			this.bullet,
			this.space,
			this.content,
			this.br,
			this.list,
		];
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitListItem(this);
	}
}

/**
 * Represents a list item.
 *
 * @example
 * - item 1  <-- This is a list item.
 * - item 2  <-- This is a list item.
 *  - item 2.1  <-- This is a list item.
 */
export class ListItemStatement extends ListItemBaseStatement {
	public static create(
		tab: number,
		content: string,
		list?: ListStatement
	): ListItemStatement {
		return new ListItemStatement(
			tab > 0 ? Token.createTab(tab) : undefined,
			Token.create(TokenType.BULLET, "-"),
			Token.createSpace(),
			RichTextStatement.create(content),
			Token.createBr(),
			list
		);
	}
}

/**
 * Represents a checkbox list item.
 *
 * @example
 * - [ ] item 1  <-- This is a checkbox list item.
 */
export class CheckboxStatement extends ListItemBaseStatement {
	constructor(
		public tab: Token | undefined,
		public checkbox: Token,
		public space: Token | undefined,
		public content: RichTextStatement | undefined,
		public br: Token,
		public list: ListStatement | undefined = undefined
	) {
		super(tab, checkbox, space, content, br);
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitCheckbox(this);
	}

	/**
	 * Create a checkbox statement. This can be added as a child to a ListStatement.
	 * @param tab The indentation level.
	 * @param checked Whether the checkbox is checked.
	 * @param content The content of the checkbox.
	 * @param list Nested, child list items.
	 * @returns The generated checkbox statement.
	 */
	public static create(
		tab: number,
		checked: boolean,
		content: string,
		list?: ListStatement
	): CheckboxStatement {
		return new CheckboxStatement(
			tab > 0 ? Token.createTab(tab) : undefined,
			Token.create(TokenType.CHECKBOX, checked ? "- [x]" : "- [ ]"),
			Token.createSpace(),
			RichTextStatement.create(content),
			Token.createBr(),
			list
		);
	}
}

/**
 * Represents a numbered list.
 *
 * @example
 * 1. item 1
 * 2. item 2
 *   1. item 2.1
 * 3. item 3
 */
export class NumberedListStatement extends ListStatement {
	/**
	 * Create a numbered list.
	 * @param items The items to add to the list.
	 * @returns The generated list statement.
	 *
	 * @example
	 * ```
	 * const list = NumberedListStatement.create(
	 * 	["foo"],
	 * 	["bar"],
	 * 	["baz", ["moo"]],
	 * 	["zar", ["car", ["dar"]]]
	 * );
	 *
	 * 1. foo
	 * 2. bar
	 * 3. baz
	 *  1. moo
	 * 4. zar
	 *  1. car
	 *   1. dar
	 */
	private static _ncreate(tab: number, items: any[]): NumberedListStatement {
		if (!items || items.length === 0) {
			return new NumberedListStatement([]);
		}

		const listItems = items.map((item, index) => {
			if (item instanceof NumberedListItemStatement) {
				return item;
			} else if (typeof item === "string") {
				return NumberedListItemStatement.create(tab, index + 1, item);
			} else {
				return NumberedListItemStatement.create(
					tab,
					index + 1,
					item.shift(),
					NumberedListStatement._ncreate(tab + 1, item)
				);
			}
		});

		return new NumberedListStatement(listItems);
	}

	/**
	 * Create a numbered list.
	 * @param items The items to add to the list.
	 * @returns The generated list statement.
	 *
	 * @example
	 * ```
	 * const list = NumberedListStatement.create(
	 * 	["foo"],
	 * 	["bar"],
	 * 	["baz", ["moo"]],
	 * 	["zar", ["car", ["dar"]]]
	 * );
	 *
	 * 1. foo
	 * 2. bar
	 * 3. baz
	 *  1. moo
	 * 4. zar
	 *  1. car
	 *   1. dar
	 */
	public static create(...items: any[]): NumberedListStatement {
		return NumberedListStatement._ncreate(0, items);
	}

	/**
	 * Create a simple one-dimensional list.
	 * @param items The items to add to the list.
	 * @returns The generated list statement.
	 */
	public static createDim(...items: string[]): NumberedListStatement {
		return NumberedListStatement._ncreate(
			0,
			items.map((item) => [item])
		);
	}
}

/**
 * Represents a numbered list item.
 *
 * @example
 * 1. item 1 <-- This is a numbered list item.
 * 2. item 2 <-- This is a numbered list item.
 *   1. item 2.1 <-- This is a numbered list item.
 * 3. item 3 <-- This is a numbered list item.
 */
export class NumberedListItemStatement extends ListItemBaseStatement {
	constructor(
		public tab: Token | undefined,
		public number: Token,
		public space: Token | undefined,
		public content: RichTextStatement | undefined,
		public br: Token,
		public list: ListStatement | undefined = undefined
	) {
		super(tab, number, space, content, br, list);
	}

	/**
	 * Create a numbered list item.
	 * @param tab The indentation level.
	 * @param number The bullet index, e.g. 1 for a bullet of "1."
	 * @param content The content of the bullet.
	 * @param list Nested, child list items.
	 * @returns The generated list item statement.
	 */
	public static create(
		tab: number,
		number: number,
		content: string,
		list?: ListStatement
	): NumberedListItemStatement {
		return new NumberedListItemStatement(
			tab > 0 ? Token.createTab(tab) : undefined,
			Token.create(TokenType.N_BULLET, `${number}.`),
			Token.createSpace(),
			RichTextStatement.create(content),
			Token.createBr(),
			list
		);
	}
}
