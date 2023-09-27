import { RichTextStatement } from "src/parsers/statements/RichTextStatement";
import { spawnFromContent } from "./BlockFactory";
import { MutableBlock } from "./MutableBlock";

export type RichTextContent = RichTextBlock | RichTextStatement | string;

export class RichTextBlock extends MutableBlock {}

export function createRichTextBlock(content: RichTextContent) {
	return spawnFromContent<RichTextBlock>(content, RichTextStatement);
}
