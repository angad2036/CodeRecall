import { DSA_PROBLEMS } from '../data/problems';
import type { DsaProblem } from '../types/dsa';
import {
  BINARY_SEARCH_PROBLEM,
  BASE_ALGORITHM_GENERATORS,
  TWO_SUM_SORTED_PROBLEM,
} from './baseVisualizations';
import { GENERATORS_BATCH_1, type ProblemGeneratorEntry } from './generatorsBatch1';
import { GENERATORS_BATCH_2 } from './generatorsBatch2';
import { GENERATORS_BATCH_3 } from './generatorsBatch3';
import type { ProblemExecutionBundle } from './types';

const ALL_GENERATORS: Record<string, ProblemGeneratorEntry> = {
  ...GENERATORS_BATCH_1,
  ...GENERATORS_BATCH_2,
  ...GENERATORS_BATCH_3,
  ...BASE_ALGORITHM_GENERATORS,
};

export const BASE_ENGINE_PROBLEMS: DsaProblem[] = [
  DSA_PROBLEMS.find((p) => p.id === 'two-sum')!,
  TWO_SUM_SORTED_PROBLEM,
  BINARY_SEARCH_PROBLEM,
];

export function getEngineProblemById(id: string): DsaProblem | undefined {
  return (
    DSA_PROBLEMS.find((p) => p.id === id) ??
    BASE_ENGINE_PROBLEMS.find((p) => p.id === id)
  );
}

export function buildProblemExecution(
  problem: DsaProblem,
  presetId?: string,
  customInputs?: Record<string, string>,
): ProblemExecutionBundle {
  const entry = ALL_GENERATORS[problem.id];
  if (!entry) {
    throw new Error(`No execution generator registered for problem "${problem.id}".`);
  }

  const presets = entry.presets;
  const activePreset =
    (presetId ? presets.find((p) => p.id === presetId) : undefined) ?? presets[0];

  const effectiveInputs =
    customInputs ?? activePreset?.inputs ?? entry.customSpec?.defaultValues ?? {};

  const { steps, error } = entry.generate(problem, effectiveInputs);

  if (error || steps.length === 0) {
    const fallback = entry.generate(
      problem,
      activePreset?.inputs ?? entry.customSpec?.defaultValues ?? {},
    );
    return {
      problemId: problem.id,
      presets,
      activePresetId: customInputs ? 'custom' : activePreset.id,
      customSpec: entry.customSpec,
      steps: fallback.steps,
      inputError: error ?? 'Could not parse custom input.',
    };
  }

  return {
    problemId: problem.id,
    presets,
    activePresetId: customInputs ? 'custom' : activePreset.id,
    customSpec: entry.customSpec,
    steps,
  };
}
