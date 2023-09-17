import { EOL_TOKEN, ParserBase, SPACE_TOKEN } from "./ParserBase";
import { Token } from "./Token";
import { TokenType } from "./TokenType";
import { getTokens } from "./Tokenizer";
import { BoldStatement } from "./statements/BoldStatement";
import { CheckboxStatement } from "./statements/CheckBoxStatement";
import { DictItemDelimStatement } from "./statements/DictItemDelimStatement";
import { DictItemKeyStatement } from "./statements/DictItemKeyStatement";
import { DictItemListValueStatement } from "./statements/DictItemListValueStatement";
import { DictItemValueStatement } from "./statements/DictItemValueStatement";
import { ExternalLinkStatement } from "./statements/ExternalLinkStatement";
import { FileStatement } from "./statements/FileStatement";
import { FrontmatterDictItemStatement } from "./statements/FrontmatterDictItemStatement";
import { FrontmatterDictStatement } from "./statements/FrontmatterDictStatement";
import { FrontmatterStatement } from "./statements/FrontmatterStatement";
import { HeadingStatement } from "./statements/HeadingStatement";
import { ImageLinkStatement } from "./statements/ImageLink";
import { InternalLinkStatement } from "./statements/InternalLinkStatement";
import { ItalicStatement } from "./statements/ItalicStatement";
import { ListItemDelimStatement } from "./statements/ListItemDelimStatement";
import { ListItemKeyStatement } from "./statements/ListItemKeyStatement";
import { ListItemStatement } from "./statements/ListItemStatement";
import { ListItemValueStatement } from "./statements/ListItemValueStatement";
import { ListStatement } from "./statements/ListStatement";
import { MetadataStatement } from "./statements/MetadataStatement";
import { NumberedListItemStatement } from "./statements/NumberedListItemStatement";
import { NumberedListStatement } from "./statements/NumberedListStatement";
import { PlainTextStatement } from "./statements/PlainTextStatement";
import { RichTextStatement } from "./statements/RichTextStatement";
import { Statement } from "./statements/Statement";
import { StrikethroughStatement } from "./statements/StrikethroughStatement";
import { TagStatement } from "./statements/TagStatement";

export const EOL_TOKENS = [TokenType.BR, TokenType.EOF];

export const BULLET_TOKENS = [
	TokenType.BULLET,
	TokenType.FRONTMATTER_BULLET,
	TokenType.N_BULLET,
	TokenType.CHECKBOX,
];

export const FILE_TOKENS = [
	TokenType.SYMBOL,
	TokenType.RUNE,
	TokenType.NUMBER,
	TokenType.ORDINAL,
	TokenType.SPACE,
	TokenType.ESCAPE,
];
export const PLAINTEXT_TOKENS = [
	TokenType.SYMBOL,
	TokenType.RUNE,
	TokenType.NUMBER,
	TokenType.ORDINAL,
	TokenType.SPACE,
	TokenType.ESCAPE,
	TokenType.COLON_COLON,
	TokenType.FRONTMATTER_VALUE,
];

export class Parser extends ParserBase {
	public bold(): BoldStatement {
		return new BoldStatement(
			this.chomp(TokenType.ASTERISK_ASTERISK),
			this.richText([
				TokenType.ASTERISK_ASTERISK,
				TokenType.BR,
				TokenType.EOF,
			]),
			this.chomp(TokenType.ASTERISK_ASTERISK)
		);
	}

	public externalLink(): ExternalLinkStatement {
		return new ExternalLinkStatement(
			this.chomp(TokenType.L_BRACKET),
			this.plainText(),
			this.chomp(TokenType.R_BRACKET),
			this.chomp(TokenType.L_PAREN),
			this.chomp(TokenType.URL),
			this.chomp(TokenType.R_PAREN)
		);
	}

	public file(): FileStatement {
		return new FileStatement(...this.chompWhile(FILE_TOKENS));
	}

	public frontmatter(): FrontmatterStatement {
		return new FrontmatterStatement(
			this.chomp(TokenType.FRONTMATTER_START),
			this.chomp(EOL_TOKEN),
			this.frontmatterDictionary(),
			this.chomp(TokenType.FRONTMATTER_END)
		);
	}

	public frontmatterDictionary(): FrontmatterDictStatement {
		const items: FrontmatterDictItemStatement[] = [];

		while (!this.is(TokenType.FRONTMATTER_END)) {
			items.push(this.frontmatterItem());
		}

		return new FrontmatterDictStatement(...items);
	}

	public frontmatterItem(): FrontmatterDictItemStatement {
		return new FrontmatterDictItemStatement(
			this.frontmatterItemKey(),
			this.frontmatterItemDelim(),
			this.frontmatterItemValue(),
			this.maybeChomp(EOL_TOKEN) as Token
		);
	}

	public frontmatterItemDelim(): DictItemKeyStatement {
		return new DictItemDelimStatement(
			this.chomp(TokenType.COLON),
			this.maybeChomp(TokenType.SPACE)
		);
	}

	public frontmatterItemKey(): DictItemKeyStatement {
		return new DictItemKeyStatement(this.chomp(TokenType.FRONTMATTER_KEY));
	}

	public frontmatterItemValue(): DictItemValueStatement {
		if (this.is(EOL_TOKENS)) {
			return new DictItemListValueStatement(
				this.chomp(EOL_TOKEN),
				this.list(),
				this.maybeChomp(EOL_TOKEN)
			);
		} else {
			return new DictItemValueStatement(
				this.chomp(TokenType.FRONTMATTER_VALUE)
			);
		}
	}

