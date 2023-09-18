import { BoldStatement } from "src/parsers/statements/BoldStatement";
import { DictItemDelimStatement } from "src/parsers/statements/DictItemDelimStatement";
import { DictItemKeyStatement } from "src/parsers/statements/DictItemKeyStatement";
import { DictItemListValueStatement } from "src/parsers/statements/DictItemListValueStatement";
import { DictItemValueStatement } from "src/parsers/statements/DictItemValueStatement";
import { ExternalLinkStatement } from "src/parsers/statements/ExternalLinkStatement";
import { FileStatement } from "src/parsers/statements/FileStatement";
import { FrontmatterDictItemStatement } from "src/parsers/statements/FrontmatterDictItemStatement";
import { FrontmatterDictStatement } from "src/parsers/statements/FrontmatterDictStatement";
import { FrontmatterStatement } from "src/parsers/statements/FrontmatterStatement";
import { HeadingStatement } from "src/parsers/statements/HeadingStatement";
import { ImageLinkStatement } from "src/parsers/statements/ImageLink";
import { InlineCodeStatement } from "src/parsers/statements/InlineCodeStatement";
import { InternalLinkStatement } from "src/parsers/statements/InternalLinkStatement";
import { ItalicStatement } from "src/parsers/statements/ItalicStatement";
import { LatexStatement } from "src/parsers/statements/LatexStatement";
import { ListItemDelimStatement } from "src/parsers/statements/ListItemDelimStatement";
import { ListItemKeyStatement } from "src/parsers/statements/ListItemKeyStatement";
import { ListItemStatement } from "src/parsers/statements/ListItemStatement";
import { ListItemValueStatement } from "src/parsers/statements/ListItemValueStatement";
import { ListStatement } from "src/parsers/statements/ListStatement";
import { MetadataStatement } from "src/parsers/statements/MetadataStatement";
import { MetadataTagStatement } from "src/parsers/statements/MetadataTagStatement";
import { NumberedListItemStatement } from "src/parsers/statements/NumberedListItemStatement";
import { NumberedListStatement } from "src/parsers/statements/NumberedListStatement";
import { PlainTextStatement } from "src/parsers/statements/PlainTextStatement";
import { RichTextStatement } from "src/parsers/statements/RichTextStatement";
import { Statement } from "src/parsers/statements/Statement";
import { StrikethroughStatement } from "src/parsers/statements/StrikethroughStatement";
import { TagStatement } from "src/parsers/statements/TagStatement";

export interface IVisitor {
	visitBold(expr: BoldStatement): void;
	visitCheckbox(expr: Statement): void;
	visitDictItemKey(expr: DictItemKeyStatement): void;
	visitDictItemValue(expr: DictItemValueStatement): void;
	visitDictItemListValue(expr: DictItemListValueStatement): void;
	visitDictItemDelim(expr: DictItemDelimStatement): void;
	visitExternalLink(expr: ExternalLinkStatement): void;
	visitFile(expr: FileStatement): void;
	visitFrontmatter(expr: FrontmatterStatement): void;
	visitFrontmatterDictionary(expr: FrontmatterDictStatement): void;
	visitFrontmatterDictionaryItem(expr: FrontmatterDictItemStatement): void;
	visitHeading(expr: HeadingStatement): void;
	visitImageLink(expr: ImageLinkStatement): void;
	visitInlineCode(expr: InlineCodeStatement): void;
	visitInternalLink(expr: InternalLinkStatement): void;
	visitLatex(expr: LatexStatement): void;
	visitList(expr: ListStatement): void;
	visitListItem(expr: ListItemStatement): void;
	visitListItemKey(expr: ListItemKeyStatement): void;
	visitListItemValue(expr: ListItemValueStatement): void;
	visitListItemDelim(expr: ListItemDelimStatement): void;
	visitMetadata(expr: MetadataStatement): void;
	visitMetadataTag(expr: MetadataTagStatement): void;
	visitNumberedList(expr: NumberedListStatement): void;
	visitNumberedListItem(expr: NumberedListItemStatement): void;
	visitItalic(expr: ItalicStatement): void;
	visitPlainText(expr: PlainTextStatement): void;
	visitRichText(expr: RichTextStatement): void;
	visitStrikethrough(expr: StrikethroughStatement): void;
	visitTag(expr: TagStatement): void;
}

export class Visitor implements IVisitor {
	public visit(s: Statement): void {
		throw new Error(
			`Visitor.visit() not implemented for ${s.constructor.name}`
		);
	}

	public visitBold = this.visit;
	public visitCheckbox = this.visit;
	public visitDictItemKey = this.visit;
	public visitDictItemValue = this.visit;
	public visitDictItemDelim = this.visit;
	public visitDictItemListValue = this.visit;
	public visitExternalLink = this.visit;
	public visitFile = this.visit;
	public visitFrontmatter = this.visit;
	public visitFrontmatterDictionary = this.visit;
	public visitFrontmatterDictionaryItem = this.visit;
	public visitHeading = this.visit;
	public visitImageLink = this.visit;
	public visitInlineCode = this.visit;
	public visitInternalLink = this.visit;
	public visitItalic = this.visit;
	public visitLatex = this.visit;
	public visitList = this.visit;
	public visitListItem = this.visit;
	public visitListItemKey = this.visit;
	public visitListItemValue = this.visit;
	public visitListItemDelim = this.visit;
	public visitMetadata = this.visit;
	public visitMetadataTag = this.visit;
	public visitNumberedList = this.visit;
	public visitNumberedListItem = this.visit;
	public visitPlainText = this.visit;
	public visitRichText = this.visit;
	public visitStrikethrough = this.visit;
	public visitTag = this.visit;
}
