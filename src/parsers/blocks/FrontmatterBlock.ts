import {
	FrontmatterItemStatement,
	FrontmatterListStatement,
	FrontmatterStatement,
} from "../statements";
import { Block } from "./Block";

export class FrontmatterBlock extends Block<FrontmatterStatement> {
	public static create(
		dictionary: Record<string, string | string[]>
	): FrontmatterBlock {
		return new FrontmatterBlock(FrontmatterStatement.create(dictionary));
	}

	protected findItem(key: string): FrontmatterItemStatement | undefined {
		return this.stmt.items.find((item) => item.key.toString() === key);
	}

	/**
	 * Gets the value of a frontmatter item.
	 * @returns A dictionary of all frontmatter items.
	 */
	public get(
		key: string,
		defaultValue: string | string[] | undefined = undefined
	): string | string[] | undefined {
		const item = this.findItem(key);

		if (item) {
			if (item.value instanceof FrontmatterListStatement) {
				return item.value.items.map(
					(item) => item.value?.toString() ?? ""
				);
			} else {
				return item.value?.toString() ?? defaultValue;
			}
		} else {
			return defaultValue;
		}
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
	public getDict(): Record<string, string | string[] | undefined> {
		const dict: Record<string, string | string[] | undefined> = {};
		for (const item of this.stmt.items) {
			dict[item.key.toString()] = this.get(item.key.toString());
		}
		return dict;
	}

	/**
	 * Convert a frontmatter item to a list.
	 * @param key The key of the frontmatter item.
	 * @returns The frontmatter block.
	 *
	 * @example
	 *
	 * ---
	 * foo: bar
	 * ---
	 *
	 * // becomes:
	 *
	 * ---
	 * foo:
	 * - bar
	 * ---
	 */
	public convertToList(key: string): this {
		const scalar = this.get(key);
		if (scalar instanceof Array) return this;

		const list: string[] = scalar ? [scalar] : [];
		this.set(key, list);
		return this;
	}

	/**
	 * Convert a frontmatter item to a scalar.
	 * @param key The key of the frontmatter item.
	 * @param join The delimiter to join the list with.
	 * @returns The frontmatter block.
	 *
	 * @example
	 *
	 * ---
	 * foo:
	 * - bar
	 * - baz
	 * ---
	 *
	 * // becomes:
	 *
	 * ---
	 * foo: bar, baz
	 * ---
	 */
	public convertToScalar(key: string, join = ", "): this {
		const list = this.get(key);
		if (!(list instanceof Array)) return this;

		const scalar = list.join(join);
		this.set(key, scalar);
		return this;
	}

	/**
	 * Move a frontmatter item to a specific index.
	 * @param key The key of the frontmatter item to move.
	 * @param index The index to move the frontmatter item to.
	 */
	public move(key: string, index: number) {
		const item = this.findItem(key);
		if (item) {
			this.stmt.items.splice(this.stmt.items.indexOf(item), 1);
			this.stmt.items.splice(index, 0, item);
		}
	}

	/**
	 * Move a frontmatter item to the top of the list.
	 * @param key The key of the frontmatter item to move.
	 */
	public moveToTop(key: string) {
		this.move(key, 0);
	}

	/**
	 * Move a frontmatter item to the bottom of the list.
	 * @param key The key of the frontmatter item to move.
	 */
	public moveToBottom(key: string) {
		this.move(key, this.stmt.items.length - 1);
	}

	/**
	 * Remove a frontmatter item.
	 * @param key The key of the frontmatter item.
	 */
	public remove(key: string): void {
		const item = this.findItem(key);
		if (item) {
			this.stmt.items.splice(this.stmt.items.indexOf(item), 1);
		}
	}

	/**
	 * Sets the value of a frontmatter item. If the item does not exist, it will be created.
	 * @param key The key of the frontmatter item.
	 * @param value The value of the frontmatter item.
	 * @returns The frontmatter block.
	 */
	public set(key: string, value: string | string[]): this {
		const item = this.findItem(key);
		const newItem = FrontmatterItemStatement.create(key, value);

		if (item) {
			this.stmt.items.splice(this.stmt.items.indexOf(item), 1, newItem);
		} else {
			this.stmt.items.push(FrontmatterItemStatement.create(key, value));
		}
		return this;
	}

	/**
	 * Alphabetically sorts the frontmatter keys.
	 * @returns The frontmatter block.
	 */
	public sortKeys(): this {
		return this.sortKeysBy((a, b) => a.localeCompare(b));
	}

	/**
	 * Sorts the frontmatter keys using a custom compare function.
	 * If sorting alphabetically, use `sortKeys()` instead.
	 * @param compareFn The function to compare the keys.
	 * @returns The frontmatter block.
	 */
	public sortKeysBy(compareFn: (a: string, b: string) => number): this {
		this.stmt.items.sort((a, b) =>
			compareFn(a.key.toString(), b.key.toString())
		);
		return this;
	}
}