	public heading(): HeadingStatement {
		return new HeadingStatement(
			this.chomp(TokenType.HHASH),
			this.chomp(SPACE_TOKEN),
			this.richText(),
			this.chomp(EOL_TOKEN)
		);
	}
	public imageLink(): ImageLinkStatement {
		return new ImageLinkStatement(
			this.chomp(TokenType.ILL_BRACKET),
			this.file(),
			this.chomp(TokenType.RR_BRACKET)
		);
	}

	public internalLink(): InternalLinkStatement {
		const leftBracket = this.chomp(TokenType.LL_BRACKET);
		const file = this.file();
		let pipe;
		let label;

		if (this.is(TokenType.PIPE)) {
			pipe = this.chomp(TokenType.PIPE);
			label = this.plainText();
		}

		return new InternalLinkStatement(
			leftBracket,
			file,
			pipe,
			label,
			this.chomp(TokenType.RR_BRACKET)
		);
	}

	public italic(): ItalicStatement {
		return new ItalicStatement(
			this.chomp(TokenType.ASTERISK),
			this.richText([TokenType.ASTERISK, TokenType.BR, TokenType.EOF]),
			this.chomp(TokenType.ASTERISK)
		);
	}

	public list(): ListStatement {
		let listType = ListStatement;

		switch (this.token.type) {
			case TokenType.CHECKBOX:
			case TokenType.BULLET:
			case TokenType.FRONTMATTER_BULLET:
				listType = ListStatement;
				break;
			case TokenType.N_BULLET:
				listType = NumberedListStatement;
				break;
			default:
				throw new Error(`Unknown list type: ${this.token.type}`);
		}

		const listItems: ListItemStatement[] = [];

		while (this.is(BULLET_TOKENS) && this.nextIs(TokenType.SPACE)) {
			listItems.push(this.listItem());
		}

		return new listType(...listItems);
	}

	public listItem(): ListItemStatement {
		let listItemType = ListItemStatement;

		switch (this.token.type) {
			case TokenType.CHECKBOX:
				listItemType = CheckboxStatement;
				break;
			case TokenType.BULLET:
			case TokenType.FRONTMATTER_BULLET:
				listItemType = ListItemStatement;
				break;
			case TokenType.N_BULLET:
				listItemType = NumberedListItemStatement;
				break;
			default:
				throw new Error(`Unknown list item type: ${this.token.type}`);
		}

		return new listItemType(
			this.listItemKey(),
			this.listItemDelim(),
			this.listItemValue(),
			this.chomp(EOL_TOKEN)
		);
	}

	public listItemDelim(): ListItemDelimStatement {
		return new ListItemDelimStatement(this.chomp(TokenType.SPACE));
	}

	public listItemKey(): ListItemKeyStatement {
		return new ListItemKeyStatement(this.chomp(BULLET_TOKENS));
	}

	public listItemValue(): ListItemValueStatement {
		return new ListItemValueStatement(this.richText(EOL_TOKENS));
	}

	public metadata(): MetadataStatement {
		return new MetadataStatement(
			this.chomp(TokenType.SYMBOL),
			this.chomp(TokenType.COLON_COLON),
			this.chomp(TokenType.SPACE),
			this.richText(),
			this.chomp(EOL_TOKEN)
		);
	}

	public parse(): Statement[] {
		let overflowValve = 20000;
		const statements: Statement[] = [];

		if (this.is(TokenType.FRONTMATTER_START)) {
			statements.push(this.frontmatter());
		}

		while (!this.is(TokenType.EOF) && overflowValve-- > 0) {
			statements.push(this.parseLine());
		}

		return statements;
	}

	public parseLine(): Statement {
		switch (this.token.type) {
			case TokenType.HHASH:
				return this.heading();
			case TokenType.CHECKBOX:
			case TokenType.BULLET:
			case TokenType.N_BULLET:
				return this.list();
			default:
				if (
					this.is(TokenType.SYMBOL) &&
					this.nextIs(TokenType.COLON_COLON)
				) {
					return this.metadata();
				}
				return this.richText();
		}
	}

	public plainText(): PlainTextStatement {
		return new PlainTextStatement(...this.chompWhile(PLAINTEXT_TOKENS));
	}

	public richText(stopToken = EOL_TOKEN): RichTextStatement {
		const statements: Statement[] = [];

		while (!this.is(stopToken)) {
			switch (this.token.type) {
				case TokenType.ILL_BRACKET:
					statements.push(this.imageLink());
					break;
				case TokenType.LL_BRACKET:
					statements.push(this.internalLink());
					break;
				case TokenType.L_BRACKET:
					statements.push(this.externalLink());
					break;
				case TokenType.ASTERISK:
					statements.push(this.italic());
					break;
				case TokenType.ASTERISK_ASTERISK:
					statements.push(this.bold());
					break;
				case TokenType.TAG:
					statements.push(this.tag());
					break;
				case TokenType.TILDE_TILDE:
					statements.push(this.strikethrough());
					break;
				default:
					statements.push(this.plainText());
			}
		}

		return new RichTextStatement(...statements);
	}

	public strikethrough(): StrikethroughStatement {
		return new StrikethroughStatement(
			this.chomp(TokenType.TILDE_TILDE),
			this.richText([TokenType.TILDE_TILDE, TokenType.BR, TokenType.EOF]),
			this.chomp(TokenType.TILDE_TILDE)
		);
	}

	public tag(): TagStatement {
		return new TagStatement(this.chomp(TokenType.TAG));
	}
}

export function parse(source: string): Statement[] {
	const tokens = getTokens(source);
	return new Parser(tokens).parse();
}
