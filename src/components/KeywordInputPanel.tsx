import { ClipboardPaste, RotateCcw, Upload } from 'lucide-react';
import { sampleKeywordJson } from '@/utils/inputParser';

interface KeywordInputPanelProps {
  value: string;
  onChange: (value: string) => void;
  onFileText: (value: string) => void;
  parseWarnings: string[];
}

export const KeywordInputPanel = ({ value, onChange, onFileText, parseWarnings }: KeywordInputPanelProps) => {
  const handleFile = async (file: File | null) => {
    if (!file) {
      return;
    }

    onFileText(await file.text());
  };

  return (
    <section className="card space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-300">إدخال الكلمات</p>
          <h2 className="mt-1 text-2xl font-bold text-white">الصق مصفوفات الكلمات أو ارفع ملف CSV/TXT</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            يدعم صيغة <span dir="ltr" className="font-mono text-cyan-200">const data1 = {'{'} results: [...] {'}'}</span>، أو JSON، أو كلمات مفصولة بأسطر/فواصل.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={() => onChange(sampleKeywordJson)}>
            <ClipboardPaste className="size-4" /> مثال جاهز
          </button>
          <button type="button" className="btn-ghost" onClick={() => onChange('')}>
            <RotateCcw className="size-4" /> مسح
          </button>
        </div>
      </div>

      <textarea
        className="min-h-72 w-full rounded-2xl border border-slate-700 bg-slate-950/70 p-4 font-mono text-sm leading-7 text-slate-100 outline-none ring-cyan-400/40 transition focus:border-cyan-400 focus:ring-4"
        dir="auto"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={'const data1 = {\n  "batch_number": 1,\n  "keywords_processed": 2,\n  "results": [\n    { "keyword": "انتريهات مودرن 2026", "dominant_intent": "Inspirational" },\n    { "keyword": "ركنه مودرن 2026", "dominant_intent": "Commercial" }\n  ]\n}' }
      />

      {parseWarnings.length > 0 && (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          <p className="font-bold">تنبيه أثناء التحليل</p>
          <ul className="mt-2 list-inside list-disc">
            {parseWarnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        </div>
      )}

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-600 bg-slate-950/40 p-5 text-center transition hover:border-cyan-400 hover:bg-cyan-950/20">
        <Upload className="mb-2 size-7 text-cyan-300" />
        <span className="font-semibold">اسحب ملفًا هنا أو اختر ملفًا</span>
        <span className="mt-1 text-xs text-slate-400">CSV, TXT, JSON — يتم قراءته محليًا داخل المتصفح</span>
        <input className="hidden" type="file" accept=".csv,.txt,.json,text/csv,application/json,text/plain" onChange={(event) => void handleFile(event.target.files?.[0] ?? null)} />
      </label>
    </section>
  );
};
