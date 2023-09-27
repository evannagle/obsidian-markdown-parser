export class Block {
	public parent: Block | undefined = undefined;
	protected children: Block[] = [];
	protected static allowedChildren: (typeof Block)[] | undefined = undefined;
	protected static childCount: number | undefined = undefined;

	constructor(...children: (Block | undefined)[]) {
		this.add(...(children.filter((c) => c) as Block[]));
		this.assertChildCount();
	}

	/**
	 * @param child The child to add.
	 */
	protected add(...children: Block[]): this {
		children.forEach((child) => {
			this.addAt(child, this.children.length);
		});

		return this;
	}

	/**
	 * Adds a child to the block after the given sibling block.
	 * @param sibling The sibling block
	 * @param newBlock The new block, added after the sibling block
	 */
	protected addAfter(sibling: Block, newBlock: Block): this {
		const index = this.indexOfChild(sibling);
		this.addAt(newBlock, index + 1);
		return this;
	}

	/**
	 * Adds a child to the block at the given index.
	 * @param child The child to add.
	 * @param index The index at which to add the child.
	 */
	protected addAt(child: Block, index: number): this {
		this.children.splice(index, 0, child);
		Block.adopt(child, this);
		return this;
	}

	/**
	 * Adds a child to the block before the given sibling block.
	 * @param sibling The sibling block
	 * @param newBlock The new block, added before the sibling block
	 */
	protected addBefore(sibling: Block, newBlock: Block) {
		const index = this.indexOfChild(sibling);
		this.addAt(newBlock, index);
	}

	/**
	 * Find all children of the given type.
	 * @param type The type of block to find.
	 * @returns All blocks of the given type.
	 */
	public all<T extends Block>(type: { new (...args: any[]): T }): T[] {
		const r = this.children.filter((child) => child instanceof type) as T[];

		for (const child of this.children) {
			r.push(...child.all(type));
		}

		return r;
	}

	/**
	 * Asserts the number of children attached to the block is set to the expected value.
	 * @throws An error if the number of children is not equal to the expected value.
	 */
	public assertChildCount(): this {
		const source = this.constructor as typeof Block;

		if (source.childCount !== undefined) {
			if (this.children.length !== source.childCount) {
				throw new Error(
					`Expected ${source.childCount} children, found ${this.children.length}.`
				);
			}
		}

		return this;
	}

	/**
	 * Throws an error if the block does not have a parent.
	 */
	public assertParent(): Block {
		if (!this.parent) {
			throw new Error(
				`Block ${this.constructor.name} does not have a parent; cannot remove.`
			);
		}

		return this.parent;
	}

	/**
	 * Sets the parent of the block.
	 */
	protected static adopt(child: Block, parent: Block): Block {
		parent.onChildAdopted(child);
		child.onAdoption(parent);
		return parent;
	}

	/**
	 * Get the count of children.
	 */
	public countChildren(): number {
		return this.children.length;
	}

	/**
	 * Disown the given child from the given parent. Throws an error if the child is not a child of the parent or if
	 * Removing the child is forbidding by the constraints of the parent.
	 * @param child The child to disown.
	 * @param parent The parent of the child.
	 */
	protected static disown(child: Block, parent: Block): Block {
		parent.onChildAbandoned(child);
		child.onAbandon(parent);
		return parent;
	}

	/**
	 * Recurse through the block and its children, calling the given function for each block.
	 * @param fn The function to call for each block.
	 * @returns
	 */
	public each(fn: (block: Block) => void | boolean): this {
		// this.children.forEach(fn);
		for (const child of this.children) {
			if (fn(child) === false) {
				return this;
			}
			child.each(fn);
		}

		return this;
	}

	/**
	 * Find the first child of the given type.
	 * @param type The type of block to find.
	 * @returns The first block of the given type.
	 */
	public first<T extends Block>(type?: {
		new (...args: any[]): T;
	}): T | undefined {
		for (const child of this.children) {
			if (!type) {
				return child as T;
			} else if (child instanceof type) {
				return child;
			} else {
				const found = child.first(type);
				if (found) {
					return found;
				}
			}
		}

		return undefined;
	}
	/**
	 * Disown the given block from its parent.
	 * @param index The index of the child to get.
	 * @returns The child at the given index.
	 */
	public get<T extends Block>(index: number): T {
		return this.children[index] as T;
	}

	/**
	 * Find the last child of the given type.
	 * @param type The type of block to find.
	 * @returns The last block of the given type.
	 */
	public last<T extends Block>(type?: {
		new (...args: any[]): T;
	}): T | undefined {
		for (let i = this.children.length - 1; i >= 0; i--) {
			const child = this.children[i]!;
			if (!type) {
				return child as T;
			} else if (child instanceof type) {
				return child;
			} else {
				const found = child.last(type);
				if (found) {
					return found;
				}
			}
		}

		return undefined;
	}

	/**
	 * Move a child to a new position
	 * @param child The child to move.
	 * @param index The index to move the child to.
	 */
	protected move(child: Block, index: number) {
		const oldIndex = this.indexOfChild(child);
		if (oldIndex < 0) {
			throw new Error(
				`Child of type ${child.constructor.name} not found in parent ${this.constructor.name}.`
			);
		}
		this.children.splice(oldIndex, 1);
		this.children.splice(index, 0, child);
		this.onMutation();
	}

	/**
	 * Called when a child is removed.
	 */
	protected onAbandon(parent: Block) {
		if (this.parent == parent) {
			throw new Error(
				`Parent of type ${parent.constructor.name} is still the parent of child ${this.constructor.name} even though it was abandoned.`
			);
		}
	}

	/**
	 * Called when a child is adopted by a parent.
	 */
	protected onAdoption(parent: Block) {
		if (this.parent !== parent) {
			throw new Error(
				`Parent of type ${parent.constructor.name} is not the parent of child ${this.constructor.name}.`
			);
		}
	}

	protected onMutation() {}

	/**
	 * Called when a child is added.
	 */
	protected onChildAdopted(child: Block) {
		const source = this.constructor as typeof Block;

		if (
			source.allowedChildren &&
			!source.allowedChildren.includes(child.constructor as typeof Block)
		) {
			throw new Error(
				`Block of type ${this.constructor.name} cannot have children of type ${child.constructor.name}.\n` +
					`Allowed types: ${source.allowedChildren
						.map((c) => (c ? c.name : "Undefined"))
						.join(", ")}\n`
			);
		}

		child.parent = this;
		this.onMutation();
	}

	/**
	 * Called when a child is removed.
	 */
	protected onChildAbandoned(child: Block) {
		if (child.parent !== this) {
			throw new Error(
				`Child of type ${child.constructor.name} is not a child of parent ${this.constructor.name}.`
			);
		}

		child.parent = undefined;
		this.onMutation();
	}

	/**
	 * Find the first child of the given type. Throws an error if there is not exactly one child of the given type.
	 * @param type The type of block to find.
	 * @returns The first block of the given type.
	 */
	public single<T extends Block>(type: { new (...args: any[]): T }): T {
		const found = this.all(type);

		if (found.length === 0) {
			throw new Error(`Expected 1 child of type ${type.name}, found 0.`);
		} else if (found.length > 1) {
			throw new Error(
				`Expected 1 child of type ${type.name}, found ${found.length}.`
			);
		}

		return found[0] as T;
	}

	/**
	 * Gets the children of the block. The array is a copy of the managed array.
	 * @returns The array of child blocks.
	 */
	public getChildren(): Block[] {
		return [...this.children];
	}

	/**
	 * Checks if the block has children.
	 * @returns True if the block has children, false otherwise.
	 */
	public hasChildren(): boolean {
		return this.countChildren() > 0;
	}

	/**
	 * Get the index of this block in its parent's `children` array.
	 * @returns The index of this block in its parent's `children` array, or -1 if this block has no parent
	 */
	public index(): number {
		const parent = this.assertParent();
		return parent.indexOfChild(this);
	}

	/**
	 * Get the index of the given child in this block's `children` array.
	 * @param child The child to find.
	 * @returns The index of the given child in this block's `children` array, or -1 if the child is not found.
	 */
	public indexOfChild(child: Block): number {
		return this.children.indexOf(child);
	}

	/**
	 * Gets the next sibling of the block.
	 * @returns The next sibling of the block, or undefined if there is no next sibling.
	 */
	public nextSibling(): Block | undefined {
		const parent = this.assertParent();
		const index = parent.indexOfChild(this);
		return parent.children[index + 1];
	}

	/**
	 * Gets the previous sibling of the block.
	 * @returns The previous sibling of the block, or undefined if there is no previous sibling.
	 */
	public prevSibling(): Block | undefined {
		const parent = this.assertParent();
		const index = parent.indexOfChild(this);
		return parent.children[index - 1];
	}
	/**
	 *
	 * @param child
	 * @returns
	 */
	protected remove(child: Block): this {
		const index = this.children.indexOf(child);

		if (index < 0) {
			throw new Error(
				`Child of type ${child.constructor.name} not found in parent ${
					this.constructor.name
				}.\n${this.toString()}`
			);
		}

		this.removeChildAt(index);
		return this;
	}
	/**
	 * Removes the block from its parent.
	 * @param index The index of the child to remove.
	 */
	protected removeChildAt(index: number): this {
		if (index < 0 || index > this.children.length - 1) {
			throw new Error(
				`This block does not have ${index} children; splicing failed.`
			);
		}

		const block = this.children[index]!;
		Block.disown(block, this);
		this.children.splice(index, 1);
		return this;
	}

	/**
	 * Replace the given child with the new child.
	 * @param oldChild The child to replace.
	 * @param newChild The new child.
	 */
	protected replace(oldChild: Block, newChild: Block) {
		const index = this.children.indexOf(oldChild);

		if (index < 0) {
			throw new Error(
				`Child of type ${oldChild.constructor.name} not found in parent ${this.constructor.name}.`
			);
		}

		this.replaceChildAt(index, newChild);
	}

	/**
	 * Replace the child at the given index with the new block.
	 * @param index
	 * @param newChild
	 */
	protected replaceChildAt(index: number, newChild: Block): this {
		// this.removeChildAt(index);
		// this.addAt(newChild, index);
		Block.disown(this.children[index]!, this);
		this.children[index] = newChild;
		Block.adopt(newChild, this);
		return this;
	}

	/**
	 * Replaces the child at the given index with the new child.
	 * @param index The index of the child to set.
	 * @param child The child to set.
	 */
	protected set(index: number, child: Block): this {
		const oldChild = this.children[index]!;
		if (oldChild) {
			Block.disown(oldChild, this);
		}

		Block.adopt(child, this);
		this.children[index] = child;
		return this;
	}

	/**
	 * Sorts the children of the block.
	 * @param comparator The comparator function to use to sort the children.
	 */
	protected sort(comparator: (a: Block, b: Block) => number) {
		this.children.sort(comparator);
	}

	/**
	 * Gets the string representation of the child block at the given index.
	 * @param index The index of the child block to get.
	 * @returns The child block at the given index as a string.
	 */
	public str(index: number): string {
		return this.get(index).toString();
	}

	/**
	 * Gets the string representation of the block.
	 * @returns A string representation of the block.
	 */
	public toString(): string {
		return this.children.map((child) => child.toString()).join("");
	}
}
