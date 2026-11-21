import { useEffect, useState } from 'react';
import { Check, Copy, RotateCcw, Save } from 'lucide-react';
import type { DsaProblem, ProblemProgress, ProgrammingLanguage } from '../types/dsa';

interface SolveSectionProps {
  problem: DsaProblem;
  progress?: ProblemProgress;
  language: ProgrammingLanguage;
  code: string;
  onLanguageChange: (lang: ProgrammingLanguage) => void;
  onCodeChange: (code: string) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  isAuthenticated: boolean;
}

const LANG_LABELS: { id: ProgrammingLanguage; label: string }[] = [
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
];

export function SolveSection({
  problem,
  progress,
  language,
  code,
  onLanguageChange,
  onCodeChange,
  onSave,
  isSaving,
  isAuthenticated,
}: SolveSectionProps) {
  const [copied, setCopied] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setJustSaved(false);
  }, [problem.id, language]);

  const lines = code.split('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleReset = () => {
    onCodeChange(problem.starterCode[language]);
  };

  const handleSaveClick = async () => {
    await onSave();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const updated = `${code.slice(0, start)}    ${code.slice(end)}`;
      onCodeChange(updated);
      requestAnimationFrame(() => {
        target.selectionStart = start + 4;
        target.selectionEnd = start + 4;
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
        <div
          role="tablist"
          aria-label="Programming language"
          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800"
        >
          {LANG_LABELS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={language === item.id}
              onClick={() => onLanguageChange(item.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                language === item.id
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void handleSaveClick()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-60 whitespace-nowrap shrink-0"
          >
            {justSaved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            <span>{isSaving ? 'Saving...' : justSaved ? 'Saved' : 'Save Code'}</span>
          </button>
        </div>
      </div>

      {/* Line-Numbered Code Surface */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-slate-800">
        <div className="flex max-h-[420px] min-h-[320px] overflow-auto">
          <div
            aria-hidden="true"
            className="select-none border-r border-slate-800 bg-slate-900/70 px-3 py-4 text-right font-mono text-xs leading-6 text-slate-500 tabular-nums"
          >
            {lines.map((_, idx) => (
              <div key={idx}>{idx + 1}</div>
            ))}
          </div>
          <textarea
            aria-label={`${language} code editor for ${problem.title}`}
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className="code-editor w-full resize-none bg-transparent p-4 font-mono text-xs leading-6 text-slate-100 outline-none placeholder:text-slate-600"
            rows={Math.max(14, lines.length + 2)}
          />
        </div>
      </div>

      {/* Transparent Runtime Integration Note */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        <p className="font-medium text-slate-800 dark:text-slate-200">
          Workspace persistence &amp; execution scope
        </p>
        <p className="mt-1">
          {isAuthenticated
            ? 'Your Python, Java, and C++ drafts sync directly to your Firebase Firestore profile.'
            : 'Drafts are saved locally in this browser. Sign in with Google in the top bar to sync progress across devices.'}{' '}
          Compiling and executing arbitrary Java, C++, and Python code against hidden test suites requires an external sandbox runtime (such as Judge0 or Piston) and is kept intentionally decoupled from fake client-side results.
        </p>
        {Boolean(progress?.lastPracticedAt) && (
          <p className="mt-1.5 text-slate-500 dark:text-slate-400">
            Current status: <span className="font-medium text-slate-700 dark:text-slate-200">{progress?.status}</span>
          </p>
        )}
      </div>
    </div>
  );
}
