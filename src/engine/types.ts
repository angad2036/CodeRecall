import type { ProgrammingLanguage, VisEdge, VisNode } from '../types/dsa';

export interface ExecutionVariable {
  name: string;
  value: string;
  changed?: boolean;
  tone?: 'neutral' | 'active' | 'positive' | 'warning';
}

export interface TeachingNotes {
  happening: string;
  whyLine: string;
  condition: string;
  memoryChange: string;
  whatNext: string;
}

export type VisualMode =
  | 'array'
  | 'bars'
  | 'water-container'
  | 'string'
  | 'two-pointers'
  | 'sliding-window'
  | 'hash-buckets'
  | 'linked-list'
  | 'tree'
  | 'graph'
  | 'grid'
  | 'dp-1d'
  | 'binary-search';

export interface AuxEntry {
  key: string;
  value: string;
  highlight?: 'default' | 'active' | 'match';
}

export interface TraceVisualState {
  mode: VisualMode;
  arrayValues?: (string | number)[];
  arrayItemIds?: string[];
  arrayLabel?: string;
  secondaryArrayLabel?: string;
  secondaryArrayValues?: (string | number)[];
  pointers?: Record<string, number>;
  activeIndices?: number[];
  matchedIndices?: number[];
  discardedIndices?: number[];
  swapPair?: [number, number];
  compareIndices?: [number, number];
  searchBounds?: [number, number];
  operationBadge?: string;
  windowRange?: [number, number];
  waterArea?: {
    left: number;
    right: number;
    height: number;
    area: number;
  };
  dpLabels?: string[];
  auxTitle?: string;
  auxKind?:
    | 'hashmap'
    | 'hashset'
    | 'buckets'
    | 'queue'
    | 'deque'
    | 'heap'
    | 'stack'
    | 'tails'
    | 'distances';
  auxEntries?: AuxEntry[];
  nodes?: VisNode[];
  edges?: VisEdge[];
  nodePointers?: Record<string, string>;
  callStack?: string[];
  dpGrid?: (string | number)[][];
  dpHighlight?: [number, number];
  resultBadge?: string;
}

export interface TraceStep {
  stepIndex: number;
  phase: string;
  title: string;
  activeLine: Record<ProgrammingLanguage, number>;
  codeNote?: string;
  teaching: TeachingNotes;
  variables: ExecutionVariable[];
  visual: TraceVisualState;
}

export interface ExecutionPreset {
  id: string;
  label: string;
  summary: string;
  inputs?: Record<string, string>;
}

export interface CustomInputField {
  key: string;
  label: string;
  placeholder: string;
  helper: string;
}

export interface CustomInputSpec {
  fields: CustomInputField[];
  defaultValues: Record<string, string>;
}

export interface ProblemExecutionBundle {
  problemId: string;
  presets: ExecutionPreset[];
  activePresetId: string;
  customSpec?: CustomInputSpec;
  steps: TraceStep[];
  inputError?: string;
}

export type VideoSceneId =
  | 'intro'
  | 'io'
  | 'intuition'
  | 'algorithm'
  | 'dry-run'
  | 'code'
  | 'complexity'
  | 'recap';

export interface SubtitleCue {
  startSec: number;
  endSec: number;
  text: string;
}

export interface VideoScene {
  index: number;
  id: VideoSceneId;
  label: string;
  title: string;
  durationSeconds: number;
  narration: string;
  subtitleCues: SubtitleCue[];
  keyCallout: string;
  dryRunFrames: TraceStep[];
  blueprintSteps?: string[];
  complexityData?: {
    bruteTime: string;
    bruteSpace: string;
    optTime: string;
    optSpace: string;
    insight: string;
  };
  recapBullets?: string[];
}
