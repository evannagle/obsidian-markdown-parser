import { Token } from "src/tokens/Token";
import { Statement } from "./Statement";
import { RichTextStatement } from "./RichTextStatement";
import { IVisitor } from "src/visitors/Visitor";
import { TokenType } from "src/tokens/TokenType";

/**
 * Metadata statements are statements in a document used to describe the document.
 * The format of the statments is as follows:
 *
 * Key:: Value
 *
 * The key is a symbol, and the value is a rich text statement.
 *
 * @example
 * title:: Hello, world!
 * author:: John Doe
 * date:: 2021-01-01
 *
 */
export class MetadataStatement extends Statement {
	public constructor(
		public key: Token,
		public colon: Token,
		public space: Token | undefined,
		public value: RichTextStatement,
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
		visitor.visitMetadata(this);
	}

	/**
	 * Creates a metadata item.
	 * @param key The key of the metadata item.
	 * @param value The value of the metadata item.
	 * @returns The generated metadata item.
	 *
	 * @example
	 * create("key", "value") // key:: value
	 */
	public static create(key: string, value: string): MetadataStatement {
		return new MetadataStatement(
			Token.create(TokenType.SYMBOL, key),
			Token.create(TokenType.COLON_COLON),
			Token.createSpace(),
			RichTextStatement.create(value),
			Token.createBr()
		);
	}
}

/**
 * Metadata tag statements are statements in a document used to describe the document.
 * They are different than metadata statements in that they are enclosed in brackets and are meant to be applicable to a specific line or part of the document.
 *
 * The format of the statments is as follows:
 * [vey:: value]
 *
 * @example
 * - Here is a task with a metadata tag: [key:: value]
 */
export class MetadataTagStatement extends Statement {
	constructor(
		public bracketOnLeft: Token,
		public key: Token,
		public colon: Token,
		public space: Token | undefined,
		public value: RichTextStatement,
		public bracketOnRight: Token
	) {
		super([bracketOnLeft, key, colon, space, value, bracketOnRight]);
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitMetadataTag(this);
	}

	/**
	 *
	 * @param key The key of the metadata item.
	 * @param value The value of the metadata item.
	 * @returns The generated metadata item.
	 *
	 * @example
	 * create("key", "value") // [key:: value]
	 */
	public static create(key: string, value: string): MetadataTagStatement {
		return new MetadataTagStatement(
			Token.create(TokenType.L_BRACKET),
			Token.create(TokenType.SYMBOL, key),
			Token.create(TokenType.COLON_COLON),
			Token.createSpace(),
			RichTextStatement.create(value),
			Token.create(TokenType.R_BRACKET)
		);
	}
}
