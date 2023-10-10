import { FrontmatterBlock, FrontmatterItemBlock } from "./FrontmatterBlock";
import { LedeBlock } from "./LedeBlock";
import { MetadataItemBlock } from "./MetadataBlock";
import { SectionBlock } from "./SectionBlock";
import { MetadataSpan } from "./spans/MetadataSpan";

export class DocumentBlock extends SectionBlock {
	constructor(
		public frontmatter?: FrontmatterBlock,
		public lede?: LedeBlock,
		...sections: SectionBlock[]
	) {
		// super(frontmatter, lede, ...sections);
		super(undefined, lede, ...sections);
		if (frontmatter) {
			this.children.unshift(frontmatter);
		}
	}

	/**
	 * Finds all metadata items.
	 * @returns Gdt all metadata items in the current block, across multiple metadata parent blocks.
	 */
	public override getMetadata(): MetadataSpan {
		return new MetadataSpan(
			this.findAll((b) => {
				return (
					b instanceof MetadataItemBlock ||
					b instanceof FrontmatterItemBlock
				);
			}) as MetadataItemBlock[]
		);
	}
}

export function createDocumentBlock(
	frontmatter?: FrontmatterBlock,
	lede?: LedeBlock,
	...sections: SectionBlock[]
): DocumentBlock {
	return new DocumentBlock(frontmatter, lede, ...sections);
}
