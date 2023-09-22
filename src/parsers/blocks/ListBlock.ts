import { TokenType } from "src/tokens/TokenType";
import {
	CheckboxStatement,
	ListItemBaseStatement,
	ListItemStatement,
	ListStatement,
	NumberedListItemStatement,
	NumberedListStatement,
	RichTextStatement,
} from "../statements";
import { Block } from "./Block";
import { Token } from "src/tokens/Token";

export type listItemBlockTypes =
	| ListItemBlock
	| CheckboxBlock
	| NumberedListItemBlock;

export type listItemBlockTypesOrStr = listItemBlockTypes | string;

/**
 * Represents a list.
 *
 * @example
 * - item 1
 * - item 2
 * - item 2.1
 *
 * @example
 * - [ ] item 1
 * - [ ] item 2
 *   - [ ] item 2.1
 *
 */
export class ListBlock extends Block<ListStatement> {
	public items: listItemBlockTypes[];

	public constructor(statement: ListStatement) {
		super(statement);
		this.items = this.stmt.items.map(
			(item) => new ListItemBlock(item, this)
		);
	}

	/**
	 * Add an item to the list.
	 * @param item The item to add
	 * @param sublist Indented sublist of items underneath the item.
	 */
	public add(
		item: listItemBlockTypesOrStr | listItemBlockTypesOrStr[],
		sublist?: ListBlock
	): this {
		if (sublist) {
			sublist.tab = this.tab + 1;
		}

		if (typeof item === "string") {
			return this.addString(item, sublist);
		} else if (Array.isArray(item)) {
			item.map((i) => this.add(i, sublist));
			return this;
		} else if (item instanceof ListItemBaseBlock) {
			item.parent = this;
			const itemStatment = item.releaseStatementToParent(this);

			this.items.push(item);
			this.stmt.items.push(itemStatment);
			item.tab = this.tab;
			// this.stmt.items.push(item.stmt);
		} else {
			throw new Error("Invalid item type: " + typeof item);
		}

		return this;
	}

	/**
	 * Add a list item statement to the list.
	 * In most cases, you should use add() instead.
	 * @param stmt The list item statement to add.
	 */
	protected addStatement(stmt: ListItemBaseStatement): this {
		const item = new ListItemBlock(stmt);
		item.tab = this.tab;
		this.stmt.items.push(stmt);
		this.items.push(item);
		return this;
	}

	/**
	 * Add a list item with the specified content.
	 * @param item The content of the list item.
	 * @param sublist An indented sublist under this list item.
	 */
	protected addString(item: string, sublist?: ListBlock): this {
		const stmt = ListItemStatement.create(0, item, sublist?.stmt);
		this.addStatement(stmt);
		return this;
	}

	/**
	 * Create a new list block.
	 * @param items The items to add to the list.
	 * @returns A new list block.
	 */
	public static create(...items: string[]): ListBlock {
		return new ListBlock(ListStatement.createAtTab(0, items));
	}

	/**
	 * Find the first item that matches the specified function.
	 * @param where The function to use to find the item.
	 * @returns
	 */
	public firstItemWhere(
		where: (item: listItemBlockTypes) => boolean
	): listItemBlockTypes | undefined {
		for (let i = 0; i < this.items.length; i++) {
			const item = this.items[i];
			if (item && where(item)) {
				return item;
			}
		}

		return undefined;
	}

	/**
	 * Get the item at the specified index.
	 * @param index The index of the item to get.
	 * @returns The item at the specified index.
	 */
	public get(index: number): ListItemBlock {
		if (index < 0 || index >= this.items.length)
			throw new Error("Index out of range");

		return this.items[index] as ListItemBlock;
	}

	/**
	 * Get the item at the specified index.
	 * @param value The value to search for.
	 * @returns
	 */
	public hasValue(value: string): boolean {
		return this.items.some((item) => item.content === value);
	}

	/**
	 * Remove the item at the specified index.
	 * @param index The index of the item to remove.
	 */
	public removeItem(index: number): this {
		this.stmt.items.splice(index, 1);
		this.items.splice(index, 1);
		return this;
	}

