import Papa from 'papaparse';
import type { CsvRow } from '@/types/csv';

const download = (filename: string, content: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportCsv = (rows: CsvRow[], filename = 'dataset.csv') =>
  download(filename, Papa.unparse(rows), 'text/csv;charset=utf-8');

export const exportJson = (rows: CsvRow[], filename = 'dataset.json') =>
  download(filename, JSON.stringify(rows, null, 2), 'application/json;charset=utf-8');
