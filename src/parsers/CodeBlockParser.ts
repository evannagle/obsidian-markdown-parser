import { TokenType } from "src/tokens/TokenType";
import { ParserBase } from "./ParserBase";
import {
	CodeStatement,
	CodeMetadataStatement,
	CodeMetadataItemStatement,
	CodeSourceStatement,
} from "./statements/CodeStatement";

export class CodeBlockParser extends ParserBase {
	public parse(): CodeStatement {
		return new CodeStatement(
			this.chomp(TokenType.CODE_START),
			this.maybeChomp(TokenType.CODE_LANGUAGE),
			this.chomp(TokenType.BR),
			this.metadata(),
			this.source(),
			this.chomp(TokenType.CODE_END)
		);
	}

	public metadata(): CodeMetadataStatement | undefined {
		const items: CodeMetadataItemStatement[] = [];

		while (this.is(TokenType.CODE_KEY)) {
			items.push(this.metadataItem());
		}

		if (items.length > 0) {
			return new CodeMetadataStatement(items);
		} else {
			return undefined;
		}
	}

	public metadataItem(): CodeMetadataItemStatement {
		return new CodeMetadataItemStatement(
			this.chomp(TokenType.CODE_KEY),
			this.chomp(TokenType.COLON),
			this.maybeChomp(TokenType.SPACE),
			this.maybeChomp(TokenType.CODE_VALUE),
			this.chomp(TokenType.BR)
		);
	}

	public source(): CodeSourceStatement {
		this.nextUntil(TokenType.CODE_END);
		return new CodeSourceStatement(this.clearQueuedTokens());
	}
}
