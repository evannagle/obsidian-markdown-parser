import { Visitor } from "./Visitor";
import { escapeLinebreaks } from "src/tokens/TokenTable";
import chalk, { ChalkInstance } from "chalk";
import { Statement } from "src/parsers/statements/Statement";
import { s } from "vitest/dist/reporters-2ff87305";

export type formatPart = {
	color?: ChalkInstance;
	format: string;
};

export type statementFormatPart = {
	color?: ChalkInstance;
	format: string;
	nameFormat?: formatPart;
	contentFormat?: formatPart;
	visitChildren?: boolean;
	extendContext?: (
		s: Statement,
		context: Record<string, string>
	) => Record<string, string>;
};

/**
 *
 * @param format The string format, with placeholders for the context.
 * @param context The context to apply to the format.
 * @returns The formatted string.
 *
 * @example
 * applyFormat("{name} is {age} years old.", { name: "Bob", age: "42" });
 */
export function applyFormat(
	format: formatPart,
	context: Record<string, string>
): string {
	let s = format.color ? format.color(format.format) : format.format;

	for (const key in context) {
		s = s.replaceAll(`{${key}}`, context[key]!);
	}

	return s;
}

/**
 * Applies a format to a statement.
 * @param statement The statement to format.
 * @param format The format to apply to the statement.
 * @returns The formatted statement.
 */
export function applyStatementFormat(
	statement: Statement,
	format: statementFormatPart
): string {
	let context: Record<string, string> = {};

	context.name = statement.constructor.name.replace("Statement", "");
	context.content = escapeLinebreaks(statement.toString());
	context = format.extendContext
		? format.extendContext(statement, context)
		: context;
	context.formattedName = format.nameFormat
		? applyFormat(format.nameFormat, context)
		: context.name!;
	context.formattedContent = format.contentFormat
		? applyFormat(format.contentFormat, context)
		: context.content!;

	return applyFormat(format, context) ?? "";
}

export class DebugVisitor extends Visitor {
	indent = 0;
	dot = "| ";
	maxLineLength = 80;

	/**
	 * The default format for tabs.
	 *
	 * @example
	 * | | | | <StatementName>
	 * | | | | | <StatementName>
	 */
	public tabFormat: formatPart = {
		color: chalk.dim,
		format: "{dot}",
	};

	/**
	 * The default color for statement names.
	 */
	public nameColor = chalk.underline.green;

	/**
	 * The default format for statements.
	 *
	 * @example
	 * <StatementName>
	 */
	public defaultStatementFormat: statementFormatPart = {
		format: "<{formattedName}>",
		nameFormat: {
			color: this.nameColor,
			format: "{name}",
		},
		visitChildren: true,
	};

	public plainTextFormat: statementFormatPart = {
		format: "<{formattedName}> {content}",
		visitChildren: true,
		nameFormat: {
			color: this.nameColor,
			format: "{name}",
		},
	};

	public oneLineFormat: statementFormatPart = {
		format: "<{formattedName}> {content}",
		visitChildren: true,
		nameFormat: {
			color: this.nameColor,
			format: "{name}",
		},
		extendContext: (s, c) => {
			c.content = s.toString().split("\n")[0]!;
			return c;
		},
	};

	public statementFormats = new Map<string, statementFormatPart>([
		["PlainTextStatement", this.plainTextFormat],
		["FrontmatterListItemStatement", this.oneLineFormat],
		["FrontmatterScalarAttrStatement", this.oneLineFormat],
		["MetadataItemStatement", this.oneLineFormat],
		["HeadingStatement", this.oneLineFormat],
		["HrStatement", this.oneLineFormat],
	]);

	protected formatTab(indent = 0): string {
		return applyFormat(this.tabFormat, { dot: this.dot }).repeat(indent);
	}

	/**
	 * Returns the substring at the end of a word.
	 * @param s The string to substring.
	 * @param length The length of the substring.
	 * @returns The substring at the end of a word.
	 */
	private substringAtWordEnd(s: string, length: number): string {
		let i = length;

		while (i < s.length && s[i] !== " ") {
			i++;
		}

		return s.substring(0, i);
	}

	protected log(...args: string[]): void {
		const tab = this.formatTab(this.indent);

		let lines = args.join("");

		while (lines.length > this.maxLineLength) {
			const line = this.substringAtWordEnd(lines, this.maxLineLength);
			lines = lines.substring(line.length);
			console.log(tab + line);
		}

		console.log(tab + lines);
	}

	public override visit(s: Statement) {
		const format =
			this.statementFormats.get(s.constructor.name) ??
			this.defaultStatementFormat;

		this.log(applyStatementFormat(s, format));

		if (format.visitChildren) {
			this.indent++;
			s.visitParts(this);
			this.indent--;
		}
	}
}

export function printStatement(statement?: Statement): void {
	return statement && statement.accept(new DebugVisitor());
}
