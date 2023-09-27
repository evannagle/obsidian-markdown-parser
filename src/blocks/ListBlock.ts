import {
	CheckboxStatement,
	ListItemStatement,
	ListStatement,
	NumberedListItemStatement,
	NumberedListStatement,
} from "src/parsers/statements/ListStatement";
import {
	RichTextBlock,
	RichTextContent,
	createRichTextBlock,
} from "./RichTextBlock";
import { TokenBlock, createTokenBlock } from "./TokenBlock";
import {
	spawnBlock,
	spawnFromContent,
	spawnFromContentAndCreate,
} from "./BlockFactory";
import { isStatement } from "src/parsers/statements/Statement";
import { Token } from "src/tokens/Token";
import { MutableBlock } from "./MutableBlock";

export type ListItemContent = ListItemBlock | ListItemStatement | string;
export type ListContent =
	| ListBlock
	| ListStatement
	| ListItemContent[]
	| string;
export type NumberedListContent =
	| NumberedListBlock
	| NumberedListStatement
	| NumberedListItemContent[]
	| string;
export type CheckboxListItemContent =
	| CheckboxListItemBlock
	| CheckboxStatement
	| string;
export type NumberedListItemContent =
	| ListItemBlock
	| NumberedListItemStatement
	| string;

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
export class ListBlock extends MutableBlock {
	public constructor(...children: ListItemBlock[]) {
		super(...children);
	}

	public item(index: number): ListItemBlock {
		return this.get<ListItemBlock>(index);
	}

	public get tab(): number {
		return this.item(0)?.tab ?? 0;
	}

	public set tab(tab: number) {
		this.children.forEach((child: ListItemBlock) => {
			child.tab = tab;
		});
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
export class NumberedListBlock extends ListBlock {
	protected override onMutation(): void {
		super.onMutation();
		this.reorder();
	}

	public reorder() {
		let c = 1;

		this.children.forEach((child: ListItemBlock, index: number) => {
			if (child instanceof NumberedListItemBlock) {
				child.number = c++;
			}

			if (child.list instanceof NumberedListBlock) {
				child.list.reorder();
			}
		});
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
 */
export class ListItemBlock extends MutableBlock {
	public static override allowedChildren = [
		TokenBlock,
		RichTextBlock,
		ListBlock,
		NumberedListBlock,
	];
	public static override childCount = 6;
	public contentIndex = 3;
	public tabIndex = 0;
	public listIndex = 5;

	public constructor(
		tab: TokenBlock,
		bullet: TokenBlock,
		space: TokenBlock,
		content: RichTextBlock,
		br: TokenBlock,
		list: ListBlock | undefined = undefined
	) {
		super(tab, bullet, space, content, br, list);
	}

	public get content(): string {
		return this.str(this.contentIndex);
	}

	public set content(content: RichTextContent) {
		this.set(this.contentIndex, createRichTextBlock(content));
	}

	public get list(): ListBlock {
		return this.get(this.listIndex) as ListBlock;
	}

	public set list(listContent: ListContent) {
		this.set(this.listIndex, createListBlock(listContent));
		this.list.tab = this.tab + 1;
	}

	public get tab(): number {
		return this.get<TokenBlock>(this.tabIndex).toNumber() ?? 0;
	}

	public set tab(tab: number) {
		this.set(this.tabIndex, createTokenBlock(Token.createTab(tab)));
		if (this.list) this.list.tab++;
	}

	public sublist(listContent: ListContent): this {
		this.list = listContent;
		return this;
	}

	public atTab(tab: number): this {
		this.tab = tab;
		return this;
	}
}

/**
 * Represents a checkbox list item.
 *
 * @example
 * - [ ] item 1 <-- This is a checkbox list item.
 */
export class CheckboxListItemBlock extends ListItemBlock {
	public override contentIndex = 4;
	public override listIndex = 6;

	public constructor(
		tab: TokenBlock,
		checkbox: TokenBlock,
		space: TokenBlock,
		content: RichTextBlock,
		br: TokenBlock,
		list: ListBlock | undefined = undefined
	) {
		super(tab, checkbox, space, content, br, list);
	}
}

/**
 * Represents a numbered list item.
 *
 * @example
 * 1. item 1 <-- This is a numbered list item.
 */
export class NumberedListItemBlock extends ListItemBlock {
	public override contentIndex = 4;
	public override listIndex = 6;
	public numberIndex = 1;

	public constructor(
		tab: TokenBlock,
		number: TokenBlock,
		space: TokenBlock,
		content: RichTextBlock,
		br: TokenBlock,
		list: ListBlock | undefined = undefined
	) {
		super(tab, number, space, content, br, list);
	}

	public get number(): number {
		return this.get<TokenBlock>(this.numberIndex).toNumber() ?? 0;
	}

	public set number(number: number) {
		this.set(this.numberIndex, createTokenBlock(Token.createNumLi(number)));
	}
}

/**
 * Create a list block.
 * @param content The list content.
 * @returns A list block.
 */
export function createListBlock(content: ListContent): ListBlock {
	if (Array.isArray(content)) {
		return new ListBlock(
			...content.map((item) => createListItemBlock(item))
		);
	}

	return spawnFromContent<ListBlock>(content, ListStatement);
}

/**
 * Create a numbered list block.
 * @param content The numbered list content.
 * @returns A numbered list block.
 */
export function createNumberedList(
	content: NumberedListContent
): NumberedListBlock {
	if (Array.isArray(content)) {
		return new NumberedListBlock(
			...content.map((item) => createNumberedListItem(item))
		);
	} else if (isStatement(content)) {
		return spawnBlock(content) as NumberedListBlock;
	} else {
		return content as NumberedListBlock;
	}
}

/**
 * Create a list item block.
 * @param content The list item content
 * @returns A list item block
 */
export function createListItemBlock(content: ListItemContent): ListItemBlock {
	return spawnFromContentAndCreate<ListItemBlock, ListItemStatement>(
		content,
		(c) => ListItemStatement.create(0, c)
	);
}

/**
 * Create a checkbox list item block.
 * @param content The checkbox list item content
 * @param checked Whether the checkbox is checked
 * @returns A checkbox list item block
 */
export function createCheckbox(
	content: CheckboxListItemContent,
	checked = false
) {
	return spawnFromContentAndCreate<CheckboxListItemBlock, CheckboxStatement>(
		content,
		(c) => CheckboxStatement.create(0, checked, c)
	);
}

/**
 *
 * @param content The numbered list item content
 * @param index The index of the numbered list item
 * @returns A numbered list item block
 */
export function createNumberedListItem(
	content: NumberedListItemContent,
	index = 1
) {
	return spawnFromContentAndCreate<
		NumberedListItemBlock,
		NumberedListItemStatement
	>(content, (c) => NumberedListItemStatement.create(0, index, c));
}
