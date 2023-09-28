import { RichTextContent, createRichTextBlock } from "./RichTextBlock";
import { LineBlock } from "./LineBlock";

export class RichContentBlock extends LineBlock {
	protected contentIndex = 2;

	/**
	 * Get the content of the block.
	 */
	public get content(): string {
		return this.str(this.contentIndex);
	}

	/**
	 * Set the content of the block.
	 */
	public set content(content: RichTextContent) {
		this.set(this.contentIndex, createRichTextBlock(content));
	}
}
