import { RichTextStatement } from "src/parsers/statements/RichTextStatement";
import { spawnFromContent } from "./BlockFactory";
import { MutableBlock } from "./MutableBlock";
import { Block } from "./Block";

export type RichTextContent =
	| RichTextBlock
	| RichTextStatement
	| Block[]
	| Block
	| string
	| undefined;

export class RichTextBlock extends MutableBlock {}

export function createRichTextBlock(content: RichTextContent) {
	if (content instanceof Block && !(content instanceof RichTextBlock)) {
		return new RichTextBlock(content);
	} else if (content === undefined) {
		return new RichTextBlock();
	} else if (Array.isArray(content)) {
		return new RichTextBlock(...content);
	} else {
		return spawnFromContent<RichTextBlock>(content, RichTextStatement);
	}
}
