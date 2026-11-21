import type { DsaProblem, ProgrammingLanguage, SolutionApproach } from '../types/dsa';
import type { ExecutionVariable, TraceStep } from './types';

export function getOptimalApproach(problem: DsaProblem): SolutionApproach {
  return (
    problem.approaches.find((a) => a.tier === 'Optimal') ??
    problem.approaches[problem.approaches.length - 1]
  );
}

export function findLine(
  code: string,
  matcher: string | RegExp,
  fallback = 1,
): number {
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (typeof matcher === 'string') {
      if (line.includes(matcher)) return i + 1;
    } else if (matcher.test(line)) {
      return i + 1;
    }
  }
  return fallback;
}

export function resolveLines(
  problem: DsaProblem,
  matchers: Record<ProgrammingLanguage, string | RegExp>,
  fallback: Record<ProgrammingLanguage, number> = { python: 1, java: 1, cpp: 1 },
): Record<ProgrammingLanguage, number> {
  const opt = getOptimalApproach(problem);
  return {
    python: findLine(opt.code.python, matchers.python, fallback.python),
    java: findLine(opt.code.java, matchers.java, fallback.java),
    cpp: findLine(opt.code.cpp, matchers.cpp, fallback.cpp),
  };
}

export class TraceBuilder {
  private steps: TraceStep[] = [];
  private prevVars = new Map<string, string>();
  private problem: DsaProblem;

  constructor(problem: DsaProblem) {
    this.problem = problem;
  }

  push(
    config: Omit<TraceStep, 'stepIndex' | 'activeLine' | 'variables'> & {
      lines: Record<ProgrammingLanguage, string | RegExp>;
      vars: Array<{
        name: string;
        value: string | number | boolean;
        tone?: ExecutionVariable['tone'];
      }>;
    },
  ): void {
    const activeLine = resolveLines(this.problem, config.lines);
    const nextVars: ExecutionVariable[] = config.vars.map((v) => {
      const strVal = String(v.value);
      const prev = this.prevVars.get(v.name);
      const changed = prev !== undefined && prev !== strVal;
      return {
        name: v.name,
        value: strVal,
        changed,
        tone: v.tone ?? (changed ? 'active' : 'neutral'),
      };
    });

    this.prevVars = new Map(nextVars.map((v) => [v.name, v.value]));

    this.steps.push({
      stepIndex: this.steps.length,
      phase: config.phase,
      title: config.title,
      activeLine,
      codeNote: config.codeNote,
      teaching: config.teaching,
      variables: nextVars,
      visual: config.visual,
    });
  }

  build(): TraceStep[] {
    return this.steps;
  }
}

export function parseIntArray(raw: string, minLen = 1, maxLen = 12): number[] | null {
  const cleaned = raw.replace(/[\[\]]/g, '').trim();
  if (!cleaned) return null;
  const parts = cleaned
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length < minLen || parts.length > maxLen) return null;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isFinite(n) || !Number.isInteger(n))) return null;
  return nums;
}

export function parseStringList(raw: string, minLen = 1, maxLen = 10): string[] | null {
  const cleaned = raw.replace(/[\[\]"']/g, '').trim();
  if (!cleaned) return null;
  const parts = cleaned
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length < minLen || parts.length > maxLen) return null;
  return parts;
}

export function createArrayItemIds(length: number, prefix = 'el'): string[] {
  return Array.from({ length }, (_, idx) => `${prefix}-${idx}`);
}

export function swapArraySnapshot<T>(
  arr: T[],
  ids: string[],
  i: number,
  j: number,
): { values: T[]; itemIds: string[] } {
  const nextVals = [...arr];
  const nextIds = [...ids];
  if (
    i >= 0 &&
    j >= 0 &&
    i < nextVals.length &&
    j < nextVals.length &&
    i !== j
  ) {
    [nextVals[i], nextVals[j]] = [nextVals[j], nextVals[i]];
    [nextIds[i], nextIds[j]] = [nextIds[j], nextIds[i]];
  }
  return { values: nextVals, itemIds: nextIds };
}
