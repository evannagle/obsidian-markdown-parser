import { Token } from "src/tokens/Token";
import { IVisitor } from "src/visitors/Visitor";

export type StatementPart = Token | Statement | undefined;

export abstract class Statement {
	constructor(public parts: StatementPart[]) {}

	/**
	 * Accepts a visitor.
	 * @param visitor The visitor to accept.
	 * @link https://craftinginterpreters.com/representing-code.html
	 */
	public abstract accept(visitor: IVisitor): void;

	/**
	 * Returns a string representation of the statement.
	 * @returns A string representation of the statement.
	 */
	public toString(): string {
		return this.parts.map((part) => (part || "").toString()).join("");
	}

	/**
	 * Visit the children of the statement.
	 * @param visitor The visitor to accept.
	 */
	public visitParts(visitor: IVisitor): void {
		for (const part of this.parts) {
			if (part instanceof Statement) {
				part.accept(visitor);
			}
		}
	}
}
