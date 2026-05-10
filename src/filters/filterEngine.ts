import { normalizeArabic } from '@/utils/arabic';
import type { CsvRow, FilterCondition, FilterGroup } from '@/types/csv';

const compare = (row: CsvRow, c: FilterCondition): boolean => {
  const raw = row[c.column];
  if (raw == null) return false;
  const v1 = c.value ?? '';
  const v2 = c.value2 ?? '';
  if (typeof raw === 'number') {
    const n1 = Number(v1); const n2 = Number(v2 || v1);
    if (c.operator === 'gt') return raw > n1;
    if (c.operator === 'lt') return raw < n1;
    if (c.operator === 'eq') return raw === n1;
    if (c.operator === 'between') return raw >= Math.min(n1, n2) && raw <= Math.max(n1, n2);
  }
  if (raw instanceof Date) {
    const d1 = new Date(v1).getTime();
    const d2 = new Date(v2 || v1).getTime();
    const t = raw.getTime();
    if (c.operator === 'before') return t < d1;
    if (c.operator === 'after') return t > d1;
    if (c.operator === 'between') return t >= Math.min(d1, d2) && t <= Math.max(d1, d2);
  }
  const source = normalizeArabic(String(raw));
  const target = normalizeArabic(v1);
  if (c.operator === 'contains') return source.includes(target);
  if (c.operator === 'notContains') return !source.includes(target);
  if (c.operator === 'startsWith') return source.startsWith(target);
  if (c.operator === 'endsWith') return source.endsWith(target);
  if (c.operator === 'exact' || c.operator === 'eq') return source === target;
  if (c.operator === 'regex') { try { return new RegExp(v1, 'iu').test(source); } catch { return false; } }
  return false;
};

export const applyFilterGroup = (rows: CsvRow[], group: FilterGroup): CsvRow[] => rows.filter((row) => {
  const checks = group.conditions.map((c) => compare(row, c));
  return group.combinator === 'and' ? checks.every(Boolean) : checks.some(Boolean);
});
