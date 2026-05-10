import { useMemo, useState } from 'react';
import { CsvUpload } from '@/features/upload/CsvUpload';
import { parseCsvFile } from '@/services/csvParser';
import type { FilterCondition, FilterGroup, ParsedCsvDataset } from '@/types/csv';
import { applyFilterGroup } from '@/filters/filterEngine';
import { DataTable } from '@/features/table/DataTable';
import { ChartsPanel } from '@/features/charts/ChartsPanel';
import { exportCsv, exportJson } from '@/exporters/exporters';

const emptyGroup: FilterGroup = { id: 'root', combinator: 'and', conditions: [] };

export const App = () => {
  const [dataset, setDataset] = useState<ParsedCsvDataset | null>(null);
  const [group, setGroup] = useState<FilterGroup>(emptyGroup);

  const filtered = useMemo(() => dataset ? applyFilterGroup(dataset.rows, group) : [], [dataset, group]);

  const addCondition = () => {
    if (!dataset?.columns.length) return;
    const col = dataset.columns[0];
    const condition: FilterCondition = { id: crypto.randomUUID(), column: col.key, operator: col.type === 'number' || col.type === 'percentage' ? 'gt' : 'contains', value: '' };
    setGroup((g) => ({ ...g, conditions: [...g.conditions, condition] }));
  };

  return <main className="mx-auto max-w-7xl space-y-4 p-4" dir="auto">
    <header className="card"><h1 className="text-2xl font-bold">Universal Dynamic CSV Analytics Platform</h1></header>
    <CsvUpload onFile={async (file) => { const parsed = await parseCsvFile(file); setDataset(parsed); setGroup(emptyGroup); }} />
    {dataset && <section className="card space-y-2">
      <div className="flex flex-wrap gap-2"><button className="rounded bg-slate-700 px-3 py-2" onClick={addCondition}>Add Filter</button><button className="rounded bg-slate-700 px-3 py-2" onClick={() => setGroup((g) => ({ ...g, combinator: g.combinator === 'and' ? 'or' : 'and' }))}>Combinator: {group.combinator.toUpperCase()}</button><button className="rounded bg-emerald-700 px-3 py-2" onClick={() => exportCsv(filtered)}>Export CSV</button><button className="rounded bg-indigo-700 px-3 py-2" onClick={() => exportJson(filtered)}>Export JSON</button></div>
      {group.conditions.map((c) => <div key={c.id} className="grid grid-cols-1 gap-2 md:grid-cols-5"><select className="rounded bg-slate-900 p-2" value={c.column} onChange={(e) => setGroup((g) => ({ ...g, conditions: g.conditions.map((x) => x.id === c.id ? { ...x, column: e.target.value } : x) }))}>{dataset.columns.map((col) => <option key={col.key} value={col.key}>{col.label}</option>)}</select><select className="rounded bg-slate-900 p-2" value={c.operator} onChange={(e) => setGroup((g) => ({ ...g, conditions: g.conditions.map((x) => x.id === c.id ? { ...x, operator: e.target.value as FilterCondition['operator'] } : x) }))}>{['gt','lt','eq','between','contains','notContains','startsWith','endsWith','exact','regex','before','after'].map((op) => <option key={op} value={op}>{op}</option>)}</select><input className="rounded bg-slate-900 p-2" placeholder="value" value={c.value ?? ''} onChange={(e) => setGroup((g) => ({ ...g, conditions: g.conditions.map((x) => x.id === c.id ? { ...x, value: e.target.value } : x) }))} /><input className="rounded bg-slate-900 p-2" placeholder="value2" value={c.value2 ?? ''} onChange={(e) => setGroup((g) => ({ ...g, conditions: g.conditions.map((x) => x.id === c.id ? { ...x, value2: e.target.value } : x) }))} /><button className="rounded bg-rose-700 px-3 py-2" onClick={() => setGroup((g) => ({ ...g, conditions: g.conditions.filter((x) => x.id !== c.id) }))}>Remove</button></div>)}
    </section>}
    {dataset && <section className="card text-sm text-slate-300">Rows: {dataset.totalRows} | Filtered: {filtered.length}</section>}
    {dataset && <ChartsPanel rows={filtered} schema={dataset.columns} />}
    {dataset && <DataTable data={filtered} schema={dataset.columns} />}
  </main>;
};
