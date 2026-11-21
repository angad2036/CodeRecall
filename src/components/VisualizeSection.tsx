import { useState } from 'react';
import type { DsaProblem, ProgrammingLanguage } from '../types/dsa';
import { TWO_SUM_SORTED_PROBLEM } from '../engine/baseVisualizations';
import {
  VisualizationEngine,
  VisualizationEngineProvider,
} from './visualizer/VisualizationEngine';

interface VisualizeSectionProps {
  problem: DsaProblem;
  language?: ProgrammingLanguage;
  onLanguageChange?: (lang: ProgrammingLanguage) => void;
}

export function VisualizeSection({
  problem,
  language,
  onLanguageChange,
}: VisualizeSectionProps) {
  const [twoSumVariant, setTwoSumVariant] = useState<'hashmap' | 'swap-pointers'>(
    'hashmap',
  );

  const activeProblem =
    problem.id === 'two-sum' && twoSumVariant === 'swap-pointers'
      ? TWO_SUM_SORTED_PROBLEM
      : problem;

  return (
    <div className="space-y-4">
      {problem.id === 'two-sum' && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Execution Strategy:
          </span>
          <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setTwoSumVariant('hashmap')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                twoSumVariant === 'hashmap'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              HashMap Lookup · O(n)
            </button>
            <button
              type="button"
              onClick={() => setTwoSumVariant('swap-pointers')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                twoSumVariant === 'swap-pointers'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Array Swap-Sort + Two Pointers
            </button>
          </div>
        </div>
      )}

      <VisualizationEngineProvider
        problem={activeProblem}
        language={language}
        onLanguageChange={onLanguageChange}
      >
        <VisualizationEngine />
      </VisualizationEngineProvider>
    </div>
  );
}
