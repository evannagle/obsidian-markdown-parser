import { FrontmatterItemBlock } from "../FrontmatterBlock";
import { MetadataItemBlock } from "../MetadataBlock";
import { Span } from "./Span";

export type MetadataSpanItemBlock = MetadataItemBlock | FrontmatterItemBlock;

export type MetadataSpanItemMatch =
	| string
	| RegExp
	| ((block: MetadataSpanItemBlock) => boolean);

export class MetadataSpan extends Span<
	MetadataSpanItemBlock,
	MetadataSpanItemMatch
> {
	/**
	 * Checks if a block matches the given predicate.
	 * @param block The block to check
	 * @param match The predicate to check against
	 * @returns True if the block matches the predicate, false otherwise.
	 */
	public matches(
		block: MetadataSpanItemBlock,
		match: MetadataSpanItemMatch
	): boolean {
		switch (typeof match) {
			case "string":
				return block.key === match;
			case "function":
				return match(block);
			default:
				return (match as RegExp).test(block.key);
		}
	}

	/**
	 * Sets the value of an existing metadata item.
	 * @param key The key of the item to set.
	 * @param value The new value.
	 */
	public set(key: string, value: string | string[]) {
		this.single(key).value = value;
	}

	/**
	 * Creates a dictionary representation of all metadata items in the section.
	 * @returns A dictionary of all metadata items.
	 */
	public toDictionary() {
		const dict: Record<string, string | string[]> = {};

		this.blocks.forEach((block) => {
			if (dict[block.key]) {
				const value = MetadataSpan.arr(dict[block.key]);
				const newValue = MetadataSpan.arr(block.value);
				dict[block.key] = [...value, ...newValue];
			} else {
				dict[block.key] = block.value;
			}
		});

		return dict;
	}

	/**
	 * A simple reducer of a string to an array of strings with one string value
	 * @param s The string or array of strings
	 * @returns An array of strings
	 *
	 * @example
	 * arr("foo") => ["foo"]
	 * arr(["foo"]) => ["foo"]
	 */
	private static arr(s: string | string[] | undefined): string[] {
		if (typeof s === "string") {
			return [s];
		} else if (s === undefined) {
			return [];
		}
		return s;
	}
}
