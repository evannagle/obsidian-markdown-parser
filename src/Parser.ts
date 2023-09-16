import { EOL_TOKEN, ParserBase, SPACE_TOKEN } from "./ParserBase";
import {
	HeadingStatement,
	Statement,
	RichTextStatement,
	PlainTextStatement,
	InternalLinkStatement,
	ExternalLinkStatement,
} from "./Statement";
import { Token } from "./Token";
import { printTokens } from "./TokenTable";
import { TokenType } from "./TokenType";
import { getTokens } from "./Tokenizer";

export const EOL = [TokenType.BR, TokenType.EOF];

export class Parser extends ParserBase {
	public declaration(): Statement {
		if (this.is(TokenType.HHASH)) return this.heading();

		return this.richText();
	}

	public heading(): HeadingStatement {
		return new HeadingStatement(
			this.chomp(TokenType.HHASH),
			this.chomp(SPACE_TOKEN),
			this.richText(),
			this.chomp(EOL_TOKEN)
		);
	}

	public externalLink(): Statement {
		return new ExternalLinkStatement(
			this.chomp(TokenType.L_BRACKET),
			this.plainText(),
			this.chomp(TokenType.R_BRACKET),
			this.chomp(TokenType.L_PAREN),
			this.chomp(TokenType.URL),
			this.chomp(TokenType.R_PAREN)
		);
	}

	public internalLink(): InternalLinkStatement {
		const leftBracket = this.chomp(TokenType.LL_BRACKET);
		const text = this.plainText();
		let pipe;
		let label;

		if (this.is(TokenType.PIPE)) {
			pipe = this.chomp(TokenType.PIPE);
			label = this.plainText();
		}

		return new InternalLinkStatement(
			leftBracket,
			text,
			pipe,
			label,
			this.chomp(TokenType.RR_BRACKET)
		);
	}

	public parse(): Statement[] {
		let overflowValve = 2000;
		const statements: Statement[] = [];

		while (!this.is(TokenType.EOF) && overflowValve-- > 0) {
			statements.push(this.declaration());
		}

		return statements;
	}

	public plainText(): PlainTextStatement {
		const tokens: Token[] = [];

		while (
			this.is(
				TokenType.SYMBOL,
				TokenType.RUNE,
				TokenType.SPACE,
				TokenType.ESCAPE
			)
		) {
			tokens.push(this.token);
			this.next();
		}

		return new PlainTextStatement(...tokens);
	}

	public richText(): RichTextStatement {
		const statements: Statement[] = [];

		while (!this.is(EOL_TOKEN)) {
			if (this.is(TokenType.LL_BRACKET)) {
				statements.push(this.internalLink());
			} else if (this.is(TokenType.L_BRACKET)) {
				statements.push(this.externalLink());
			} else {
				statements.push(this.plainText());
			}
		}

		return new RichTextStatement(...statements);
	}
}

export function parse(source: string): Statement[] {
	const tokens = getTokens(source);
	return new Parser(tokens).parse();
}
