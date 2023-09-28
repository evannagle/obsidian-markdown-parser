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
import { HeadingBlock, createHeadingBlock } from "./HeadingBlock";
import { HrBlock, createHrBlock } from "./HrBlock";
import { InlineCodeBlock, createInlineCodeBlock } from "./InlineCodeBlock";
import { LedeBlock, createLedeBlock } from "./LedeBlock";
import {
	CheckboxListItemBlock,
	ListBlock,
	ListItemBlock,
	NumberedListItemBlock,
	createCheckboxBlock,
	createListBlock,
	createListItemBlock,
	createNumberedListBlock,
	createNumberedListItemBlock,
} from "./ListBlock";
import { ParagraphBlock, createParagraphBlock } from "./ParagraphBlock";
import { PlainTextBlock, createPlainTextBlock } from "./PlainTextBlock";
import { QuoteBlock, createQuoteBlock } from "./QuoteBlock";
import { RichTextBlock, createRichTextBlock } from "./RichTextBlock";
import { SectionBlock, createSectionBlock } from "./SectionBlock";
import { TagBlock, createTagBlock } from "./TagBlock";
import { TokenBlock, createTokenBlock } from "./TokenBlock";

export class MarkdownClassReference {
	public bold = BoldBlock;
	public bookmark = BookmarkBlock;
	public checkbox = CheckboxListItemBlock;
	public code = CodeBlock;
	public codeMetadata = CodeMetadataBlock;
	public codeMetadataItem = CodeMetadataItemBlock;
	public heading = HeadingBlock;
	public hr = HrBlock;
	public i = ItalicBlock;
	public inlineCode = InlineCodeBlock;
	public latex = LatexBlock;
	public lede = LedeBlock;
	public list = ListBlock;
	public li = ListItemBlock;
	public nli = NumberedListItemBlock;
	public numbers = NumberedListItemBlock;
	public p = ParagraphBlock;
	public quote = QuoteBlock;
	public rich = RichTextBlock;
	public section = SectionBlock;
	public strike = StrikethroughBlock;
	public tag = TagBlock;
	public text = PlainTextBlock;
	public token = TokenBlock;
}

export class MarkdownGenerator {
	public a = new MarkdownClassReference();
	public bold = createBoldBlock;
	public bookmark = createBookmarkBlock;
	public checkbox = createCheckboxBlock;
	public code = createCodeBlock;
	public codeMetadata = createCodeMetadataBlock;
	public heading = createHeadingBlock;
	public hr = createHrBlock;
	public highlight = createHighlightBlock;
	public i = createItalicBlock;
	public inlineCode = createInlineCodeBlock;
	public latex = createLatexBlock;
	public lede = createLedeBlock;
	public list = createListBlock;
	public li = createListItemBlock;
	public nli = createNumberedListItemBlock;
	public numbers = createNumberedListBlock;
	public p = createParagraphBlock;
	public quote = createQuoteBlock;
	public rich = createRichTextBlock;
	public section = createSectionBlock;
	public strike = createStrikethroughBlock;
	public tag = createTagBlock;
	public text = createPlainTextBlock;
	public token = createTokenBlock;
}

export const md = new MarkdownGenerator();
