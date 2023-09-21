import { IVisitor } from "src/visitors/Visitor";
import { Statement, StatementPart } from "./Statement";
import { Token } from "src/tokens/Token";
import { Parser } from "../Parser";

/**
 * Returns whether the HTML tag is self-closing.
 * @param htmlToken The HTML token to check.
 * @returns Whether the HTML tag is self-closing.
 *
 * @example
 * <br /> is self-closing.
 * <br> is not self-closing.
 */
export function htmlTagIsSelfClosing(htmlToken: Token): boolean {
	const html = htmlToken.literal as string;
	return html.match(/<\s*(\w+)\s*\/>/) !== null;
}

/**
 * Returns the name of the HTML tag.
 * @param htmlToken The HTML token to check.
 * @returns The name of the HTML tag.
 *
 * @example
 * <br /> returns "br".
 * <br> returns "br".
 * <div class="foo"> returns "div".
 */
export function getNameOfHtmlTag(htmlToken: Token): string {
	const html = htmlToken.literal as string;
	const htmlTag = html.match(/<\s*(\w+)/);
	if (!htmlTag) {
		throw new Error("Invalid HTML tag");
	}

	return htmlTag[1] as string;
}

export class HtmlStatement extends Statement {
	constructor(public parts: StatementPart[]) {
		super();
	}

	/**
	 * Gets the parts of the statement.
	 * @returns The parts of the statement.
	 */
	protected getParts(): StatementPart[] {
		return this.parts;
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitHtml(this);
	}

	/**
	 * Creates an HTML statement.
	 * @param html The HTML content to parse.
	 * @returns The generated HTML statement.
	 */
	public static create(html: string): HtmlStatement {
		return new Parser(html).html();
	}
}
