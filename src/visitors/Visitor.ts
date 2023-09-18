import {
	Statement,
	FormattingStatement,
	RichTextStatement,
	DocumentStatement,
	FrontmatterItemStatement,
	FrontmatterStatement,
	ListStatement,
	ListItemStatement,
	PlainTextStatement,
	FrontmatterListStatement,
	FrontmatterListItemStatement,
} from "src/parsers/statements";

export interface IVisitor {
	visitDocument(s: DocumentStatement): void;
	visitFormatting(s: FormattingStatement): void;
	visitFrontmatterItem(s: FrontmatterItemStatement): void;
	visitFrontmatterList(s: FrontmatterListStatement): void;
	visitFrontmatterListItem(s: FrontmatterListItemStatement): void;
	visitFrontmatter(s: FrontmatterStatement): void;
	visitList(s: ListStatement): void;
	visitListItem(s: ListItemStatement): void;
	visitPlainText(s: PlainTextStatement): void;
	visitRichText(s: RichTextStatement): void;
}

export class Visitor implements IVisitor {
	public visit(s: Statement): void {
		throw new Error(
			`Visitor.visit() not implemented for ${s.constructor.name}`
		);
	}

	public visitDocument = this.visit;
	public visitFormatting = this.visit;
	public visitFrontmatter = this.visit;
	public visitFrontmatterItem = this.visit;
	public visitFrontmatterList = this.visit;
	public visitFrontmatterListItem = this.visit;
	public visitList = this.visit;
	public visitListItem = this.visit;
	public visitPlainText = this.visit;
	public visitRichText = this.visit;
}
