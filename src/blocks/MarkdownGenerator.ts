import { BookmarkBlock, createBookmarkBlock } from "./BookmarkBlock";
import {
	CodeBlock,
	CodeMetadataBlock,
	CodeMetadataItemBlock,
	LatexBlock,
	createCodeBlock,
	createCodeMetadataBlock,
	createLatexBlock,
} from "./CodeBlock";
import {
	BoldBlock,
	ItalicBlock,
	StrikethroughBlock,
	createBoldBlock,
	createHighlightBlock,
	createItalicBlock,
	createStrikethroughBlock,
} from "./FormattingBlock";
import { HrBlock, createHrBlock } from "./HrBlock";
import { InlineCodeBlock, createInlineCodeBlock } from "./InlineCodeBlock";
import {
	CheckboxListItemBlock,
	ListBlock,
	ListItemBlock,
	NumberedListItemBlock,
	createCheckbox,
	createListBlock,
	createListItemBlock,
	createNumberedList,
	createNumberedListItem,
} from "./ListBlock";
import { ParagraphBlock, createParagraphBlock } from "./ParagraphBlock";
import { PlainTextBlock, createPlainTextBlock } from "./PlainTextBlock";
import { QuoteBlock, createQuoteBlock } from "./QuoteBlock";
import { RichTextBlock, createRichTextBlock } from "./RichTextBlock";
import { TagBlock, createTagBlock } from "./TagBlock";
import { TokenBlock, createTokenBlock } from "./TokenBlock";

export class MarkdownClassReference {
	public bold = BoldBlock;
	public bookmark = BookmarkBlock;
	public checkbox = CheckboxListItemBlock;
	public code = CodeBlock;
	public codeMetadata = CodeMetadataBlock;
	public codeMetadataItem = CodeMetadataItemBlock;
	public hr = HrBlock;
	public i = ItalicBlock;
	public inlineCode = InlineCodeBlock;
	public latex = LatexBlock;
	public list = ListBlock;
	public li = ListItemBlock;
	public nli = NumberedListItemBlock;
	public numbers = NumberedListItemBlock;
	public p = ParagraphBlock;
	public quote = QuoteBlock;
	public rich = RichTextBlock;
	public strike = StrikethroughBlock;
	public tag = TagBlock;
	public text = PlainTextBlock;
	public token = TokenBlock;
}

export class MarkdownGenerator {
	public a = new MarkdownClassReference();
	public bold = createBoldBlock;
	public bookmark = createBookmarkBlock;
	public checkbox = createCheckbox;
	public code = createCodeBlock;
	public codeMetadata = createCodeMetadataBlock;
	public hr = createHrBlock;
	public highlight = createHighlightBlock;
	public i = createItalicBlock;
	public inlineCode = createInlineCodeBlock;
	public latex = createLatexBlock;
	public list = createListBlock;
	public li = createListItemBlock;
	public nli = createNumberedListItem;
	public numbers = createNumberedList;
	public p = createParagraphBlock;
	public quote = createQuoteBlock;
	public rich = createRichTextBlock;
	public strike = createStrikethroughBlock;
	public tag = createTagBlock;
	public text = createPlainTextBlock;
	public token = createTokenBlock;
}

export const md = new MarkdownGenerator();
