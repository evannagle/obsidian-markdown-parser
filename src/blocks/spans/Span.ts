import { Block } from "../Block";
import { MutableBlock } from "../MutableBlock";

export abstract class Span<B extends Block, M> {
	// public abstract find(match: M): T | undefined;

	public constructor(public blocks: B[]) {}

	public abstract matches(block: B, match: M): boolean;

	public find(match: M): B | undefined {
		for (let i = 0; i < this.blocks.length; i++) {
			const block = this.blocks[i] as B;
			if (this.matches(block, match)) {
				return block;
			}
		}

		return undefined;
	}

	/**
	 * Find all blocks that match the given predicate
	 * @param match The predicate to check against
	 * @returns All blocks that match the predicate
	 */
	public findAll(match: M): B[] {
		const matches: B[] = [];

		this.blocks.forEach((block) => {
			if (this.matches(block, match)) {
				matches.push(block);
			}
		});

		return matches;
	}

	/**
	 * Check to see if a metadata item with the given key exists in the section.
	 * @param key The key to check for
	 * @returns True if the key exists, false otherwise.
	 */
	public has(match: M): boolean {
		return this.blocks.find((b) => this.matches(b, match)) !== undefined;
	}

	/**
	 * Removes ALL metadata items that match the given predicate.
	 * @param match The
	 * @returns
	 */
	public remove(match: M): this {
		const matchingBlocks = this.findAll(match);
		matchingBlocks.forEach((block) => {
			// MetadataSpan.removeMetadataSpanItem(block);
			this.removeBlock(block);
		});

		return this;
	}

	/**
	 * Removes one metadata item that matches the given predicate.
	 * If more than one match is found, throws an error.
	 * @param match The predicate to match against
	 */
	public removeSingle(match: M): this {
		return this.removeBlock(this.single(match));
	}

	public removeBlock(block: B): this {
		const parent = block.parent;

		if (!(parent instanceof MutableBlock)) {
			throw new Error(
				"Cannot delete the metadata item because it has no MutableBlock as its parent."
			);
		}

		parent.remove(block);
		this.removeBlockFromSpan(block);

		return this;
	}

	/**
	 * Removes the block from the span but does NOT remove it from the actual document / parent block.
	 * @param block The block to remove
	 * @returns this span for chaining
	 */
	public removeBlockFromSpan(block: B): this {
		// also remove from this.blocks
		const index = this.blocks.indexOf(block);

		if (index === -1) {
			throw new Error("Could not find block in this.blocks");
		} else {
			this.blocks.splice(index, 1);
		}
		return this;
	}

	/**
	 * Gets a single block that matches the given predicate.
	 * If more than one match is found, an error is thrown.
	 * If no matches are found, an error is thrown.
	 */
	public single(match: M): B {
		const blocks = this.findAll(match);

		if (blocks.length === 0) {
			throw new Error(
				`Span.single called but no match found: <${match}>`
			);
		}

		if (blocks.length > 1) {
			throw new Error(
				`Span.single called but more than one match found:\n` +
					`Matches found: ${blocks.length}\n` +
					`Match pattern: ${match}`
			);
		}

		return blocks[0] as B;
	}
}
