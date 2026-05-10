import Papa from 'papaparse';
import type { GscRow, ParseIssue } from '@/types/gsc';

const toNum = (value: string): number => {
  const cleaned = value.replace(/[%،,]/g, '').trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
};

export const parseGscCsv = (file: File): Promise<{ rows: GscRow[]; issues: ParseIssue[] }> =>
  new Promise((resolve) => {
    const issues: ParseIssue[] = [];
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'utf-8',
      complete(result) {
        const rows = result.data.flatMap((row, idx) => {
          const keyword = row['أهم طلبات البحث']?.trim() ?? row['Keyword']?.trim();
          const clicks = toNum(row['النقرات'] ?? row['Clicks'] ?? '');
          const impressions = toNum(row['عدد الظهور'] ?? row['Impressions'] ?? '');
          const ctr = toNum(row['نسبة النقر إلى الظهور'] ?? row['CTR'] ?? '');
          const position = toNum(row['موضع'] ?? row['Position'] ?? '');
          if (!keyword || [clicks, impressions, ctr, position].some(Number.isNaN)) {
            issues.push({ row: idx + 2, message: 'Malformed row with missing/invalid columns' });
            return [];
          }
          return [{ keyword, clicks, impressions, ctr, position }];
        });
        resolve({ rows, issues });
      }
    });
  });
