import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import {
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
} from 'lucide-react';
import type { DsaProblem, ProgrammingLanguage, SolutionApproach } from '../../types/dsa';
import { buildProblemExecution } from '../../engine/executionEngine';
import { getOptimalApproach } from '../../engine/traceHelpers';
import type { ProblemExecutionBundle, TraceStep } from '../../engine/types';
import { CodeExecutionPanel } from './CodeExecutionPanel';
import { LiveAlgorithmStage } from './LiveAlgorithmStage';
import { VariableInspectorPanel } from './VariableInspectorPanel';

export const VISUALIZATION_SPEED_OPTIONS = [
  { label: '0.5x', ms: 2200 },
  { label: '1x', ms: 1350 },
  { label: '1.5x', ms: 900 },
  { label: '2x', ms: 550 },
] as const;

export interface VisualizationEngineContextValue {
  problem: DsaProblem;
  optimalApproach: SolutionApproach;
  bundle: ProblemExecutionBundle;
  steps: TraceStep[];
  stepIndex: number;
  totalSteps: number;
  currentStep: TraceStep | undefined;
  isPlaying: boolean;
  speedMs: number;
  language: ProgrammingLanguage;
  presetId: string | undefined;
  customActive: boolean;
  showCustomForm: boolean;
  draftInputs: Record<string, string>;
  canStepPrev: boolean;
  canStepNext: boolean;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  reset: () => void;
  setSpeedMs: (ms: number) => void;
  setLanguage: (lang: ProgrammingLanguage) => void;
  selectPreset: (id: string) => void;
  toggleCustomForm: () => void;
  setDraftInput: (key: string, value: string) => void;
  runCustomInputs: (inputs?: Record<string, string>) => void;
}

const VisualizationEngineContext = createContext<
  VisualizationEngineContextValue | undefined
>(undefined);

export interface VisualizationEngineProviderProps {
  problem: DsaProblem;
  language?: ProgrammingLanguage;
  onLanguageChange?: (lang: ProgrammingLanguage) => void;
  initialSpeedMs?: number;
  children: ReactNode;
}

