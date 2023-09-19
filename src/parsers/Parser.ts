import { TokenType } from "src/tokens/TokenType";
import { EOL_TOKENS, ParserBase } from "./ParserBase";

import {
	BoldStatement,
	BookmarkStatement,
	CheckboxStatement,
	CodeBlockStatement,
	ContentStatement,
	DocumentStatement,
	ExternalLinkStatement,
	FrontmatterStatement,
	HeadingStatement,
	HighlightStatement,
	HrStatement,
	ImageLinkStatement,
	InlineCodeStatement,
	InlineLatexStatement,
	InternalLinkStatement,
	ItalicStatement,
	ListItemStatement,
	ListStatement,
	MetadataStatement,
	MetadataTagStatement,
	NumberedListItemStatement,
	NumberedListStatement,
	ParagraphStatement,
	PlainTextStatement,
	RichTextStatement,
	SectionStatement,
	Statement,
	StrikethroughStatement,
	TagStatement,
} from "./statements";

import { Scanner } from "src/scanners/Scanner";
import { FrontmatterParser } from "./FrontmatterParser";
import { CodeBlockParser } from "./CodeBlockParser";

export const PLAINTEXT_TOKENS = [
	TokenType.SYMBOL,
	TokenType.RUNE,
	TokenType.NUMBER,
	TokenType.ORDINAL,
	TokenType.SPACE,
	TokenType.ESCAPE,
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

	public checkbox(): CheckboxStatement {
		const tab = this.maybeChomp(TokenType.TAB);

		return new CheckboxStatement(
			tab,
			this.chomp(TokenType.CHECKBOX),
			this.chomp(TokenType.SPACE),
			this.richText(EOL_TOKENS),
			this.chomp(EOL_TOKENS),
			this.list((tab ? (tab?.literal as number) : 0) + 1)
		);
	}

	public codeBlock(): CodeBlockStatement {
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
					s = this.list();
					break;
				case TokenType.N_BULLET:
					s = this.numberedList();
					break;
				case TokenType.CODE_START:
					s = this.codeBlock();
					break;
				// case TokenType.BR:
				// 	s = new PlainTextStatement([this.chomp()]);
				// 	break;
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

	/**
	 * Parses a frontmatter statement
	 * @returns a parsed frontmatter statement
	 */
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

		while (
			(depth === 0 && this.is(TokenType.BULLET, TokenType.CHECKBOX)) ||
			(depth > 0 &&
				this.is(TokenType.TAB) &&
				this.nextIs(TokenType.BULLET, TokenType.CHECKBOX) &&
				(this.token.literal as number) >= depth)
		) {
			const bullet = this.is(TokenType.TAB) ? this.peekAt(1) : this.token;
			const s =
				bullet.type === TokenType.CHECKBOX
					? this.checkbox()
					: this.listItem();
			if (s) items.push(s);
		}

		if (items.length > 0) {
			return new ListStatement(items);
		} else {
			return undefined;
		}
	}

	public listItem(): ListItemStatement {
		const tab = this.maybeChomp(TokenType.TAB);

		return new ListItemStatement(
			tab,
			this.chomp(TokenType.BULLET),
			this.chomp(TokenType.SPACE),
			this.richText(EOL_TOKENS),
			this.chomp(EOL_TOKENS),
			this.list((tab ? (tab?.literal as number) : 0) + 1)
		);
	}

	public metadata(): MetadataStatement {
		return new MetadataStatement(
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

	public numberedList(depth = 0): NumberedListStatement {
		const items: NumberedListItemStatement[] = [];

		while (
			(depth === 0 && this.is(TokenType.N_BULLET)) ||
			(depth > 0 &&
				this.is(TokenType.TAB) &&
				(this.token.literal as number) >= depth)
		) {
			items.push(this.numberedListItem());
		}

		return new NumberedListStatement(items);
	}

	public numberedListItem(): NumberedListItemStatement {
		const tab = this.maybeChomp(TokenType.TAB);

		return new NumberedListItemStatement(
			tab,
			this.chomp(TokenType.N_BULLET),
			this.chomp(TokenType.SPACE),
			this.richText(EOL_TOKENS),
			this.chomp(EOL_TOKENS),
			this.numberedList((tab ? (tab?.literal as number) : 0) + 1)
		);
	}

	public paragraph(): ParagraphStatement {
		return new ParagraphStatement(this.richText(), this.chomp(EOL_TOKENS));
	}

	public parse(): DocumentStatement {
		return this.document();
	}

	public plainText(allowedTokens: TokenType[] = []): Statement {
		return new PlainTextStatement([
			this.chomp(),
			...this.chompWhile([...PLAINTEXT_TOKENS, ...allowedTokens]),
		]);
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

	public tag(): TagStatement {
		return new TagStatement(this.chomp(TokenType.TAG));
	}
}

export function parseMarkdown(text: string): DocumentStatement {
	const tokens = new Scanner(text).scan();
	return new Parser(tokens).parse();
}
