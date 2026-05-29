import { Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { BranchDefinition } from '@/types/keyword';

interface BranchEditorProps {
  branches: BranchDefinition[];
  onBranchesChange: (branches: BranchDefinition[]) => void;
}

export const BranchEditor = ({ branches, onBranchesChange }: BranchEditorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateBranch = (branchId: string, patch: Partial<BranchDefinition>) => {
    onBranchesChange(branches.map((branch) => (branch.id === branchId ? { ...branch, ...patch } : branch)));
  };

  const addBranch = () => {
    const id = `custom_${Date.now()}`;
    onBranchesChange([
      ...branches,
      {
        id,
        label: 'فرع جديد',
        description: 'فرع قابل للتخصيص',
        priority: branches.length * 10 + 100,
        aliases: ['كلمة مفتاحية'],
      },
    ]);
    setIsOpen(true);
  };

  const removeBranch = (branchId: string) => {
    onBranchesChange(branches.filter((branch) => branch.id !== branchId));
  };

  return (
    <section className="card space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-300">قاموس التصنيف</p>
          <h2 className="text-xl font-bold">تحرير الفروع والمرادفات</h2>
          <p className="text-sm text-slate-400">يتم حفظ التعديلات تلقائيًا في localStorage وتجهيزها للتوسع بالذكاء الاصطناعي لاحقًا.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={addBranch}><Plus className="size-4" /> فرع جديد</button>
          <button type="button" className="btn-ghost" onClick={() => setIsOpen((current) => !current)}><Save className="size-4" /> {isOpen ? 'إخفاء' : 'إظهار'} المحرر</button>
        </div>
      </div>

      {isOpen && (
        <div className="grid gap-3">
          {branches.map((branch) => (
            <article key={branch.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
                <input className="input" value={branch.label} onChange={(event) => updateBranch(branch.id, { label: event.target.value })} aria-label="اسم الفرع" />
                <input className="input" dir="ltr" value={branch.id} onChange={(event) => updateBranch(branch.id, { id: event.target.value.trim() })} aria-label="معرف الفرع" />
                <button type="button" className="btn-danger" onClick={() => removeBranch(branch.id)}><Trash2 className="size-4" /> حذف</button>
              </div>
              <input className="input mt-3" value={branch.description} onChange={(event) => updateBranch(branch.id, { description: event.target.value })} aria-label="وصف الفرع" />
              <textarea
                className="input mt-3 min-h-24"
                dir="auto"
                value={branch.aliases.join('\n')}
                onChange={(event) => updateBranch(branch.id, { aliases: event.target.value.split(/\r?\n|,/).map((alias) => alias.trim()).filter(Boolean) })}
                aria-label="مرادفات الفرع"
              />
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
