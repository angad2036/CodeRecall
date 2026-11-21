import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Captions,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { DsaProblem, ProgrammingLanguage } from '../types/dsa';
import { buildVideoStoryboard } from '../engine/videoStoryboard';
import { SceneCanvas } from './video/SceneCanvas';

interface ExplainSectionProps {
  problem: DsaProblem;
  language?: ProgrammingLanguage;
}

type VoiceEngine = 'gemini' | 'browser' | 'muted';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ExplainSection({
  problem,
  language = 'python',
}: ExplainSectionProps) {
  const scenes = useMemo(() => buildVideoStoryboard(problem), [problem]);
  const totalSeconds = useMemo(
    () => scenes.reduce((sum, s) => sum + s.durationSeconds, 0),
    [scenes],
  );

  const [sceneIdx, setSceneIdx] = useState(0);
  const [sceneElapsed, setSceneElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [voiceEngine, setVoiceEngine] = useState<VoiceEngine>('gemini');
  const [ttsNotice, setTtsNotice] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const speechSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  const currentScene = scenes[sceneIdx] ?? scenes[0];

  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current = null;
    }
    if (speechSupported) {
      window.speechSynthesis.cancel();
    }
  };

  // Check health on mount to know if GEMINI_API_KEY is configured
  useEffect(() => {
    let active = true;
    fetch('/api/health')
      .then((r) => r.json())
      .then((data: { ttsConfigured?: boolean }) => {
        if (!active) return;
        if (data && data.ttsConfigured === false) {
          setTtsNotice(
            'Gemini AI Voice requires GEMINI_API_KEY in Settings > Secrets. Using Browser Voice or switch anytime.',
          );
          setVoiceEngine((prev) => (prev === 'gemini' ? 'browser' : prev));
        }
      })
      .catch(() => {
        // Ignore transient network check errors
      });
    return () => {
      active = false;
    };
  }, []);

  // Reset when problem changes
  useEffect(() => {
    stopAllAudio();
    setSceneIdx(0);
    setSceneElapsed(0);
    setIsPlaying(false);
    return () => stopAllAudio();
  }, [problem.id]);

  // Fetch & play Gemini TTS audio or Browser Speech when playing
  useEffect(() => {
    stopAllAudio();
    if (!isPlaying || !currentScene || voiceEngine === 'muted') {
      setAudioLoading(false);
      return;
    }

    if (voiceEngine === 'browser') {
      if (!speechSupported) return;
      const utt = new SpeechSynthesisUtterance(currentScene.narration);
      utt.rate = rate;
      window.speechSynthesis.speak(utt);
      return () => {
        window.speechSynthesis.cancel();
      };
    }

    // voiceEngine === 'gemini'
    let cancelled = false;
    const cacheKey = `${problem.id}::${currentScene.id}`;

    const playDataUrl = (dataUrl: string) => {
      if (cancelled) return;
      const audio = new Audio(dataUrl);
      audio.playbackRate = rate;
      audioRef.current = audio;
      audio.onended = () => {
        if (cancelled) return;
        if (sceneIdx < scenes.length - 1) {
          setSceneIdx((idx) => idx + 1);
          setSceneElapsed(0);
        } else {
          setIsPlaying(false);
        }
      };
      void audio.play().catch(() => {
        // Autoplay restriction or decode issue
      });
    };

    const cachedUrl = audioCacheRef.current.get(cacheKey);
    if (cachedUrl) {
      setAudioLoading(false);
      playDataUrl(cachedUrl);
    } else {
      setAudioLoading(true);
      fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentScene.narration }),
      })
        .then(async (res) => {
          const body = (await res.json()) as {
            audioBase64?: string;
            mimeType?: string;
            error?: string;
          };
          if (!res.ok || !body.audioBase64) {
            throw new Error(body.error || 'Gemini TTS failed.');
          }
          const url = `data:${body.mimeType || 'audio/wav'};base64,${body.audioBase64}`;
          audioCacheRef.current.set(cacheKey, url);
          setTtsNotice(null);
          if (!cancelled) {
            setAudioLoading(false);
            playDataUrl(url);
          }
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          setAudioLoading(false);
          const msg =
            err instanceof Error ? err.message : 'Unable to reach Gemini TTS.';
          setTtsNotice(msg);
          setVoiceEngine(speechSupported ? 'browser' : 'muted');
        });
    }

    // Pre-fetch next scene audio quietly
    const nextScene = scenes[sceneIdx + 1];
    if (nextScene) {
      const nextKey = `${problem.id}::${nextScene.id}`;
      if (!audioCacheRef.current.has(nextKey)) {
        fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: nextScene.narration }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((body: { audioBase64?: string; mimeType?: string } | null) => {
            if (body?.audioBase64) {
              audioCacheRef.current.set(
                nextKey,
                `data:${body.mimeType || 'audio/wav'};base64,${body.audioBase64}`,
              );
            }
          })
          .catch(() => {
            // Silent prefetch ignore
          });
      }
    }

    return () => {
      cancelled = true;
      stopAllAudio();
    };
  }, [isPlaying, voiceEngine, sceneIdx, problem.id, currentScene?.id]);

  // Adjust playbackRate dynamically while Gemini audio is playing
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, [rate]);

  // Smooth elapsed timer driving visual animations & subtitles
  useEffect(() => {
    if (!isPlaying || !currentScene) return;
    const id = window.setInterval(() => {
      setSceneElapsed((prev) => {
        const audioPos = audioRef.current?.currentTime;
        if (
          voiceEngine === 'gemini' &&
          audioRef.current &&
          typeof audioPos === 'number' &&
          audioRef.current.duration > 0
        ) {
          const scaled =
            (audioPos / audioRef.current.duration) * currentScene.durationSeconds;
          return Math.min(currentScene.durationSeconds, scaled);
        }
        const next = prev + 0.2 * rate;
        if (next >= currentScene.durationSeconds) {
          if (sceneIdx < scenes.length - 1) {
            setSceneIdx((idx) => idx + 1);
            return 0;
          }
          setIsPlaying(false);
          return currentScene.durationSeconds;
        }
        return next;
      });
    }, 200);
    return () => window.clearInterval(id);
  }, [isPlaying, sceneIdx, scenes.length, currentScene, rate, voiceEngine]);

  if (!currentScene) return null;

  const elapsedPrior = scenes
    .slice(0, sceneIdx)
    .reduce((sum, s) => sum + s.durationSeconds, 0);
  const totalElapsed = Math.min(totalSeconds, elapsedPrior + sceneElapsed);

  return (
    <div className="space-y-4">
      {/* Notice if Gemini TTS unavailable */}
      {ttsNotice && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
          <span>{ttsNotice}</span>
          {speechSupported && voiceEngine !== 'browser' && (
            <button
              type="button"
              onClick={() => setVoiceEngine('browser')}
              className="rounded-md bg-amber-900 px-2.5 py-1 text-[11px] font-medium text-white dark:bg-amber-500 dark:text-slate-950"
            >
              Switch to Browser Voice
            </button>
          )}
        </div>
      )}

      {/* Cinema Transport Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={sceneIdx === 0}
            onClick={() => {
              setSceneIdx((i) => Math.max(0, i - 1));
              setSceneElapsed(0);
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <SkipBack className="h-3.5 w-3.5" />
            <span>Prev</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (
                sceneIdx === scenes.length - 1 &&
                sceneElapsed >= currentScene.durationSeconds
              ) {
                setSceneIdx(0);
                setSceneElapsed(0);
              }
              setIsPlaying((p) => !p);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-sky-700 whitespace-nowrap"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>
              {audioLoading
                ? 'Synthesizing Voice...'
                : isPlaying
                  ? 'Pause Lesson'
                  : 'Play Animated Lesson'}
            </span>
          </button>

          <button
            type="button"
            disabled={sceneIdx >= scenes.length - 1}
            onClick={() => {
              setSceneIdx((i) => Math.min(scenes.length - 1, i + 1));
              setSceneElapsed(0);
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <span>Next</span>
            <SkipForward className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              stopAllAudio();
              setIsPlaying(false);
              setSceneIdx(0);
              setSceneElapsed(0);
            }}
            aria-label="Restart video lesson"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-xs text-slate-600 tabular-nums dark:text-slate-400">
            {formatDuration(totalElapsed)} / {formatDuration(totalSeconds)}
          </span>

          {/* Audio Source Switcher */}
          <div className="inline-flex items-center gap-0.5 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {[
              { id: 'gemini' as VoiceEngine, label: 'AI Voice' },
              { id: 'browser' as VoiceEngine, label: 'Browser' },
              { id: 'muted' as VoiceEngine, label: 'Mute' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                disabled={opt.id === 'browser' && !speechSupported}
                onClick={() => setVoiceEngine(opt.id)}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium whitespace-nowrap transition-colors disabled:opacity-40 ${
                  voiceEngine === opt.id
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {opt.id === 'muted' ? (
                  <VolumeX className="h-3 w-3" />
                ) : (
                  <Volume2 className="h-3 w-3" />
                )}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Captions Toggle */}
          <button
            type="button"
            onClick={() => setShowSubtitles((s) => !s)}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
              showSubtitles
                ? 'border-sky-600 bg-sky-50 text-sky-800 dark:border-sky-400 dark:bg-sky-950/60 dark:text-sky-300'
                : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'
            }`}
          >
            <Captions className="h-3.5 w-3.5" />
            <span>CC</span>
          </button>

          {/* Speed */}
          <div className="inline-flex items-center gap-0.5 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {[0.85, 1, 1.25].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRate(r)}
                className={`rounded-md px-2 py-1 font-mono text-[11px] font-medium ${
                  rate === r
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {r}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Animated Cinema Viewport */}
      <SceneCanvas
        problem={problem}
        scene={currentScene}
        sceneElapsedSec={sceneElapsed}
        language={language}
        showSubtitles={showSubtitles}
      />

      {/* 8-Scene Interactive Storyboard Strip */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {scenes.map((scene, idx) => {
          const isActive = idx === sceneIdx;
          const isCompleted = idx < sceneIdx;
          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => {
                setSceneIdx(idx);
                setSceneElapsed(0);
              }}
              className={`rounded-xl border p-3 text-left transition-colors ${
                isActive
                  ? 'border-sky-600 bg-sky-50/70 dark:border-sky-400 dark:bg-sky-950/40'
                  : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-mono font-medium">{scene.label}</span>
                <span className="font-mono tabular-nums">
                  {formatDuration(scene.durationSeconds)}
                </span>
              </div>
              <div className="mt-1 truncate font-display text-xs font-semibold text-slate-900 dark:text-slate-100">
                {scene.title}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
