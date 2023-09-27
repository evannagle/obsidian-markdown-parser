import { TokenType } from "src/tokens/TokenType";
import { EOL_TOKENS, ParserBase } from "./ParserBase";
import { BookmarkStatement } from "./statements/BookmarkStatement";
import { PlainTextStatement } from "./statements/PlainTextStatement"; // avoid circular dependency
import { FrontmatterParser } from "./FrontmatterParser";
import { CodeBlockParser } from "./CodeBlockParser";
import { Token } from "src/tokens/Token";
import { CodeStatement, LatexStatement } from "./statements/CodeStatement";
import { ContentStatement } from "./statements/ContentStatement";
import { DocumentStatement } from "./statements/DocumentStatement";
import {
	BoldStatement,
	HighlightStatement,
	ItalicStatement,
	StrikethroughStatement,
} from "./statements/FormattingStatement";
import { FrontmatterStatement } from "./statements/FrontmatterStatement";
import { HrStatement } from "./statements/HrStatement";
import {
	HtmlStatement,
	htmlTagIsSelfClosing,
	getNameOfHtmlTag,
} from "./statements/HtmlStatement";
import {
	InlineCodeStatement,
	InlineLatexStatement,
} from "./statements/InlineCodeStatement";
import {
	ExternalLinkStatement,
	ImageLinkStatement,
	InternalLinkStatement,
} from "./statements/LinkStatement";
import {
	CheckboxStatement,
	ListStatement,
	ListItemStatement,
	NumberedListStatement,
	NumberedListItemStatement,
} from "./statements/ListStatement";
import {
	MetadataListStatement,
	MetadataItemStatement,
	MetadataTagStatement,
} from "./statements/MetadataStatement";
import { ParagraphStatement } from "./statements/ParagraphStatement";
import { QuoteStatement } from "./statements/QuoteStatement";
import { RichTextStatement } from "./statements/RichTextStatement";
import {
	HeadingStatement,
	SectionStatement,
} from "./statements/SectionStatement";
import { Statement } from "./statements/Statement";
import {
	TableStatement,
	TableRowStatement,
	TableCellStatement,
} from "./statements/TableStatement";
import { TagStatement } from "./statements/TagStatement";

export const PLAINTEXT_TOKENS = [
	TokenType.SYMBOL,
	TokenType.RUNE,
	TokenType.NUMBER,
	TokenType.ORDINAL,
	TokenType.SPACE,
	TokenType.ESCAPE,
];

export const BULLET_TOKENS = [
	TokenType.BULLET,
	TokenType.CHECKBOX,
	TokenType.N_BULLET,
];

export class Parser extends ParserBase {
	public bold(): BoldStatement {
		return new BoldStatement(
			this.chomp(TokenType.ASTERISK_ASTERISK),
			this.richTextOnLineUntil(TokenType.ASTERISK_ASTERISK),
			this.chomp(TokenType.ASTERISK_ASTERISK)
		);
	}

	public bookmark(): BookmarkStatement {
		return new BookmarkStatement(
			this.chomp(TokenType.LL_BRACE),
			this.plainText(),
			this.chomp(TokenType.RR_BRACE)
		);
	}

	public checkbox(tab?: Token): CheckboxStatement {
		return new CheckboxStatement(
			tab,
			this.chomp(TokenType.CHECKBOX),
			this.chomp(TokenType.SPACE),
			this.richText(EOL_TOKENS),
			this.chomp(EOL_TOKENS),
			this.list((tab ? (tab?.literal as number) : 0) + 1)
		);
	}

	public code(): CodeStatement {
		this.nextUntil(TokenType.CODE_END).next();
		return new CodeBlockParser(this.clearQueuedTokens()).parse();
	}

