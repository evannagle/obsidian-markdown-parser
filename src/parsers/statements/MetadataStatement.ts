import { Token } from "src/tokens/Token";
import { Statement } from "./Statement";
import { RichTextStatement } from "./RichTextStatement";
import { IVisitor } from "src/visitors/Visitor";

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

	public accept(visitor: IVisitor): void {
		visitor.visitMetadata(this);
	}
}

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

	public accept(visitor: IVisitor): void {
		visitor.visitMetadataTag(this);
	}
}
