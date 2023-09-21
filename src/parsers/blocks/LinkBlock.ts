import { Token } from "src/tokens/Token";
import {
	ExternalLinkStatement,
	ImageLinkStatement,
	InternalLinkStatement,
	PlainTextStatement,
} from "../statements";
import { Block } from "./Block";
import { TokenType } from "src/tokens/TokenType";

export function tryCastingStringToUrl(s: string) {
	try {
		return new URL(s);
	} catch {
		return s;
	}
}

export class ExternalLinkBlock extends Block<ExternalLinkStatement> {
	public static create(alias: string, url: string) {
		return new ExternalLinkBlock(
			ExternalLinkStatement.create(alias, tryCastingStringToUrl(url))
		);
	}

	public get alias(): string {
		return this.stmt.alias.toString();
	}

	public set alias(alias: string) {
		this.stmt.alias = PlainTextStatement.create(alias);
	}

	public get url(): URL | string {
		return tryCastingStringToUrl(this.stmt.url.toString());
	}

	public set url(url: URL | string) {
		this.stmt.url = PlainTextStatement.create(url.toString());
	}
}

export class ImageLinkBlock extends Block<ImageLinkStatement> {
	public static create(file: string) {
		return new ImageLinkBlock(ImageLinkStatement.create(file));
	}

	public get file(): string {
		return this.stmt.file.toString();
	}

	public set file(file: string) {
		this.stmt.file = PlainTextStatement.create(file);
	}
}

export class InternalLinkBlock extends Block<InternalLinkStatement> {
	public static create(file: string, alias?: string) {
		return new InternalLinkBlock(InternalLinkStatement.create(file, alias));
	}

	public get file(): string {
		return this.stmt.file.toString();
	}

	public set file(file: string) {
		this.stmt.file = PlainTextStatement.create(file);
	}

	public get alias(): string | undefined {
		return this.stmt.alias?.toString();
	}

	public set alias(alias: string | undefined) {
		if (alias === undefined) {
			this.stmt.pipe = this.stmt.alias = undefined;
		} else {
			this.stmt.pipe = Token.create(TokenType.PIPE);
			this.stmt.alias = PlainTextStatement.create(alias);
		}
	}
}