	public content(): ContentStatement | undefined {
		const statements: Statement[] = [];

		while (!this.is(TokenType.HHASH, TokenType.EOF)) {
			let s: Statement | undefined;

			switch (this.token.type) {
				case TokenType.BULLET:
				case TokenType.CHECKBOX:
				case TokenType.N_BULLET:
					s = this.list();
					break;
				case TokenType.CODE_START:
					s = this.code();
					break;
				case TokenType.PIPE:
					s = this.table();
					break;
				case TokenType.HGTHAN:
					s = this.quote();
					break;
				case TokenType.HR:
					s = this.hr();
					break;
				default:
					if (
						this.is(TokenType.SYMBOL) &&
						this.nextIs(TokenType.COLON_COLON)
					) {
						s = this.metadata();
					} else {
						s = this.paragraph();
					}

					break;
			}

			if (s) statements.push(s);
		}

		if (statements.length > 0) {
			return new ContentStatement(statements);
		} else {
			return undefined;
		}
	}

	public document(): DocumentStatement {
		return new DocumentStatement(
			this.frontmatter(),
			this.content(),
			this.sections()
		);
	}

	public externalLink(): Statement {
		return new ExternalLinkStatement(
			this.chomp(TokenType.L_BRACKET),
			this.plainText(),
			this.chomp(TokenType.R_BRACKET),
			this.chomp(TokenType.L_PAREN),
			this.maybeChomp(TokenType.URL) || this.plainText(),
			this.chomp(TokenType.R_PAREN)
		);
	}

	public frontmatter(): FrontmatterStatement | undefined {
		if (!this.is(TokenType.FRONTMATTER_START)) return undefined;
		this.nextUntil(TokenType.FRONTMATTER_END).next();
		return new FrontmatterParser(this.clearQueuedTokens()).parse();
	}

	public heading(): HeadingStatement {
		return new HeadingStatement(
			this.chomp(TokenType.HHASH),
			this.chomp(TokenType.SPACE),
			this.richText(),
			this.chomp(EOL_TOKENS)
		);
	}

	public highlight(): HighlightStatement {
		return new HighlightStatement(
			this.chomp(TokenType.EQUALS_EQUALS),
			this.richTextOnLineUntil(TokenType.EQUALS_EQUALS),
			this.chomp(TokenType.EQUALS_EQUALS)
		);
	}

	public hr(): HrStatement {
		return new HrStatement(
			this.chomp(TokenType.HR),
			this.chomp(EOL_TOKENS)
		);
	}

	public html(): HtmlStatement {
		const openTag = this.chomp(TokenType.HTML_TAG);
		const isSelfClosing = htmlTagIsSelfClosing(openTag);
		const tags: (Token | HtmlStatement)[] = [openTag];

		if (!isSelfClosing) {
			const tagName = getNameOfHtmlTag(openTag);

			while (!this.is(TokenType.EOF)) {
				if (
					this.is(TokenType.HTML_TAG) &&
					this.token.lexeme === `</${tagName}>`
				) {
					tags.push(this.chomp());
					break;
				} else if (this.is(TokenType.HTML_TAG)) {
					tags.push(this.html());
				} else {
					tags.push(this.chomp());
				}
			}
		}

		return new HtmlStatement(tags);
	}

	public imageLink(): ImageLinkStatement {
		return new ImageLinkStatement(
			this.chomp(TokenType.ILL_BRACKET),
			this.plainText(),
			this.chomp(TokenType.RR_BRACKET)
		);
	}

	public inlineCode(): InlineCodeStatement {
		return new InlineCodeStatement(
			this.chomp(TokenType.BACKTICK),
			this.chompWhileNot([TokenType.BACKTICK, ...EOL_TOKENS]),
			this.chomp(TokenType.BACKTICK)
		);
	}

	public italic(): ItalicStatement {
		return new ItalicStatement(
			this.chomp(TokenType.ASTERISK),
			this.richTextOnLineUntil(TokenType.ASTERISK),
			this.chomp(TokenType.ASTERISK)
		);
	}

	public internalLink(): InternalLinkStatement {
		const leftBracket = this.chomp(TokenType.LL_BRACKET);
		const file = this.plainText();
		const pipe = this.maybeChomp(TokenType.PIPE);
		const alias = pipe ? this.plainText() : undefined;

		return new InternalLinkStatement(
			leftBracket,
			file,
			pipe,
			alias,
			this.chomp(TokenType.RR_BRACKET)
		);
	}

