import { CodeMetadataItemStatement } from "src/parsers/statements/CodeStatement";
import { Block } from "./Block";
import { MutableBlock } from "./MutableBlock";
import { TokenBlock, createTokenBlock } from "./TokenBlock";
import { MetadataItemStatement } from "src/parsers/statements/MetadataStatement";
import { spawnBlock, spawnFromContent } from "./BlockFactory";
import { Token } from "src/tokens/Token";
import { UndefinedBlock } from "./UndefinedBlock";

export type MetadataItemContent = MetadataItemBlock | [string, string] | string;

export class MetadataBlock<T extends MetadataItemBlock> extends MutableBlock {
	protected children: MetadataItemBlock[];
	protected br: TokenBlock;

	constructor(...blocks: Block[]) {
		super(...blocks);

		const lastBlock = blocks[blocks.length - 1];
		if (lastBlock instanceof TokenBlock) {
			this.br = blocks.pop() as TokenBlock;
		}

		this.children = blocks as MetadataItemBlock[];
	}

	/**
	 * Get the number of line breaks at the end of the block.
	 */
	public get bottomMargin(): number {
		return this.br.toNumber() ?? 0;
	}

	/**
	 * Set the number of line breaks at the end of the block.
	 */
	public set bottomMargin(margin: number) {
		this.br = createTokenBlock(Token.createBr(margin));
	}

	/**
	 * Create a new item with the given key and value.
	 * @param key
	 * @param value
	 * @returns The new MetadataItemBlock
	 */
	protected createItem(key: string, value: string): T {
		return createMetadataItemBlock([key, value]) as T;
	}

	/**
	 * Get all metadata items and the end BR.
	 * @returns All metadata items and the end BR.
	 */
	public override getParts(): Block[] {
		if (this.br) {
			return [...this.children, this.br];
		} else {
			return this.children;
		}
	}

	// /**
	//  * Get the value of the metadata item with the given key.
	//  * @param key The key of the metadata item.
	//  * @param defaultValue The default value to return if the metadata item does not exist.
	//  * @returns The value of the metadata item.
	//  */
	public getValue(key: string, defaultValue: string): string | undefined {
		const item = this.item(key);
		if (item) {
			return item.value;
		}

		return defaultValue;
	}

	/**
	 * Check whether a metadata item with the given key exists.
	 * @param key The key of the metadata item.
	 * @returns Whether or not the metadata item exists.
	 */
	public hasKey(key: string): boolean {
		return this.children.some((item) => item.key === key);
	}

	/**
	 * Remove the metadata item with the given key.
	 * @param key The key of the metadata item.
	 */
	public removeKey(...keys: string[]): this {
		keys.forEach((key) => {
			const item = this.children.find((item) => item.key === key);
			if (item) {
				this.remove(item);
			}
		});
		return this;
	}

	/**
	 * Get the metadata item with the given key.
	 * @param key The key of the metadata item.
	 * @returns The metadata item with the given key.
	 */
	public item(key: string): T | undefined {
		return this.children.find((item) => item.key === key) as T;
	}

	/**
	 * Remove the given child from this MetadataBlock.
	 * @param child The child to remove.
	 * @returns This MetadataBlock.
	 */
	public remove = (child: Block) => {
		super.remove(child);
		if (this.children.length === 0) {
			this.br = new UndefinedBlock();
		}
		return this;
	};

	/**
	 * Set the metadata item with the given key to the given value.
	 * @param key The key of the metadata item.
	 * @param value The value of the metadata item.
	 */
	public setKey(key: string, value: string): this {
		const item = this.children.find((item) => item.key === key);
		if (item) {
			item.value = value;
		} else {
			this.add(this.createItem(key, value));
		}
		return this;
	}

	/**
	 * Sets many metadata items.
	 * @param metadata The metadata items to set.
	 *
	 * @example
	 * metadata.setKeys({
	 *    "key1": "value1",
	 *    "key2": "value2",
	 * });
	 */
	public setKeys(metadata: Record<string, string>): this {
		Object.entries(metadata).forEach(([key, value]) => {
			this.setKey(key, value);
		});
		return this;
	}

	/**
	 * Sort the metadata items by key.
	 * @returns This MetadataBlock, sorted by key.
	 */
	public sortKeys(): this {
		this.children.sort((a, b) => a.key.localeCompare(b.key));
		return this;
	}

	/**
	 * Get the metadata items as a dictionary.
	 * @returns A dictionary of all metadata items.
	 */
	public toDictionary(): Record<string, string | string[]> {
		const dict: Record<string, string> = {};
		this.children.forEach((item) => {
			dict[item.key] = item.value;
		});
		return dict;
	}
}

/**
 * Represents a metadata item of a code block.
 *
 * @example
 *
 * ```js
 * key1: value1 <-- This is a metadata item.
 * key2: value2 <-- This is a metadata item.
 *
 * console.log("Hello, world!");
 * ```
 */
export class MetadataItemBlock extends Block {
	protected keyIndex = 0;
	protected valueIndex = 3;

	/**
	 * Get the key of the metadata item.
	 */
	public get key(): string {
		return this.str(this.keyIndex);
	}

	/**
	 * Set the key of the metadata item.
	 */
	public set key(key: string) {
		this.set(this.keyIndex, createTokenBlock(key));
	}

	/**
	 * Remove this MetadataItemBlock from its parent.
	 * @returns This MetadataItemBlock.
	 */
	public removeFromParent(): this {
		if (this.parent instanceof MutableBlock) {
			this.parent.remove(this);
		}
		return this;
	}

	/**
	 * Get the value of the metadata item.
	 */
	public get value(): any {
		return this.str(this.valueIndex);
	}

	/**
	 * Set the value of the metadata item.
	 */
	public set value(value: string) {
		this.set(this.valueIndex, createTokenBlock(value));
	}
}

export class MetadataListBlock extends MetadataBlock<MetadataItemBlock> {}

/**
 * Create a new metadata item block.
 * @param content The metadata item content
 * @returns A MetadataItemBlock
 */
export function createMetadataItemBlock(
	content: MetadataItemContent
): MetadataItemBlock {
	if (content instanceof MetadataItemBlock) {
		return content;
	} else if (Array.isArray(content)) {
		return spawnBlock(
			MetadataItemStatement.create(content[0], content[1])
		) as MetadataItemBlock;
	} else {
		return spawnFromContent<MetadataItemBlock>(
			content,
			CodeMetadataItemStatement
		);
	}
}
