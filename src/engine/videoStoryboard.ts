import type { DsaProblem } from '../types/dsa';
import { buildProblemExecution } from './executionEngine';
import { getOptimalApproach } from './traceHelpers';
import type { SubtitleCue, TraceStep, VideoScene } from './types';

function splitIntoSubtitleCues(narration: string, durationSeconds: number): SubtitleCue[] {
  const rawSentences = narration
    .split(/(?<=[.!?])\s+|\s*\.\.\.\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  const sentences = rawSentences.length > 0 ? rawSentences : [narration];
  const totalChars = sentences.reduce((acc, s) => acc + s.length + 12, 0);

  let cursor = 0;
  return sentences.map((sentence, idx) => {
    const weight = (sentence.length + 12) / totalChars;
    const span =
      idx === sentences.length - 1
        ? Math.max(1.5, durationSeconds - cursor)
        : Math.max(1.8, Number((durationSeconds * weight).toFixed(2)));
    const cue: SubtitleCue = {
      startSec: Number(cursor.toFixed(2)),
      endSec: Number(Math.min(durationSeconds, cursor + span).toFixed(2)),
      text: sentence,
    };
    cursor += span;
    return cue;
  });
}

function estimateDuration(text: string, minSec = 11, maxSec = 24): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  const sec = Math.round((words / 2.25) + 2.5);
  return Math.max(minSec, Math.min(maxSec, sec));
}

function selectKeyDryRunFrames(steps: TraceStep[], maxFrames = 6): TraceStep[] {
  if (steps.length <= maxFrames) return steps;
  const selected: TraceStep[] = [steps[0]];
  const innerCount = maxFrames - 2;
  for (let i = 1; i <= innerCount; i++) {
    const idx = Math.round((i / (innerCount + 1)) * (steps.length - 1));
    if (!selected.some((s) => s.stepIndex === steps[idx].stepIndex)) {
      selected.push(steps[idx]);
    }
  }
  const last = steps[steps.length - 1];
  if (selected[selected.length - 1].stepIndex !== last.stepIndex) {
    selected.push(last);
  }
  return selected;
}

