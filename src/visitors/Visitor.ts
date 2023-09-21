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
	ContentStatement,
	LinkStatement,
	TagStatement,
	CheckboxStatement,
	MetadataStatement,
	InlineCodeStatement,
	MetadataTagStatement,
	HrStatement,
	SectionStatement,
	HeadingStatement,
	BookmarkStatement,
	ParagraphStatement,
	CodeStatement,
	CodeMetadataStatement,
	CodeSourceStatement,
	CodeMetadataItemStatement,
	LatexStatement,
	HtmlStatement,
	TableStatement,
	TableRowStatement,
	TableCellStatement,
	QuoteStatement,
} from "src/parsers/statements";

export interface IVisitor {
	visitBookmark(s: BookmarkStatement): void;
	visitCheckbox(s: CheckboxStatement): void;
	visitCodeBlock(s: CodeStatement): void;
	visitCodeBlockMetadata(s: CodeMetadataStatement): void;
	visitCodeBlockMetadataItem(s: CodeMetadataItemStatement): void;
	visitCodeBlockSource(s: CodeSourceStatement): void;
	visitContent(s: ContentStatement): void;
	visitDocument(s: DocumentStatement): void;
	visitFormatting(s: FormattingStatement): void;
	visitFrontmatterItem(s: FrontmatterItemStatement): void;
	visitFrontmatterList(s: FrontmatterListStatement): void;
	visitFrontmatterListItem(s: FrontmatterListItemStatement): void;
	visitFrontmatter(s: FrontmatterStatement): void;
	visitHeading(s: HeadingStatement): void;
	visitHr(s: HrStatement): void;
	visitHtml(s: HtmlStatement): void;
	visitInlineCode(s: InlineCodeStatement): void;
	visitLatexBlock(s: LatexStatement): void;
	visitLink(s: LinkStatement): void;
	visitList(s: ListStatement): void;
	visitListItem(s: ListItemStatement): void;
	visitMetadata(s: MetadataStatement): void;
	visitMetadataTag(s: MetadataTagStatement): void;
	visitParagraph(s: ParagraphStatement): void;
	visitPlainText(s: PlainTextStatement): void;
	visitQuote(s: QuoteStatement): void;
	visitRichText(s: RichTextStatement): void;
	visitSection(s: SectionStatement): void;
	visitTable(s: TableStatement): void;
	visitTableRow(s: TableRowStatement): void;
	visitTableCell(s: TableCellStatement): void;
	visitTag(s: TagStatement): void;
}

export class Visitor implements IVisitor {
	public visit(s: Statement): void {
		throw new Error(
			`Visitor.visit() not implemented for ${s.constructor.name}`
		);
	}

	public visitBookmark = this.visit;
	public visitCheckbox = this.visit;
	public visitCodeBlock = this.visit;
	public visitCodeBlockMetadata = this.visit;
	public visitCodeBlockMetadataItem = this.visit;
	public visitCodeBlockSource = this.visit;
	public visitContent = this.visit;
	public visitDocument = this.visit;
	public visitFormatting = this.visit;
	public visitFrontmatter = this.visit;
	public visitFrontmatterItem = this.visit;
	public visitFrontmatterList = this.visit;
	public visitFrontmatterListItem = this.visit;
	public visitHeading = this.visit;
	public visitHr = this.visit;
	public visitHtml = this.visit;
	public visitInlineCode = this.visit;
	public visitLatexBlock = this.visit;
	public visitLink = this.visit;
	public visitList = this.visit;
	public visitListItem = this.visit;
	public visitMetadata = this.visit;
	public visitMetadataTag = this.visit;
	public visitParagraph = this.visit;
	public visitPlainText = this.visit;
	public visitQuote = this.visit;
	public visitRichText = this.visit;
	public visitSection = this.visit;
	public visitTable = this.visit;
	public visitTableRow = this.visit;
	public visitTableCell = this.visit;
	public visitTag = this.visit;
}
