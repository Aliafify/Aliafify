import { AlertTriangle, GitBranch, Layers3, Sparkles } from 'lucide-react';
import type { ClassificationStats } from '@/types/keyword';

interface StatsCardsProps {
  stats: ClassificationStats;
}

const cards = [
  { key: 'totalProcessed', label: 'كلمات معالجة', icon: Layers3, color: 'text-cyan-300' },
  { key: 'matched', label: 'كلمات مصنفة', icon: Sparkles, color: 'text-emerald-300' },
  { key: 'unknown', label: 'غير معروف', icon: AlertTriangle, color: 'text-amber-300' },
  { key: 'overlaps', label: 'تداخل فروع', icon: GitBranch, color: 'text-violet-300' },
] as const;

export const StatsCards = ({ stats }: StatsCardsProps) => (
  <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {cards.map(({ key, label, icon: Icon, color }) => (
      <article key={key} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl shadow-slate-950/30">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-slate-400">{label}</span>
          <Icon className={`size-5 ${color}`} />
        </div>
        <p className="mt-3 text-3xl font-black text-white">{stats[key].toLocaleString('ar-EG')}</p>
      </article>
    ))}
    <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:col-span-2 xl:col-span-4">
      <p className="text-sm text-slate-300">
        إجمالي الإدخال: <strong>{stats.totalInput.toLocaleString('ar-EG')}</strong> — التكرارات المحذوفة: <strong>{stats.duplicatesRemoved.toLocaleString('ar-EG')}</strong>
      </p>
    </article>
  </section>
);
