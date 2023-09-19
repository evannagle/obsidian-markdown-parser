import { Statement } from "src/parsers/statements";
import { Visitor } from "./Visitor";
import { escapeLinebreaks } from "src/tokens/TokenTable";

export class DebugVisitor extends Visitor {
	indent = 0;

	protected log(...args: string[]): void {
		if (this.indent) {
			const tab = "..".repeat(this.indent);
			console.log(tab, ...args);
		} else {
			console.log(...args);
		}
	}

	public override visit(s: Statement) {
		const name = "<" + s.constructor.name.replace("Statement", "") + ">";

		this.log(name, escapeLinebreaks(s.toString()));
		this.indent++;
		s.visitParts(this);
		this.indent--;
	}
}

export function printStatement(statement?: Statement): void {
	if (!statement) return;

	statement.accept(new DebugVisitor());
}
