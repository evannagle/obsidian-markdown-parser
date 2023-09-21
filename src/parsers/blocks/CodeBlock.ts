import { Token } from "src/tokens/Token";
import {
	CodeMetadataItemStatement,
	CodeMetadataStatement,
	CodeStatement,
} from "../statements";
import { Block, getLinesAsStr, lines } from "./Block";
import { TokenType } from "src/tokens/TokenType";

/**
 * Represents a code block.
 *
 * @example
 *
 * ```js
 * key1: value1
 * key2: value2
 *
 * console.log("Hello, world!");
 * ```
 */
export class CodeBlock extends Block<CodeStatement> {
	public static create({
		language = undefined,
		metadata = {},
		source = "",
	}: {
		language?: string;
		metadata?: Record<string, string>;
		source?: lines;
	} = {}) {
		return new CodeBlock(
			CodeStatement.create(language, metadata, getLinesAsStr(source))
		);
	}

	/**
	 * Get the language of the code block.
	 * @returns The language of the code block.
	 * @example
	 *
	 * const block = CodeBlock.create({ language: "js" });
	 * block.language // "js"
	 */
	public get language(): string | undefined {
		return this.stmt.language?.toString();
	}

	/**
	 * Set the language of the code block.
	 */
	public set language(language: string | undefined) {
		this.stmt.language = Token.create(TokenType.CODE_LANGUAGE, language);
	}

	/**
	 * Get the source of the code block.
	 */
	public get source(): string {
		return Token.toString(this.stmt.source.content);
	}

	/**
	 * Set the source of the code block.
	 */
	public set source(source: lines) {
		this.stmt.source.content = [
			Token.create(TokenType.CODE_SOURCE, getLinesAsStr(source)),
		];
	}

	/**
	 * Get the metadata of the code block.
	 */
	public get metadata(): CodeMetadataBlock {
		if (!this.stmt.metadata) {
			this.stmt.metadata = CodeMetadataStatement.create();
		}

		return new CodeMetadataBlock(this.stmt.metadata);
	}

	/**
	 * Set the metadata of the code block.
	 */
	public set metadata(metadata: Record<string, string>) {
		this.stmt = CodeStatement.create(this.language, metadata, this.source);
	}
}

/**
 * Represents the metadata of a code block.
 *
 * @example
 *
 * ```js
 * key1: value1 <-- This is a metadata item.
 * key2: value2 <-- This is a metadata item.
 * ```
 */
export class CodeMetadataBlock extends Block<CodeMetadataStatement> {
	public constructor(stmt: CodeMetadataStatement) {
		super(stmt);
		this._lastItem = stmt.items[stmt.items.length - 1];
		this._lastItemBr = this._lastItem?.br;
	}

	/**
	 * Find the CodeMedataItemStatement with the given key.
	 * Remember -- blocks should never expose their statements.
	 */
	private findItem(key: string): CodeMetadataItemStatement | undefined {
		return this.stmt.items.find((item) => item.key.toString() === key);
	}

	/**
	 * Get the value of the metadata item with the given key.
	 * @param key The key of the metadata item.
	 * @param defaultValue The default value to return if the metadata item does not exist.
	 * @returns The value of the metadata item.
	 */
	public get(
		key: string,
		defaultValue: string | undefined = undefined
	): string | undefined {
		const item = this.findItem(key);

		if (!item || !item?.value) {
			return defaultValue;
		} else {
			return item.value.toString();
		}
	}

	/**
	 * Remove the metadata item with the given key.
	 * @param key The key of the metadata item.
	 */
	public remove(key: string) {
		const item = this.findItem(key);

		if (item) {
			this.stmt.items = this.stmt.items.filter((i) => i !== item);
		}
	}

	/**
	 * Set the metadata item with the given key to the given value.
	 * @param key The key of the metadata item.
	 * @param value The value of the metadata item.
	 */
	public set(key: string, value: any) {
		this._set(key, value);
		this._updateBrs();
	}

	/**
	 * Sets many metadata items.
	 * @param metadata The metadata items to set.
	 *
	 * @example
	 * metadata.setMany({
	 *    "key1": "value1",
	 *    "key2": "value2",
	 * });
	 */
	public setMany(metadata: Record<string, string>) {
		for (const [key, value] of Object.entries(metadata)) {
			this._set(key, value);
		}
		this._updateBrs();
	}

	protected _set(key: string, value: any) {
		const item = this.findItem(key);

		if (!item) {
			this.stmt.items.push(
				CodeMetadataItemStatement.create(key, value.toString())
			);
		} else {
			item.value = Token.create(TokenType.CODE_VALUE, value);
		}
	}

	protected _updateBrs(): void {
		if (this._lastItem) {
			this._lastItem.br = Token.createBr();
			this._lastItem = this.stmt.items[
				this.stmt.items.length - 1
			] as CodeMetadataItemStatement;
			this._lastItem.br = this._lastItemBr;
		}

		// let brSize = 1;
		// for (let i = 0; i < this.stmt.items.length; i++) {
		// 	const item = this.stmt.items[i] as CodeMetadataItemStatement;

		// 	brSize = Math.max(brSize, (item.br?.literal as number) ?? 1);

		// 	if (i === this.stmt.items.length - 1) {
		// 		item.br = Token.createBr(brSize);
		// 	} else {
		// 		item.br = Token.createBr(1);
		// 	}
		// }
	}

	private _lastItem: CodeMetadataItemStatement | undefined;
	private _lastItemBr: Token | undefined;
}
