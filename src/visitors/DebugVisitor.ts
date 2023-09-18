import { Statement } from "src/parsers/statements/Statement";
import { Visitor } from "./Visitor";

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

	protected override visit(s: Statement) {
		const name = "<" + s.constructor.name.replace("Statement", "") + ">";

		this.log(name, s.toString().replace(/\n/g, "\\n"));
		this.indent++;
		s.visitChildren(this);
		this.indent--;
	}
}

export function debugStatements(statements: Statement[]): void {
	for (const statement of statements) {
		statement.accept(new DebugVisitor());
	}
}
