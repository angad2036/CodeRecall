import { CheckCircle2, Circle, CircleDot, Award } from 'lucide-react';
import type { Difficulty, ProblemStatus } from '../types/dsa';

export function ProblemStatusIndicator({ status }: { status: ProblemStatus }) {
  switch (status) {
    case 'mastered':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
          <Award className="h-3.5 w-3.5 shrink-0" />
          <span>Mastered</span>
        </span>
      );
    case 'solved':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 dark:text-sky-400 whitespace-nowrap">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span>Solved</span>
        </span>
      );
    case 'attempted':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 whitespace-nowrap">
          <CircleDot className="h-3.5 w-3.5 shrink-0" />
          <span>In Progress</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
          <Circle className="h-3.5 w-3.5 shrink-0" />
          <span>Unstarted</span>
        </span>
      );
  }
}

export function DifficultyText({ difficulty }: { difficulty: Difficulty }) {
  const colorClass =
    difficulty === 'Beginner'
      ? 'text-emerald-700 dark:text-emerald-400'
      : difficulty === 'Intermediate'
        ? 'text-amber-700 dark:text-amber-400'
        : 'text-rose-700 dark:text-rose-400';

  return (
    <span className={`text-xs font-medium whitespace-nowrap ${colorClass}`}>
      {difficulty}
    </span>
  );
}
