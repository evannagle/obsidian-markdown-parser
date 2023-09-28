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
import {
	FrontMatterListItemBlock,
	FrontmatterBlock,
	FrontmatterItemBlock,
	FrontmatterListBlock,
	createFrontmatterBlock,
	createFrontmatterItemBlock,
	createFrontmatterListBlock,
	createFrontmatterListItemBlock,
} from "./FrontmatterBlock";
import { HeadingBlock, createHeadingBlock } from "./HeadingBlock";
import { HrBlock, createHrBlock } from "./HrBlock";
import { InlineCodeBlock, createInlineCodeBlock } from "./InlineCodeBlock";
import { LedeBlock, createLedeBlock } from "./LedeBlock";
import {
	ExternalLinkBlock,
	ImageLinkBlock,
	InternalLinkBlock,
	LinkBlock,
	createExternalLinkBlock,
	createImageLinkBlock,
	createInternalLinkBlock,
} from "./LinkBlock";
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
	public frontmatter = FrontmatterBlock;
	public frontmatterItem = FrontmatterItemBlock;
	public frontmatterList = FrontmatterListBlock;
	public frontmatterListItem = FrontMatterListItemBlock;
	public heading = HeadingBlock;
	public hr = HrBlock;
	public i = ItalicBlock;
	public image = ImageLinkBlock;
	public inlineCode = InlineCodeBlock;
	public fileLink = InternalLinkBlock;
	public latex = LatexBlock;
	public lede = LedeBlock;
	public list = ListBlock;
	public li = ListItemBlock;
	public link = LinkBlock;
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
	public urlLink = ExternalLinkBlock;
}

export class MarkdownGenerator {
	public a = new MarkdownClassReference();
	public bold = createBoldBlock;
	public bookmark = createBookmarkBlock;
	public checkbox = createCheckboxBlock;
	public code = createCodeBlock;
	public codeMetadata = createCodeMetadataBlock;
	public frontmatter = createFrontmatterBlock;
	public frontmatterItem = createFrontmatterItemBlock;
	public frontmatterList = createFrontmatterListBlock;
	public frontmatterListItem = createFrontmatterListItemBlock;
	public heading = createHeadingBlock;
	public hr = createHrBlock;
	public highlight = createHighlightBlock;
	public i = createItalicBlock;
	public image = createImageLinkBlock;
	public inlineCode = createInlineCodeBlock;
	public latex = createLatexBlock;
	public lede = createLedeBlock;
	public link = createInternalLinkBlock;
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
	public urlLink = createExternalLinkBlock;
}

export const md = new MarkdownGenerator();
