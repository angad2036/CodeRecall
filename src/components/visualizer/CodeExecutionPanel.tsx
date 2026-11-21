import { useEffect, useRef } from 'react';
import type { ProgrammingLanguage } from '../../types/dsa';
import type { TraceStep } from '../../engine/types';

interface CodeExecutionPanelProps {
  codeByLang: Record<ProgrammingLanguage, string>;
  language: ProgrammingLanguage;
  onLanguageChange: (lang: ProgrammingLanguage) => void;
  step: TraceStep;
  approachTitle: string;
}

const LANG_OPTIONS: { id: ProgrammingLanguage; label: string }[] = [
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
];

export function CodeExecutionPanel({
  codeByLang,
  language,
  onLanguageChange,
  step,
  approachTitle,
}: CodeExecutionPanelProps) {
  const code = codeByLang[language];
  const lines = code.split('\n');
  const activeLine = step.activeLine[language] ?? 1;
  const activeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeLine, language]);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-950">
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Code Execution
          </div>
          <div className="truncate font-display text-xs font-semibold text-slate-900 dark:text-slate-100">
            {approachTitle}
          </div>
        </div>

        <div className="inline-flex items-center gap-0.5 rounded-lg bg-slate-200/70 p-0.5 dark:bg-slate-800">
          {LANG_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onLanguageChange(opt.id)}
              className={`rounded-md px-2 py-1 text-[11px] font-medium whitespace-nowrap transition-colors ${
                language === opt.id
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[430px] overflow-auto bg-slate-950 py-2 font-mono text-[12px] leading-relaxed text-slate-200">
        {lines.map((lineText, idx) => {
          const lineNo = idx + 1;
          const isCurrent = lineNo === activeLine;
          return (
            <div
              key={lineNo}
              ref={isCurrent ? activeRef : undefined}
              className={`flex items-start gap-2.5 px-3 py-0.5 transition-colors duration-150 ${
                isCurrent
                  ? 'border-l-2 border-sky-400 bg-sky-500/15 text-white'
                  : 'border-l-2 border-transparent text-slate-400'
              }`}
            >
              <span
                className={`w-6 shrink-0 select-none text-right text-[11px] tabular-nums ${
                  isCurrent ? 'font-bold text-sky-400' : 'text-slate-600'
                }`}
              >
                {lineNo}
              </span>
              <span className="w-3 shrink-0 select-none text-sky-400">
                {isCurrent ? '▶' : ''}
              </span>
              <pre className="min-w-0 flex-1 whitespace-pre-wrap break-words font-mono">
                {lineText || ' '}
              </pre>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-800 bg-slate-900 px-3.5 py-2 text-[11px] text-slate-300">
        <span className="font-mono text-sky-400 tabular-nums">
          Line {activeLine}
        </span>
        {step.codeNote && (
          <span className="truncate font-mono text-emerald-300">
            {step.codeNote}
          </span>
        )}
      </div>
    </div>
  );
}
