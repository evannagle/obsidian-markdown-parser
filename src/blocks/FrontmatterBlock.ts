import {
	FrontmatterItemStatement,
	FrontmatterListItemStatement,
	FrontmatterListStatement,
	FrontmatterStatement,
} from "src/parsers/statements/FrontmatterStatement";
import { ListBlock, ListItemBlock } from "./ListBlock";
import { MetadataBlock, MetadataItemBlock } from "./MetadataBlock";
import {
	spawnBlock,
	spawnFromContent,
	spawnFromContentAndCreate,
} from "./BlockFactory";
import { TokenBlock, createTokenBlock } from "./TokenBlock";
import { isStatement } from "src/parsers/statements/Statement";
import { Token } from "src/tokens/Token";
import { createRichTextBlock } from "./RichTextBlock";

export type FrontmatterContent =
	| FrontmatterBlock
	| FrontmatterStatement
	| Record<string, string | string[]>;
export type FrontmatterItemContent =
	| FrontmatterItemBlock
	| FrontmatterItemStatement
	| [string, string]
	| string;
export type FrontmatterListContent =
	| FrontmatterListBlock
	| FrontmatterListItemContent[]
	| FrontmatterListStatement
	| string;
export type FrontmatterListItemContent =
	| FrontMatterListItemBlock
	| FrontmatterListItemStatement
	| string;

/**
 * Represents a frontmatter block.
 *
 * @example
 * ---
 * title: Hello, world!
 * tags: foo, bar, baz
 * date: 2021-01-01
 * list:
 * - item 1
 * - item 2
 * ---
 */
export class FrontmatterBlock extends MetadataBlock<FrontmatterItemBlock> {
	protected children: FrontmatterItemBlock[];

	public override item(index: string): FrontmatterItemBlock {
		return super.item(index) as FrontmatterItemBlock;
	}

	public addToKey(key: string, value: string | string[]): this {
		value = Array.isArray(value) ? value : [value];

		const item = this.item(key) as FrontmatterItemBlock;

		if (item) {
			item.value = [...item.getValues(), ...value];
		} else {
			this.add(createFrontmatterItemBlock(key, value));
		}

		return this;
	}

	public override setKey(key: string, value: string | string[]): this {
		const newItem = createFrontmatterItemBlock(key, value);
		const item = this.item(key) as FrontmatterItemBlock;
		if (item) {
			this.replace(item, newItem);
		} else {
			this.add(newItem);
		}

		return this;
	}

	/**
	 *
	 * @returns A dictionary of all frontmatter items.
	 *
	 * @example
	 * const frontmatter = FrontmatterBlock.create({
	 *   title: "Hello, world!",
	 *   tags: ["foo", "bar", "baz"],
	 *   date: "2021-01-01",
	 * });
	 *
	 * const dict = frontmatter.getDict();
	 *
	 * // returns:
	 * // {
	 * //   title: "Hello, world!",
	 * //   tags: ["foo", "bar", "baz"],
	 * //   date: "2021-01-01",
	 * // }
	 */
	public override toDict(): Record<string, string | string[]> {
		const dict: Record<string, string | string[]> = {};
		this.children.forEach((item) => {
			dict[item.key] = item.value;
		});
		return dict;
	}
}

/**
 * Represents a single metadata item in the frontmatter
 *
 * @example
 * ---
 * title: Hello, world! <-- This is a frontmatter item.
 * tags: foo, bar, baz <-- This is a frontmatter item.
 * date: 2021-01-01 <-- This is a frontmatter item.
 * ---
 */
export class FrontmatterItemBlock extends MetadataItemBlock {
	protected spaceIndex = 2;
	protected brIndex = 4;

	public override get value(): string | string[] {
		if (this.isList()) {
			return this.getValues();
		} else {
			return this.str(this.valueIndex);
		}
	}

	public isList(): boolean {
		return this.get(this.valueIndex) instanceof FrontmatterListBlock;
	}

	public getValues(): string[] {
		if (!this.isList()) {
			return [this.str(this.valueIndex)];
		} else {
			return this.get(this.valueIndex)
				.getChildren()
				.map((item: FrontMatterListItemBlock) => item.content);
		}
	}

	public override set value(value: string | string[]) {
		if (Array.isArray(value)) {
			this.set(this.spaceIndex, createTokenBlock(Token.createBr(1)));
			this.set(this.valueIndex, createFrontmatterListBlock(value));
			this.set(this.brIndex, createTokenBlock(""));
		} else {
			this.set(this.spaceIndex, createTokenBlock(Token.createSpace(1)));
			this.set(this.valueIndex, createTokenBlock(value));
			this.set(this.brIndex, createTokenBlock(Token.createBr(1)));
		}
	}
}

