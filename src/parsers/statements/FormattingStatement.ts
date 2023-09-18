import { Token } from "src/tokens/Token";
import { Statement } from "./Statement";
import { IVisitor } from "src/visitors/Visitor";
import { RichTextStatement } from "./RichTextStatement";

export class FormattingStatement extends Statement {
	constructor(
		decoratorOnLeft: Token,
		content: RichTextStatement,
		decoratorOnRight: Token
	) {
		super([decoratorOnLeft, content, decoratorOnRight]);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitFormatting(this);
	}
}

export class BoldStatement extends FormattingStatement {}
export class ItalicStatement extends FormattingStatement {}
export class StrikethroughStatement extends FormattingStatement {}
export class HighlightStatement extends FormattingStatement {}
