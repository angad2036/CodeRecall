import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Code2,
  Eye,
  Lightbulb,
  PlayCircle,
} from 'lucide-react';
import { DSA_PROBLEMS } from '../data/problems';
import type {
  DsaProblem,
  ProblemProgress,
  ProblemStatus,
  ProgrammingLanguage,
} from '../types/dsa';
import { DifficultyText } from '../components/StatusLabel';
import { SolveSection } from '../components/SolveSection';
import { VisualizeSection } from '../components/VisualizeSection';
import { ExplainSection } from '../components/ExplainSection';
import { SolutionsSection } from '../components/SolutionsSection';

interface ProblemDetailPageProps {
  problem: DsaProblem;
  progress?: ProblemProgress;
  savingProblemId: string | null;
  isAuthenticated: boolean;
  defaultLanguage: ProgrammingLanguage;
  onBackToLibrary: () => void;
  onSelectProblem: (problemId: string) => void;
  onSavePractice: (
    problemId: string,
    updates: {
      status?: ProblemStatus;
      preferredLanguage?: ProgrammingLanguage;
      codeJava?: string;
      codeCpp?: string;
      codePython?: string;
      notes?: string;
    },
  ) => Promise<void>;
}

type DetailTab = 'solve' | 'visualize' | 'explain' | 'solutions';

const STATUS_OPTIONS: { id: ProblemStatus; label: string }[] = [
  { id: 'unstarted', label: 'Unstarted' },
  { id: 'attempted', label: 'In Progress' },
  { id: 'solved', label: 'Solved' },
  { id: 'mastered', label: 'Mastered' },
];

