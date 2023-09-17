import { IVisitor } from "src/visitors/Visitor";
import { ListItemValueStatement } from "./ListItemValueStatement";

export class DictItemValueStatement extends ListItemValueStatement {
	public accept(visitor: IVisitor) {
		visitor.visitDictItemValue(this);
	}
}
