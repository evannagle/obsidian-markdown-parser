import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";
import { Token } from "src/Token";
import { RichTextStatement } from "./RichTextStatement";

export class MetadataStatement extends Statement {
	constructor(
		public key: Token,
		public colon: Token,
		public space: Token,
		public value: RichTextStatement,
		public br: Token
	) {
		super(...arguments);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitMetadata(this);
	}
}