/**
 * Represents a frontmatter value that is an item in a bulleted list
 *
 * @example
 * ---
 * list:
 * - item 1 <-- This is a frontmatter list item.
 * - item 2 <-- This is a frontmatter list item.
 */
export class FrontMatterListItemBlock extends ListItemBlock {
	protected static override childCount = 5;
	protected static valueIndex = 2;

	constructor(
		bullet: TokenBlock,
		space: TokenBlock,
		content: TokenBlock,
		br: TokenBlock
	) {
		super(
			createTokenBlock(Token.createTab(0)),
			bullet,
			space,
			createRichTextBlock(content.toString()),
			br,
			undefined
		);
	}
}

/**
 * Represents a bulleted list in the frontmatter
 *
 * @example
 * ---
 * list:
 * - item 1 <--|
 * - item 2    |-- This is a frontmatter list.
 */
export class FrontmatterListBlock extends ListBlock {
	protected static override allowedChildren = [FrontMatterListItemBlock];
	protected children: FrontMatterListItemBlock[];
	protected defaultTabSize = 1;
	protected tabManuallySet = false;

	public get tab(): number {
		if (!this.hasChildren() || !this.tabManuallySet) {
			return this.defaultTabSize;
		}
		return this.children[0]!.tab;
	}

	public set tab(tab: number) {
		this.tabManuallySet = true;
		this.children.forEach((item) => (item.tab = tab));
	}

	public onChildAdopted(child: FrontMatterListItemBlock): void {
		super.onChildAdopted(child);
		child.tab = this.tab;
	}
}

/**
 * Create a list item in a frontmatter list
 * @param content The frontmatter item content
 * @returns A frontmatter item block
 *
 * @example
 * const item = createFrontmatterListItemBlock("item 1");
 * // returns "- item 1"
 */
export function createFrontmatterListItemBlock(
	content: FrontmatterListItemContent
): FrontMatterListItemBlock {
	return spawnFromContent<FrontMatterListItemBlock>(
		content,
		FrontmatterListItemStatement
	);
}

/**
 * Creates a frontmatter list
 * @param content The content of the frontmatter list
 * @returns The frontmatter list block
 *
 * @example
 * const list = createFrontmatterListBlock(["item 1", "item 2"]);
 *
 * // returns:
 * // - item 1
 * // - item 2
 */
export function createFrontmatterListBlock(
	content: FrontmatterListContent
): FrontmatterListBlock {
	// return spawnFromContent<FrontmatterListBlock>(content, FrontmatterListStatement);
	if (Array.isArray(content)) {
		return new FrontmatterListBlock(
			...content.map((item) => createFrontmatterListItemBlock(item))
		);
	} else if (isStatement(content)) {
		return spawnBlock(content) as FrontmatterListBlock;
	} else {
		return spawnFromContentAndCreate<
			FrontmatterListBlock,
			FrontmatterListStatement
		>(content, (c) => FrontmatterListStatement.create([c]));
	}
}

/**
 * Create a frontmatter item block
 * @param content The content of the frontmatter item
 * @param value The value of the frontmatter item, either a string or an array of strings
 * @returns The frontmatter item block
 *
 * @example
 * const item = createFrontmatterItemBlock("title", "Hello, world!");
 *
 * // returns:
 * // title: Hello, world!
 *
 * const item = createFrontmatterItemBlock("tags", ["foo", "bar", "baz"]);
 *
 * // returns:
 * // tags:
 * // - foo
 * // - bar
 * // - baz
 */
export function createFrontmatterItemBlock(
	content: FrontmatterItemContent,
	value?: string | string[]
): FrontmatterItemBlock {
	if (content instanceof FrontmatterItemBlock) {
		return content;
	} else if (Array.isArray(content)) {
		const value = content[1];
		return spawnBlock(
			FrontmatterItemStatement.create(content[0], value)
		) as FrontmatterItemBlock;
	} else {
		return spawnFromContentAndCreate(content, (c) =>
			FrontmatterItemStatement.create(c, value ?? "")
		);
	}
}

/**
 *
 * @param content The content of the frontmatter block
 * @returns The frontmatter block
 *
 * @example
 * const frontmatter = createFrontmatterBlock({
 *  title: "Hello, world!",
 *  tags: ["foo", "bar", "baz"],
 *  date: "2021-01-01",
 * });
 *
 * // returns:
 * // ---
 * // title: Hello, world!
 * // tags:
 * // - foo
 * // - bar
 * // - baz
 * // date: 2021-01-01
 * // ---
 */
export function createFrontmatterBlock(content: FrontmatterContent) {
	if (content instanceof FrontmatterBlock) {
		return content;
	} else if (isStatement(content)) {
		return spawnBlock(content) as FrontmatterBlock;
	} else {
		return spawnBlock(
			FrontmatterStatement.create(content as Record<string, string[]>)
		) as FrontmatterBlock;
	}
}
