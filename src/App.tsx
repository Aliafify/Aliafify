import { Bot, BrainCircuit, DatabaseZap, Workflow } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BranchEditor } from '@/components/BranchEditor';
import { ControlsBar } from '@/components/ControlsBar';
import { KeywordInputPanel } from '@/components/KeywordInputPanel';
import { ResultsPanel } from '@/components/ResultsPanel';
import { Sidebar } from '@/components/Sidebar';
import { StatsCards } from '@/components/StatsCards';
import { DEFAULT_BRANCHES } from '@/constants/branches';
import { useKeywordClassifier } from '@/hooks/useKeywordClassifier';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { exportAugmentedCsv, exportAugmentedJson } from '@/services/exportService';
import type { BranchDefinition, ClassificationOptions } from '@/types/keyword';
import { parseKeywordInput, sampleKeywordJson } from '@/utils/inputParser';

const INITIAL_OPTIONS: ClassificationOptions = {
  deduplicate: true,
  allowMultipleMatches: true,
};

export const App = () => {
  const [rawInput, setRawInput] = useLocalStorage('arabic-keyword-classifier-input', sampleKeywordJson);
  const [branches, setBranches] = useLocalStorage<BranchDefinition[]>('arabic-keyword-classifier-branches', DEFAULT_BRANCHES);
  const [options, setOptions] = useState<ClassificationOptions>(INITIAL_OPTIONS);
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');

  const parsedInput = useMemo(() => parseKeywordInput(rawInput), [rawInput]);
  const stableOptions = useMemo(() => options, [options]);
  const { result, analytics } = useKeywordClassifier(parsedInput.items, stableOptions, branches);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_32rem),linear-gradient(135deg,_#020617_0%,_#0f172a_50%,_#111827_100%)] px-4 py-6 text-slate-100" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="overflow-hidden rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200">
                <Bot className="size-4" /> Arabic SEO Keyword Branch Classifier
              </div>
              <h1 className="max-w-4xl text-3xl font-black leading-tight text-white md:text-5xl">
                أداة احترافية لتجميع وتصنيف كلمات SEO العربية وإعادة توزيعها على الفروع تلقائيًا
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
                دمج batches متعددة، تطبيع عربي متقدم، تصنيف ديناميكي قابل للتوسعة، CSV UTF-8، نسخ بضغطة واحدة، وفصل معماري جاهز لإضافة NLP و OpenAI API مستقبلًا.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:w-80 lg:grid-cols-1">
              <div className="hero-pill"><DatabaseZap className="size-5 text-cyan-300" /> 50K+ كلمة</div>
              <div className="hero-pill"><Workflow className="size-5 text-emerald-300" /> فروع ديناميكية</div>
              <div className="hero-pill"><BrainCircuit className="size-5 text-violet-300" /> جاهز للذكاء الاصطناعي</div>
            </div>
          </div>
        </header>

        <StatsCards stats={result.stats} />

        <KeywordInputPanel value={rawInput} onChange={setRawInput} onFileText={setRawInput} parseWarnings={parsedInput.parseWarnings} />

        <BranchEditor branches={branches} onBranchesChange={setBranches} />

        <ControlsBar
          options={options}
          onOptionsChange={setOptions}
          search={search}
          onSearchChange={setSearch}
          selectedBranch={selectedBranch}
          onSelectedBranchChange={setSelectedBranch}
          branches={branches}
          onExportCsv={() => exportAugmentedCsv(parsedInput.documents, result)}
          onExportJson={() => exportAugmentedJson(parsedInput.documents, result)}
        />

        <section className="grid gap-6 lg:grid-cols-[18rem_1fr]">
          <Sidebar analytics={analytics} selectedBranch={selectedBranch} onSelectBranch={setSelectedBranch} unknownCount={result.stats.unknown} />
          <ResultsPanel buckets={result.buckets} branches={branches} search={search} selectedBranch={selectedBranch} />
        </section>
      </div>
    </main>
  );
};
