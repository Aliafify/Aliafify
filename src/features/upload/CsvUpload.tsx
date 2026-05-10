import { useRef } from 'react';

export const CsvUpload = ({ onFile }: { onFile: (file: File) => void }) => {
  const ref = useRef<HTMLInputElement>(null);
  return <section className="card"><div className="rounded border-2 border-dashed border-slate-600 p-6 text-center" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files?.[0]; if (file) onFile(file); }}><p>Drop CSV here (UTF-8 + Arabic supported)</p><button className="mt-3 rounded bg-slate-700 px-4 py-2" onClick={() => ref.current?.click()}>Choose CSV</button><input ref={ref} type="file" accept=".csv,text/csv" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) onFile(file); }} /></div></section>;
};
