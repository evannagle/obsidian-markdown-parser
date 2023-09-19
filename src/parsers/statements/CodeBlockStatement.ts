import { IVisitor } from "src/visitors/Visitor";
import { Statement } from "./Statement";
import { Token } from "src/tokens/Token";

export class CodeBlockStatement extends Statement {
	public constructor(
		public backticksOnLeft: Token,
		public language: Token | undefined,
		public topBr: Token,
		public metadata: CodeBlockMetadataStatement | undefined,
		public source: CodeBlockSourceStatement,
		public backticksOnRight: Token
	) {
		super([
			backticksOnLeft,
			language,
			topBr,
			metadata,
			source,
			backticksOnRight,
		]);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitCodeBlock(this);
	}
}

export class CodeBlockMetadataStatement extends Statement {
	constructor(public items: CodeBlockMetadataItemStatement[]) {
		super(items);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitCodeBlockMetadata(this);
	}
}

export class CodeBlockMetadataItemStatement extends Statement {
	public constructor(
		public key: Token,
		public colon: Token,
		public space: Token | undefined,
		public value: Token | undefined,
		public br: Token | undefined
	) {
		super([key, colon, space, value, br]);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitCodeBlockMetadataItem(this);
	}
}

export class CodeBlockSourceStatement extends Statement {
	public constructor(public source: Token[]) {
		super(source);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitCodeBlockSource(this);
	}
}

export class LatexBlockStatement extends Statement {
	public constructor(
		public dollarsOnLeft: Token,
		public content: Token[],
		public dollarsOnRight: Token
	) {
		super([dollarsOnLeft, ...content, dollarsOnRight]);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitLatexBlock(this);
	}
}