export function VisualizationEngineProvider({
  problem,
  language: externalLang,
  onLanguageChange,
  initialSpeedMs = 1350,
  children,
}: VisualizationEngineProviderProps) {
  const [internalLang, setInternalLang] = useState<ProgrammingLanguage>('python');
  const language = externalLang ?? internalLang;
  const setLanguage = useCallback(
    (lang: ProgrammingLanguage) => {
      if (onLanguageChange) onLanguageChange(lang);
      else setInternalLang(lang);
    },
    [onLanguageChange],
  );

  const [presetId, setPresetId] = useState<string | undefined>(undefined);
  const [customActive, setCustomActive] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [draftInputs, setDraftInputs] = useState<Record<string, string>>({});
  const [appliedInputs, setAppliedInputs] = useState<
    Record<string, string> | undefined
  >(undefined);

  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(initialSpeedMs);

  const bundle = useMemo(
    () =>
      buildProblemExecution(
        problem,
        presetId,
        customActive ? appliedInputs : undefined,
      ),
    [problem, presetId, customActive, appliedInputs],
  );

  const optimalApproach = useMemo(() => getOptimalApproach(problem), [problem]);

  useEffect(() => {
    setPresetId(undefined);
    setCustomActive(false);
    setAppliedInputs(undefined);
    setShowCustomForm(false);
    setStepIndex(0);
    setIsPlaying(false);
    const initialBundle = buildProblemExecution(problem);
    setDraftInputs(initialBundle.customSpec?.defaultValues ?? {});
  }, [problem]);

  useEffect(() => {
    if (!isPlaying) return;
    if (stepIndex >= bundle.steps.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setStepIndex((prev) => Math.min(prev + 1, bundle.steps.length - 1));
    }, speedMs);
    return () => window.clearTimeout(timer);
  }, [isPlaying, stepIndex, bundle.steps.length, speedMs]);

  const totalSteps = bundle.steps.length;
  const currentStep = bundle.steps[stepIndex] ?? bundle.steps[0];
  const canStepPrev = stepIndex > 0;
  const canStepNext = stepIndex < totalSteps - 1;

  const play = useCallback(() => {
    if (stepIndex >= totalSteps - 1) setStepIndex(0);
    setIsPlaying(true);
  }, [stepIndex, totalSteps]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      if (!prev && stepIndex >= totalSteps - 1) {
        setStepIndex(0);
      }
      return !prev;
    });
  }, [stepIndex, totalSteps]);

  const nextStep = useCallback(() => {
    setIsPlaying(false);
    setStepIndex((prev) => Math.min(Math.max(0, totalSteps - 1), prev + 1));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setIsPlaying(false);
    setStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToStep = useCallback(
    (index: number) => {
      setIsPlaying(false);
      const clamped = Math.max(0, Math.min(Math.max(0, totalSteps - 1), index));
      setStepIndex(clamped);
    },
    [totalSteps],
  );

  const reset = useCallback(() => {
    setIsPlaying(false);
    setStepIndex(0);
  }, []);

  const selectPreset = useCallback((id: string) => {
    setPresetId(id);
    setCustomActive(false);
    setAppliedInputs(undefined);
    setStepIndex(0);
    setIsPlaying(false);
  }, []);

  const toggleCustomForm = useCallback(() => {
    setShowCustomForm((prev) => !prev);
  }, []);

  const setDraftInput = useCallback((key: string, value: string) => {
    setDraftInputs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const runCustomInputs = useCallback(
    (overrideInputs?: Record<string, string>) => {
      setAppliedInputs({ ...(overrideInputs ?? draftInputs) });
      setCustomActive(true);
      setStepIndex(0);
      setIsPlaying(false);
    },
    [draftInputs],
  );

  const value: VisualizationEngineContextValue = {
    problem,
    optimalApproach,
    bundle,
    steps: bundle.steps,
    stepIndex,
    totalSteps,
    currentStep,
    isPlaying,
    speedMs,
    language,
    presetId,
    customActive,
    showCustomForm,
    draftInputs,
    canStepPrev,
    canStepNext,
    play,
    pause,
    togglePlay,
    nextStep,
    prevStep,
    goToStep,
    reset,
    setSpeedMs,
    setLanguage,
    selectPreset,
    toggleCustomForm,
    setDraftInput,
    runCustomInputs,
  };

  return (
    <VisualizationEngineContext.Provider value={value}>
      {children}
    </VisualizationEngineContext.Provider>
  );
}

export function useVisualizationEngine(): VisualizationEngineContextValue {
  const ctx = useContext(VisualizationEngineContext);
  if (!ctx) {
    throw new Error(
      'useVisualizationEngine must be used inside a <VisualizationEngineProvider>.',
    );
  }
  return ctx;
}

export function VisualizationInputBar() {
  const {
    bundle,
    customActive,
    showCustomForm,
    draftInputs,
    selectPreset,
    toggleCustomForm,
    setDraftInput,
    runCustomInputs,
  } = useVisualizationEngine();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    runCustomInputs();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            Trace Input:
          </span>
          {bundle.presets.map((preset) => {
            const active = !customActive && bundle.activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => selectPreset(preset.id)}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'border-sky-600 bg-sky-600 text-white dark:border-sky-500 dark:bg-sky-500 dark:text-slate-950'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {bundle.customSpec && (
          <button
            type="button"
            onClick={toggleCustomForm}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              showCustomForm || customActive
                ? 'border-sky-600 bg-sky-50 text-sky-800 dark:border-sky-400 dark:bg-sky-950/60 dark:text-sky-300'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>{showCustomForm ? 'Hide Custom Input' : 'Custom Input'}</span>
          </button>
        )}
      </div>

      {showCustomForm && bundle.customSpec && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {bundle.customSpec.fields.map((field) => (
              <label key={field.key} className="block space-y-1">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {field.label}
                </span>
                <input
                  type="text"
                  value={draftInputs[field.key] ?? ''}
                  onChange={(e) => setDraftInput(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-900 outline-none focus:border-sky-600 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                  {field.helper}
                </span>
              </label>
            ))}
            <div className="flex items-end">
              <button
                type="submit"
                className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-700 whitespace-nowrap"
              >
                Run Trace
              </button>
            </div>
          </div>

          {bundle.inputError && (
            <p className="mt-2.5 text-xs font-medium text-amber-700 dark:text-amber-400">
              {bundle.inputError}
            </p>
          )}
        </form>
      )}
    </div>
  );
}

export function VisualizationControls() {
  const {
    stepIndex,
    totalSteps,
    isPlaying,
    speedMs,
    canStepPrev,
    canStepNext,
    togglePlay,
    prevStep,
    nextStep,
    goToStep,
    reset,
    setSpeedMs,
  } = useVisualizationEngine();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!canStepPrev}
          onClick={prevStep}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <SkipBack className="h-3.5 w-3.5" />
          <span>Prev</span>
        </button>
        <button
          type="button"
          onClick={togglePlay}
          className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-sky-700 whitespace-nowrap"
        >
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          <span>{isPlaying ? 'Pause' : 'Play'}</span>
        </button>
        <button
          type="button"
          disabled={!canStepNext}
          onClick={nextStep}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <span>Next</span>
          <SkipForward className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="flex min-w-[180px] flex-1 items-center gap-3 px-2">
        <input
          type="range"
          aria-label="Execution step scrubber"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={stepIndex}
          onChange={(e) => goToStep(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer accent-sky-600"
        />
        <span className="shrink-0 font-mono text-xs text-slate-600 tabular-nums dark:text-slate-400">
          Step {stepIndex + 1} / {totalSteps}
        </span>
      </div>

      <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
        {VISUALIZATION_SPEED_OPTIONS.map((sp) => (
          <button
            key={sp.label}
            type="button"
            onClick={() => setSpeedMs(sp.ms)}
            className={`rounded-md px-2 py-1 font-mono text-[11px] font-medium whitespace-nowrap transition-colors ${
              speedMs === sp.ms
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            {sp.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function VisualizationCodeSync() {
  const { optimalApproach, language, setLanguage, currentStep } =
    useVisualizationEngine();
  if (!currentStep) return null;
  return (
    <CodeExecutionPanel
      codeByLang={optimalApproach.code}
      language={language}
      onLanguageChange={setLanguage}
      step={currentStep}
      approachTitle={optimalApproach.title}
    />
  );
}

export function VisualizationStage() {
  const { currentStep } = useVisualizationEngine();
  if (!currentStep) return null;
  return <LiveAlgorithmStage step={currentStep} />;
}

export function VisualizationInspector() {
  const { currentStep } = useVisualizationEngine();
  if (!currentStep) return null;
  return <VariableInspectorPanel step={currentStep} />;
}

export function VisualizationEngine() {
  const { currentStep } = useVisualizationEngine();
  if (!currentStep) return null;

  return (
    <div className="space-y-4">
      <VisualizationInputBar />
      <VisualizationControls />
      <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-4">
          <VisualizationCodeSync />
        </div>
        <div className="lg:col-span-5">
          <VisualizationStage />
        </div>
        <div className="lg:col-span-3">
          <VisualizationInspector />
        </div>
      </div>
    </div>
  );
}
