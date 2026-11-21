import { ArrowRight } from 'lucide-react';
import { DSA_PROBLEMS } from '../data/problems';
import {
  DSA_CATEGORIES,
  type DsaCategory,
  type ProblemProgress,
} from '../types/dsa';
import { DifficultyText, ProblemStatusIndicator } from '../components/StatusLabel';

interface CategoriesPageProps {
  progressMap: Record<string, ProblemProgress>;
  onOpenProblem: (problemId: string) => void;
  onOpenCategoryInLibrary: (category: DsaCategory) => void;
}

const CATEGORY_BRIEFS: Record<DsaCategory, string> = {
  Arrays: 'Prefix scans, running extrema, Kadane’s algorithm, and complement hashing.',
  Strings: 'Frequency invariants, center expansion palindromes, and canonical signatures.',
  Hashing: 'Constant-time membership, frequency buckets, and sequence start detection.',
  'Two Pointers': 'Opposite-end convergence, duplicate skipping, and greedy wall shrinking.',
  'Sliding Window': 'Variable validity windows and monotonic deque extrema.',
  'Linked Lists': 'In-place pointer rewiring, Floyd’s cycle detection, and k-way merging.',
  Trees: 'Preorder/postorder recursion, BFS level snapshots, and BST interval bounds.',
  Graphs: 'Flood fill, deep cloning with cycle maps, Kahn’s topological sort, and Dijkstra.',
  'Dynamic Programming': 'Rolling 1D state, unbounded coin change, and binary-searched LIS tails.',
};

export function CategoriesPage({
  progressMap,
  onOpenProblem,
  onOpenCategoryInLibrary,
}: CategoriesPageProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          DSA Curriculum by Category
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Explore all 9 algorithmic domains and jump directly into any problem’s
          interactive workbench.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {DSA_CATEGORIES.map((category) => {
          const items = DSA_PROBLEMS.filter((p) => p.category === category);
          const solved = items.filter((p) => {
            const st = progressMap[p.id]?.status;
            return st === 'solved' || st === 'mastered';
          }).length;

          return (
            <section
              key={category}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                    {category}
                  </h2>
                  <span className="font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
                    {solved} / {items.length} solved
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {CATEGORY_BRIEFS[category]}
                </p>

                <div className="mt-4 divide-y divide-slate-100 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-800">
                  {items.map((prob) => {
                    const st = progressMap[prob.id]?.status ?? 'unstarted';
                    return (
                      <button
                        key={prob.id}
                        type="button"
                        onClick={() => onOpenProblem(prob.id)}
                        className="group flex w-full items-center justify-between gap-2 py-2.5 text-left transition-colors hover:text-sky-700 dark:hover:text-sky-400"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-xs font-medium text-slate-800 group-hover:text-sky-700 dark:text-slate-200 dark:group-hover:text-sky-400">
                            {prob.number}. {prob.title}
                          </div>
                          <div className="mt-0.5">
                            <DifficultyText difficulty={prob.difficulty} />
                          </div>
                        </div>
                        <ProblemStatusIndicator status={st} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenCategoryInLibrary(category)}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 hover:underline dark:text-sky-400"
              >
                <span>Filter {category} in library</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </section>
          );
        })}
      </div>
    </div>
  );
}
