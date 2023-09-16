import { Token } from "src/Token";
import { IVisitor } from "./visitors/Visitor";

/**
 * PARENTHESIS:         L_PAREN TEXT R_PAREN
 * TEXT:                SYMBOL | RUNE | NUMBER | SPACE | PARENTHESIS
 * INTERNAL_LINK:       LL_BRACKET TEXT RR_BRACKET
 *                      LL_BRACKET TEXT PIPE TEXT RR_BRACKET
 *
 * EXTERNAL_LINK:       L_BRACKET TEXT R_BRACKET L_PAREN URL R_PAREN
 * IMAGE_LINK:          ILL_BRACKET TEXT RR_BRACKET
 * RICH_TEXT:           TEXT | INTERNAL_LINK | EXTERNAL_LINK | IMAGE_LINK | CODE | EMPHASIS | STRIKE | TAG | METADATA | SECTION
 *
 * EMPHASIS:            ASTERISKS RICH_TEXT ASTERISKS
 * STRIKE:              TILDES RICH_TEXT TILDES
 *
 * HEADER:              HHASH SPACE TEXT BR
 *
 * CODE:                CODE_START CODE_LANGUAGE CODE_KEY CODE_VALUE CODE_SOURCE CODE_END
 *
 * FRONTMATTER:         FRONTMATTER_START FRONTMATTER_KEY COLON FRONTMATTER_VALUE FRONTMATTER_END
 *
 * TAG:                 TAG
 *
 * METADATA:            SYMBOL COLONS SPACE TEXT BR
 *
 * SECTION:             HEADER RICH_TEXT
 *
 * LATEX:               DOLLARS TEXT DOLLARS
 *
 * QUOTE:               HGTHAN SPACE TEXT BR
 *
 * TASK:                CHECKBOX SPACE TEXT BR
 */

// line parts
/*
 * PARENTHESES:         L_PAREN TEXT R_PAREN
 *
 */

// full lines
/*
 * TASK:                CHECKBOX SPACE TEXT BR
 * HEADER:              HHASH SPACE TEXT BR
 * IMAGE:               ILL_BRACKET TEXT RR_BRACKET
 * QUOTE:               (HGTHAN SPACE)* TEXT BR
 * PARAGRAPH:           ???
 */

// multiple lines / blocks
/*
 * CODE:                CODE_START CODE_LANGUAGE CODE_KEY CODE_VALUE CODE_SOURCE CODE_END
 * FRONTMATTER:         FRONTMATTER_START FRONTMATTER_KEY COLON FRONTMATTER_VALUE FRONTMATTER_END
 * SECTION:             HEADER ??
 * LATEX:               DOLLARS TEXT DOLLARS
 * PARAGRAPHS:          ???
 */

export type statementPart = Token | Statement | undefined;

export abstract class Statement {
	public parts: statementPart[];

	constructor(...parts: statementPart[]) {
		this.parts = parts;
	}

	/**
	 * Accepts a visitor.
	 * @param visitor The visitor to accept.
	 */
	public abstract accept(visitor: IVisitor): void;

	public toString(): string {
		return this.parts.map((part) => (part || "").toString()).join("");
	}

	public visitChildren(visitor: IVisitor): void {
		for (const part of this.parts) {
			if (part instanceof Statement) {
				part.accept(visitor);
			}
		}
	}
}

export class ExternalLinkStatement extends Statement {
	constructor(
		public leftParen: Token,
		public label: PlainTextStatement,
		public rightParen: Token,
		public leftBracket: Token,
		public url: Token,
		public rightBracket: Token
	) {
		super(...arguments);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitExternalLink(this);
	}
}

export class HeadingStatement extends Statement {
	public parts: statementPart[];

	constructor(
		public hash: Token,
		public space: Token,
		public richText: RichTextStatement,
		public br: Token
	) {
		super(...arguments);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitHeading(this);
	}
}

export class InternalLinkStatement extends Statement {
	constructor(
		public left: Token,
		public document: PlainTextStatement,
		public bar: Token | undefined,
		public label: PlainTextStatement | undefined,
		public right: Token
	) {
		super(...arguments);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitInternalLink(this);
	}
}

export class PlainTextStatement extends Statement {
	public accept(visitor: IVisitor): void {
		visitor.visitPlainText(this);
	}
}

export class RichTextStatement extends Statement {
	public accept(visitor: IVisitor): void {
		visitor.visitRichText(this);
	}
}
