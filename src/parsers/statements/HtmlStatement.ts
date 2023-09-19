import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";
import { Token } from "src/tokens/Token";

export function htmlTagIsSelfClosing(htmlToken: Token): boolean {
	const html = htmlToken.literal as string;
	return html.match(/<\s*(\w+)\s*\/>/) !== null;
}

export function getNameOfHtmlTag(htmlToken: Token): string {
	const html = htmlToken.literal as string;
	const htmlTag = html.match(/<\s*(\w+)/);
	if (!htmlTag) {
		throw new Error("Invalid HTML tag");
	}

	return htmlTag[1] as string;
}

export class HtmlStatement extends Statement {
	public accept(visitor: IVisitor): void {
		visitor.visitHtml(this);
	}
}
