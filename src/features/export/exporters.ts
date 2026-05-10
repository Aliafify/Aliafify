import Papa from 'papaparse';
import type { GscRow } from '@/types/gsc';

const download = (blob: Blob, name: string) => { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url); };
export const exportCsv = (rows: GscRow[], file = 'filtered-data.csv') => download(new Blob([Papa.unparse(rows)], { type: 'text/csv;charset=utf-8;' }), file);
export const exportJson = (rows: GscRow[], file = 'filtered-data.json') => download(new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' }), file);
