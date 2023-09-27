import { TagStatement } from "src/parsers/statements/TagStatement";
import { Block } from "./Block";
import { spawnFromContent } from "./BlockFactory";
import { TokenBlock, createTokenBlock } from "./TokenBlock";

export type TagBlockContent = TagBlock | TagStatement | string;

export class TagBlock extends Block {
	public static override allowedChildren = [TokenBlock];
	public static override childCount = 1;

	public get name(): string {
		return this.str(0);
	}

	public set name(name: string) {
		this.set(0, createTokenBlock(TagStatement.create(name).toString()));
	}
}

export function createTagBlock(content: TagBlockContent): TagBlock {
	return spawnFromContent<TagBlock>(content, TagStatement);
}
