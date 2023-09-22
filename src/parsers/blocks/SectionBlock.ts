import { Token } from "src/tokens/Token";
import {
	ContentStatement,
	HeadingStatement,
	SectionStatement,
} from "../statements";
import { Block } from "./Block";
import { TokenType } from "src/tokens/TokenType";

export class SectionBlock extends Block<SectionStatement> {
	public static create(
		heading: string,
		lede: string | undefined = undefined,
		sections: SectionBlock[] = [],
		level = 1
	) {
		return new SectionBlock(
			SectionStatement.create(
				HeadingStatement.create(heading, level),
				lede ? ContentStatement.create(lede) : undefined,
				sections.map((s) => s.stmt)
			)
		);
	}

	public get level(): number {
		return this.stmt.heading.hhash.literal as number;
	}

	public set level(level: number) {
		this.stmt.heading.hhash = Token.create(
			TokenType.HHASH,
			"#".repeat(level),
			level
		);
	}
}

export class HeadingBlock extends Block<HeadingStatement> {
	public static create(text: string, level = 1): HeadingBlock {
		return new HeadingBlock(HeadingStatement.create(text, level));
	}
}
