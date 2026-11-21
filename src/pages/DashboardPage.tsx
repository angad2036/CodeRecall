import { ArrowRight, BookOpen, CheckCircle2, Flame, Layers } from 'lucide-react';
import { DSA_PROBLEMS } from '../data/problems';
import {
  DSA_CATEGORIES,
  type DsaCategory,
  type ProblemProgress,
} from '../types/dsa';
import { DifficultyText, ProblemStatusIndicator } from '../components/StatusLabel';

interface DashboardPageProps {
  progressMap: Record<string, ProblemProgress>;
  streakDays: number;
  isAuthenticated: boolean;
  displayName?: string;
  onOpenProblem: (problemId: string) => void;
  onOpenLibrary: (category?: DsaCategory) => void;
}

export function DashboardPage({
  progressMap,
  streakDays,
  isAuthenticated,
  displayName,
  onOpenProblem,
  onOpenLibrary,
}: DashboardPageProps) {
  const totalCount = DSA_PROBLEMS.length;
  const solvedCount = DSA_PROBLEMS.filter((p) => {
    const status = progressMap[p.id]?.status;
    return status === 'solved' || status === 'mastered';
  }).length;
  const masteredCount = DSA_PROBLEMS.filter(
    (p) => progressMap[p.id]?.status === 'mastered',
  ).length;
  const inProgressCount = DSA_PROBLEMS.filter(
    (p) => progressMap[p.id]?.status === 'attempted',
  ).length;
  const coveragePct = Math.round((solvedCount / totalCount) * 100);

  // Pick next unstarted or attempted problems as recommended path
  const nextUp = DSA_PROBLEMS.filter((p) => {
    const s = progressMap[p.id]?.status ?? 'unstarted';
    return s === 'attempted' || s === 'unstarted';
  }).slice(0, 4);

  const recommended = nextUp.length > 0 ? nextUp : DSA_PROBLEMS.slice(0, 4);
  const primaryNext = recommended[0];

  return (
    <div className="space-y-10">
      {/* Editorial Hero */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:p-10 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-medium text-sky-700 dark:text-sky-400">
              {isAuthenticated && displayName
                ? `Welcome back, ${displayName}`
                : 'Structured DSA Mastery Studio'}
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 text-balance sm:text-4xl dark:text-slate-50">
              Understand the logic. Master the algorithm.
            </h1>
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
              Practice 30 foundational problems across 9 core data structures and
              algorithmic patterns. Step through live visualizations, listen to
              guided explanations, and compare brute-force to optimal code.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {primaryNext && (
              <button
                type="button"
                onClick={() => onOpenProblem(primaryNext.id)}
                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-700 whitespace-nowrap shrink-0"
              >
                <span>
                  {solvedCount === 0
                    ? `Start #${primaryNext.number} ${primaryNext.title}`
                    : `Continue: ${primaryNext.title}`}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenLibrary()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span>Browse All 30 Problems</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4-Column KPI Strip */}
      <section aria-label="Personal progress summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Problems Solved</span>
            <CheckCircle2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-slate-900 tabular-nums dark:text-slate-50">
            {solvedCount} <span className="text-base font-normal text-slate-400">/ {totalCount}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {inProgressCount} currently in progress
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Mastered</span>
            <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-slate-900 tabular-nums dark:text-slate-50">
            {masteredCount} <span className="text-base font-normal text-slate-400">/ {totalCount}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Ready for independent recall
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Active Streak</span>
            <Flame className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-slate-900 tabular-nums dark:text-slate-50">
            {isAuthenticated ? `${streakDays} ${streakDays === 1 ? 'day' : 'days'}` : 'Guest'}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {isAuthenticated
              ? 'Synced via Firebase Auth'
              : 'Sign in with Google to track streak'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Curriculum Coverage</span>
            <Layers className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-slate-900 tabular-nums dark:text-slate-50">
            {coveragePct}%
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-sky-600 transition-[width] duration-300 dark:bg-sky-400"
              style={{ width: `${coveragePct}%` }}
            />
          </div>
        </div>
      </section>

      {/* Category Mastery + Recommended Next */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Category Mastery Breakdown */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
                Category Mastery
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Select any topic to filter the problem library
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenLibrary()}
              className="text-xs font-medium text-sky-700 hover:underline whitespace-nowrap shrink-0 dark:text-sky-400"
            >
              View full library
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {DSA_CATEGORIES.map((cat) => {
              const catProblems = DSA_PROBLEMS.filter((p) => p.category === cat);
              const catSolved = catProblems.filter((p) => {
                const s = progressMap[p.id]?.status;
                return s === 'solved' || s === 'mastered';
              }).length;
              const pct =
                catProblems.length > 0
                  ? Math.round((catSolved / catProblems.length) * 100)
                  : 0;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onOpenLibrary(cat)}
                  className="group flex w-full items-center justify-between gap-4 py-3 text-left transition-colors hover:bg-slate-50/80 px-2 rounded-lg dark:hover:bg-slate-800/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-900 group-hover:text-sky-700 dark:text-slate-100 dark:group-hover:text-sky-400">
                        {cat}
                      </span>
                      <span className="font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
                        {catSolved} / {catProblems.length} solved
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full bg-emerald-600 transition-[width] duration-300 dark:bg-emerald-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Recommended Practice Queue */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
              Recommended Next
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Structured sequence from fundamentals to advanced patterns
            </p>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {recommended.map((prob) => {
              const status = progressMap[prob.id]?.status ?? 'unstarted';
              return (
                <button
                  key={prob.id}
                  type="button"
                  onClick={() => onOpenProblem(prob.id)}
                  className="group flex w-full flex-col gap-1.5 py-3.5 px-2 text-left transition-colors hover:bg-slate-50/80 rounded-lg dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-sm font-semibold text-slate-900 group-hover:text-sky-700 truncate dark:text-slate-100 dark:group-hover:text-sky-400">
                      {prob.number}. {prob.title}
                    </span>
                    <ProblemStatusIndicator status={status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{prob.category}</span>
                    <span aria-hidden="true">·</span>
                    <DifficultyText difficulty={prob.difficulty} />
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{prob.estimatedMinutes} min</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1 dark:text-slate-400">
                    {prob.pattern}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