	/**
	 * Get the first item that matches the specified function.
	 * If no item matches the function, an error is thrown.
	 * @param where The function to use to find the item.
	 * @returns The first item that matches the specified function.
	 */
	public singleItemWhere(
		where: (item: listItemBlockTypes) => boolean
	): listItemBlockTypes {
		const item = this.items.find(where);
		if (!item) {
			throw new Error("Item not found");
		}
		return item;
	}

	/**
	 * Sort the items in the list.
	 * @param compareFn The function to use to compare the items.
	 */
	public sortBy(compareFn: (a: ListItemBlock, b: ListItemBlock) => number) {
		this.items.sort(compareFn);
		this.stmt.items = this.items.map((item) =>
			item.releaseStatementToParent(this)
		);
	}

	/**
	 * Sort the items in the list by alphabetical order.
	 */
	public sort() {
		this.sortBy((a, b) => {
			if (a.content < b.content) {
				return -1;
			} else if (a.content > b.content) {
				return 1;
			} else {
				return 0;
			}
		});
	}

	/**
	 * Gets the tab level of the list.
	 */
	public get tab(): number {
		const tab = this.items?.[0]?.tab as number;
		if (tab === undefined) {
			return 0;
		} else {
			return tab;
		}
		// return tab ?? 0;
	}

	/**
	 * Sets the tab level of the list.
	 */
	public set tab(tab: number) {
		this.items.forEach((item) => {
			item.tab = tab;
		});
	}

	/**
	 * Sets the parent list for a given listItemStatement.
	 * That means that this list is indented under the given listItemStatement.
	 * @param listItemStmt
	 */
	public setParentListFor(listItemStmt: ListItemStatement) {
		listItemStmt.list = this.stmt;
	}
}

/**
 * Represents a numbered, bulleted, or checkbox list item.
 *
 * @example
 * - item 1 <-- This is a list item.
 * - [ ] item 2 <-- This is a list item.
 * - [x] item 3 <-- This is a list item.
 * 1. item 4 <-- This is a list item.
 *
 */
export class ListItemBaseBlock<
	T extends ListItemBaseStatement
> extends Block<T> {
	constructor(statement: T) {
		super(statement);
		if (statement.list) {
			// this.setParentListTo(statement.list);
			this.sublist = new ListBlock(statement.list);
		}
	}

	protected _sublist?: ListBlock;
	protected _parent?: ListBlock;

	public get parent(): ListBlock | undefined {
		return this._parent;
	}

	public set parent(parent: ListBlock | undefined) {
		this._parent = parent;
	}

	/**
	 * Add a sublist of items under the current list item.
	 * @param items The items to add to the list.
	 *
	 * @example
	 * - foo
	 * - bar
	 *   - baz <-- addSublist("baz", "moo")
	 *   - moo
	 */
	public set sublist(list: ListBlock) {
		list.tab = this.tab + 1;
		list.setParentListFor(this.stmt);
		this._sublist = list;
	}

	/**
	 * Get the sublist of items under the current list item.
	 */
	public get sublist(): ListBlock | undefined {
		return this._sublist;
	}

	/**
	 * Get content of the list item.
	 *
	 * - <This is the content of the list item.>
	 */
	public get content(): string {
		return this.stmt.content?.toString() ?? "";
	}

	/**
	 * Set content of the list item.
	 *
	 * - <This is the content of the list item.>
	 */
	public set content(content: string) {
		this.stmt.content = RichTextStatement.create(content);
	}

	/**
	 *
	 * @param parent The parent list to release the statement to.
	 * @returns
	 */
	public releaseStatementToParent(parent: ListBlock): ListItemStatement {
		if (this.parent !== parent) {
			console.log("x", this.parent, this);
			throw new Error("Parent does not contain this item");
		}

		return this.stmt;
	}

	/**
	 * Get the tab level of the list item.
	 */
	public get tab(): number {
		return (this.stmt.tab?.literal as number) ?? 0;
	}

	/**
	 * Set the tab level of the list item.
	 */
	public set tab(tab: number) {
		this.stmt.tab = Token.createTab(tab);
	}
}

/**
 * Represents a list item.
 *
 * @example
 * - item 1 <-- This is a list item.
 * - [ ] item 2 <-- This is a list item.
 */
export class ListItemBlock extends ListItemBaseBlock<ListItemStatement> {
	public constructor(statement: ListItemStatement, parent?: ListBlock) {
		super(statement);
		this.parent = parent;
	}

