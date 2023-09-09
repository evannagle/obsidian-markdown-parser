export class Expression extends Array<Expression> {
	parent: Expression | null = null;
	protected children: Expression[] = [];

	constructor() {
		super();
	}

	override push(...exprs: Expression[]): number {
		for (const expr of exprs) {
			expr.parent = this;
			super.push(expr);
		}

		return this.children.length;
	}

	toString(indentLevel = 0): string {
		const indent = " ".repeat(indentLevel * 2);
		const childLines = this.map((child) => child.toString(indentLevel + 1));

		const lines = [`${indent}${this.constructor.name}`, ...childLines];

		return lines.join("\n");
	}
}
