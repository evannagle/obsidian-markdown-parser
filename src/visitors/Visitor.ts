import {
	ExternalLinkStatement,
	HeadingStatement,
	InternalLinkStatement,
	PlainTextStatement,
	RichTextStatement,
} from "src/Statement";

export interface IVisitor {
	visitExternalLink(expr: ExternalLinkStatement): void;
	visitHeading(expr: HeadingStatement): void;
	visitInternalLink(expr: InternalLinkStatement): void;
	visitRichText(expr: RichTextStatement): void;
	visitPlainText(expr: PlainTextStatement): void;
}

export class Visitor implements IVisitor {
	public visitExternalLink(expr: ExternalLinkStatement): void {
		expr.visitChildren(this);
	}

	public visitHeading(expr: HeadingStatement): void {
		expr.visitChildren(this);
	}

	public visitInternalLink(expr: InternalLinkStatement): void {
		expr.visitChildren(this);
	}

	public visitRichText(expr: RichTextStatement): void {
		expr.visitChildren(this);
	}

	public visitPlainText(expr: PlainTextStatement): void {
		expr.visitChildren(this);
	}
}
