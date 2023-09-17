import { Token } from "src/Token";
import { ListItemStatement } from "./ListItemStatement";
import { DictItemKeyStatement } from "./DictItemKeyStatement";
import { DictItemValueStatement } from "./DictItemValueStatement";
import { DictItemDelimStatement } from "./DictItemDelimStatement";

export abstract class DictItemStatement extends ListItemStatement {
	constructor(
		public key: DictItemKeyStatement,
		public delim: DictItemDelimStatement | null,
		public value: DictItemValueStatement | null,
		public br: Token
	) {
		super(key, delim, value, br);
	}
}
