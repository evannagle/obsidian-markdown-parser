import { MutableBlock } from "./MutableBlock";
import { spawnFromContentAndCreate } from "./BlockFactory";
import { ContentStatement } from "src/parsers/statements/ContentStatement";

// export type LedeContent = LedeBlock | ContentStatement | string;

export class LedeBlock extends MutableBlock {}

export function createLedeBlock(content: string, bottomMargin = 2): LedeBlock {
	return spawnFromContentAndCreate<LedeBlock, ContentStatement>(
		content,
		(c) => {
			return ContentStatement.create(c, bottomMargin);
		}
	);
}

// export function createLedeBlock(blocks: string | Block[]) {
// 	if (typeof blocks === "string") {
// 		blocks = blocks.trimEnd() + "\nxx\n";
// 		return spawnBlock(ContentStatement.create(blocks));
// 		// return spawnFromContent<LedeBlock>(blocks, ContentStatement);
// 	}

// 	return new LedeBlock(...blocks);
// }
