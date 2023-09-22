import {
	BoldStatement,
	FormattingStatement,
	HighlightStatement,
	ItalicStatement,
	RichTextStatement,
	StrikethroughStatement,
} from "../statements";
import { Block } from "./Block";

export class FormattingBlock<T extends FormattingStatement> extends Block<T> {
	public get content() {
		return this.stmt.content.toString();
	}

	public set content(value: string) {
		this.stmt.content = RichTextStatement.create(value);
	}
}

export class BoldBlock extends FormattingBlock<BoldStatement> {
	public static create(content: string) {
		return new BoldBlock(BoldStatement.create(content));
	}
}

export class ItalicBlock extends FormattingBlock<FormattingStatement> {
	public static create(content: string) {
		return new ItalicBlock(ItalicStatement.create(content));
	}
}

export class StrikethroughBlock extends FormattingBlock<FormattingStatement> {
	public static create(content: string) {
		return new StrikethroughBlock(StrikethroughStatement.create(content));
	}
}

export class HighlightBlock extends FormattingBlock<FormattingStatement> {
	public static create(content: string) {
		return new HighlightBlock(HighlightStatement.create(content));
	}
}
