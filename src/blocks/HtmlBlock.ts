import { HtmlStatement } from "src/parsers/statements/HtmlStatement";
import { Block } from "./Block";
import { spawnFromContent } from "./BlockFactory";

export type HtmlContent = HtmlBlock | HtmlStatement | string;

export class HtmlBlock extends Block {}

export function createHtmlBlock(content: HtmlContent): HtmlBlock {
	return spawnFromContent<HtmlBlock>(content, HtmlStatement);
}
