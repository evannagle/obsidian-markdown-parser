import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";
import { TokenType } from "src/tokens/TokenType";
import { Token } from "src/tokens/Token";
import { scanTokens } from "src/scanners/Scanner";

/**
 * Represents a code block.
 *
 * @example
 * ```js
 * key1: value1
 * key2: value2
 *
 * console.log("Hello, world!");
 * ```
 */
export class CodeBlockStatement extends Statement {
	public constructor(
		public backticksOnLeft: Token,
		public language: Token | undefined,
		public topBr: Token,
		public metadata: CodeBlockMetadataStatement | undefined,
		public source: CodeBlockSourceStatement,
		public backticksOnRight: Token
	) {
		super([
			backticksOnLeft,
			language,
			topBr,
			metadata,
			source,
			backticksOnRight,
		]);
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitCodeBlock(this);
	}

	/**
	 * Creates a code block.
	 * @param language The language of the code block, e.g. "js".
	 * @param metadata The metadata of the code block, e.g. { key1: "value1", key2: "value2" }.
	 * @param source The source code of the code block, e.g. "console.log("Hello, world!");".
	 * @returns The generated code block.
	 */
	public static create(
		language: string | undefined,
		metadata: Record<string, string>,
		source: string
	): CodeBlockStatement {
		return new CodeBlockStatement(
			Token.create(TokenType.CODE_START),
			language
				? Token.create(TokenType.CODE_LANGUAGE, language)
				: undefined,
			Token.createBr(),
			CodeBlockMetadataStatement.create(
				...CodeBlockMetadataItemStatement.createMany(metadata)
			),
			CodeBlockSourceStatement.create("\n" + source),
			Token.create(TokenType.CODE_END)
		);
	}
}

/**
 * Represents the metadata of a code block.
 *
 * @example
 * ```js
 * key1: value1  <-- This is a CodeBlockMetadataItemStatement.
 * key2: value2  <-- This is a CodeBlockMetadataItemStatement.
 *
 * console.log("Hello, world!");
 * ```
 */
export class CodeBlockMetadataStatement extends Statement {
	constructor(public items: CodeBlockMetadataItemStatement[]) {
		super(items);
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitCodeBlockMetadata(this);
	}

	/**
	 * Creates a code block metadata.
	 * @param items The items of metadata. You can create metadata items using
	 * 	`CodeBlockMetadataItemStatement.create()` or `CodeBlockMetadataItemStatement.createMany()`.
	 * @returns The generated metadata.
	 */
	public static create(
		...items: CodeBlockMetadataItemStatement[]
	): CodeBlockMetadataStatement {
		return new CodeBlockMetadataStatement(items);
	}
}

/**
 * Represents the metadata item of a code block.
 *
 * @example
 * ```js
 * key1: value1  <-- This is a CodeBlockMetadataItemStatement.
 * key2: value2  <-- This is a CodeBlockMetadataItemStatement.
 *
 * console.log("Hello, world!");
 * ```
 */
export class CodeBlockMetadataItemStatement extends Statement {
	public constructor(
		public key: Token,
		public colon: Token,
		public space: Token | undefined,
		public value: Token | undefined,
		public br: Token | undefined
	) {
		super([key, colon, space, value, br]);
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitCodeBlockMetadataItem(this);
	}

	/**
	 * Creates a code block metadata item.
	 * @param key The key of the metadata item.
	 * @param value The value of the metadata item.
	 * @returns
	 */
	public static create(
		key: string,
		value: string
	): CodeBlockMetadataItemStatement {
		return new CodeBlockMetadataItemStatement(
			Token.create(TokenType.CODE_KEY, key),
			Token.create(TokenType.COLON),
			Token.createSpace(),
			Token.create(TokenType.CODE_VALUE, value),
			Token.createBr()
		);
	}

	/**
	 * Creates many code block metadata items.
	 * @param dictionary The dictionary of the metadata items.
	 * @returns The generated metadata items.
	 */
	public static createMany(
		dictionary: Record<string, string>
	): CodeBlockMetadataItemStatement[] {
		return Object.entries(dictionary).map(([key, value]) =>
			CodeBlockMetadataItemStatement.create(key, value)
		);
	}
}

/**
 * Represents the source code of a code block.
 *
 * @example
 * ```js
 * key1: value1
 * key2: value2
 *
 * console.log("Hello, world!");  <-- This is a CodeBlockSourceStatement.
 * ```
 */
export class CodeBlockSourceStatement extends Statement {
	public constructor(public source: Token[]) {
		super(source);
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitCodeBlockSource(this);
	}

	/**
	 * Creates a code block source.
	 * @param source The source code of the code block. This will be split into lines of CODE_SOURCE tokens.
	 * @returns The generated code block source.
	 */
	public static create(source: string): CodeBlockSourceStatement {
		const lines = source.split("\n");
		const tokens = lines.map((line) =>
			Token.create(TokenType.CODE_SOURCE, line + "\n")
		);

		return new CodeBlockSourceStatement(tokens);
	}
}

/**
 * Represents a LaTeX block.
 * @example
 * $$1 + 1 = 2$$
 */
export class LatexBlockStatement extends Statement {
	public constructor(
		public dollarsOnLeft: Token,
		public content: Token[],
		public dollarsOnRight: Token
	) {
		super([dollarsOnLeft, ...content, dollarsOnRight]);
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitLatexBlock(this);
	}

	/**
	 * Creates a LaTeX block.
	 * @param content The Latex content.
	 * @returns The generated LaTeX block.
	 */
	public static create(content: string): LatexBlockStatement {
		return new LatexBlockStatement(
			Token.create(TokenType.DOLLAR_DOLLAR),
			scanTokens(content),
			Token.create(TokenType.DOLLAR_DOLLAR)
		);
	}
}
