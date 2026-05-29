import type { BranchAnalytics } from '@/types/keyword';

interface SidebarProps {
  analytics: BranchAnalytics[];
  selectedBranch: string;
  onSelectBranch: (branchId: string) => void;
  unknownCount: number;
}

export const Sidebar = ({ analytics, selectedBranch, onSelectBranch, unknownCount }: SidebarProps) => (
  <aside className="card sticky top-4 h-fit space-y-3">
    <div>
      <p className="text-sm font-semibold text-cyan-300">الفروع</p>
      <h2 className="mt-1 text-xl font-bold">لوحة التوزيع</h2>
    </div>
    <button type="button" className={`sidebar-item ${selectedBranch === 'all' ? 'sidebar-active' : ''}`} onClick={() => onSelectBranch('all')}>
      <span>كل الفروع</span><span>—</span>
    </button>
    {analytics.map((item) => (
      <button key={item.branchId} type="button" className={`sidebar-item ${selectedBranch === item.branchId ? 'sidebar-active' : ''}`} onClick={() => onSelectBranch(item.branchId)}>
        <span>{item.label}</span>
        <span>{item.count.toLocaleString('ar-EG')}</span>
      </button>
    ))}
    <button type="button" className={`sidebar-item ${selectedBranch === 'unknown' ? 'sidebar-active' : ''}`} onClick={() => onSelectBranch('unknown')}>
      <span>غير مصنف</span>
      <span>{unknownCount.toLocaleString('ar-EG')}</span>
    </button>
  </aside>
);
