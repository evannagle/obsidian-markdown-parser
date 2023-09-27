import { Token } from "src/tokens/Token";
import { Statement, StatementPart } from "./Statement";
import { IVisitor } from "src/visitors/Visitor";
import { TokenType } from "src/tokens/TokenType";
import { scanTokens } from "src/scanners/Scanner";
import { isAlpha } from "src/scanners/ScannerBase";

export class TagStatement extends Statement {
	public constructor(public tag: Token) {
		super();
	}

	/**
	 * Creates a new tag statement.
	 * @param tag The value of the tag.
	 * @returns A new tag statement.
	 */
	public static create(tag: string): TagStatement {
		if (tag.startsWith("#")) {
			tag = tag.substring(1);
		}

		if (tag.length === 0) {
			throw new Error("Tag cannot be empty.");
		}

		if (!isAlpha(tag[0]) && !["-", "_"].includes(tag[0]!)) {
			throw new Error(
				`Tag must start with a letter. <${tag}> is invalid.`
			);
		}

		if (tag.includes(" ")) {
			throw new Error(`Tag cannot contain spaces. <${tag}> is invalid.`);
		}

		const tokens = scanTokens(`#${tag}`);

		if (tokens.length !== 2 || tokens[0]?.type !== TokenType.TAG) {
			throw new Error(`Invalid tag name: <#${tag}>.`);
		}

		return new TagStatement(tokens[0]);
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	public getParts(): StatementPart[] {
		return [this.tag];
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitTag(this);
	}
}
