import { Token } from "src/tokens/Token";
import { Block } from "./Block";
import {
	PlainTextBlock,
	PlainTextContent,
	createPlainTextBlock,
} from "./PlainTextBlock";
import { TokenBlock, createTokenBlock } from "./TokenBlock";
import { TokenType } from "src/tokens/TokenType";
import {
	ExternalLinkStatement,
	ImageLinkStatement,
	InternalLinkStatement,
	LinkStatement,
} from "src/parsers/statements/LinkStatement";
import { spawnFromContent, spawnFromContentAndCreate } from "./BlockFactory";

export type InternalLinkBlockContent = LinkBlock | LinkStatement | string;
export type ExternalLinkBlockContent =
	| ExternalLinkBlock
	| ExternalLinkStatement
	| string;
export type ImageLinkBlockContent =
	| ImageLinkBlock
	| ImageLinkStatement
	| string;

export class LinkBlock extends Block {}

/**
 * A link to another file.
 *
 * @example
 * This is a [[link]] to another file.
 */
export class InternalLinkBlock extends LinkBlock {
	protected static override allowedChildren = [TokenBlock, PlainTextBlock];

	protected fileIndex = 1;
	protected pipeIndex = 2;
	protected aliasIndex = 3;

	/**
	 * Get the file path.
	 */
	public get file(): string {
		return this.str(this.fileIndex);
	}

	/**
	 * Set the file path.
	 */
	public set file(file: PlainTextContent) {
		this.set(this.fileIndex, createPlainTextBlock(file));
	}

	/**
	 * Get whether or not the link has an alias.
	 * @returns Whether or not the link has an alias.
	 */
	public hasAlias(): boolean {
		return this.str(this.aliasIndex).length > 0;
	}

	/**
	 * Get the alias of the link.
	 * @returns The alias of the link, or undefined if there is no alias.
	 */
	public get alias(): string | undefined {
		if (!this.hasAlias()) return undefined;
		return this.str(this.aliasIndex);
	}

	/**
	 * Set the alias of the link.
	 */
	public set alias(alias: PlainTextContent | null) {
		if (alias === null) {
			this.set(this.pipeIndex, createTokenBlock(""));
			this.set(this.aliasIndex, createPlainTextBlock(""));
		} else {
			this.set(
				this.pipeIndex,
				createTokenBlock(Token.create(TokenType.PIPE))
			);
			this.set(this.aliasIndex, createPlainTextBlock(alias));
		}
	}

	/**
	 * Remove the alias of the link. Changing [[link|alias]] to [[link]].
	 * @returns This link block.
	 */
	public removeAlias(): this {
		this.alias = null;
		return this;
	}
}

/**
 * A link to an external URL.
 *
 * @example
 * This is a [link](https://example.com) to another website.
 */
export class ExternalLinkBlock extends LinkBlock {
	protected titleIndex = 1;
	protected urlIndex = 4;

	/**
	 * Get the title of the link.
	 * @example [link](https://example.com "title") <-- "link" is the title.n
	 */
	public get title(): string {
		return this.str(this.titleIndex);
	}

	/**
	 * Set the title of the link.
	 */
	public set title(title: string) {
		this.set(this.titleIndex, createPlainTextBlock(title));
	}

	/**
	 * Get the URL of the link.
	 * @example [link](https://example.com "title") <-- "https://example.com" is the URL.
	 * @returns The URL of the link. Attempts to parse the URL, but if it fails, returns the string.
	 */
	public get url(): URL | string {
		try {
			return new URL(this.str(this.urlIndex));
		} catch {
			return this.str(this.urlIndex);
		}
	}

	/**
	 * Set the URL of the link.
	 */
	public set url(url: URL | string) {
		this.set(this.urlIndex, createPlainTextBlock(url.toString()));
	}
}

/**
 * A image rendered in a document.
 *
 * @example
 * This is an image: ![[image.png]]
 */
export class ImageLinkBlock extends Block {
	protected fileIndex = 1;

	/**
	 * Get the file path.
	 */
	public get file(): string {
		return this.str(this.fileIndex);
	}

	/**
	 * Set the file path.
	 */
	public set file(file: string) {
		this.set(this.fileIndex, createPlainTextBlock(file));
	}
}

/**
 * Creates an internal link block
 * @param content The content of the link block
 * @param alias The alias of the link block
 * @returns A link block
 */
export function createInternalLinkBlock(
	content: InternalLinkBlockContent,
	alias?: string
): InternalLinkBlock {
	return spawnFromContentAndCreate<LinkBlock, LinkStatement>(content, (c) => {
		return InternalLinkStatement.create(c, alias);
	}) as InternalLinkBlock;
}

/**
 * Creates an external link block
 * @param content The content of the link block
 * @param title The title of the link block
 * @returns An external link block
 */
export function createExternalLinkBlock(
	content: ExternalLinkBlockContent,
	title?: string
): ExternalLinkBlock {
	return spawnFromContentAndCreate<ExternalLinkBlock, ExternalLinkStatement>(
		content,
		(c) => {
			return ExternalLinkStatement.create(title ?? c, c);
		}
	);
}

/**
 * Creates an image link block
 * @param content The content of the image link block
 * @returns An image link block
 */
export function createImageLinkBlock(content: ImageLinkBlockContent) {
	return spawnFromContent<ImageLinkBlock>(content, ImageLinkStatement);
}