	public latex(): InlineLatexStatement | undefined {
		this.checkout();

		const leftDollar = this.chomp(TokenType.DOLLAR);
		const source = this.chompWhileNot([TokenType.DOLLAR, ...EOL_TOKENS]);
		const rightDollar = this.maybeChomp(TokenType.DOLLAR);

		if (rightDollar !== undefined && this.is(TokenType.SPACE, EOL_TOKENS)) {
			return new InlineLatexStatement(leftDollar, source, rightDollar);
		} else {
			this.revertCheckout();
			return undefined;
		}
	}

	public list(depth = 0): ListStatement | undefined {
		const items: ListItemStatement[] = [];
		let listItemType = ListStatement;

		while (
			(depth === 0 && this.is(BULLET_TOKENS)) ||
			(depth > 0 &&
				this.is(TokenType.TAB) &&
				this.nextIs(BULLET_TOKENS) &&
				(this.token.literal as number) >= depth)
		) {
			const tab = this.maybeChomp(TokenType.TAB);
			let s: ListItemStatement | undefined;

			switch (this.token.type) {
				case TokenType.BULLET:
					s = this.listItem(tab);
					break;
				case TokenType.CHECKBOX:
					s = this.checkbox(tab);
					break;
				case TokenType.N_BULLET:
					s = this.numberedListItem(tab);
					listItemType = NumberedListStatement;
					break;
			}

			if (s) items.push(s);
		}

		if (items.length > 0) {
			return new listItemType(items);
		} else {
			return undefined;
		}
	}

	public latexBlock(): LatexStatement {
		return new LatexStatement(
			this.chomp(TokenType.DOLLAR_DOLLAR),
			this.chompWhileNot([TokenType.DOLLAR_DOLLAR, TokenType.EOF]),
			this.chomp(TokenType.DOLLAR_DOLLAR)
		);
	}

	public listItem(tab?: Token): ListItemStatement {
		return new ListItemStatement(
			tab,
			this.chomp(TokenType.BULLET),
			this.chomp(TokenType.SPACE),
			this.richText(EOL_TOKENS),
			this.chomp(EOL_TOKENS),
			this.list((tab ? (tab?.literal as number) : 0) + 1)
		);
	}

	public metadata(): MetadataListStatement {
		const items: MetadataItemStatement[] = [];

		while (
			this.is(TokenType.SYMBOL) &&
			this.nextIs(TokenType.COLON_COLON)
		) {
			items.push(this.metadataItem());
		}

		return new MetadataListStatement(items);
	}

	public metadataItem(): MetadataItemStatement {
		return new MetadataItemStatement(
			this.chomp(TokenType.SYMBOL),
			this.chomp(TokenType.COLON_COLON),
			this.maybeChomp(TokenType.SPACE),
			this.richText(EOL_TOKENS),
			this.chomp(EOL_TOKENS)
		);
	}

	public metadataTag(): MetadataTagStatement {
		return new MetadataTagStatement(
			this.chomp(TokenType.L_BRACKET),
			this.chomp(TokenType.SYMBOL),
			this.chomp(TokenType.COLON_COLON),
			this.maybeChomp(TokenType.SPACE),
			this.richText([TokenType.R_BRACKET]),
			this.chomp(TokenType.R_BRACKET)
		);
	}

	public numberedListItem(tab?: Token): NumberedListItemStatement {
		return new NumberedListItemStatement(
			tab,
			this.chomp(TokenType.N_BULLET),
			this.chomp(TokenType.SPACE),
			this.richText(EOL_TOKENS),
			this.chomp(EOL_TOKENS),
			this.list((tab ? (tab?.literal as number) : 0) + 1)
		);
	}

	public paragraph(): ParagraphStatement {
		return new ParagraphStatement(this.richText(), this.chomp(EOL_TOKENS));
	}

	public parse(): DocumentStatement {
		return this.document();
	}

