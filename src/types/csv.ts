export type RowValue = string | number | boolean | Date | null;

export type ColumnType = 'number' | 'percentage' | 'date' | 'boolean' | 'text' | 'empty';

export interface ColumnSchema {
  key: string;
  label: string;
  type: ColumnType;
  nullable: boolean;
  distinctCount: number;
}

export type CsvRow = Record<string, RowValue>;

export interface ParsedCsvDataset {
  columns: ColumnSchema[];
  rows: CsvRow[];
  totalRows: number;
  warnings: string[];
}

export type FilterOperator =
  | 'gt'
  | 'lt'
  | 'eq'
  | 'between'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'exact'
  | 'regex'
  | 'before'
  | 'after';

export interface FilterCondition {
  id: string;
  column: string;
  operator: FilterOperator;
  value?: string;
  value2?: string;
}

export interface FilterGroup {
  id: string;
  combinator: 'and' | 'or';
  conditions: FilterCondition[];
}
