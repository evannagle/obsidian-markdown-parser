import { TokenType } from "src/tokens/TokenType";
import { ParserBase } from "./ParserBase";
import {
	CodeBlockMetadataItemStatement,
	CodeBlockMetadataStatement,
	CodeBlockSourceStatement,
	CodeBlockStatement,
} from "./statements";
import { Token } from "src/tokens/Token";

export class CodeBlockParser extends ParserBase {
	public parse(): CodeBlockStatement {
		return new CodeBlockStatement(
			this.chomp(TokenType.CODE_START),
			this.maybeChomp(TokenType.CODE_LANGUAGE),
			this.chomp(TokenType.BR),
			this.metadata(),
			this.source(),
			this.chomp(TokenType.CODE_END)
		);
	}

	public metadata(): CodeBlockMetadataStatement | undefined {
		const items: CodeBlockMetadataItemStatement[] = [];

		while (this.is(TokenType.CODE_KEY)) {
			items.push(this.metadataItem());
		}

		if (items.length > 0) {
			return new CodeBlockMetadataStatement(items);
		} else {
			return undefined;
		}
	}

	public metadataItem(): CodeBlockMetadataItemStatement {
		return new CodeBlockMetadataItemStatement(
			this.chomp(TokenType.CODE_KEY),
			this.chomp(TokenType.COLON),
			this.maybeChomp(TokenType.SPACE),
			this.maybeChomp(TokenType.CODE_VALUE),
			this.chomp(TokenType.BR)
		);
	}

	public source(): CodeBlockSourceStatement {
		this.nextUntil(TokenType.CODE_END);
		return new CodeBlockSourceStatement(this.clearQueuedTokens());
	}
}
