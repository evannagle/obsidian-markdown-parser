import { Token } from "src/tokens/Token";
import { IVisitor } from "src/visitors/Visitor";

export type StatementPart = Token | Statement | undefined;

export type lines = string | string[];

export interface IStatement {
	discriminator: string;
	accept(visitor: IVisitor): void;
	visitParts(visitor: IVisitor): void;
}

export abstract class Statement implements IStatement {
	discriminator = "statement";

	/**
	 * Accepts a visitor.
	 * @param visitor The visitor to accept.
	 * @link https://craftinginterpreters.com/representing-code.html
	 */
	public abstract accept(visitor: IVisitor): void;

	/**
	 * Returns the parts of the statement.
	 */
	public abstract getParts(): StatementPart[];

	/**
	 * Releases the parts of the statement to a block.
	 * @param block The block to release the parts to.
	 * @returns The parts of the statement.
	 */
	public releasePartsTo(block: block): StatementPart[] {
		if (block) {
			return this.getParts();
		} else {
			return [];
		}
	}

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

/**
 * Checks if the given object is a statement.
 * @param s The statement to check.
 * @returns True if the class implements the IStatement interface.
 */
export function isStatement(s: any): s is Statement {
	return s.discriminator === "statement";
}