	public plainText(allowedTokens: TokenType[] = []): PlainTextStatement {
		return new PlainTextStatement([
			this.chomp(),
			...this.chompWhile([...PLAINTEXT_TOKENS, ...allowedTokens]),
		]);
	}

	public quote(): QuoteStatement {
		return new QuoteStatement(
			this.chomp(TokenType.HGTHAN),
			this.maybeChomp(TokenType.SPACE),
			this.richTextOnLineUntil(TokenType.HGTHAN),
			this.chomp(EOL_TOKENS)
		);
	}

	public richText(stopTokens = EOL_TOKENS): RichTextStatement {
		const statements: Statement[] = [];

		while (!this.is(stopTokens)) {
			let s;

			switch (this.token.type) {
				case TokenType.ASTERISK:
					s = this.italic();
					break;
				case TokenType.ASTERISK_ASTERISK:
					s = this.bold();
					break;
				case TokenType.BACKTICK:
					s = this.inlineCode();
					break;
				case TokenType.DOLLAR:
					s = this.latex() || this.plainText([TokenType.DOLLAR]);
					break;
				case TokenType.DOLLAR_DOLLAR:
					s = this.latexBlock();
					break;
				case TokenType.EQUALS_EQUALS:
					s = this.highlight();
					break;
				case TokenType.ILL_BRACKET:
					s = this.imageLink();
					break;
				case TokenType.LL_BRACKET:
					s = this.internalLink();
					break;
				case TokenType.L_BRACKET:
					if (
						this.nextIs(TokenType.SYMBOL) &&
						this.peekAt(2).type === TokenType.COLON_COLON
					) {
						s = this.metadataTag();
					} else {
						s = this.externalLink();
					}
					break;
				case TokenType.LL_BRACE:
					s = this.bookmark();
					break;
				case TokenType.TAG:
					s = this.tag();
					break;
				case TokenType.HTML_TAG:
					s = this.html();
					break;
				case TokenType.TILDE_TILDE:
					s = this.strikethrough();
					break;
				default:
					s = this.plainText();
					break;
			}

			if (s) statements.push(s);
		}

		return new RichTextStatement(statements);
	}

	public richTextOnLineUntil(stopToken: TokenType) {
		return this.richText([TokenType.BR, TokenType.EOF, stopToken]);
	}

	public sections(minDepth = 0): SectionStatement[] {
		const sections: SectionStatement[] = [];

		while (
			this.is(TokenType.HHASH) &&
			(this.token.literal as number) > minDepth
		) {
			sections.push(this.section(this.token.literal as number));
		}

		return sections;
	}

	public section(minDepth = 0): SectionStatement {
		return new SectionStatement(
			this.heading(),
			this.content(),
			this.sections(minDepth)
		);
	}

	public strikethrough(): StrikethroughStatement {
		return new StrikethroughStatement(
			this.chomp(TokenType.TILDE_TILDE),
			this.richTextOnLineUntil(TokenType.TILDE_TILDE),
			this.chomp(TokenType.TILDE_TILDE)
		);
	}

	public table(): TableStatement {
		const rows: TableRowStatement[] = [];

		while (this.is(TokenType.PIPE)) {
			rows.push(this.tableRow());
		}

		return new TableStatement(rows);
	}

	public tableCell(): TableCellStatement {
		return new TableCellStatement(
			this.chomp(TokenType.PIPE),
			this.richTextOnLineUntil(TokenType.PIPE),
			this.nextIs(EOL_TOKENS) ? this.chomp(TokenType.PIPE) : undefined
		);
	}

	public tableRow(): TableRowStatement {
		const cells: TableCellStatement[] = [];

		while (this.is(TokenType.PIPE)) {
			cells.push(this.tableCell());
		}

		return new TableRowStatement(cells, this.chomp(EOL_TOKENS));
	}

	public tag(): TagStatement {
		return new TagStatement(this.chomp(TokenType.TAG));
	}
}

export function parseMarkdownDoc(text: string): DocumentStatement {
	return new Parser(text).parse();
}

export function parse(text: string): Parser {
	return new Parser(text);
}
