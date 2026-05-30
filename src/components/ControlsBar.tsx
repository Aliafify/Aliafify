import { Download, Filter, Search, Settings2 } from 'lucide-react';
import type { BranchDefinition, ClassificationOptions } from '@/types/keyword';

interface ControlsBarProps {
  options: ClassificationOptions;
  onOptionsChange: (options: ClassificationOptions) => void;
  search: string;
  onSearchChange: (value: string) => void;
  selectedBranch: string;
  onSelectedBranchChange: (value: string) => void;
  branches: BranchDefinition[];
  onExportCsv: () => void;
  onExportJson: () => void;
}

export const ControlsBar = ({
  options,
  onOptionsChange,
  search,
  onSearchChange,
  selectedBranch,
  onSelectedBranchChange,
  branches,
  onExportCsv,
  onExportJson,
}: ControlsBarProps) => (
  <section className="card grid gap-4 xl:grid-cols-[1fr_auto]">
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <label className="relative block">
        <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          className="input pr-10"
          dir="auto"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="بحث حي داخل الكلمات..."
        />
      </label>

      <label className="relative block">
        <Filter className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <select className="input pr-10" value={selectedBranch} onChange={(event) => onSelectedBranchChange(event.target.value)}>
          <option value="all">كل الفروع</option>
          {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.label}</option>)}
          <option value="unknown">غير مصنف</option>
        </select>
      </label>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3">
        <Settings2 className="size-4 text-cyan-300" />
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input type="checkbox" checked={options.deduplicate} onChange={(event) => onOptionsChange({ ...options, deduplicate: event.target.checked })} />
          إزالة التكرار
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input type="checkbox" checked={options.allowMultipleMatches} onChange={(event) => onOptionsChange({ ...options, allowMultipleMatches: event.target.checked })} />
          تعدد الفروع
        </label>
      </div>
    </div>

    <div className="flex flex-wrap gap-2 xl:justify-end">
      <button type="button" className="btn-primary" onClick={onExportCsv}>
        <Download className="size-4" /> تصدير البيانات CSV
      </button>
      <button type="button" className="btn-secondary" onClick={onExportJson}>
        <Download className="size-4" /> تصدير البيانات JSON
      </button>
    </div>
  </section>
);
