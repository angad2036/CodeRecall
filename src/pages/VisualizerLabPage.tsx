import { useState } from 'react';
import { ArrowRight, GitCompare, Search, Sparkles } from 'lucide-react';
import { BASE_ENGINE_PROBLEMS } from '../engine/executionEngine';
import { DSA_PROBLEMS } from '../data/problems';
import type { ProgrammingLanguage } from '../types/dsa';
import {
  VisualizationEngine,
  VisualizationEngineProvider,
} from '../components/visualizer/VisualizationEngine';

interface VisualizerLabPageProps {
  defaultLanguage: ProgrammingLanguage;
  onOpenProblem: (problemId: string) => void;
}

const BASE_DESCRIPTORS: Record<
  string,
  {
    subtitle: string;
    primitives: string[];
    icon: typeof Sparkles;
  }
> = {
  'two-sum': {
    subtitle: 'Complement HashMap lookups & O(1) dictionary insertion',
    primitives: ['Index pointer movement', 'HashMap state mutation'],
    icon: Sparkles,
  },
  'two-sum-sorted': {
    subtitle: 'Animated in-place array swaps + converging left/right pointers',
    primitives: ['Array element swapping', 'Two-pointer convergence'],
    icon: GitCompare,
  },
  'binary-search': {
    subtitle: 'Logarithmic halving with low, mid, high pointer tracking',
    primitives: ['Search bounds bracket', 'Midpoint probing & half discard'],
    icon: Search,
  },
};

export function VisualizerLabPage({
  defaultLanguage,
  onOpenProblem,
}: VisualizerLabPageProps) {
  const [selectedId, setSelectedId] = useState<string>(
    BASE_ENGINE_PROBLEMS[2]?.id ?? 'binary-search',
  );
  const [language, setLanguage] = useState<ProgrammingLanguage>(defaultLanguage);

  const activeProblem =
    BASE_ENGINE_PROBLEMS.find((p) => p.id === selectedId) ??
    BASE_ENGINE_PROBLEMS[0];

  const descriptor = BASE_DESCRIPTORS[activeProblem.id];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="text-xs font-medium uppercase tracking-wider text-sky-700 dark:text-sky-400">
              Visualization Engine · Core Foundation
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Interactive Algorithm Foundations
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Explore the foundational step-by-step state machines powering CodeRecall:
              hash lookups, animated array swapping, and pointer-driven search space halving
              for <strong className="font-semibold text-slate-900 dark:text-slate-100">Two Sum</strong> and{' '}
              <strong className="font-semibold text-slate-900 dark:text-slate-100">Binary Search</strong>.
            </p>
          </div>
          {DSA_PROBLEMS.some((p) => p.id === activeProblem.id) && (
            <button
              type="button"
              onClick={() => onOpenProblem(activeProblem.id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <span>Open Full Problem Page</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {BASE_ENGINE_PROBLEMS.map((item) => {
            const isSelected = item.id === activeProblem.id;
            const info = BASE_DESCRIPTORS[item.id];
            const Icon = info?.icon ?? Sparkles;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-sky-600 bg-sky-50/70 dark:border-sky-400 dark:bg-sky-950/40'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/70 dark:border-slate-800 dark:bg-slate-950/50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                    <Icon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    <span>{item.title}</span>
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {info?.subtitle ?? item.coreIdea}
                </p>
                {info?.primitives && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 font-mono text-[10px] text-sky-700 dark:text-sky-300">
                    {info.primitives.map((prim) => (
                      <span
                        key={prim}
                        className="rounded border border-sky-200 bg-white px-1.5 py-0.5 dark:border-sky-900/70 dark:bg-slate-900"
                      >
                        {prim}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {descriptor && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              Core Logic:{' '}
            </span>
            {activeProblem.coreIdea}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <VisualizationEngineProvider
          problem={activeProblem}
          language={language}
          onLanguageChange={setLanguage}
        >
          <VisualizationEngine />
        </VisualizationEngineProvider>
      </section>
    </div>
  );
}
