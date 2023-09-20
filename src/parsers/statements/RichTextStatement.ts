import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";
import { parse } from "../Parser";

export class RichTextStatement extends Statement {
	public accept(visitor: IVisitor): void {
		visitor.visitRichText(this);
	}

	public static create(content: string): RichTextStatement {
		return parse(content).richText();
	}
}