export function ProblemDetailPage({
  problem,
  progress,
  savingProblemId,
  isAuthenticated,
  defaultLanguage,
  onBackToLibrary,
  onSelectProblem,
  onSavePractice,
}: ProblemDetailPageProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('solve');
  const [language, setLanguage] = useState<ProgrammingLanguage>(
    progress?.preferredLanguage ?? defaultLanguage,
  );
  const [codeByLang, setCodeByLang] = useState<Record<ProgrammingLanguage, string>>({
    python: progress?.codePython || problem.starterCode.python,
    java: progress?.codeJava || problem.starterCode.java,
    cpp: progress?.codeCpp || problem.starterCode.cpp,
  });
  const [notes, setNotes] = useState(progress?.notes ?? '');
  const [showHint, setShowHint] = useState(false);
  const [showBriefInStudio, setShowBriefInStudio] = useState(false);

  // Sync editor buffers when switching problem or loading saved progress
  useEffect(() => {
    setLanguage(progress?.preferredLanguage ?? defaultLanguage);
    setCodeByLang({
      python: progress?.codePython || problem.starterCode.python,
      java: progress?.codeJava || problem.starterCode.java,
      cpp: progress?.codeCpp || problem.starterCode.cpp,
    });
    setNotes(progress?.notes ?? '');
    setShowHint(false);
  }, [problem.id, progress?.updatedAt]);

  const currentIdx = DSA_PROBLEMS.findIndex((p) => p.id === problem.id);
  const prevProblem = currentIdx > 0 ? DSA_PROBLEMS[currentIdx - 1] : undefined;
  const nextProblem =
    currentIdx >= 0 && currentIdx < DSA_PROBLEMS.length - 1
      ? DSA_PROBLEMS[currentIdx + 1]
      : undefined;

  const currentStatus: ProblemStatus = progress?.status ?? 'unstarted';
  const isStudioTab = activeTab === 'visualize' || activeTab === 'explain';

  const handleStatusChange = async (nextStatus: ProblemStatus) => {
    await onSavePractice(problem.id, {
      status: nextStatus,
      preferredLanguage: language,
      codeJava: codeByLang.java,
      codeCpp: codeByLang.cpp,
      codePython: codeByLang.python,
      notes,
    });
  };

  const handleSaveAll = async () => {
    await onSavePractice(problem.id, {
      status: currentStatus === 'unstarted' ? 'attempted' : currentStatus,
      preferredLanguage: language,
      codeJava: codeByLang.java,
      codeCpp: codeByLang.cpp,
      codePython: codeByLang.python,
      notes,
    });
  };

  const handleLoadSolutionToSolve = (code: string, lang: ProgrammingLanguage) => {
    setLanguage(lang);
    setCodeByLang((prev) => ({ ...prev, [lang]: code }));
    setActiveTab('solve');
  };

  const tabs: { id: DetailTab; label: string; icon: typeof Code2 }[] = [
    { id: 'solve', label: 'Solve', icon: Code2 },
    { id: 'visualize', label: 'Visualize', icon: Eye },
    { id: 'explain', label: 'Explain', icon: PlayCircle },
    { id: 'solutions', label: 'Solutions', icon: BookOpen },
  ];

  const showBriefPanel = !isStudioTab || showBriefInStudio;

  return (
    <div className="space-y-6">
      {/* Contextual Breadcrumb & Neighbor Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={onBackToLibrary}
            className="inline-flex items-center gap-1.5 font-medium text-slate-700 hover:text-sky-700 dark:text-slate-300 dark:hover:text-sky-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Problems</span>
          </button>
          <span aria-hidden="true">/</span>
          <span>{problem.category}</span>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            #{problem.number} {problem.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isStudioTab && (
            <button
              type="button"
              onClick={() => setShowBriefInStudio((v) => !v)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              {showBriefInStudio ? 'Hide Problem Brief' : 'Show Problem Brief'}
            </button>
          )}
          <button
            type="button"
            disabled={!prevProblem}
            onClick={() => prevProblem && onSelectProblem(prevProblem.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap shrink-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Prev</span>
          </button>
          <button
            type="button"
            disabled={!nextProblem}
            onClick={() => nextProblem && onSelectProblem(nextProblem.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap shrink-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <span>Next</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Split / Studio Workspace */}
      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        {/* Problem Brief & Notes */}
        {showBriefPanel && (
          <section
            className={`space-y-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 ${
              isStudioTab ? 'lg:col-span-12' : 'lg:col-span-5'
            }`}
          >
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono tabular-nums">
                  #{String(problem.number).padStart(2, '0')}
                </span>
                <span aria-hidden="true">·</span>
                <span>{problem.category}</span>
                <span aria-hidden="true">·</span>
                <DifficultyText difficulty={problem.difficulty} />
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {problem.estimatedMinutes} min
                </span>
              </div>

              <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 text-balance dark:text-slate-50">
                {problem.title}
              </h1>
              <p className="mt-1 text-xs font-medium text-sky-700 dark:text-sky-400">
                Pattern: {problem.pattern}
              </p>
            </div>

            {/* Mastery Status Control */}
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Your Progress Status
              </div>
              <div className="grid grid-cols-4 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => void handleStatusChange(opt.id)}
                    className={`rounded-md px-2 py-1.5 text-[11px] font-medium whitespace-nowrap transition-colors ${
                      currentStatus === opt.id
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Statement */}
            <div className="space-y-2 border-t border-slate-100 pt-5 dark:border-slate-800">
              <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                Problem Statement
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {problem.statement}
              </p>
            </div>

            {/* Examples */}
            <div className="space-y-3">
              <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                Examples
              </h2>
              <div className={isStudioTab ? 'grid gap-3 md:grid-cols-2' : 'space-y-3'}>
                {problem.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="font-mono text-slate-800 dark:text-slate-200">
                      <span className="text-slate-500">Input: </span>
                      {ex.input}
                    </div>
                    <div className="mt-1 font-mono text-slate-800 dark:text-slate-200">
                      <span className="text-slate-500">Output: </span>
                      {ex.output}
                    </div>
                    <p className="mt-1.5 text-slate-600 dark:text-slate-400">
                      {ex.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Constraints */}
            <div className="space-y-2">
              <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                Constraints
              </h2>
              <ul className="space-y-1 font-mono text-xs text-slate-600 dark:text-slate-400">
                {problem.constraints.map((c, i) => (
                  <li key={i}>• {c}</li>
                ))}
              </ul>
            </div>

            {/* Core Insight Reveal */}
            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowHint((h) => !h)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 hover:underline dark:text-sky-400"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                <span>{showHint ? 'Hide Core Logic Hint' : 'Reveal Core Logic Hint'}</span>
              </button>
              {showHint && (
                <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                  {problem.coreIdea}
                </p>
              )}
            </div>

            {/* Personal Invariant Notes */}
            <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="recall-notes"
                  className="font-display text-xs font-semibold text-slate-900 dark:text-slate-100"
                >
                  Personal Logic Notes
                </label>
                <button
                  type="button"
                  onClick={() => void handleSaveAll()}
                  className="text-xs font-medium text-sky-700 hover:underline dark:text-sky-400"
                >
                  Save notes
                </button>
              </div>
              <textarea
                id="recall-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write down the invariant or edge case you want to remember for recall..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-800 outline-none focus:border-sky-600 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              />
            </div>
          </section>
        )}

        {/* Right / Full-Width Interactive Workbench */}
        <section
          className={`rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 ${
            isStudioTab ? 'lg:col-span-12' : 'lg:col-span-7'
          }`}
        >
          {/* Studio Header Strip when full-width */}
          {isStudioTab && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
                  #{String(problem.number).padStart(2, '0')}
                </span>
                <h1 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50">
                  {problem.title}
                </h1>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                  ·
                </span>
                <DifficultyText difficulty={problem.difficulty} />
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                  ·
                </span>
                <span className="text-xs font-medium text-sky-700 dark:text-sky-400">
                  {problem.pattern}
                </span>
              </div>
            </div>
          )}

          {/* Section Switcher Tabs */}
          <div
            role="tablist"
            aria-label="Problem learning sections"
            className="mb-6 grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeTab === 'solve' && (
            <SolveSection
              problem={problem}
              progress={progress}
              language={language}
              code={codeByLang[language]}
              onLanguageChange={setLanguage}
              onCodeChange={(next) =>
                setCodeByLang((prev) => ({ ...prev, [language]: next }))
              }
              onSave={handleSaveAll}
              isSaving={savingProblemId === problem.id}
              isAuthenticated={isAuthenticated}
            />
          )}

          {activeTab === 'visualize' && (
            <VisualizeSection
              problem={problem}
              language={language}
              onLanguageChange={setLanguage}
            />
          )}

          {activeTab === 'explain' && (
            <ExplainSection problem={problem} language={language} />
          )}

          {activeTab === 'solutions' && (
            <SolutionsSection
              problem={problem}
              language={language}
              onLanguageChange={setLanguage}
              onLoadIntoEditor={handleLoadSolutionToSolve}
            />
          )}
        </section>
      </div>
    </div>
  );
}
