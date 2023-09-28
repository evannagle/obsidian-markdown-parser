import { SectionStatement } from "src/parsers/statements/SectionStatement";
import { MutableBlock } from "./MutableBlock";
import { LedeBlock, LedeContent, createLedeBlock } from "./LedeBlock";
import {
	HeadingBlock,
	HeadingContent,
	createHeadingBlock,
} from "./HeadingBlock";
import { spawnFromContent, spawnFromContentAndCreate } from "./BlockFactory";

export type SectionContent = SectionBlock | SectionStatement | string;

export class SectionBlock extends MutableBlock {
	public children: SectionBlock[];
	public heading: HeadingBlock;
	public lede?: LedeBlock;
	protected headingIndex = 0;
	protected ledeIndex = 1;

	constructor(
		heading: HeadingBlock,
		lede?: LedeBlock,
		...sections: SectionBlock[]
	) {
		super(heading, lede, ...sections);
		SectionBlock.allowedChildren = [LedeBlock, HeadingBlock, SectionBlock];
		this.heading = heading;
		this.lede = lede;
		this.children = sections;
	}

	public get level(): number {
		return this.heading.level;
	}

	public set level(level: number) {
		this.heading.level = level;
		this.relevel();
	}

	/**
	 * A fluent setter for the level of the heading
	 * @param level The level to set for the heading
	 * @returns The section block
	 */
	public atLevel(level: number): this {
		this.level = level;
		return this;
	}

	public relevel() {
		this.heading.level = this.level;
		this.children.forEach((child) => (child.level = this.level + 1));
	}

	/**
	 * Gets the string representation of the block.
	 * @returns A string representation of the block.
	 */
	public toString(): string {
		return (
			this.heading.toString() +
			(this.lede?.toString() || "") +
			super.toString()
		);
	}
}

export function createSectionBlockFromSectionContent(
	content: SectionContent
): SectionBlock {
	// return spawnFromContent<SectionBlock>(content, SectionStatement);
	return spawnFromContentAndCreate<SectionBlock, SectionStatement>(
		content,
		(c) => {
			return SectionStatement.create(c, undefined, []);
		}
	);
}

export function createSectionBlock(
	heading: HeadingContent,
	lede?: LedeContent,
	sections?: SectionContent[]
): SectionBlock {
	return new SectionBlock(
		createHeadingBlock(1, heading),
		lede ? createLedeBlock(lede, 2) : undefined,
		...(sections
			? sections.map((section) =>
					createSectionBlockFromSectionContent(section)
			  )
			: [])
	);
}
