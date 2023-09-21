import { IVisitor } from "src/visitors/Visitor";
import { Statement, StatementPart } from "./Statement";
import { PlainTextStatement } from "./PlainTextStatement";
import { Token } from "src/tokens/Token";
import { TokenType } from "src/tokens/TokenType";

export enum LinkType {
	Internal = "internal",
	External = "external",
	Image = "image",
}

export abstract class LinkStatement extends Statement {
	public type = LinkType.Internal;

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitLink(this);
	}
}

/**
 * Represents an internal link to another Markdown document.
 * Links are [[like this]] with an optional alias [[like this|alias]].
 */
export class InternalLinkStatement extends LinkStatement {
	constructor(
		public bracketOnLeft: Token,
		public file: PlainTextStatement,
		public pipe: Token | undefined,
		public alias: PlainTextStatement | undefined,
		public bracketOnRight: Token
	) {
		super();
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	protected getParts(): StatementPart[] {
		return [
			this.bracketOnLeft,
			this.file,
			this.pipe,
			this.alias,
			this.bracketOnRight,
		];
	}

	/**
	 * Creates an internal link.
	 * @param file The basename of the markdown file to link to
	 * @param alias The alias to display instead of the basename
	 * @returns The generated internal link.
	 */
	public static create(file: string, alias?: string) {
		return new InternalLinkStatement(
			Token.create(TokenType.LL_BRACKET),
			PlainTextStatement.create(file),
			alias ? Token.create(TokenType.PIPE) : undefined,
			alias ? PlainTextStatement.create(alias) : undefined,
			Token.create(TokenType.RR_BRACKET)
		);
	}
}

/**
 * Represents an external link to another website.
 * Links are [like this](https://example.com)
 */
export class ExternalLinkStatement extends LinkStatement {
	public type = LinkType.External;

	constructor(
		public leftBracket: Token,
		public alias: PlainTextStatement,
		public rightBracket: Token,
		public leftParen: Token,
		public url: Token | PlainTextStatement,
		public rightParen: Token
	) {
		super();
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	protected getParts(): StatementPart[] {
		return [
			this.leftBracket,
			this.alias,
			this.rightBracket,
			this.leftParen,
			this.url,
			this.rightParen,
		];
	}

	/**
	 * Creates an external link.
	 * @param alias The alias to display instead of the url
	 * @param url The url to link to
	 * @returns The generated external link.
	 */
	public static create(alias: string, url: URL | string) {
		return new ExternalLinkStatement(
			Token.create(TokenType.L_BRACKET),
			PlainTextStatement.create(alias),
			Token.create(TokenType.R_BRACKET),
			Token.create(TokenType.L_PAREN),
			Token.create(TokenType.URL, url.toString()),
			Token.create(TokenType.R_PAREN)
		);
	}
}

/**
 * Represents an image link which is rendered directly on the page
 * Links are ![[like this]]
 */
export class ImageLinkStatement extends LinkStatement {
	public type = LinkType.Image;

	constructor(
		public leftBracket: Token,
		public file: PlainTextStatement,
		public rightBracket: Token
	) {
		super();
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	protected getParts(): StatementPart[] {
		return [this.leftBracket, this.file, this.rightBracket];
	}

	/**
	 * Creates an image link.
	 * @param file The basename of the image file to link to
	 * @returns The generated image link.
	 */
	public static create(file: string) {
		return new ImageLinkStatement(
			Token.create(TokenType.ILL_BRACKET),
			PlainTextStatement.create(file),
			Token.create(TokenType.RR_BRACKET)
		);
	}
}
