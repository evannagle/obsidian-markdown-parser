import { TokenType } from "src/tokens/TokenType";
import {
	MetadataItemStatement,
	MetadataListStatement,
	MetadataTagStatement,
	RichTextStatement,
} from "../statements";
import { Block } from "./Block";
import { Token } from "src/tokens/Token";

/**
 * Represents a list of metadata items.
 *
 * @example
 * Foo:: bar
 * Moo:: zar
 *
 */
export class MetadataListBlock extends Block<MetadataListStatement> {
	protected findItem(key: string): MetadataItemStatement | undefined {
		return this.stmt.items.find((item) => item.key.toString() === key);
	}

	/**
	 *
	 * @param key The key of the metadata item.
	 * @param defaultValue The default value to return if the item does not exist. Undefined by default.
	 * @returns The value of the metadata item.
	 */
	public get(key: string, defaultValue?: string): string | undefined {
		const item = this.findItem(key);
		if (item) {
			return item.value?.toString() ?? defaultValue;
		} else {
			return defaultValue;
		}
	}

	/**
	 * Gets the value of a metadata item.
	 * @returns A dictionary of all metadata items.
	 */
	public getDict(): Record<string, string> {
		const dict: Record<string, string> = {};
		for (const item of this.stmt.items) {
			dict[item.key.toString()] = item.value?.toString() ?? "";
		}
		return dict;
	}

	/**
	 * Merge another metadata list into this one.
	 * @param other The metadata items to merge into this list.
	 */
	public merge(other: Record<string, string>) {
		for (const key in other) {
			this.set(key, other[key] ?? "");
		}
	}

	/**
	 * Move a metadata item to a new index.
	 * @param key The key of the metadata item to move.
	 * @param index The index to move the metadata item to.
	 */
	public moveKey(key: string, index: number) {
		const item = this.findItem(key);
		if (item) {
			this.stmt.items.splice(this.stmt.items.indexOf(item), 1);
			this.stmt.items.splice(index, 0, item);
		}
	}

	/**
	 * Move a metadata item to the top of the list.
	 * @param key The key of the metadata item to move.
	 */
	public moveKeyToTop(key: string) {
		this.moveKey(key, 0);
	}

	/**
	 * Move a metadata item to the bottom of the list.
	 * @param key The key of the metadata item to move.
	 */
	public moveKeyToBottom(key: string) {
		this.moveKey(key, this.stmt.items.length - 1);
	}

	/**
	 * Remove a metadata item.
	 * @param key The key of the metadata item.
	 */
	public removeKey(key: string): void {
		const item = this.findItem(key);
		if (item) {
			this.stmt.items.splice(this.stmt.items.indexOf(item), 1);
		}
	}

	/**
	 * Replace the current list of metadata items with a new list.
	 * @param dict The dictionary of metadata items to replace the current list with.
	 */
	public replace(dict: Record<string, string>) {
		this.stmt.items = [];
		this.merge(dict);
	}

	/**
	 * Sets the value of a metadata item. If the item does not exist, it will be created.
	 * @param key The key of the metadata item.
	 * @param value The value of the metadata item.
	 */
	public set(key: string, value: string): this {
		const item = this.findItem(key);
		if (item) {
			item.value = RichTextStatement.create(value);
		} else {
			this.stmt.items.push(MetadataItemStatement.create(key, value));
		}
		return this;
	}

	/**
	 * Sort the keys of the metadata list by alphabetical order.
	 */
	public sortKeys() {
		this.sortKeysBy((a, b) => a.localeCompare(b));
	}

	/**
	 * Sort the keys of the metadata list.
	 * If sorting by alphabetical order, use `sortKeys()` instead.
	 * @param compareFn The function to use to compare the keys.
	 */
	public sortKeysBy(compareFn: (a: string, b: string) => number) {
		this.stmt.items.sort((a, b) =>
			compareFn(a.key.toString(), b.key.toString())
		);
	}

	public static create(items: Record<string, string>): MetadataListBlock {
		return new MetadataListBlock(MetadataListStatement.create(items));
	}
}

/**
 * Represents a metadata tag.
 * These are often used to describe list items or checkbox (task) items.
 *
 * @example
 * - here is a list item with a metadata tag [foo:: bar]
 *
 */
export class MetadataTagBlock extends Block<MetadataTagStatement> {
	public static create(key: string, value: string): MetadataTagBlock {
		return new MetadataTagBlock(MetadataTagStatement.create(key, value));
	}

	/**
	 * Get the key of the metadata item.
	 */
	public get key(): string {
		return this.stmt.key.toString();
	}

	/**
	 * Set the key of the metadata item.
	 */
	public set key(key: string) {
		this.stmt.key = Token.create(TokenType.SYMBOL, key);
	}

	/**
	 * Get the value of the metadata item.
	 */
	public get value(): string {
		return this.stmt.value.toString();
	}

	/**
	 * Set the value of the metadata item.
	 */
	public set value(value: string) {
		this.stmt.value = RichTextStatement.create(value);
	}
}
