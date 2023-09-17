import { DictItemStatement } from "./DictItemStatement";
import { ListStatement } from "./ListStatement";

export abstract class DictStatement extends ListStatement {
	constructor(...listItems: DictItemStatement[]) {
		super(...listItems);
	}
}
