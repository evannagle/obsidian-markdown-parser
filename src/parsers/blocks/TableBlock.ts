import { TableRowStatement, TableStatement } from "../statements";
import { Block } from "./Block";

export class TableBlock extends Block<TableStatement> {
	public static create(rows: string[][]): TableBlock {
		return new TableBlock(TableStatement.create(rows));
	}

	/**
	 * Adds a row to the table.
	 * @param values The values to add to the row.
	 * @param index The index to insert the row at. Defaults to the last row.
	 * @returns
	 */
	public addRow(
		values: string[],
		index: number | undefined = undefined
	): this {
		if (index === undefined) {
			this.stmt.rows.push(TableRowStatement.create(values));
		} else {
			this.stmt.rows.splice(index, 0, TableRowStatement.create(values));
		}
		return this;
	}

	/**
	 * Adds a row below the header row.
	 * @param values Adds a row below the header row.
	 * @returns This table block.
	 */
	public addRowBelowHeader(values: string[]): this {
		if (this.countRows() < 2) return this.addRow(values);

		const rowPlacement = TableBlock.rowIsDivider(this.getRow(1)) ? 2 : 1;
		return this.addRow(values, rowPlacement);
	}

	/**
	 * Returns the number of rows in the table.
	 * @returns The number of rows in the table.
	 */
	public countRows(): number {
		return this.stmt.rows.length;
	}

	/**
	 * Returns the number of columns in the table.
	 * @returns The number of columns in the table.
	 */
	public countColumns(): number {
		if (this.stmt.rows.length === 0) return 0;
		return this.stmt.rows[0]?.cells.length ?? 0;
	}

	/**
	 *
	 * @param column The index of the column to return.
	 * @returns An array of values in the given column.
	 *
	 * @example
	 * const block = TableBlock.create([
	 *      ["foo", "bar", "a"],
	 *      ["---", "---", "---"],
	 *      ["moo", "zar", "b"],
	 *      ["dar", "car", "c"],
	 * ]);
	 *
	 * expect(block.getColumn(2)).toEqual(["b", "c"]);
	 */
	public getColumn(column: number): string[] {
		const cells: string[] = [];

		if (this.countRows() < 2 || this.countColumns() < column) return cells;

		let startIndex = TableBlock.rowIsDivider(this.getRow(1)) ? 2 : 1;

		for (const row of this.stmt.rows.slice(startIndex)) {
			const cell = row.cells[column];
			if (cell) {
				cells.push(cell.content.toString());
			}
		}

		return cells;
	}

	/**
	 * Get a column with the given header name.
	 * @param column The name of the column to return.
	 * @returns An array of values in the given column.
	 */
	public getColumnByName(column: string): string[] {
		return this.toDict()[column] ?? [];
	}

	/**
	 * Get the values in a row.
	 * @param row The index of the row to return.
	 * @returns An array of values in the given row.
	 */
	public getRow(row: number): string[] {
		return (
			this.stmt.rows[row]?.cells.map((cell) => cell.content.toString()) ??
			[]
		);
	}

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
	public insertSpacerRow(): this {
		if (this.countRows() < 1) return this;

		this.stmt.rows.splice(
			1,
			0,
			TableRowStatement.create(
				this.getRow(0).map((s) => "-".repeat(s.length))
			)
		);

		return this;
	}

	/**
	 * Removes a column from the table.
	 * @param column The index of the column to remove.
	 * @returns This table block.
	 */
	public removeColumn(column: number): this {
		for (let i = 0; i < this.stmt.rows.length; i++) {
			const rowValues = this.getRow(i);
			rowValues.splice(column, 1);
			this.stmt.rows[i] = TableRowStatement.create(rowValues);
		}

		return this;
	}

	/**
	 * Removes a row from the table.
	 * @param row The index of the row to remove.
	 * @returns This table block.
	 */
	public removeRow(row: number): this {
		this.stmt.rows.splice(row, 1);
		return this;
	}

	/**
	 * Checks to see if the row is a divider row.
	 * @param row The values in the row.
	 * @returns True if the row is a divider row.
	 */
	public static rowIsDivider(row: string[]): boolean {
		return row.every(
			(cell) => cell.trim() === "-".repeat(cell.trim().length)
		);
	}

	/**
	 * Sets a column in the table.
	 * @param row The index of the row to update.
	 * @param values The values to update the row with.
	 * @returns This table block.
	 */
	public setRow(row: number, values: string[]): this {
		this.stmt.rows[row] = TableRowStatement.create(values);
		return this;
	}

	/**
	 * Sorts the table by the given function.
	 * @param compareFn The function to use to compare the rows.
	 * @returns This table block.
	 */
	public sortBy(compareFn: (a: string[], b: string[]) => number): this {
		if (this.countRows() < 2) return this;

		const rows: TableRowStatement[] = [this.stmt.rows.shift()!];

		if (TableBlock.rowIsDivider(this.getRow(0))) {
			rows.push(this.stmt.rows.shift()!);
		}

		const sorted = this.stmt.rows.sort((a, b) => {
			const ar = a.cells.map((c) => c.content.toString());
			const br = b.cells.map((c) => c.content.toString());
			return compareFn(ar, br);
		});

		this.stmt.rows = rows.concat(sorted);
		return this;
	}

	/**
	 * Converts the table to a dictionary.
	 * @returns A dictionary of the table's values.
	 */
	public toDict(): Record<string, string[]> {
		const dict: Record<string, string[]> = {};

		this.getRow(0).forEach((key) => {
			dict[key] = [];
		});

		if (this.countRows() < 2) return dict;

		let startIndex = TableBlock.rowIsDivider(this.getRow(1)) ? 2 : 1;

		// check to see if next row is dashes and pipes
		// little bit of a cheat here

		for (const row of this.stmt.rows.slice(startIndex)) {
			for (const [i, cell] of row.cells.entries()) {
				const key = this.getRow(0)[i]!.trim();
				dict[key]!.push(cell.content.toString());
			}
		}

		return dict;
	}
}
