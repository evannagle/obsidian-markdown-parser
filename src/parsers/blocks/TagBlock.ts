import { Token } from "src/tokens/Token";
import { TagStatement } from "../statements";
import { Block } from "./Block";
import { TokenType } from "src/tokens/TokenType";

export class TagBlock extends Block<TagStatement> {
	/**
	 *
	 * @param name Creates a new tag block.
	 * @returns
	 */
	public static create(name: string) {
		return new TagBlock(TagStatement.create(name));
	}

	/**
	 * Gets the name of the tag.
	 */
	public get name(): string {
		return this.stmt.tag.literal as string;
	}

	/**
	 * Sets the name of the tag.
	 */
	public set name(name: string) {
		this.stmt.tag = Token.create(TokenType.TAG, "#" + name, name);
	}
}
