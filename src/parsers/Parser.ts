import { TokenType } from "src/tokens/TokenType";
import { ParserBase, EOL_TOKENS } from "./ParserBase";

import {
	DocumentStatement,
	FrontmatterListAttrStatement,
	FrontmatterScalarAttrStatement,
	FrontmatterItemStatement,
	FrontmatterListItemStatement,
	FrontmatterListStatement,
	FrontmatterStatement,
	ListItemStatement,
	ListStatement,
	PlainTextStatement,
	RichTextStatement,
	Statement,
} from "./statements";

import { Scanner } from "src/scanners/Scanner";

export const PLAINTEXT_TOKENS = [
	TokenType.SYMBOL,
	TokenType.RUNE,
	TokenType.NUMBER,
	TokenType.ORDINAL,
	TokenType.SPACE,
	TokenType.ESCAPE,
];

export class Parser extends ParserBase {
	public document(): DocumentStatement {
		return new DocumentStatement(
			this.frontmatter()
			// this.lede(),
			// this.sections()
		);
	}

	public frontmatter(): FrontmatterStatement | undefined {
		if (!this.is(TokenType.FRONTMATTER_START)) return;

		return new FrontmatterStatement(
			this.chomp(TokenType.FRONTMATTER_START),
			this.chomp(TokenType.BR),
			this.frontmatterItems(),
			this.chomp(TokenType.FRONTMATTER_END)
		);
	}

	public frontmatterItems(): FrontmatterItemStatement[] {
		const items: FrontmatterItemStatement[] = [];

		while (this.is(TokenType.FRONTMATTER_KEY)) {
			const key = this.chomp(TokenType.FRONTMATTER_KEY);
			const colon = this.chomp(TokenType.COLON);
			const space = this.maybeChomp(TokenType.SPACE);

			if (
				this.is(TokenType.BR) &&
				this.nextIs(
					TokenType.FRONTMATTER_KEY,
					TokenType.FRONTMATTER_END
				)
			) {
				// ---
				// foo: <-- frontmatter item with no value
				// bar: <-- frontmatter item with no value
				// ---
				items.push(
					new FrontmatterScalarAttrStatement(
						key,
						colon,
						space,
						undefined,
						this.chomp(TokenType.BR)
					)
				);
			} else if (this.is(TokenType.FRONTMATTER_VALUE)) {
				// ---
				// foo: bar <-- frontmatter item with scalar value
				// ---
				items.push(
					new FrontmatterScalarAttrStatement(
						key,
						colon,
						space,
						this.chomp(TokenType.FRONTMATTER_VALUE),
						this.chomp(TokenType.BR)
					)
				);
			} else {
				// ---
				// foo: <-- frontmatter item with list value
				//   - bar
				//   - baz
				// ---
				items.push(
					new FrontmatterListAttrStatement(
						key,
						colon,
						this.maybeChomp(TokenType.BR),
						this.frontmatterList(),
						this.maybeChomp(TokenType.BR)
					)
				);
			}
		}

		return items;
	}

	public frontmatterList(): FrontmatterListStatement {
		return new FrontmatterListStatement(this.frontmatterListItems());
	}

	public frontmatterListItems(): FrontmatterListItemStatement[] {
		const items: FrontmatterListItemStatement[] = [];

		while (this.is(TokenType.FRONTMATTER_BULLET)) {
			items.push(this.frontmatterListItem());
		}

		return items;
	}

	public frontmatterListItem(): FrontmatterListItemStatement {
		return new FrontmatterListItemStatement(
			this.chomp(TokenType.FRONTMATTER_BULLET),
			this.maybeChomp(TokenType.SPACE),
			this.chomp(TokenType.FRONTMATTER_VALUE),
			this.chomp(TokenType.BR)
		);
	}

	public list(): ListStatement {
		return new ListStatement(this.listItems());
	}

	public listItems(): ListItemStatement[] {
		const items: ListItemStatement[] = [];

		while (this.is(TokenType.BULLET)) {
			items.push(this.listItem());
		}

		return items;
	}

	public listItem(): ListItemStatement {
		return new ListItemStatement(
			this.chomp(TokenType.BULLET),
			this.maybeChomp(TokenType.SPACE),
			this.richText(),
			this.chomp(TokenType.BR)
		);
	}

	public plainText(): PlainTextStatement {
		// always consume the first token
		return new PlainTextStatement([
			this.chomp(),
			...this.chompWhile(PLAINTEXT_TOKENS),
		]);
	}

	public richText(stopAt = EOL_TOKENS): Statement {
		const statements: Statement[] = [];

		while (!this.is(stopAt)) {
			switch (this.token.type) {
				default:
					statements.push(this.plainText());
			}
		}

		return new RichTextStatement(statements);
	}

	public parse(): DocumentStatement {
		return this.document();
	}
}

export function parseMarkdown(text: string): DocumentStatement {
	const tokens = new Scanner(text).scan();
	return new Parser(tokens).parse();
}
