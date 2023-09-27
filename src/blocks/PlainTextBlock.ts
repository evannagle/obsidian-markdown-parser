import { PlainTextStatement } from "src/parsers/statements/PlainTextStatement";
import { spawnFromContent } from "./BlockFactory";
import { TokenBlock } from "./TokenBlock";
import { MutableBlock } from "./MutableBlock";

export type PlainTextContent = PlainTextBlock | PlainTextStatement | string;

export class PlainTextBlock extends MutableBlock {
	public allowedChildren = [TokenBlock];
}

export function createPlainTextBlock(
	content: PlainTextContent
): PlainTextBlock {
	return spawnFromContent<PlainTextBlock>(content, PlainTextStatement);
}
