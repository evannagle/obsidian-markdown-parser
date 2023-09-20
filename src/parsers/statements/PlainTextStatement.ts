import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";
import { Parser } from "../Parser";

/**
 * Represents a plain text statement. No special syntax or Markdown components are allowed.
 * For rich text including links, formatting, quotes, etc., use a RichTextStatement.
 *
 * @example
 * Hello, world!
 */
export class PlainTextStatement extends Statement {
	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitPlainText(this);
	}

	/**
	 * Creates a plain text statement.
	 * @param content The content of the plain text statement.
	 * @returns
	 */
	static create(content: string): PlainTextStatement {
		return new Parser(content).plainText() as PlainTextStatement;
	}
}
