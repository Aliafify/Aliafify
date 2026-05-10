import { useRef } from 'react';

export const CsvUpload = ({ onFile }: { onFile: (file: File) => void }) => {
  const ref = useRef<HTMLInputElement>(null);
  return <div className="card border-dashed text-center" onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file?.name.endsWith('.csv')) onFile(file); }} onDragOver={(e) => e.preventDefault()}>
    <p className="mb-3">اسحب ملف CSV هنا أو اختر ملف</p>
    <button className="rounded bg-sky-600 px-4 py-2" onClick={() => ref.current?.click()}>اختر ملف</button>
    <input ref={ref} hidden type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
  </div>;
};
