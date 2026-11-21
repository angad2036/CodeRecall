export type ProgrammingLanguage = 'java' | 'cpp' | 'python';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type DsaCategory =
  | 'Arrays'
  | 'Strings'
  | 'Hashing'
  | 'Two Pointers'
  | 'Sliding Window'
  | 'Linked Lists'
  | 'Trees'
  | 'Graphs'
  | 'Dynamic Programming';

export const DSA_CATEGORIES: DsaCategory[] = [
  'Arrays',
  'Strings',
  'Hashing',
  'Two Pointers',
  'Sliding Window',
  'Linked Lists',
  'Trees',
  'Graphs',
  'Dynamic Programming',
];

export type ProblemStatus = 'unstarted' | 'attempted' | 'solved' | 'mastered';

export interface ProblemExample {
  input: string;
  output: string;
  explanation: string;
}

export interface SolutionLineNote {
  lines: string;
  explanation: string;
}

export type ApproachTier = 'Brute Force' | 'Better' | 'Optimal';

export interface SolutionApproach {
  tier: ApproachTier;
  title: string;
  timeComplexity: string;
  spaceComplexity: string;
  summary: string;
  dryRun: string[];
  code: Record<ProgrammingLanguage, string>;
  lineByLine: SolutionLineNote[];
}

export type VisualizerKind = 'array' | 'linked-list' | 'tree' | 'graph' | 'dp';

export interface VisNode {
  id: string;
  label: string;
  x?: number;
  y?: number;
  state?: 'default' | 'active' | 'visited' | 'match' | 'window';
}

export interface VisEdge {
  from: string;
  to: string;
  label?: string;
  active?: boolean;
}

export interface VisualizationStep {
  stepNumber: number;
  title: string;
  description: string;
  arrayValues?: (string | number)[];
  pointers?: Record<string, number>;
  activeIndices?: number[];
  matchedIndices?: number[];
  windowRange?: [number, number];
  auxiliaryLabel?: string;
  auxiliaryItems?: string[];
  dpGrid?: (string | number)[][];
  dpHighlight?: [number, number];
  nodes?: VisNode[];
  edges?: VisEdge[];
  variables: Record<string, string | number>;
}

export interface ExplainChapter {
  id: string;
  title: string;
  durationSeconds: number;
  narration: string;
  keyTakeaway: string;
  diagramHighlight: string;
}

export interface DsaProblem {
  id: string;
  number: number;
  title: string;
  category: DsaCategory;
  difficulty: Difficulty;
  estimatedMinutes: number;
  pattern: string;
  coreIdea: string;
  statement: string;
  examples: ProblemExample[];
  constraints: string[];
  starterCode: Record<ProgrammingLanguage, string>;
  visualizerKind: VisualizerKind;
  visualizationSteps: VisualizationStep[];
  explainChapters: ExplainChapter[];
  approaches: SolutionApproach[];
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  preferredLanguage: ProgrammingLanguage;
  streakDays: number;
  lastActiveDate: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ProblemProgress {
  userId: string;
  problemId: string;
  status: ProblemStatus;
  preferredLanguage: ProgrammingLanguage;
  codeJava?: string;
  codeCpp?: string;
  codePython?: string;
  notes?: string;
  recallAttempts: number;
  recallSuccessCount: number;
  lastRecallAccuracy: number;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewAt?: unknown;
  lastPracticedAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface RecallSession {
  id?: string;
  userId: string;
  problemId: string;
  language: ProgrammingLanguage;
  accuracyPercent: number;
  passed: boolean;
  durationSeconds: number;
  createdAt?: unknown;
}
