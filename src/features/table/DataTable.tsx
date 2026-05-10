import { useMemo, useRef } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { GscRow } from '@/types/gsc';

export const DataTable = ({ data }: { data: GscRow[] }) => {
  const columns = useMemo<ColumnDef<GscRow>[]>(() => [
    { accessorKey: 'keyword', header: 'Keyword' },
    { accessorKey: 'clicks', header: 'Clicks' },
    { accessorKey: 'impressions', header: 'Impressions' },
    { accessorKey: 'ctr', header: 'CTR %' },
    { accessorKey: 'position', header: 'Position' }
  ], []);
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });
  const parentRef = useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;
  const virtualizer = useVirtualizer({ count: rows.length, getScrollElement: () => parentRef.current, estimateSize: () => 42, overscan: 20 });

  return <div ref={parentRef} className="card h-[520px] overflow-auto"><table className="w-full text-right text-sm"><thead className="sticky top-0 bg-slate-950">{table.getHeaderGroups().map(hg => <tr key={hg.id}>{hg.headers.map(h => <th key={h.id} className="p-2">{flexRender(h.column.columnDef.header, h.getContext())}</th>)}</tr>)}</thead><tbody style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>{virtualizer.getVirtualItems().map(vi => { const row = rows[vi.index]; return <tr key={row.id} className="absolute inset-x-0 border-b border-slate-800" style={{ transform: `translateY(${vi.start}px)` }}>{row.getVisibleCells().map(cell => <td key={cell.id} className="p-2">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>; })}</tbody></table></div>;
};
