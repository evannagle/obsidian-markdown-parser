import { Block } from "./Block";
import { createTokenBlock } from "./TokenBlock";
import { RichTextBlock } from "./RichTextBlock";
import { PlainTextBlock } from "./PlainTextBlock";
import {
	BoldBlock,
	HighlightBlock,
	ItalicBlock,
	StrikethroughBlock,
} from "./FormattingBlock";
import {
	Statement,
	StatementPart,
	isStatement,
} from "src/parsers/statements/Statement";
import { BookmarkBlock } from "./BookmarkBlock";
import { HrBlock } from "./HrBlock";
import { QuoteBlock } from "./QuoteBlock";
import { InlineCodeBlock } from "./InlineCodeBlock";
import { TagBlock } from "./TagBlock";
import {
	CheckboxListItemBlock,
	ListBlock,
	ListItemBlock,
	NumberedListItemBlock,
} from "./ListBlock";
import {
	CodeBlock,
	CodeMetadataBlock,
	CodeMetadataItemBlock,
	CodeSourceBlock,
	LatexBlock,
} from "./CodeBlock";
import { MetadataItemBlock } from "./MetadataBlock";
import { HeadingBlock } from "./HeadingBlock";
import { LedeBlock } from "./LedeBlock";
import { ParagraphBlock } from "./ParagraphBlock";
import {
	ExternalLinkBlock,
	ImageLinkBlock,
	InternalLinkBlock,
} from "./LinkBlock";
import {
	FrontMatterListItemBlock,
	FrontmatterBlock,
	FrontmatterItemBlock,
	FrontmatterListBlock,
} from "./FrontmatterBlock";

export class BlockFactory {
	public map = new Map<string, typeof Block>([
		["BoldStatement", BoldBlock],
		["BookmarkStatement", BookmarkBlock],
		["CheckboxStatement", CheckboxListItemBlock],
		["CodeStatement", CodeBlock],
		["CodeMetadataStatement", CodeMetadataBlock],
		["CodeMetadataItemStatement", CodeMetadataItemBlock],
		["CodeSourceStatement", CodeSourceBlock],
		["ContentStatement", LedeBlock],
		["ExternalLinkStatement", ExternalLinkBlock],
		["FrontmatterStatement", FrontmatterBlock],
		["FrontmatterScalarAttrStatement", FrontmatterItemBlock],
		["FrontmatterListItemStatement", FrontMatterListItemBlock],
		["FrontmatterListAttrStatement", FrontmatterItemBlock],
		["FrontmatterScalarAttrStatement", FrontmatterItemBlock],
		["FrontmatterListStatement", FrontmatterListBlock],
		["ParagraphStatement", ParagraphBlock],
		["PlainTextStatement", PlainTextBlock],
		["RichTextStatement", RichTextBlock],
		["HeadingStatement", HeadingBlock],
		["ImageLinkStatement", ImageLinkBlock],
		["InlineCodeStatement", InlineCodeBlock],
		["InternalLinkStatement", InternalLinkBlock],
		["ItalicStatement", ItalicBlock],
		["LatexStatement", LatexBlock],
		["StrikethroughStatement", StrikethroughBlock],
		["HighlightStatement", HighlightBlock],
		["HrStatement", HrBlock],
		["ListStatement", ListBlock],
		["ListItemStatement", ListItemBlock],
		["MetadataItemStatement", MetadataItemBlock],
		["NumberedListItemStatement", NumberedListItemBlock],
		["QuoteStatement", QuoteBlock],
		["TagStatement", TagBlock],
	]);

	public spawnFromStatementPart(statement: StatementPart): Block {
		if (!statement) {
			return createTokenBlock("");
		} else if (!isStatement(statement)) {
			return createTokenBlock(statement.lexeme, statement.literal);
		}

		const blockType = this.map.get(statement.constructor.name);

		if (!blockType) {
			throw new Error(
				`A block handling statements of type <${statement.constructor.name}> was not found. ` +
					`Please ensure a block has been registered to handle this type.`
			);
		}

		const block = new blockType(
			...statement
				.getParts()
				.map((part) => this.spawnFromStatementPart(part))
		);

		return block;
	}
}

export function spawnBlock(statement: StatementPart): Block {
	return new BlockFactory().spawnFromStatementPart(statement);
}

export function spawnFromContent<T extends Block>(
	content: T | Statement | string,
	statementType: { create: (content: string) => StatementPart }
) {
	if (isStatement(content)) {
		const factory = new BlockFactory();
		return factory.spawnFromStatementPart(content) as T;
	} else if (typeof content === "string") {
		return spawnBlock(statementType.create(content)) as T;
	} else {
		return content;
	}
}

/**
 *
 * @param content The content of the list item.
 * @param createStmt The function to create a new statement if the content is a string.
 * @returns
 */
export function spawnFromContentAndCreate<T extends Block, S extends Statement>(
	content: any,
	createStmt: (...args: any[]) => S
): T {
	if (typeof content === "string") {
		// return spawnBlock(ListItemStatement.create(0, content)) as T;
		return spawnBlock(createStmt(content)) as T;
	} else if (isStatement(content)) {
		return spawnBlock(content) as T;
	} else {
		return content as T;
	}
}
