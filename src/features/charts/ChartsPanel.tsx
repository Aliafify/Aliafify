import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ColumnSchema, CsvRow } from '@/types/csv';

export const ChartsPanel = ({ rows, schema }: { rows: CsvRow[]; schema: ColumnSchema[] }) => {
  const numeric = schema.find((c) => c.type === 'number' || c.type === 'percentage');
  const distribution = useMemo(() => {
    if (!numeric) return [];
    const values = rows.map((r) => Number(r[numeric.key])).filter((n) => Number.isFinite(n));
    const buckets = new Map<number, number>();
    values.forEach((v) => { const b = Math.floor(v / 10) * 10; buckets.set(b, (buckets.get(b) ?? 0) + 1); });
    return [...buckets.entries()].sort((a, b) => a[0] - b[0]).map(([bin, count]) => ({ bin: `${bin}-${bin + 9}`, count }));
  }, [rows, numeric]);
  if (!numeric) return null;
  return <section className="card"><h2 className="mb-3 text-lg font-semibold">Distribution: {numeric.label}</h2><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={distribution}><XAxis dataKey="bin" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#0ea5e9" /></BarChart></ResponsiveContainer></div></section>;
};
