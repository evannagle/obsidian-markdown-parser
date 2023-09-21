import { Statement } from "../statements";

export type lines = string | string[];

/**
 * Converts a string or array of strings to a string.
 * @param s The string or array of strings to convert.
 * @returns The string.
 */
export function getLinesAsStr(s: lines): string {
	return typeof s === "string" ? s : s.join("\n");
}

/**
 * Converts a string or array of strings to an array of strings.
 * @param s The string or array of strings to convert.
 * @returns An array of strings
 */
export function getLinesAsArray(s: lines): string[] {
	return typeof s === "string" ? s.split("\n") : s;
}

export abstract class Block<T extends Statement> {
	/**
	 * The statement that the block wraps.
	 * @protected
	 */
	protected stmt: T;

	public constructor(stmt: T) {
		this.stmt = stmt;
	}

	/**
	 * Returns the statement as a string.
	 * @returns The statement as a string.
	 */
	public toString(): string {
		return this.stmt.toString();
	}
}
