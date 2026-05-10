import { useMemo, useState } from 'react';
import { CsvUpload } from '@/features/upload/CsvUpload';
import { parseGscCsv } from '@/services/csvParser';
import type { GscRow, ParseIssue } from '@/types/gsc';
import { applyFilters, seoPresets, type NumericFilter } from '@/features/filters/filterEngine';
import { DataTable } from '@/features/table/DataTable';
import { ChartsPanel } from '@/features/charts/ChartsPanel';
import { exportCsv, exportJson } from '@/features/export/exporters';

export const App = () => {
  const [rows, setRows] = useState<GscRow[]>([]);
  const [issues, setIssues] = useState<ParseIssue[]>([]);
  const [filters, setFilters] = useState<NumericFilter[]>([]);

  const filtered = useMemo(() => applyFilters(rows, filters), [rows, filters]);

  return <main className="mx-auto max-w-7xl space-y-4 p-4">
    <header className="card"><h1 className="text-2xl font-bold">Google Search Console CSV Analyzer</h1><p className="text-slate-300">جاهز لتحليل 50k+ صف مع دعم كامل للعربية ومرشحات SEO.</p></header>
    <CsvUpload onFile={async (file) => { const result = await parseGscCsv(file); setRows(result.rows); setIssues(result.issues); }} />
    <section className="card flex flex-wrap gap-2">
      <button className="rounded bg-slate-700 px-3 py-2" onClick={() => setFilters(seoPresets.ctrOpportunities)}>CTR Opportunities</button>
      <button className="rounded bg-slate-700 px-3 py-2" onClick={() => setFilters(seoPresets.nearTop3)}>Near Top 3</button>
      <button className="rounded bg-slate-700 px-3 py-2" onClick={() => setFilters(seoPresets.highImpressionLowClick)}>High Impression Low Click</button>
      <button className="rounded bg-slate-700 px-3 py-2" onClick={() => setFilters(seoPresets.lowCtrHighRanking)}>Low CTR High Ranking</button>
      <button className="rounded bg-emerald-700 px-3 py-2" onClick={() => exportCsv(filtered)}>Export CSV</button>
      <button className="rounded bg-indigo-700 px-3 py-2" onClick={() => exportJson(filtered)}>Export JSON</button>
    </section>
    {issues.length > 0 && <section className="card text-amber-300">Validation issues: {issues.length}</section>}
    <ChartsPanel rows={filtered} />
    <DataTable data={filtered} />
  </main>;
};
