import { Token } from "src/tokens/Token";
import { Block } from "./Block";
import { TokenBlock, createTokenBlock } from "./TokenBlock";

export class LineBlock extends Block {
	protected brIndex = 3;

	/**
	 * Get the number of line breaks at the end of the block.
	 */
	public get bottomMargin(): number {
		return this.get<TokenBlock>(this.brIndex).toNumber() ?? 0;
	}

	/**
	 * Set the number of line breaks at the end of the block.
	 */
	public set bottomMargin(margin: number) {
		this.set(this.brIndex, createTokenBlock(Token.createBr(margin)));
	}
}