export function buildVideoStoryboard(problem: DsaProblem): VideoScene[] {
  const bundle = buildProblemExecution(problem);
  const optimal = getOptimalApproach(problem);
  const brute = problem.approaches[0];
  const ex1 = problem.examples[0];
  const ex2 = problem.examples[1];

  const keyFrames = selectKeyDryRunFrames(bundle.steps, 6);
  const pivotFrame =
    keyFrames[Math.min(1, keyFrames.length - 1)] ?? bundle.steps[0];
  const finalFrame = bundle.steps[bundle.steps.length - 1] ?? bundle.steps[0];

  const introText = `Welcome to CodeRecall. Today we are mastering Problem ${problem.number}: ${problem.title}, a classic ${problem.difficulty} challenge in ${problem.category}. ... ${problem.statement}`;
  const introDur = estimateDuration(introText, 12, 20);

  const ioText = `Let us ground the problem with concrete examples. ... Given ${ex1.input}, the expected output is ${ex1.output}, because ${ex1.explanation}${ex2 ? ` ... Notice also the second case: ${ex2.input} produces ${ex2.output}.` : ''}`;
  const ioDur = estimateDuration(ioText, 13, 22);

  const intuitionChapter = problem.explainChapters[0];
  const intuitionText = `Here is the visual intuition behind ${problem.pattern}. ... ${problem.coreIdea} ... ${intuitionChapter ? intuitionChapter.narration : ''}`;
  const intuitionDur = estimateDuration(intuitionText, 14, 24);

  const blueprintSteps = [
    `Identify invariant: ${problem.pattern}`,
    ...optimal.lineByLine.slice(0, 3).map((l) => `${l.lines} — ${l.explanation}`),
    `Guarantee complexity: ${optimal.timeComplexity} time, ${optimal.spaceComplexity} space`,
  ];

  const algoText = `Let us map out the step-by-step algorithm for ${optimal.title}. ... ${optimal.summary} ... Follow this invariant carefully so edge cases resolve automatically.`;
  const algoDur = estimateDuration(algoText, 13, 21);

  const dryRunSummary = keyFrames
    .slice(0, 4)
    .map((f) => f.teaching.happening)
    .join(' ... ');
  const dryRunText = `Now watch the animated dry run execute live on ${bundle.presets[0]?.label ?? 'our input'}. ... ${dryRunSummary}`;
  const dryRunDur = Math.max(16, Math.min(28, keyFrames.length * 4));

  const codeHighlightsText = optimal.lineByLine
    .slice(0, 3)
    .map((note) => `Notice ${note.lines}: ${note.explanation}`)
    .join(' ... ');
  const codeText = `Let us trace how those visual steps translate directly into clean code. ... ${codeHighlightsText || optimal.summary}`;
  const codeDur = Math.max(14, Math.min(24, estimateDuration(codeText, 14, 24)));

  const complexityChapter = problem.explainChapters[problem.explainChapters.length - 1];
  const complexityText = `Finally, let us compare performance. ... While ${brute.title} runs in ${brute.timeComplexity} time and ${brute.spaceComplexity} space, our optimal ${problem.pattern} reaches ${optimal.timeComplexity} time and ${optimal.spaceComplexity} space. ... ${complexityChapter?.keyTakeaway ?? ''}`;
  const complexityDur = estimateDuration(complexityText, 13, 21);

  const recapBullets = [
    `Pattern: ${problem.pattern}`,
    `Core Rule: ${problem.coreIdea}`,
    ...problem.explainChapters.slice(0, 2).map((ch) => ch.keyTakeaway),
    `Target Complexity: ${optimal.timeComplexity} time | ${optimal.spaceComplexity} space`,
  ];
  const recapText = `Quick final recap to lock ${problem.title} into long-term memory. ... Pattern: ${problem.pattern}. ... ${problem.coreIdea} ... Try reproducing this solution from scratch in Code Recall mode!`;
  const recapDur = estimateDuration(recapText, 12, 18);

  const scenes: Array<Omit<VideoScene, 'subtitleCues'>> = [
    {
      index: 0,
      id: 'intro',
      label: '1. Problem Intro',
      title: problem.title,
      durationSeconds: introDur,
      narration: introText,
      keyCallout: `${problem.category} · ${problem.difficulty} · ${problem.pattern}`,
      dryRunFrames: [bundle.steps[0]],
    },
    {
      index: 1,
      id: 'io',
      label: '2. Input & Output',
      title: 'Understanding Input & Expected Output',
      durationSeconds: ioDur,
      narration: ioText,
      keyCallout: `${ex1.input}  =>  ${ex1.output}`,
      dryRunFrames: [bundle.steps[0], finalFrame],
    },
    {
      index: 2,
      id: 'intuition',
      label: '3. Visual Intuition',
      title: `Visual Intuition: ${problem.pattern}`,
      durationSeconds: intuitionDur,
      narration: intuitionText,
      keyCallout: intuitionChapter?.diagramHighlight ?? problem.coreIdea,
      dryRunFrames: [pivotFrame],
    },
    {
      index: 3,
      id: 'algorithm',
      label: '4. Step-by-Step Plan',
      title: optimal.title,
      durationSeconds: algoDur,
      narration: algoText,
      keyCallout: optimal.summary,
      dryRunFrames: keyFrames,
      blueprintSteps,
    },
    {
      index: 4,
      id: 'dry-run',
      label: '5. Animated Dry Run',
      title: 'Step-by-Step Visual Dry Run',
      durationSeconds: dryRunDur,
      narration: dryRunText,
      keyCallout: `Live simulation across ${bundle.steps.length} execution states`,
      dryRunFrames: keyFrames,
    },
    {
      index: 5,
      id: 'code',
      label: '6. Code Sync Walkthrough',
      title: 'Synchronized Code Execution',
      durationSeconds: codeDur,
      narration: codeText,
      keyCallout: optimal.lineByLine[0]?.lines ?? optimal.title,
      dryRunFrames: keyFrames,
    },
    {
      index: 6,
      id: 'complexity',
      label: '7. Time & Space',
      title: 'Complexity & Tradeoff Analysis',
      durationSeconds: complexityDur,
      narration: complexityText,
      keyCallout: `Optimal: ${optimal.timeComplexity} Time · ${optimal.spaceComplexity} Space`,
      dryRunFrames: [finalFrame],
      complexityData: {
        bruteTime: brute.timeComplexity,
        bruteSpace: brute.spaceComplexity,
        optTime: optimal.timeComplexity,
        optSpace: optimal.spaceComplexity,
        insight: complexityChapter?.keyTakeaway ?? optimal.summary,
      },
    },
    {
      index: 7,
      id: 'recap',
      label: '8. Final Recap',
      title: 'Key Takeaways for Recall',
      durationSeconds: recapDur,
      narration: recapText,
      keyCallout: `Master ${problem.pattern}`,
      dryRunFrames: [finalFrame],
      recapBullets,
    },
  ];

  return scenes.map((scene) => ({
    ...scene,
    subtitleCues: splitIntoSubtitleCues(scene.narration, scene.durationSeconds),
  }));
}