	/**
	 * Convert a string, ListItemBlock, or ListItemStatement to a ListItemBlock.
	 * @param item The item to convert.
	 * @returns A ListItemBlock.
	 */
	public static create(item: string): ListItemBlock {
		return new ListItemBlock(ListItemStatement.create(0, item));
	}
}

/**
 * Represents a checkbox list item.
 *
 * @example
 * - [ ] item 1 <-- This is a checkbox list item.
 */
export class CheckboxBlock extends ListItemBaseBlock<CheckboxStatement> {
	/**
	 * Convert a string, CheckboxBlock, or CheckboxStatement to a CheckboxBlock.
	 * @param item The item to convert.
	 * @returns A CheckboxBlock.
	 */
	public static create(item: string, checked = false): CheckboxBlock {
		return new CheckboxBlock(CheckboxStatement.create(0, checked, item));
	}
}

/**
 * Represents a numbered list item.
 *
 * @example
 * 1. item 1 <-- This is a numbered list item.
 */
export class NumberedListItemBlock extends ListItemBaseBlock<NumberedListItemStatement> {
	/**
	 * Convert a string, NumberedListItemBlock, or NumberedListItemStatement to a NumberedListItemBlock.
	 * @param item The item to convert.
	 * @returns A NumberedListItemBlock.
	 */
	public static create(number: number, item: string): NumberedListItemBlock {
		return new NumberedListItemBlock(
			NumberedListItemStatement.create(0, number, item)
		);
	}

	/**
	 * Get the bullet number.
	 */
	public get number(): number {
		return this.stmt.number.literal as number;
	}

	/**
	 * Set the bullet number.
	 */
	public set number(number: number) {
		this.stmt.number = Token.create(
			TokenType.N_BULLET,
			number.toString() + ".",
			number
		);
	}
}

/**
 * Represents a numbered list.
 *
 * @example
 * 1. item 1
 * 2. item 2
 *  1. item 2.1
 * 3. item 3
 *  - [ ] item 3.1
 *  - [x] item 3.2
 * 4. item 4
 */
export class NumberedListBlock extends ListBlock {
	public constructor(statement: NumberedListStatement) {
		super(statement);
		this.items = this.stmt.items.map(
			(item) =>
				new NumberedListItemBlock(item as NumberedListItemStatement)
		);
	}

	/**
	 * Add an item to the list.
	 * @param stmt The list item statement to add.
	 * @returns
	 */
	public override addStatement(stmt: ListItemBaseStatement): this {
		this.stmt.items.push(stmt);
		this.items.push(
			new NumberedListItemBlock(stmt as NumberedListItemStatement)
		);
		return this;
	}

	/**
	 * Add a list item with the specified content.
	 * @param item The content of the list item.
	 * @param sublist An indented sublist under this list item.
	 */
	public override addString(item: string, sublist?: NumberedListBlock): this {
		const stmt = NumberedListItemStatement.create(
			0,
			this.items.length + this._startingIndex,
			item,
			sublist?.stmt
		);
		this.addStatement(stmt);
		return this;
	}

	/**
	 * Create a new list block.
	 * @param items The items to add to the list.
	 * @returns A new list block.
	 */
	public static create(...items: string[]): NumberedListBlock {
		const listBlock = new NumberedListBlock(new NumberedListStatement([]));
		listBlock.add(items);
		return listBlock;
	}

	/**
	 * Remove the item at the specified index.
	 * @param index The index of the item to remove.
	 */
	public override removeItem(index: number): this {
		super.removeItem(index);
		this.renumber();
		return this;
	}

	/**
	 * Renumber the list items.
	 */
	public renumber(start?: number): this {
		start = start ?? this._startingIndex;

		this.items.forEach((item, index) => {
			if (item instanceof NumberedListItemBlock) {
				item.number = index + start!;
			}
		});

		return this;
	}

	/**
	 *
	 * @param index The index to start the list at.
	 *
	 * @example
	 * const list = NumberedListBlock.create("foo", "bar", "baz");
	 *
	 * list.startAt(3);
	 *
	 * expect(list.toString().split("\n")).toEqual([
	 *    "3. foo",
	 *   "4. bar",
	 *   "5. baz",
	 * ]);
	 */
	public startAt(index: number): void {
		this._startingIndex = index;
		this.renumber();
	}

	private _startingIndex = 1;
}
