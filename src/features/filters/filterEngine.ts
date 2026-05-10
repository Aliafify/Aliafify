import { normalizeArabic } from '@/utils/arabic';
import type { GscRow } from '@/types/gsc';

export type NumericOp = 'gt' | 'lt' | 'eq' | 'between';
export type KeywordOp = 'contains' | 'startsWith' | 'endsWith' | 'exact' | 'regex';

export interface NumericFilter { field: keyof Pick<GscRow, 'clicks'|'impressions'|'ctr'|'position'>; op: NumericOp; value: number; value2?: number; }
export interface KeywordFilter { op: KeywordOp; value: string; }

export const applyFilters = (rows: GscRow[], numeric: NumericFilter[], keyword?: KeywordFilter): GscRow[] => rows.filter((row) => {
  const numOk = numeric.every((f) => {
    const val = row[f.field];
    if (f.op === 'gt') return val > f.value;
    if (f.op === 'lt') return val < f.value;
    if (f.op === 'eq') return val === f.value;
    return val >= Math.min(f.value, f.value2 ?? f.value) && val <= Math.max(f.value, f.value2 ?? f.value);
  });
  if (!numOk || !keyword?.value) return numOk;
  const src = normalizeArabic(row.keyword);
  const target = normalizeArabic(keyword.value);
  if (keyword.op === 'contains') return src.includes(target);
  if (keyword.op === 'startsWith') return src.startsWith(target);
  if (keyword.op === 'endsWith') return src.endsWith(target);
  if (keyword.op === 'exact') return src === target;
  try { return new RegExp(keyword.value, 'i').test(row.keyword); } catch { return false; }
});

export const seoPresets: Record<string, NumericFilter[]> = {
  ctrOpportunities: [
    { field: 'impressions', op: 'gt', value: 500 },
    { field: 'ctr', op: 'lt', value: 1 },
    { field: 'position', op: 'lt', value: 8 }
  ],
  nearTop3: [{ field: 'position', op: 'between', value: 4, value2: 10 }],
  highImpressionLowClick: [{ field: 'impressions', op: 'gt', value: 1000 }, { field: 'clicks', op: 'lt', value: 20 }],
  lowCtrHighRanking: [{ field: 'ctr', op: 'lt', value: 1.5 }, { field: 'position', op: 'lt', value: 5 }]
};
