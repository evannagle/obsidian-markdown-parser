import { Token } from "src/tokens/Token";
import { IVisitor } from "src/visitors/Visitor";

export type StatementPart = Token | Statement | undefined;

export abstract class Statement {
	/**
	 * Accepts a visitor.
	 * @param visitor The visitor to accept.
	 * @link https://craftinginterpreters.com/representing-code.html
	 */
	public abstract accept(visitor: IVisitor): void;

	/**
	 * Returns the parts of the statement.
	 */
	protected abstract getParts(): StatementPart[];

	/**
	 * Returns a string representation of the statement.
	 * @returns A string representation of the statement.
	 */
	public toString(): string {
		return this.getParts()
			.map((part) => (part || "").toString())
			.join("");
	}

	/**
	 * Visit the children of the statement.
	 * @param visitor The visitor to accept.
	 */
	public visitParts(visitor: IVisitor): void {
		for (const part of this.getParts()) {
			if (part instanceof Statement) {
				part.accept(visitor);
			}
		}
	}
}
