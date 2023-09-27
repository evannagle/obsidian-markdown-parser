import {
	CodeMetadataItemStatement,
	CodeMetadataStatement,
	CodeSourceStatement,
	CodeStatement,
	LatexStatement,
} from "src/parsers/statements/CodeStatement";
import { InlineCodeBlock } from "./InlineCodeBlock";
import {
	spawnBlock,
	spawnFromContent,
	spawnFromContentAndCreate,
} from "./BlockFactory";
import { Block } from "./Block";
import { TokenBlock, createTokenBlock } from "./TokenBlock";
import { MutableBlock } from "./MutableBlock";
import { CodeBlockParser } from "src/parsers/CodeBlockParser";
import { isStatement } from "src/parsers/statements/Statement";
import {
	MetadataBlock,
	MetadataItemBlock,
	MetadataItemContent,
} from "./MetadataBlock";

export type LatexContent = LatexBlock | LatexStatement | string;
export type CodeContent = CodeBlockParser | CodeStatement | string;
export type CodeSourceContent = CodeSourceBlock | CodeSourceStatement | string;
export type CodeMetadataItemContent =
	| MetadataItemContent
	| CodeMetadataItemBlock
	| CodeMetadataItemStatement
	| string;

export type CodeMetadataContent =
	| CodeMetadataBlock
	| CodeMetadataStatement
	| Record<string, any>
	| string;

/**
 * Represents the metadata of a code block.
 *
 * @example
 *
 * ```js
 * key1: value1 <-- This is a metadata item.
 * key2: value2 <-- This is a metadata item.
 * ```
 */
export class CodeMetadataBlock extends MetadataBlock {
	public override createItem(key: string, value: string) {
		return createCodeMetadataItemBlock([key, value]);
	}
}

/**
 * Represents a metadata item of a code block.
 *
 * @example
 *
 * ```js
 * key1: value1 <-- This is a metadata item.
 * key2: value2 <-- This is a metadata item.
 *
 * console.log("Hello, world!");
 * ```
 */
export class CodeMetadataItemBlock extends MetadataItemBlock {}

/**
 * Represents the source code of a code block.
 *
 * @example
 * ```js
 * key1: value1
 * key2: value2
 *
 * console.log("Hello, world!");  <-- This is a CodeBlockSourceStatement.
 * ```
 */
export class CodeSourceBlock extends Block {
	public static override allowedChildren = [TokenBlock];
	private sourceIndex = 0;

	constructor(...blocks: Block[]) {
		super(
			createTokenBlock(blocks.splice(0, blocks.length - 1).join("")),
			blocks.shift()
		);
	}

	public get source(): string {
		return this.str(this.sourceIndex);
	}

	public set source(source: string) {
		this.set(this.sourceIndex, createTokenBlock(source));
	}
}

/**
 * Represents a code block.
 *
 * @example
 *
 * ```js
 * key1: value1
 * key2: value2
 *
 * console.log("Hello, world!");
 * ```
 */
export class CodeBlock extends MutableBlock {
	public static override allowedChildren = [
		TokenBlock,
		CodeMetadataBlock,
		CodeSourceBlock,
	];
	public static override childCount = 6;

	private languageIndex = 1;
	private metadataIndex = 3;
	private sourceIndex = 5;

	public constructor(
		ticks: TokenBlock,
		language: TokenBlock,
		topBr: TokenBlock,
		metadata: CodeMetadataBlock,
		bottomBr: TokenBlock,
		source: CodeSourceBlock
	) {
		super(ticks, language, topBr, metadata, bottomBr, source);
	}

	/**
	 * Get the language of the code block.
	 * @returns The language of the code block.
	 * @example
	 *
	 * const block = CodeBlock.create({ language: "js" });
	 * block.language // "js"
	 */
	public get language(): string {
		return this.str(this.languageIndex);
	}

	/**
	 * Set the language of the code block.
	 */
	public set language(language: string) {
		this.set(this.languageIndex, createTokenBlock(language));
	}

	/**
	 * Get the metadata of the code block.
	 */
	public get metadata(): CodeMetadataBlock {
		return this.children[this.metadataIndex] as CodeMetadataBlock;
	}

	/**
	 * Replace the metadata of the code block.
	 */
	public set metadata(metadata: CodeMetadataContent) {
		this.set(this.metadataIndex, createCodeMetadataBlock(metadata));
	}

	/**
	 * Get the source of the code block.
	 */
	public get source(): CodeSourceBlock {
		return this.children[this.sourceIndex] as CodeSourceBlock;
	}

	/**
	 * Replace the source of the code block.
	 */
	public set source(source: CodeSourceContent) {
		this.set(this.sourceIndex, createCodeSourceBlock(source));
	}
}

/**
 * Represents a block of Latex code.
 */
export class LatexBlock extends InlineCodeBlock {}

/**
 * Creates a code block.
 * @param content The code source
 * @param language The language of the code block
 * @param metadata The metadata of the code block
 * @returns The CodeBlock
 */
export function createCodeBlock(
	content: CodeContent,
	language?: string,
	metadata?: Record<string, any>
): CodeBlock {
	return spawnFromContentAndCreate<CodeBlock, CodeStatement>(content, (c) => {
		return CodeStatement.create(c, language, metadata);
	});
}

/**
 * Creates the metadata section of a code block.
 * @param content The metadata content
 * @returns The metadata block
 */
export function createCodeMetadataBlock(content: CodeMetadataContent) {
	// check if record, convert to statement
	if (
		!isStatement(content) &&
		!(content instanceof Block) &&
		typeof content === "object"
	) {
		content = CodeMetadataStatement.create(
			...CodeMetadataItemStatement.createMany(content)
		);
	}

	return spawnFromContent<MetadataBlock>(
		content as any,
		CodeMetadataItemStatement
	);
}

/**
 * Creates a metadata item of a code block.
 * @param content The metadata item content
 * @returns The metadata item block
 */
export function createCodeMetadataItemBlock(
	content: CodeMetadataItemContent
): CodeMetadataItemBlock {
	if (Array.isArray(content)) {
		return spawnBlock(
			CodeMetadataItemStatement.create(content[0], content[1])
		) as CodeMetadataItemBlock;
	}

	return spawnFromContent<CodeMetadataItemBlock>(
		content,
		CodeMetadataItemStatement
	);
}

/**
 * Creates the source section of a code block.
 * @param content The code source content
 * @returns The code source block
 */
export function createCodeSourceBlock(
	content: CodeSourceContent
): CodeSourceBlock {
	return spawnFromContent<CodeSourceBlock>(content, CodeSourceStatement);
}

/**
 * Creates a latex block.
 * @param content The latex content
 * @returns The latex block
 */
export function createLatexBlock(content: LatexContent) {
	return spawnFromContent<LatexBlock>(content, LatexStatement);
}
