import type { TraceStep } from '../../engine/types';

interface VariableInspectorPanelProps {
  step: TraceStep;
}

export function VariableInspectorPanel({ step }: VariableInspectorPanelProps) {
  const { teaching, variables } = step;

  const teachingCards = [
    { label: 'What is happening?', body: teaching.happening },
    { label: 'Why this line executes', body: teaching.whyLine },
    { label: 'Current condition', body: teaching.condition },
    { label: 'Memory & data structure change', body: teaching.memoryChange },
    { label: 'What happens next', body: teaching.whatNext },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Live Variable Inspector */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-950">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Variable Inspector
          </div>
        </div>

        <dl className="divide-y divide-slate-100 px-3.5 py-1 dark:divide-slate-800">
          {variables.map((v) => {
            const valTone =
              v.tone === 'positive'
                ? 'text-emerald-700 dark:text-emerald-400'
                : v.tone === 'warning'
                  ? 'text-amber-700 dark:text-amber-400'
                  : v.tone === 'active'
                    ? 'text-sky-700 dark:text-sky-400'
                    : 'text-slate-900 dark:text-slate-100';

            return (
              <div
                key={v.name}
                className={`flex items-center justify-between gap-2 py-2 ${
                  v.changed ? 'bg-sky-50/60 -mx-2 px-2 rounded-md dark:bg-sky-950/30' : ''
                }`}
              >
                <dt className="flex items-center gap-1.5 font-mono text-xs text-slate-600 dark:text-slate-400">
                  <span>{v.name}</span>
                  {v.changed && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
                      updated
                    </span>
                  )}
                </dt>
                <dd
                  className={`max-w-[60%] truncate font-mono text-xs font-semibold tabular-nums ${valTone}`}
                  title={v.value}
                >
                  {v.value}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      {/* 5-Part Step Teaching Explanation */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-950">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Step-by-Step Teaching Guide
          </div>
        </div>

        <div className="divide-y divide-slate-100 px-3.5 py-1 dark:divide-slate-800">
          {teachingCards.map((item) => (
            <div key={item.label} className="py-2.5">
              <div className="font-display text-[11px] font-semibold text-slate-900 dark:text-slate-100">
                {item.label}
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
