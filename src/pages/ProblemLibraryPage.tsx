import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { DSA_PROBLEMS } from '../data/problems';
import {
  DSA_CATEGORIES,
  type Difficulty,
  type DsaCategory,
  type ProblemProgress,
  type ProblemStatus,
} from '../types/dsa';
import { DifficultyText, ProblemStatusIndicator } from '../components/StatusLabel';

interface ProblemLibraryPageProps {
  progressMap: Record<string, ProblemProgress>;
  initialCategory?: DsaCategory | 'All';
  onOpenProblem: (problemId: string) => void;
}

const DIFFICULTIES: (Difficulty | 'All')[] = [
  'All',
  'Beginner',
  'Intermediate',
  'Advanced',
];

const STATUSES: { id: ProblemStatus | 'All'; label: string }[] = [
  { id: 'All', label: 'All Status' },
  { id: 'unstarted', label: 'Unstarted' },
  { id: 'attempted', label: 'In Progress' },
  { id: 'solved', label: 'Solved' },
  { id: 'mastered', label: 'Mastered' },
];

export function ProblemLibraryPage({
  progressMap,
  initialCategory = 'All',
  onOpenProblem,
}: ProblemLibraryPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DsaCategory | 'All'>(
    initialCategory,
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'All'>(
    'All',
  );
  const [selectedStatus, setSelectedStatus] = useState<ProblemStatus | 'All'>(
    'All',
  );

  const filteredProblems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return DSA_PROBLEMS.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      if (selectedDifficulty !== 'All' && p.difficulty !== selectedDifficulty) {
        return false;
      }
      const status = progressMap[p.id]?.status ?? 'unstarted';
      if (selectedStatus !== 'All' && status !== selectedStatus) {
        return false;
      }
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.pattern.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        String(p.number) === q
      );
    });
  }, [
    searchQuery,
    selectedCategory,
    selectedDifficulty,
    selectedStatus,
    progressMap,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setSelectedStatus('All');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Problem Library
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            30 curated DSA problems organized from beginner fundamentals to
            advanced graph and DP patterns.
          </p>
        </div>
        <div className="font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
          Showing {filteredProblems.length} of {DSA_PROBLEMS.length} problems
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by problem name, number, or pattern..."
              aria-label="Search problems"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-sm text-slate-900 outline-none transition-colors focus:border-sky-600 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Difficulty Segmented Filter */}
            <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                    selectedDifficulty === diff
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Status Segmented Filter */}
            <select
              aria-label="Filter by completion status"
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as ProblemStatus | 'All')
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-sky-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              {STATUSES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
              selectedCategory === 'All'
                ? 'bg-slate-900 text-white dark:bg-sky-600'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            All Categories
          </button>
          {DSA_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-sky-600'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* High-Density Curriculum Table */}
      {filteredProblems.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            No matching problems
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Try clearing your search query or switching category and difficulty
            filters.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-sky-700"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <th className="py-3 pl-5 pr-3 w-14">#</th>
                <th className="py-3 px-3">Problem &amp; Pattern</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Difficulty</th>
                <th className="py-3 px-3 text-right">Est. Time</th>
                <th className="py-3 pl-3 pr-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProblems.map((prob) => {
                const status = progressMap[prob.id]?.status ?? 'unstarted';
                return (
                  <tr
                    key={prob.id}
                    onClick={() => onOpenProblem(prob.id)}
                    className="group cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="py-3.5 pl-5 pr-3 font-mono text-xs text-slate-400 tabular-nums">
                      {String(prob.number).padStart(2, '0')}
                    </td>
                    <td className="py-3.5 px-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenProblem(prob.id);
                        }}
                        className="text-left font-display text-sm font-semibold text-slate-900 group-hover:text-sky-700 dark:text-slate-100 dark:group-hover:text-sky-400"
                      >
                        {prob.title}
                      </button>
                      <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {prob.pattern}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-600 whitespace-nowrap dark:text-slate-300">
                      {prob.category}
                    </td>
                    <td className="py-3.5 px-3">
                      <DifficultyText difficulty={prob.difficulty} />
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-xs text-slate-500 tabular-nums whitespace-nowrap dark:text-slate-400">
                      {prob.estimatedMinutes} min
                    </td>
                    <td className="py-3.5 pl-3 pr-5 text-right">
                      <div className="flex justify-end">
                        <ProblemStatusIndicator status={status} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
