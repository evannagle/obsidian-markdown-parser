import { FrontmatterBlock } from "./FrontmatterBlock";
import { LedeBlock } from "./LedeBlock";
import { MutableBlock } from "./MutableBlock";
import { SectionBlock } from "./SectionBlock";

export class DocumentBlock extends MutableBlock {
	constructor(
		public frontmatter?: FrontmatterBlock,
		public lede?: LedeBlock,
		...sections: SectionBlock[]
	) {
		super(frontmatter, lede, ...sections);
		this.children = sections;
	}

	public toString(): string {
		return (
			(this.frontmatter?.toString() || "") +
			(this.lede?.toString() || "") +
			super.toString()
		);
	}
}
