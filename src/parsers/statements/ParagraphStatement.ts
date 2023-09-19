import { IVisitor } from "src/visitors/Visitor";
import { RichTextStatement } from "./RichTextStatement";
import { Token } from "src/tokens/Token";
import { Statement } from "./Statement";

export class ParagraphStatement extends Statement {
	public constructor(public content: RichTextStatement, public br: Token) {
		super([content, br]);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitParagraph(this);
	}
}
