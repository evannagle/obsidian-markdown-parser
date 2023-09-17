import { BoldStatement } from "src/statements/BoldStatement";
import { DictItemDelimStatement } from "src/statements/DictItemDelimStatement";
import { DictItemKeyStatement } from "src/statements/DictItemKeyStatement";
import { DictItemListValueStatement } from "src/statements/DictItemListValueStatement";
import { DictItemValueStatement } from "src/statements/DictItemValueStatement";
import { ExternalLinkStatement } from "src/statements/ExternalLinkStatement";
import { FileStatement } from "src/statements/FileStatement";
import { FrontmatterDictItemStatement } from "src/statements/FrontmatterDictItemStatement";
import { FrontmatterDictStatement } from "src/statements/FrontmatterDictStatement";
import { FrontmatterStatement } from "src/statements/FrontmatterStatement";
import { HeadingStatement } from "src/statements/HeadingStatement";
import { ImageLinkStatement } from "src/statements/ImageLink";
import { InternalLinkStatement } from "src/statements/InternalLinkStatement";
import { ItalicStatement } from "src/statements/ItalicStatement";
import { ListItemDelimStatement } from "src/statements/ListItemDelimStatement";
import { ListItemKeyStatement } from "src/statements/ListItemKeyStatement";
import { ListItemStatement } from "src/statements/ListItemStatement";
import { ListItemValueStatement } from "src/statements/ListItemValueStatement";
import { ListStatement } from "src/statements/ListStatement";
import { MetadataStatement } from "src/statements/MetadataStatement";
import { NumberedListItemStatement } from "src/statements/NumberedListItemStatement";
import { NumberedListStatement } from "src/statements/NumberedListStatement";
import { PlainTextStatement } from "src/statements/PlainTextStatement";
import { RichTextStatement } from "src/statements/RichTextStatement";
import { Statement } from "src/statements/Statement";
import { StrikethroughStatement } from "src/statements/StrikethroughStatement";
import { TagStatement } from "src/statements/TagStatement";

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
	visitInternalLink(expr: InternalLinkStatement): void;
	visitList(expr: ListStatement): void;
	visitListItem(expr: ListItemStatement): void;
	visitListItemKey(expr: ListItemKeyStatement): void;
	visitListItemValue(expr: ListItemValueStatement): void;
	visitListItemDelim(expr: ListItemDelimStatement): void;
	visitMetadata(expr: MetadataStatement): void;
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
	public visitInternalLink = this.visit;
	public visitItalic = this.visit;
	public visitList = this.visit;
	public visitListItem = this.visit;
	public visitListItemKey = this.visit;
	public visitListItemValue = this.visit;
	public visitListItemDelim = this.visit;
	public visitMetadata = this.visit;
	public visitNumberedList = this.visit;
	public visitNumberedListItem = this.visit;
	public visitPlainText = this.visit;
	public visitRichText = this.visit;
	public visitStrikethrough = this.visit;
	public visitTag = this.visit;
}
