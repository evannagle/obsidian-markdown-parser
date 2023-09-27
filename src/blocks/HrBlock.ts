import { HrStatement } from "src/parsers/statements/HrStatement";
import { Block } from "./Block";
import { spawnBlock } from "./BlockFactory";
import { TokenBlock, createTokenBlock } from "./TokenBlock";

export enum HrType {
	Dash = "-",
	Underscore = "_",
}

/**
 * Creates an HrBlock with the given type.
 */
export class HrBlock extends Block {
	public static override allowedChildren = [TokenBlock];
	public static override childCount = 2;
	private hrIndex = 0;

	public constructor(hr: TokenBlock, br: TokenBlock) {
		super(hr, br);
	}

	public get type(): HrType {
		return this.str(this.hrIndex) === "___"
			? HrType.Underscore
			: HrType.Dash;
	}

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
