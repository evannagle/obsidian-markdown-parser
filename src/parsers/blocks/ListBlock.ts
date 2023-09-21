import {
	ListItemStatement,
	ListStatement,
	RichTextStatement,
} from "../statements";
import { Block } from "./Block";
import { Token } from "src/tokens/Token";

export type listItemType = string | ListItemBlock | ListItemStatement;

export class ListBlock extends Block<ListStatement> {
	public items: ListItemBlock[];
	public stmt: ListStatement;

	public constructor(statement: ListStatement) {
		super(statement);
		this.items = this.stmt.items.map((item) => new ListItemBlock(item));
	}

	/**
	 * Add an item to the list.
	 * @param item The item to add
	 * @param sublist Indented sublist of items underneath the item.
	 */
	public add(item: listItemType, sublist?: ListBlock): void {
		if (sublist) {
			sublist.tab = this.tab + 1;
		}

		const itemContent = ListItemBlock.create(item).content;
		this.stmt.items.push(
			ListItemStatement.create(0, itemContent, sublist?.stmt)
		);
	}

	/**
	 * Create a new list block.
	 * @param items The items to add to the list.
	 * @returns A new list block.
	 */
	public static create(...items: listItemType[]): ListBlock {
		const listStatement = new ListStatement(
			items.map((item) => ListItemBlock.resolveStatement(item))
		);
		return new ListBlock(listStatement);
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
	 * Gets the tab level of the list.
	 */
	public get tab(): number {
		return this.items?.[0]?.tab ?? 0;
	}

	/**
	 * Sets the tab level of the list.
	 */
	public set tab(tab: number) {
		this.items.forEach((item) => {
			item.tab = tab;
		});
	}
}

export class ListItemBlock extends Block<ListItemStatement> {
	protected _sublist?: ListBlock;

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
		this.stmt.list = list.stmt;
		this._sublist = list;
	}

	public get sublist(): ListBlock | undefined {
		return this._sublist;
	}

	/**
	 * Convert a string, ListItemBlock, or ListItemStatement to a ListItemBlock.
	 * @param item The item to convert.
	 * @returns A ListItemBlock.
	 */
	public static create(item: listItemType): ListItemBlock {
		if (typeof item === "string") {
			return new ListItemBlock(ListItemStatement.create(0, item));
		} else if (item instanceof ListItemBlock) {
			return item;
		} else {
			return new ListItemBlock(item);
		}
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
	 * Convert a string, ListItemBlock, or ListItemStatement to a ListItemStatement.
	 * @param item The item to convert.
	 * @returns A ListItemStatement.
	 */
	public static resolveStatement(item: listItemType): ListItemStatement {
		if (typeof item === "string") {
			return ListItemStatement.create(0, item);
		} else if (item instanceof ListItemStatement) {
			return item;
		} else {
			return item.stmt;
		}
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
