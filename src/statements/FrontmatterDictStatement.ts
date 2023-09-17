import { IVisitor } from "src/visitors/Visitor";
import { DictStatement } from "./DictStatement";
import { FrontmatterDictItemStatement } from "./FrontmatterDictItemStatement";

export class FrontmatterDictStatement extends DictStatement {
	constructor(...listItems: FrontmatterDictItemStatement[]) {
		super(...listItems);
	}

	accept(visitor: IVisitor) {
		visitor.visitFrontmatterDictionary(this);
	}
}
