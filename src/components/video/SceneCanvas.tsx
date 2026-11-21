import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import type { DsaProblem, ProgrammingLanguage } from '../../types/dsa';
import type { TraceStep, VideoScene } from '../../engine/types';
import { getOptimalApproach } from '../../engine/traceHelpers';
import { LiveAlgorithmStage } from '../visualizer/LiveAlgorithmStage';

interface SceneCanvasProps {
  problem: DsaProblem;
  scene: VideoScene;
  sceneElapsedSec: number;
  language: ProgrammingLanguage;
  showSubtitles: boolean;
}

function getActiveSubtitle(scene: VideoScene, elapsedSec: number): string {
  const cue = scene.subtitleCues.find(
    (c) => elapsedSec >= c.startSec && elapsedSec <= c.endSec,
  );
  return cue?.text ?? scene.subtitleCues[scene.subtitleCues.length - 1]?.text ?? '';
}

function getActiveDryRunFrame(scene: VideoScene, elapsedSec: number): TraceStep | undefined {
  const frames = scene.dryRunFrames;
  if (!frames || frames.length === 0) return undefined;
  if (frames.length === 1) return frames[0];
  const progress = Math.min(0.999, Math.max(0, elapsedSec / Math.max(1, scene.durationSeconds)));
  const idx = Math.floor(progress * frames.length);
  return frames[idx] ?? frames[0];
}

function ComplexityChart({
  bruteTime,
  optTime,
}: {
  bruteTime: string;
  optTime: string;
}) {
  return (
    <svg
      viewBox="0 0 320 155"
      className="h-40 w-full max-w-sm"
      role="img"
      aria-label="Time complexity comparison curve"
    >
      <line x1="32" y1="130" x2="300" y2="130" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1.5" />
      <line x1="32" y1="16" x2="32" y2="130" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1.5" />

      {/* Brute force steep curve */}
      <motion.path
        d="M 32 128 Q 160 120 276 20"
        fill="none"
        stroke="currentColor"
        className="text-amber-500"
        strokeWidth="3"
        strokeDasharray="6 4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      />
      {/* Optimal flat/linear curve */}
      <motion.path
        d="M 32 128 L 288 86"
        fill="none"
        stroke="currentColor"
        className="text-emerald-500"
        strokeWidth="3.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, delay: 0.2, ease: 'easeOut' }}
      />

      <text x="210" y="26" className="fill-amber-600 font-mono text-[10px] font-semibold dark:fill-amber-400">
        Brute: {bruteTime}
      </text>
      <text x="200" y="76" className="fill-emerald-600 font-mono text-[10px] font-semibold dark:fill-emerald-400">
        Optimal: {optTime}
      </text>
      <text x="160" y="146" textAnchor="middle" className="fill-slate-400 font-mono text-[10px]">
        Input size n →
      </text>
    </svg>
  );
}

