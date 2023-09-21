import { DocumentStatement } from "../statements";
import { Block } from "./Block";

export class DocumentBlock extends Block<DocumentStatement> {
	/**
	 * Create a new document block.
	 * @param source The source of the document.
	 * @returns A new document block.
	 */
	public static create(source: string): DocumentBlock {
		return new DocumentBlock(DocumentStatement.create(source));
	}
}
