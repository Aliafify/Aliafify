import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { GscRow } from '@/types/gsc';

export const ChartsPanel = ({ rows }: { rows: GscRow[] }) => {
  const top = [...rows].sort((a, b) => b.impressions - a.impressions).slice(0, 10);
  return <div className="card h-72"><h3 className="mb-2 font-semibold">Top Keywords by Impressions</h3><ResponsiveContainer width="100%" height="90%"><BarChart data={top}><XAxis dataKey="keyword" hide /><YAxis /><Tooltip /><Bar dataKey="impressions" fill="#38bdf8" /></BarChart></ResponsiveContainer></div>;
};
