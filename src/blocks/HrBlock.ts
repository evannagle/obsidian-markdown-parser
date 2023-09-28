import { HrStatement } from "src/parsers/statements/HrStatement";
import { Block } from "./Block";
import { spawnBlock } from "./BlockFactory";
import { TokenBlock, createTokenBlock } from "./TokenBlock";
import { Token } from "src/tokens/Token";
import { LineBlock } from "./LineBlock";

export enum HrType {
	Dash = "-",
	Underscore = "_",
}

/**
 * Creates an HrBlock with the given type.
 */
export class HrBlock extends LineBlock {
	public static override allowedChildren = [TokenBlock];
	public static override childCount = 2;
	protected hrIndex = 0;
	protected brIndex = 1;

	public constructor(hr: TokenBlock, br: TokenBlock) {
		super(hr, br);
	}

	/**
	 * Get the type of hr.
	 */
	public get type(): HrType {
		return this.str(this.hrIndex) === "___"
			? HrType.Underscore
			: HrType.Dash;
	}

	/**
	 * Set the type of hr.
	 */
	public set type(type: HrType) {
		this.set(this.hrIndex, createTokenBlock(type.toString().repeat(3)));
	}
}

/**
 * Creates an HrBlock with the given type.
 * @param type The type of hr to create, defaults to HrType.Dash
 * @returns The generated HrBlock
 */
export function createHrBlock(type = HrType.Dash): HrBlock {
	return spawnBlock(HrStatement.create(type)) as HrBlock;
}
