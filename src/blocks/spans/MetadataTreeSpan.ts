import { HeadingBlock } from "../HeadingBlock";
import { MetadataItemBlock } from "../MetadataBlock";
import { Span } from "./Span";

export type MetadataTreeBlock = HeadingBlock | MetadataItemBlock;

export type MetadataTreeMatch =
	| string
	| RegExp
	| ((block: MetadataTreeBlock) => boolean);

export class MetadataTreeSpan extends Span<
	MetadataTreeBlock,
	MetadataTreeMatch
> {
	public matches(
		block: MetadataTreeBlock,
		match: MetadataTreeMatch
	): boolean {
		if (block instanceof HeadingBlock) {
			return this.matchesHeading(block, match);
		} else {
			return this.matchesMetadataItem(block, match);
		}
	}

	private matchesHeading(
		block: HeadingBlock,
		match: MetadataTreeMatch
	): boolean {
		switch (typeof match) {
			case "string":
				return block.content === match;
			case "function":
				return match(block);
			default:
				return (match as RegExp).test(block.content);
		}
	}

	private matchesMetadataItem(
		block: MetadataItemBlock,
		match: MetadataTreeMatch
	): boolean {
		switch (typeof match) {
			case "string":
				return block.key === match;
			case "function":
				return match(block);
			default:
				return (match as RegExp).test(block.key);
		}
	}

	public override removeBlock(block: MetadataTreeBlock): this {
		if (block instanceof HeadingBlock) {
			this.removeHeading(block);
		} else {
			super.removeBlock(block);
		}
		return this;
	}

	protected removeHeading(heading: HeadingBlock) {
		const index = this.blocks.indexOf(heading);
		let i;

		for (i = index + 1; i < this.blocks.length; i++) {
			const block = this.blocks[i];

			if (block instanceof HeadingBlock && block.level <= heading.level) {
				break;
			}
		}

		// find the next heading at the same level or higher
		// this.blocks.splice(index, 1);
		this.blocks.splice(index, i - index);
	}

	/**
	 * Creates a dictionary representation of all metadata items in the section.
	 * @returns A dictionary of all metadata items.
	 */
	public toDictionary(): Record<string, any> {
		const dict: Record<string, any> = {};
		let node = dict;
		let stack = [node];
		let level = 0;

		this.blocks.forEach((block) => {
			if (block instanceof HeadingBlock) {
				const heading = block as HeadingBlock;
				while (stack.length > 1 && level >= heading.level) {
					stack.pop();
					level--;
				}

				node = stack[stack.length - 1]!;
				level = heading.level;
				node = node[heading.content] = {};
				stack.push(node);
			} else if (block instanceof MetadataItemBlock) {
				node[block.key] = block.value;
			}
		});

		return dict;
	}
}
