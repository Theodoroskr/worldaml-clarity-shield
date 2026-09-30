/**
 * Quote a value for CSV output and neutralise spreadsheet formulas.
 * Cells starting with =, +, -, @, tab or carriage return are prefixed with a
 * single quote so spreadsheet apps treat them as text, not formulas.
 * Plain numbers (e.g. "-12.50") are left untouched.
 */
export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s) && !/^[-+]?\d+(\.\d+)?$/.test(s)) {
    s = `'${s}`;
  }
  return `"${s.replace(/"/g, '""')}"`;
}

export function csvRow(values: unknown[]): string {
  return values.map(csvCell).join(",");
}
