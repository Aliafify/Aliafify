import { Check, Clipboard, Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { UNKNOWN_BRANCH_ID } from '@/constants/branches';
import { copyKeywords } from '@/services/exportService';
import type { BranchDefinition, ClassificationBuckets, ClassifiedKeyword } from '@/types/keyword';
import { normalizeArabic } from '@/utils/arabicNormalizer';

interface ResultsPanelProps {
  buckets: ClassificationBuckets;
  branches: BranchDefinition[];
  search: string;
  selectedBranch: string;
}

interface DisplayBranch {
  id: string;
  label: string;
  description: string;
  keywords: ClassifiedKeyword[];
}

const UNKNOWN_BRANCH = {
  id: UNKNOWN_BRANCH_ID,
  label: 'غير مصنف',
  description: 'كلمات لم تطابق أي alias حالي وتحتاج مراجعة أو توسعة الفروع.',
  priority: 999,
  aliases: [],
};

export const ResultsPanel = ({ buckets, branches, search, selectedBranch }: ResultsPanelProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const normalizedSearch = normalizeArabic(search);

  const displayBranches = useMemo<DisplayBranch[]>(() => [...branches, UNKNOWN_BRANCH]
    .filter((branch) => selectedBranch === 'all' || branch.id === selectedBranch)
    .map((branch) => {
      const sourceKeywords = buckets[branch.id] ?? [];
      const keywords = normalizedSearch
        ? sourceKeywords.filter((keyword) => keyword.normalized.includes(normalizedSearch))
        : sourceKeywords;

      return { id: branch.id, label: branch.label, description: branch.description, keywords };
    }), [branches, buckets, normalizedSearch, selectedBranch]);

  const copyBranch = async (branch: DisplayBranch) => {
    await copyKeywords(branch.keywords.map((keyword) => keyword.original));
    setCopiedId(branch.id);
    window.setTimeout(() => setCopiedId(null), 1600);
  };

  const copyAll = async () => {
    await copyKeywords(displayBranches.flatMap((branch) => branch.keywords.map((keyword) => keyword.original)));
    setCopiedId('all');
    window.setTimeout(() => setCopiedId(null), 1600);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">نتائج التصنيف</h2>
          <p className="text-sm text-slate-400">اعرض الفروع، انسخ النتائج، وراجع الكلمات غير المصنفة لتوسيع القاموس.</p>
        </div>
        <button type="button" className="btn-secondary" onClick={() => void copyAll()}>
          {copiedId === 'all' ? <Check className="size-4" /> : <Copy className="size-4" />} نسخ كل النتائج المعروضة
        </button>
      </div>

      {displayBranches.map((branch) => (
        <article key={branch.id} className="card overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-black text-white">
                {branch.label} <span className="text-cyan-300">({branch.keywords.length.toLocaleString('ar-EG')})</span>
              </h3>
              <p className="mt-1 text-sm text-slate-400">{branch.description}</p>
            </div>
            <button type="button" className="btn-ghost" onClick={() => void copyBranch(branch)}>
              {copiedId === branch.id ? <Check className="size-4" /> : <Clipboard className="size-4" />} نسخ الفرع
            </button>
          </div>

          <div className="mt-4 max-h-96 overflow-auto rounded-2xl border border-slate-800 bg-slate-950/50">
            {branch.keywords.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">لا توجد كلمات مطابقة للفلاتر الحالية.</p>
            ) : (
              <ul className="divide-y divide-slate-800">
                {branch.keywords.map((keyword, index) => (
                  <li key={`${branch.id}-${keyword.normalized}-${index}`} className="flex flex-col gap-1 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-medium text-slate-100">{keyword.original}</span>
                    <span className="text-xs text-slate-500" dir="ltr">{keyword.matchedAliases.join(' | ') || 'unknown'}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>
      ))}
    </section>
  );
};
