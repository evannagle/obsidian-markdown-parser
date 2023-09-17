import { IVisitor } from "src/visitors/Visitor";
import { Token } from "src/Token";
import { DictItemStatement } from "./DictItemStatement";
import { DictItemKeyStatement } from "./DictItemKeyStatement";
import { DictItemValueStatement } from "./DictItemValueStatement";
import { DictItemDelimStatement } from "./DictItemDelimStatement";

export class FrontmatterDictItemStatement extends DictItemStatement {
	constructor(
		public key: DictItemKeyStatement,
		public delim: DictItemDelimStatement | null,
		public value: DictItemValueStatement | null,
		public br: Token
	) {
		super(key, delim, value, br);
	}

	public accept(visitor: IVisitor): void {
		visitor.visitFrontmatterDictionaryItem(this);
	}
}
