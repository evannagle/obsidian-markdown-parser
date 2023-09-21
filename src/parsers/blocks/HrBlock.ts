import { TokenType } from "src/tokens/TokenType";
import { HrStatement } from "../statements";
import { Block } from "./Block";
import { Token } from "src/tokens/Token";

export enum HrType {
	Dash = "-",
	Underscore = "_",
}

/**
 * Represents a horizontal rule.
 */
export class HrBlock extends Block<HrStatement> {
	protected constructor(type: HrType = HrType.Dash) {
		super(HrStatement.create(type));
	}

	/**
	 * Creates a new horizontal rule block.
	 * @param type The type of horizontal rule to create, dash or underscore.
	 * @returns A new horizontal rule block.
	 */
	public static create(type: HrType = HrType.Dash): HrBlock {
		return new HrBlock(type);
	}

	/**
	 * Sets the type of horizontal rule.
	 */
	public set type(type: HrType) {
		this.stmt.hr = Token.create(TokenType.HR, type.toString().repeat(3));
	}

	/**
	 * Gets the type of horizontal rule.
	 */
	public get type(): HrType {
		return this.stmt.hr.lexeme === "___" ? HrType.Underscore : HrType.Dash;
	}
}
