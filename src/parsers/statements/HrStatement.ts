import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";
import { Token } from "src/tokens/Token";
import { TokenType } from "src/tokens/TokenType";

/**
 * A horizontal rule statement.
 * Which can be
 * ---
 *
 * or
 *
 * ___
 */
export class HrStatement extends Statement {
	constructor(public hr: Token, public br: Token) {
		super([hr, br]);
	}

	/**
	 * Accepts a visitor.
	 * See the Visitor pattern. @link https://en.wikipedia.org/wiki/Visitor_pattern
	 * @param visitor The visitor to accept.
	 */
	public accept(visitor: IVisitor): void {
		visitor.visitHr(this);
	}

	/**
	 * Creates a horizontal rule statement.
	 * @param dashOrUnder - or _
	 * @returns The generated horizontal rule statement.
	 */
	public static create(dashOrUnder = "-") {
		return new HrStatement(
			Token.create(TokenType.HR, dashOrUnder.repeat(3)),
			Token.createBr()
		);
	}
}
