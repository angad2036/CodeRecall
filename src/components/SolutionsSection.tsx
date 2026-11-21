import { useState } from 'react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import type {
  ApproachTier,
  DsaProblem,
  ProgrammingLanguage,
} from '../types/dsa';

interface SolutionsSectionProps {
  problem: DsaProblem;
  language: ProgrammingLanguage;
  onLanguageChange: (lang: ProgrammingLanguage) => void;
  onLoadIntoEditor: (code: string, lang: ProgrammingLanguage) => void;
}

const TIERS: ApproachTier[] = ['Brute Force', 'Better', 'Optimal'];
const LANGS: { id: ProgrammingLanguage; label: string }[] = [
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
];

export function SolutionsSection({
  problem,
  language,
  onLanguageChange,
  onLoadIntoEditor,
}: SolutionsSectionProps) {
  const [selectedTier, setSelectedTier] = useState<ApproachTier>('Optimal');
  const [copied, setCopied] = useState(false);

  const approach =
    problem.approaches.find((a) => a.tier === selectedTier) ??
    problem.approaches[problem.approaches.length - 1];

  if (!approach) return null;

  const code = approach.code[language];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Ignore clipboard failure
    }
  };

  return (
    <div className="space-y-5">
      {/* Approach Tier & Language Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
        <div
          role="tablist"
          aria-label="Solution approach tier"
          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800"
        >
          {TIERS.map((tier) => {
            const exists = problem.approaches.some((a) => a.tier === tier);
            if (!exists) return null;
            return (
              <button
                key={tier}
                type="button"
                role="tab"
                aria-selected={selectedTier === tier}
                onClick={() => setSelectedTier(tier)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  selectedTier === tier
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {tier}
              </button>
            );
          })}
        </div>

        <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {LANGS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onLanguageChange(item.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                language === item.id
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Approach Summary & Complexity */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            {approach.title}
          </h3>
          <div className="flex items-center gap-3 font-mono text-xs text-slate-600 tabular-nums dark:text-slate-400">
            <span>
              Time: <strong className="text-slate-900 dark:text-slate-100">{approach.timeComplexity}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Space: <strong className="text-slate-900 dark:text-slate-100">{approach.spaceComplexity}</strong>
            </span>
          </div>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {approach.summary}
        </p>
      </div>

      {/* Code Block */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
          <span className="font-mono text-xs text-slate-400">
            {language === 'cpp' ? 'C++' : language === 'java' ? 'Java' : 'Python'} · {approach.tier}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={() => onLoadIntoEditor(code, language)}
              className="inline-flex items-center gap-1 rounded-md bg-sky-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-sky-500 whitespace-nowrap shrink-0"
            >
              <span>Load in Solve</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <pre className="max-h-96 overflow-auto p-4 font-mono text-xs leading-6 text-slate-100">
          <code>{code}</code>
        </pre>
      </div>

      {/* Dry Run & Line-by-Line */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h4 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
            Dry Run Trace
          </h4>
          <ol className="mt-3 space-y-2">
            {approach.dryRun.map((step, i) => (
              <li
                key={i}
                className="flex gap-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400"
              >
                <span className="font-mono font-semibold text-sky-700 tabular-nums dark:text-sky-400">
                  {i + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h4 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
            Line-by-Line Logic
          </h4>
          <div className="mt-3 space-y-3">
            {approach.lineByLine.map((note, i) => (
              <div
                key={i}
                className="border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0 dark:border-slate-800"
              >
                <code className="block font-mono text-xs font-medium text-slate-900 dark:text-slate-200">
                  {note.lines}
                </code>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {note.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
