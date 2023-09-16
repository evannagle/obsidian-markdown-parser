import {
	InternalLinkStatement,
	HeadingStatement,
	PlainTextStatement,
	RichTextStatement,
	Statement,
	IVisitor,
	ExternalLinkStatement,
} from "src/Statement";

export class DebugVisitor implements IVisitor {
	indent = 0;

	protected log(...args: string[]): void {
		if (this.indent) {
			const tab = "..".repeat(this.indent);
			console.log(tab, ...args);
		} else {
			console.log(...args);
		}
	}

	protected visit(s: Statement) {
		const name = "<" + s.constructor.name.replace("Statement", "") + ">";

		this.log(name, s.toString().replace(/\n/g, "\\n"));
		this.indent++;
		s.visitChildren(this);
		this.indent--;
	}

	visitExternalLink(expr: ExternalLinkStatement): void {
		this.visit(expr);
	}

	visitHeading(heading: HeadingStatement): void {
		this.visit(heading);
	}

	visitInternalLink(link: InternalLinkStatement): void {
		this.visit(link);
	}

	visitRichText(richText: RichTextStatement): void {
		this.visit(richText);
	}

	visitPlainText(text: PlainTextStatement): void {
		this.visit(text);
	}
}

export function debugStatements(statements: Statement[]): void {
	for (const statement of statements) {
		statement.accept(new DebugVisitor());
	}
}
