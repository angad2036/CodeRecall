import { PROBLEMS_BATCH_1 } from './problemsBatch1';
import { PROBLEMS_BATCH_2 } from './problemsBatch2';
import { PROBLEMS_BATCH_3 } from './problemsBatch3';
import type { DsaProblem } from '../types/dsa';

export const DSA_PROBLEMS: DsaProblem[] = [
  ...PROBLEMS_BATCH_1,
  ...PROBLEMS_BATCH_2,
  ...PROBLEMS_BATCH_3,
];

export function getProblemById(id: string): DsaProblem | undefined {
  return DSA_PROBLEMS.find((p) => p.id === id);
}
