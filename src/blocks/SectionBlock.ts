import { SectionStatement } from "src/parsers/statements/SectionStatement";
import { MutableBlock } from "./MutableBlock";
import { LedeBlock, createLedeBlock } from "./LedeBlock";
import {
	HeadingBlock,
	HeadingContent,
	createHeadingBlock,
} from "./HeadingBlock";
import { spawnFromContentAndCreate } from "./BlockFactory";
import { UndefinedBlock } from "./UndefinedBlock";
import { MetadataItemBlock } from "./MetadataBlock";
import { MetadataSpan, MetadataSpanItemBlock } from "./spans/MetadataSpan";
import { MetadataTreeBlock, MetadataTreeSpan } from "./spans/MetadataTreeSpan";

export type SectionContent = SectionBlock | SectionStatement | string;
export type SectionMatch = ((s: SectionBlock) => boolean) | RegExp | string;

/**
 * A block representing a section of a document.
 *
 * A section block is a block that contains a heading, a lede, and other subsections.
 *
 * Section level is determined by the level of the heading.
 *
 * @extends {MutableBlock}
 *
 * @example
 *
 * ```markdown
 * # Heading
 *
 * This is a lede.
 *
 * This is a paragraph, but still part of the lede.
 *
 * ## Subheading
 *
 * This is the lede of the subheading.
 * ```
 *
 */
export class SectionBlock extends MutableBlock {
	public override parent: SectionBlock | undefined;
	// public override children: SectionBlock[];
	public sections: SectionBlock[];
	public heading?: HeadingBlock;
	public lede?: LedeBlock;
	protected headingIndex = 0;
	protected ledeIndex = 1;

	constructor(
		heading?: HeadingBlock,
		lede?: LedeBlock,
		...sections: SectionBlock[]
	) {
		super(heading, lede, ...sections);
		SectionBlock.allowedChildren = [
			LedeBlock,
			HeadingBlock,
			SectionBlock,
			UndefinedBlock,
		];
		this.heading = heading;
		this.lede = lede;
		this.sections = sections;
	}

	/**
	 * Returns true if the section matches the given SectionFinder.
	 * @param match A finder function, string, or RegEx to match the section.
	 * @returns True if the section matches the given function.
	 */
	public matchesSection(match: SectionMatch): boolean {
		switch (typeof match) {
			case "function":
				return match(this);
			case "string":
				return this.heading?.content === match;
			default:
				return (match as RegExp).test(this.heading?.content ?? "");
		}
	}

	/**
	 * Finds the first section that matches the given function.
	 * @param fn The function to use to find the section.
	 * @returns The first section that matches the given function.
	 */
	public findSection(finder: SectionMatch): SectionBlock | undefined {
		if (this.matchesSection(finder)) return this;

		for (const child of this.sections) {
			const section = child.findSection(finder);
			if (section) return section;
		}

		return undefined;
	}

	/**
	 * Finds all sections that match the given function.
	 * @param fn The function to use to find the sections.
	 * @returns All sections that match the given function.
	 */
	public findSections(finder: SectionMatch) {
		const sections: SectionBlock[] = [];

		if (this.matchesSection(finder)) sections.push(this);

		for (const child of this.sections) {
			sections.push(...child.findSections(finder));
		}

		return sections;
	}

	/**
	 * Finds all metadata items.
	 * @returns Gdt all metadata items in the current block, across multiple metadata parent blocks.
	 */
	public getMetadata(): MetadataSpan {
		return new MetadataSpan(
			this.findAll(MetadataItemBlock) as MetadataSpanItemBlock[]
		);
	}

	/**
	 * Finds all metadata in the section and represents it as a tree.
	 * @returns A tree of all metadata items in the section.
	 *
	 * @example
	 * ```markdown
	 * # Section 1
	 * One:: 1
	 *
	 * ## Section 2
	 * Two:: 2
	 * ```
	 *
	 * ```typescript
	 * const tree = section.getMetadataTree().toDictionary();
	 * ```
	 *
	 * ```json
	 * {
	 *  "Section 1": {
	 *   "One": "1",
	 *   "Section 2": {
	 *     "Two": "2"
	 *   }
	 * },
	 */
	public getMetadataTree(): MetadataTreeSpan {
		return new MetadataTreeSpan(
			this.findAll([
				HeadingBlock,
				MetadataItemBlock,
			]) as MetadataTreeBlock[]
		);
	}

	/**
	 * Get the section level. Determined by the level of the heading.
	 */
	public get level(): number {
		return this.heading?.level ?? 0;
	}

	/**
	 * Set the section level. Determined by the level of the heading.
	 * Also relevels all children.
	 */
	public set level(level: number) {
		if (this.heading) {
			this.heading.level = level;
		}
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

	/**
	 * Relevels all children.
	 */
	protected relevel() {
		if (this.heading) {
			this.heading.level = this.level;
		}
		this.sections.forEach((child) => (child.level = this.level + 1));
	}

	/**
	 * Removes a section from the document.
	 * @param finder The function to use to find the section.
	 * @returns The first section that matches the given function.
	 */
	public removeSection(finder: SectionMatch): this {
		const section = this.findSection(finder);
		if (!section) return this;

		section.parent!.remove(section);
		return this;
	}

	/**
	 * Finds the first section that matches the given function.
	 * @param finder The function to use to find the section.
	 * @returns The first section that matches the given function.
	 */
	public section(finder: SectionMatch): SectionBlock {
		const section = this.findSection(finder);

		if (!section)
			throw new Error(
				`Section not found: ${finder}. Used findSection() instead if the section may not exist.`
			);

		return section;
	}

	/**
	 * Get the title of the section.
	 * If the section has no heading, returns an empty string.
	 */
	public get title(): string {
		return this.heading?.content ?? "";
	}

	/**
	 * Set the title of the section.
	 * If the section has no heading, creates a new heading.
	 */
	public set title(title: string) {
		if (!this.heading) {
			this.heading = createHeadingBlock(1, title);
		} else {
			this.heading.content = title;
		}
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
	lede?: string,
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
