import { useMemo, useRef, useState } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { ColumnSchema, CsvRow } from '@/types/csv';

export const DataTable = ({ data, schema }: { data: CsvRow[]; schema: ColumnSchema[] }) => {
  const [global, setGlobal] = useState('');
  const columns = useMemo<ColumnDef<CsvRow>[]>(() => schema.map((c) => ({ accessorKey: c.key, header: c.label, cell: (ctx) => { const v = ctx.getValue(); return v instanceof Date ? v.toISOString().slice(0, 10) : String(v ?? ''); } })), [schema]);
  const filtered = useMemo(() => global ? data.filter((r) => Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(global.toLowerCase()))) : data, [data, global]);
  const table = useReactTable({ data: filtered, columns, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });
  const parentRef = useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;
  const virtualizer = useVirtualizer({ count: rows.length, getScrollElement: () => parentRef.current, estimateSize: () => 40, overscan: 30 });

  return <section className="card"><input className="mb-2 w-full rounded bg-slate-900 p-2" value={global} onChange={(e) => setGlobal(e.target.value)} placeholder="Global search" /><div ref={parentRef} className="h-[520px] overflow-auto"><table className="w-full text-sm"><thead className="sticky top-0 bg-slate-950">{table.getHeaderGroups().map((hg) => <tr key={hg.id}>{hg.headers.map((h) => <th key={h.id} className="p-2 text-left">{flexRender(h.column.columnDef.header, h.getContext())}</th>)}</tr>)}</thead><tbody style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>{virtualizer.getVirtualItems().map((vi) => { const row = rows[vi.index]; return <tr key={row.id} className="absolute inset-x-0 border-b border-slate-800" style={{ transform: `translateY(${vi.start}px)` }}>{row.getVisibleCells().map((cell) => <td key={cell.id} className="p-2">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>; })}</tbody></table></div></section>;
};
