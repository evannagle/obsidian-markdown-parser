import { TokenType } from "src/tokens/TokenType";
import { ParserBase } from "./ParserBase";
import {
	FrontmatterItemStatement,
	FrontmatterListAttrStatement,
	FrontmatterListItemStatement,
	FrontmatterListStatement,
	FrontmatterScalarAttrStatement,
	FrontmatterStatement,
} from "./statements";

export class FrontmatterParser extends ParserBase {
	public parse(): FrontmatterStatement {
		return new FrontmatterStatement(
			this.chomp(TokenType.FRONTMATTER_START),
			this.chomp(TokenType.BR),
			this.items(),
			this.chomp(TokenType.FRONTMATTER_END)
		);
	}

	public items(): FrontmatterItemStatement[] {
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
						this.list(),
						this.maybeChomp(TokenType.BR)
					)
				);
			}
		}

		return items;
	}

	public list(): FrontmatterListStatement {
		return new FrontmatterListStatement(this.listItems());
	}

	public listItems(): FrontmatterListItemStatement[] {
		const items: FrontmatterListItemStatement[] = [];

		while (this.is(TokenType.FRONTMATTER_BULLET)) {
			items.push(this.listItem());
		}

		return items;
	}

	public listItem(): FrontmatterListItemStatement {
		return new FrontmatterListItemStatement(
			this.chomp(TokenType.FRONTMATTER_BULLET),
			this.maybeChomp(TokenType.SPACE),
			this.chomp(TokenType.FRONTMATTER_VALUE),
			this.chomp(TokenType.BR)
		);
	}
}
