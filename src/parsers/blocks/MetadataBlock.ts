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
	 * Remove a metadata item.
	 * @param key The key of the metadata item.
	 */
	public remove(key: string): void {
		const item = this.findItem(key);
		if (item) {
			this.stmt.items.splice(this.stmt.items.indexOf(item), 1);
		}
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
