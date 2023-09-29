import {
	TableCellStatement,
	TableRowStatement,
	TableStatement,
} from "src/parsers/statements/TableStatement";
import { Block } from "./Block";
import {
	RichTextBlock,
	RichTextContent,
	createRichTextBlock,
} from "./RichTextBlock";
import { TokenBlock, createTokenBlock } from "./TokenBlock";
import { spawnBlock, spawnFromContent } from "./BlockFactory";
import { TokenType } from "src/tokens/TokenType";
import { Token } from "src/tokens/Token";
import { isStatement } from "src/parsers/statements/Statement";
import { MutableBlock } from "./MutableBlock";

export type TableCellContent = TableCellBlock | TableCellStatement | string;

export type TableRowContent =
	| TableRowBlock
	| TableRowStatement
	| TableCellContent[];

export type TableContent =
	| TableBlock
	| TableStatement
	| TableRowContent[]
	| TableCellContent[][];

export class TableCellBlock extends Block {
	protected static allowedChildren = [TokenBlock, RichTextBlock];
	contentIndex = 1;
	endBrIndex = 2;

	/**
	 * Gets the content of the cell.
	 */
	public get content(): string {
		return this.str(this.contentIndex).trim();
	}

	/**
	 * Sets the content of the cell.
	 */
	public set content(value: RichTextContent) {
		this.set(
			this.contentIndex,
			createRichTextBlock(TableCellStatement.pad(value.toString()))
		);
	}

	/**
	 * Adds a suffix pipe and line break to the cell, or removes it if isAtEnd is false.
	 * @param isAtEnd set to true to add a suffix pipe and line break to the cell.
	 * @returns This cell block
	 */
	public atEnd(isAtEnd = true): this {
		this.set(
			this.endBrIndex,
			isAtEnd
				? createTokenBlock(Token.create(TokenType.PIPE))
				: createTokenBlock("")
		);
		return this;
	}
}

export class TableRowBlock extends MutableBlock {
	protected static allowedChildren = [TableCellBlock, TokenBlock];
	protected brToken: TokenBlock;

	constructor(...blocks: Block[]) {
		super(...blocks.slice(0, -1));
		this.brToken = blocks.pop() as TokenBlock;
	}

	/**
	 * Gets the cell at the given index.
	 * @param index The index of the cell to return.
	 * @returns The cell at the given index.
	 */
	public cell(index: number): TableCellBlock {
		return this.children[index]!;
	}

	/**
	 * All children in a table row are table cells.
	 */
	protected override children: TableCellBlock[];

	/**
	 * Returns true if the row is a header row.
	 * @returns True if the row is a header row.
	 *
	 * @example
	 *
	 * | foo | bar | a | <-- This is a header row.
	 * | --- | --- | - |
	 * | moo | zar | b |
	 */
	public isHeader(): boolean {
		return this.parent !== undefined && this.parent.get(0) === this;
	}

	/**
	 * Returns true if the row is a spacer row.
	 * @returns True if the row is a spacer row.
	 *
	 * @example
	 *
	 * | foo | bar | a |
	 * | --- | --- | - | <-- This is a spacer row.
	 * | moo | zar | b |
	 */
	public isSpacer(): boolean {
		return this.children.every(
			(cell) => cell.content === "-".repeat(cell.content.length)
		);
	}

	/**
	 * Updates the cells to ensure that the law cell in the row
	 * Includes a suffix pipe and line break.
	 */
	public onMutation(): void {
		this.rebar();
	}

	/**
	 * Adds a suffix pipe and line break to the last cell in the row.
	 */
	protected rebar() {
		this.children.forEach((cell) => cell.atEnd(false));
		this.children[this.children.length - 1]!.atEnd();
	}

	/**
	 * Returns the number of cells in the row.
	 * @returns The cells in the row as an array of strings.
	 */
	public toArray(): string[] {
		return this.children.map((cell) => cell.content);
	}

	/**
	 *
	 * @returns The row as a string.
	 *
	 * @example
	 * ```
	 * const block = TableRowBlock.create([
	 *     "foo",
	 *     "bar",
	 *     "a",
	 * ]);
	 *
	 * expect(block.toString()).toEqual("| foo | bar | a |");
	 * ```
	 */
	public override toString() {
		return super.toString() + this.brToken.toString();
	}
}

