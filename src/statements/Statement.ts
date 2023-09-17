import { Token } from "src/Token";
import { IVisitor } from "src/visitors/Visitor";

export type statementPart = Token | Statement | undefined;

export abstract class Statement {
	public parts: statementPart[];

	constructor(...parts: statementPart[]) {
		this.parts = parts;
	}

	/**
	 * Accepts a visitor.
	 * @param visitor The visitor to accept.
	 */
	public abstract accept(visitor: IVisitor): void;

	public toString(): string {
		return this.parts.map((part) => (part || "").toString()).join("");
	}

	public visitChildren(visitor: IVisitor): void {
		for (const part of this.parts) {
			if (part instanceof Statement) {
				part.accept(visitor);
			}
		}
	}
}