export function SceneCanvas({
  problem,
  scene,
  sceneElapsedSec,
  language,
  showSubtitles,
}: SceneCanvasProps) {
  const optimal = getOptimalApproach(problem);
  const subtitle = getActiveSubtitle(scene, sceneElapsedSec);
  const activeFrame = getActiveDryRunFrame(scene, sceneElapsedSec);
  const progressPct = Math.min(
    100,
    Math.max(0, (sceneElapsedSec / Math.max(1, scene.durationSeconds)) * 100),
  );

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-sky-50/40 shadow-sm dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Top Stage Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 bg-white/80 px-5 py-3 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-950/70">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono font-semibold text-sky-700 tabular-nums dark:text-sky-400">
            Scene {scene.index + 1}/8
          </span>
          <span aria-hidden="true" className="text-slate-400">
            ·
          </span>
          <span className="font-display font-semibold text-slate-900 dark:text-slate-100">
            {scene.title}
          </span>
        </div>

        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {scene.keyCallout}
        </span>
      </div>

      {/* Main 16:9 Cinema Stage */}
      <div className="relative min-h-[390px] px-5 pt-5 pb-20 sm:px-8 sm:pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mx-auto max-w-4xl"
          >
            {scene.id === 'intro' && (
              <div className="space-y-5 py-4 text-center">
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 dark:text-sky-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>
                    Problem #{problem.number} · {problem.category} · {problem.difficulty}
                  </span>
                </div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                  {problem.title}
                </h2>
                <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {problem.statement}
                </p>
                <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white/90 px-4 py-3 font-mono text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200">
                  Target Pattern: <span className="font-semibold text-sky-700 dark:text-sky-400">{problem.pattern}</span>
                </div>
              </div>
            )}

            {scene.id === 'io' && (
              <div className="space-y-4 py-2">
                <div className="grid gap-4 md:grid-cols-2">
                  {problem.examples.slice(0, 2).map((ex, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: i === 0 ? -12 : 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                        Example {i + 1}
                      </div>
                      <div className="mt-2 rounded-lg bg-slate-50 p-2.5 font-mono text-xs text-slate-800 dark:bg-slate-950 dark:text-slate-200">
                        <div>
                          <span className="text-slate-400">Input: </span>
                          {ex.input}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                          <ArrowRight className="h-3 w-3 shrink-0" />
                          <span>Output: {ex.output}</span>
                        </div>
                      </div>
                      <p className="mt-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        {ex.explanation}
                      </p>
                    </motion.div>
                  ))}
                </div>
                {activeFrame && <LiveAlgorithmStage step={activeFrame} />}
              </div>
            )}

            {scene.id === 'intuition' && (
              <div className="space-y-4 py-1">
                <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 text-center dark:border-sky-900/60 dark:bg-sky-950/30">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                    Core Mental Model
                  </div>
                  <p className="mt-1.5 font-display text-base font-semibold text-slate-900 dark:text-white">
                    {problem.coreIdea}
                  </p>
                </div>
                {activeFrame && <LiveAlgorithmStage step={activeFrame} />}
              </div>
            )}

            {scene.id === 'algorithm' && (
              <div className="space-y-3 py-2">
                {(scene.blueprintSteps ?? []).map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.14 }}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-sky-600 font-mono text-xs font-bold text-white tabular-nums">
                      {idx + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                      {item}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}

            {scene.id === 'dry-run' && activeFrame && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    Frame {scene.dryRunFrames.indexOf(activeFrame) + 1} of{' '}
                    {scene.dryRunFrames.length}
                  </span>
                  <span className="font-mono text-sky-700 dark:text-sky-400">
                    {activeFrame.teaching.happening}
                  </span>
                </div>
                <LiveAlgorithmStage step={activeFrame} />
              </div>
            )}

            {scene.id === 'code' && activeFrame && (
              <div className="grid gap-4 md:grid-cols-12 md:items-start">
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 md:col-span-6">
                  <div className="border-b border-slate-800 px-3 py-2 font-mono text-[11px] text-slate-400">
                    Optimal ({language.toUpperCase()}) · Active Line{' '}
                    {activeFrame.activeLine[language]}
                  </div>
                  <div className="max-h-72 overflow-auto py-1.5 font-mono text-[11px] leading-relaxed">
                    {optimal.code[language].split('\n').map((line, i) => {
                      const ln = i + 1;
                      const isActive = ln === activeFrame.activeLine[language];
                      return (
                        <div
                          key={ln}
                          className={`flex gap-2 px-3 py-0.5 ${
                            isActive
                              ? 'border-l-2 border-sky-400 bg-sky-500/20 text-white'
                              : 'border-l-2 border-transparent text-slate-400'
                          }`}
                        >
                          <span className="w-5 shrink-0 text-right text-slate-600 tabular-nums">
                            {ln}
                          </span>
                          <pre className="whitespace-pre-wrap break-words font-mono">
                            {line || ' '}
                          </pre>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="md:col-span-6">
                  <LiveAlgorithmStage step={activeFrame} />
                </div>
              </div>
            )}

            {scene.id === 'complexity' && scene.complexityData && (
              <div className="grid gap-5 py-2 md:grid-cols-12 md:items-center">
                <div className="flex justify-center rounded-xl border border-slate-200 bg-white p-4 md:col-span-5 dark:border-slate-800 dark:bg-slate-900">
                  <ComplexityChart
                    bruteTime={scene.complexityData.bruteTime}
                    optTime={scene.complexityData.optTime}
                  />
                </div>
                <div className="space-y-3 md:col-span-7">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                      <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                        Brute Force
                      </div>
                      <div className="mt-1 font-mono text-base font-bold text-slate-900 dark:text-white">
                        {scene.complexityData.bruteTime}
                      </div>
                      <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
                        Space: {scene.complexityData.bruteSpace}
                      </div>
                    </div>
                    <div className="rounded-xl border border-emerald-500/40 bg-emerald-50/70 p-4 dark:border-emerald-500/40 dark:bg-emerald-950/30">
                      <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                        Optimal ({problem.pattern})
                      </div>
                      <div className="mt-1 font-mono text-base font-bold text-slate-900 dark:text-white">
                        {scene.complexityData.optTime}
                      </div>
                      <div className="font-mono text-xs text-slate-600 dark:text-slate-300">
                        Space: {scene.complexityData.optSpace}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    {scene.complexityData.insight}
                  </div>
                </div>
              </div>
            )}

            {scene.id === 'recap' && (
              <div className="space-y-3 py-2">
                {(scene.recapBullets ?? []).map((bullet, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.12 }}
                    className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-sm text-slate-800 dark:text-slate-200">{bullet}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Synchronized Subtitles Scrim */}
        {showSubtitles && subtitle && (
          <div className="pointer-events-none absolute inset-x-4 bottom-4 flex justify-center">
            <div className="max-w-2xl rounded-xl bg-slate-950/88 px-4 py-2 text-center text-xs leading-relaxed text-white shadow-lg backdrop-blur-xs sm:text-sm">
              {subtitle}
            </div>
          </div>
        )}
      </div>

      {/* Scene Progress Line */}
      <div className="h-1 w-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full bg-sky-600 transition-[width] duration-150 dark:bg-sky-400"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
