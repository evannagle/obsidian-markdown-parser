import { IVisitor } from "src/visitors/Visitor";
import { Statement, StatementPart } from "./Statement";
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
export class CodeStatement extends Statement {
	public constructor(
		public backticksOnTop: Token,
		public language: Token | undefined,
		public topBr: Token,
		public metadata: CodeMetadataStatement | undefined,
		public source: CodeSourceStatement,
		public backticksOnBottom: Token
	) {
		super();
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	public getParts(): StatementPart[] {
		return [
			this.backticksOnTop,
			this.language,
			this.topBr,
			this.metadata,
			this.source,
			this.backticksOnBottom,
		];
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
		source: string,
		language?: string,
		metadata?: Record<string, any>
	): CodeStatement {
		return new CodeStatement(
			Token.create(TokenType.CODE_START),
			language
				? Token.create(TokenType.CODE_LANGUAGE, language)
				: undefined,
			Token.createBr(),
			metadata
				? CodeMetadataStatement.create(
						...CodeMetadataItemStatement.createMany(metadata)
				  )
				: undefined,
			CodeSourceStatement.create(source),
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
export class CodeMetadataStatement extends Statement {
	constructor(public items: CodeMetadataItemStatement[], public br?: Token) {
		super();
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	public getParts(): StatementPart[] {
		return [...this.items, this.br];
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
		...items: CodeMetadataItemStatement[]
	): CodeMetadataStatement {
		return new CodeMetadataStatement(items, Token.createBr());
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
export class CodeMetadataItemStatement extends Statement {
	public constructor(
		public key: Token,
		public colon: Token,
		public space: Token | undefined,
		public value: Token | undefined,
		public br: Token | undefined
	) {
		super();
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	public getParts(): StatementPart[] {
		return [this.key, this.colon, this.space, this.value, this.br];
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
		value?: string
	): CodeMetadataItemStatement {
		return new CodeMetadataItemStatement(
			Token.create(TokenType.CODE_KEY, key),
			Token.create(TokenType.COLON),
			Token.createSpace(),
			value ? Token.create(TokenType.CODE_VALUE, value) : undefined,
			Token.createBr()
		);
	}

	/**
	 * Creates many code block metadata items.
	 * @param dictionary The dictionary of the metadata items.
	 * @returns The generated metadata items.
	 */
	public static createMany(
		dictionary: Record<string, any>
	): CodeMetadataItemStatement[] {
		return Object.entries(dictionary).map(([key, value]) =>
			CodeMetadataItemStatement.create(key, value.toString())
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
export class CodeSourceStatement extends Statement {
	public constructor(
		public content: Token[],
		public br: Token | undefined = undefined
	) {
		super();
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	public getParts(): StatementPart[] {
		return [...this.content, this.br];
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
	public static create(source: string): CodeSourceStatement {
		// const lines = source.split("\n");
		// const tokens = lines.map((line) =>
		// 	Token.create(TokenType.CODE_SOURCE, line + "\n")
		// );

		return new CodeSourceStatement(
			[Token.create(TokenType.CODE_SOURCE, source)],
			Token.createBr()
		);
	}
}

/**
 * Represents a LaTeX block.
 * @example
 * $$1 + 1 = 2$$
 */
export class LatexStatement extends Statement {
	public constructor(
		public dollarsOnLeft: Token,
		public content: Token[],
		public dollarsOnRight: Token
	) {
		super();
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	public getParts(): StatementPart[] {
		return [this.dollarsOnLeft, ...this.content, this.dollarsOnRight];
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
	public static create(content: string): LatexStatement {
		return new LatexStatement(
			Token.create(TokenType.DOLLAR_DOLLAR),
			scanTokens(content),
			Token.create(TokenType.DOLLAR_DOLLAR)
		);
	}
}
