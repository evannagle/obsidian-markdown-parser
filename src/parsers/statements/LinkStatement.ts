import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";
import { PlainTextStatement } from "./PlainTextStatement";
import { Token } from "src/tokens/Token";

export enum LinkType {
	Internal = "internal",
	External = "external",
	Image = "image",
}

export class LinkStatement extends Statement {
	public type = LinkType.Internal;

	public accept(visitor: IVisitor): void {
		visitor.visitLink(this);
	}
}

export class InternalLinkStatement extends LinkStatement {
	constructor(
		public leftBracket: Token,
		public file: PlainTextStatement,
		public pipe: Token | undefined,
		public alias: PlainTextStatement | undefined,
		public rightBracket: Token
	) {
		super([leftBracket, file, pipe, alias, rightBracket]);
	}
}

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
		super([leftBracket, alias, rightBracket, leftParen, url, rightParen]);
	}
}
export class ImageLinkStatement extends LinkStatement {
	public type = LinkType.Image;

	constructor(
		public leftBracket: Token,
		public file: PlainTextStatement,
		public rightBracket: Token
	) {
		super([leftBracket, file, rightBracket]);
	}
}