export class TableBlock extends MutableBlock {
	/**
	 * Inserts the spacer row below the header row.
	 * @returns This table block.
	 *
	 * @example
	 * const block = TableBlock.create([
	 *   ["foo", "bar", "a"],
	 *   ["qux", "dar", "b"],
	 * ]);
	 *
	 * block.insertSpacerRow();
	 *
	 * expect(block.toString().split("\n")).toEqual([
	 *   "|foo|bar|a|",
	 *   "|---|---|---|",
	 *   "|qux|dar|b|",
	 * ]);
	 */
	public addSpacer(): this {
		if (!this.hasChildren()) {
			return this;
		}

		const spacerRow = createTableRowBlock(
			this.get(0)
				.getChildren()
				.map((cell: TableCellBlock) => "-".repeat(cell.content.length))
		);

		return this.addAt(spacerRow, 1);
	}

	/**
	 * All children in a table block are table rows.
	 */
	protected override children: TableRowBlock[];

	/**
	 * Returns the number of columns in the table.
	 * @returns The number of columns in the table.
	 */
	public countColumns(): number {
		let c = 0;
		for (const row of this.children) {
			c = Math.max(c, row.countChildren());
		}

		return c;
	}

	/**
	 * Returns the number of rows in the table.
	 * @returns The number of rows in the table.
	 */
	public countRows(): number {
		return this.children.length;
	}

	/**
	 *
	 * @param column The index of the column to return.
	 * @returns An array of values in the given column.
	 *
	 * @example
	 * const block = TableBlock.create([
	 *      ["foo", "bar", "a"],
	 *      ["---", "---", "-"],
	 *      ["moo", "zar", "b"],
	 *      ["dar", "car", "c"],
	 * ]);
	 *
	 * expect(block.getColumn(2)).toEqual(["b", "c"]);
	 */
	public column(column: number | string): string[] {
		if (typeof column === "string") {
			return this.getColumnByName(column);
		}

		const cells: string[] = [];

		if (this.countColumns() < column) return cells;

		for (const row of this.children) {
			if (row.isSpacer()) continue;
			cells.push(row.cell(column).content);
		}

		return cells;
	}

	/**
	 * Get the column by name.
	 * @param column The name of the column to return.
	 * @returns An array of values in the given column.
	 */
	public getColumnByName(column: string): string[] {
		const cells: string[] = [];
		if (this.countRows() < 1) return cells;
		return this.column(this.row(0).toArray().indexOf(column));
	}

	/**
	 * Gets the table row.
	 * @param index The index of the row to return.
	 * @returns The row at the given index.
	 */
	public row(index: number): TableRowBlock {
		return this.get(index) as TableRowBlock;
	}

	/**
	 * Returns the table as a two-dimensional array.
	 * @returns A two-dimensional array of the table's contents.
	 */
	public toArray(): string[][] {
		const rows: string[][] = [];

		for (const row of this.children) {
			if (row.isSpacer()) continue;
			rows.push(row.toArray());
		}

		return rows;
	}

	/**
	 * Returns the table as a dictionary.
	 * @returns A dictionary of the table's contents.
	 */
	public toDictionary(): Record<string, string[]> {
		const dict: Record<string, string[]> = {};

		if (this.countRows() < 2) return dict;

		const headerRow = this.row(0);
		const columnCount = this.countColumns();

		for (let i = 0; i < columnCount; i++) {
			const header = headerRow.cell(i).content;
			dict[header] = this.column(i).splice(1);
		}

		return dict;
	}
}

/**
 * Creates a new table cell block.
 * @param content The content of the table cell.
 * @returns The table cell block.
 */
export function createTableCellBlock(
	content: TableCellContent
): TableCellBlock {
	return spawnFromContent<TableCellBlock>(content, TableCellStatement);
}

/**
 * Creates a new table row block.
 * @param content The content of the table row.
 * @returns The table row block.
 */
export function createTableRowBlock(content: TableRowContent): TableRowBlock {
	if (Array.isArray(content)) {
		return new TableRowBlock(
			...content.map((cell) => createTableCellBlock(cell)),
			createTokenBlock(Token.createBr())
		);
	} else if (isStatement(content)) {
		return spawnBlock(content) as TableRowBlock;
	} else {
		return content;
	}
}

/**
 * Creates a new table block.
 * @param content The content of the table.
 * @returns The table block.
 */
export function createTableBlock(content: TableContent): TableBlock {
	if (Array.isArray(content)) {
		return new TableBlock(
			...content.map((row) => createTableRowBlock(row))
		);
	} else if (isStatement(content)) {
		return spawnBlock(content) as TableBlock;
	} else {
		return content;
	}
}
