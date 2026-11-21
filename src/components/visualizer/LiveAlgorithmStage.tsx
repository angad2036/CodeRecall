import { motion } from 'motion/react';
import type { VisNode } from '../../types/dsa';
import type { AuxEntry, TraceStep, TraceVisualState } from '../../engine/types';

interface LiveAlgorithmStageProps {
  step: TraceStep;
}

function getSvgNodeColors(state?: VisNode['state']) {
  switch (state) {
    case 'match':
      return 'fill-emerald-50 stroke-emerald-600 text-emerald-900 dark:fill-emerald-950/80 dark:stroke-emerald-400 dark:text-emerald-100';
    case 'active':
      return 'fill-sky-50 stroke-sky-600 text-sky-900 dark:fill-sky-950/80 dark:stroke-sky-400 dark:text-sky-100';
    case 'visited':
      return 'fill-slate-100 stroke-slate-400 text-slate-600 dark:fill-slate-800 dark:stroke-slate-600 dark:text-slate-300';
    default:
      return 'fill-white stroke-slate-300 text-slate-800 dark:fill-slate-900 dark:stroke-slate-700 dark:text-slate-100';
  }
}

function AuxStructureCard({
  title,
  entries,
}: {
  title?: string;
  entries?: AuxEntry[];
}) {
  if (!title && (!entries || entries.length === 0)) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-900">
      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
        {title || 'Data Structure State'}
      </div>
      {entries && entries.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {entries.map((entry, idx) => {
            const cls =
              entry.highlight === 'match'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-500/70 dark:bg-emerald-950/50 dark:text-emerald-200'
                : entry.highlight === 'active'
                  ? 'border-sky-500 bg-sky-50 text-sky-900 dark:border-sky-500/70 dark:bg-sky-950/50 dark:text-sky-200'
                  : 'border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200';
            return (
              <motion.div
                key={`${entry.key}-${idx}`}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.18 }}
                className={`rounded-md border px-2 py-1 font-mono text-[11px] ${cls}`}
              >
                <span className="text-slate-500 dark:text-slate-400">{entry.key}: </span>
                <span className="font-semibold">{entry.value}</span>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="mt-1.5 font-mono text-xs text-slate-400 dark:text-slate-500">
          (empty)
        </div>
      )}
    </div>
  );
}

function ArrayBoxes({
  label,
  values,
  itemIds,
  pointers,
  activeIndices,
  matchedIndices,
  discardedIndices,
  swapPair,
  compareIndices,
  searchBounds,
  windowRange,
  dpLabels,
}: {
  label?: string;
  values: (string | number)[];
  itemIds?: string[];
  pointers?: Record<string, number>;
  activeIndices?: number[];
  matchedIndices?: number[];
  discardedIndices?: number[];
  swapPair?: [number, number];
  compareIndices?: [number, number];
  searchBounds?: [number, number];
  windowRange?: [number, number];
  dpLabels?: string[];
}) {
  const pointersByIdx: Record<number, string[]> = {};
  if (pointers) {
    for (const [name, idx] of Object.entries(pointers)) {
      if (!pointersByIdx[idx]) pointersByIdx[idx] = [];
      pointersByIdx[idx].push(name);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {label && (
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {label}
          </div>
        )}
        {searchBounds && (
          <span className="font-mono text-[11px] font-medium text-sky-700 tabular-nums dark:text-sky-400">
            Window [{searchBounds[0]} .. {searchBounds[1]}]
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-end justify-center gap-2 py-2">
        {values.map((val, idx) => {
          const isMatched = matchedIndices?.includes(idx);
          const isSwapped = swapPair && (swapPair[0] === idx || swapPair[1] === idx);
          const isCompared =
            compareIndices && (compareIndices[0] === idx || compareIndices[1] === idx);
          const isActive = activeIndices?.includes(idx);
          const isDiscarded = discardedIndices?.includes(idx);
          const inBounds =
            searchBounds && idx >= searchBounds[0] && idx <= searchBounds[1];
          const inWindow =
            windowRange && idx >= windowRange[0] && idx <= windowRange[1];

          let boxClass =
            'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';
          if (isMatched) {
            boxClass =
              'border-emerald-600 bg-emerald-50 text-emerald-900 dark:border-emerald-400 dark:bg-emerald-950/60 dark:text-emerald-200';
          } else if (isSwapped) {
            boxClass =
              'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-400/35 dark:border-amber-400 dark:bg-amber-950/60 dark:text-amber-100';
          } else if (isActive) {
            boxClass =
              'border-sky-600 bg-sky-50 text-sky-900 dark:border-sky-400 dark:bg-sky-950/60 dark:text-sky-200';
          } else if (isCompared) {
            boxClass =
              'border-sky-500 bg-sky-50/60 text-sky-950 dark:border-sky-400 dark:bg-sky-950/40 dark:text-sky-100';
          } else if (inWindow) {
            boxClass =
              'border-amber-500 bg-amber-50/70 text-amber-950 dark:border-amber-400 dark:bg-amber-950/40 dark:text-amber-100';
          } else if (isDiscarded) {
            boxClass =
              'border-slate-200 bg-slate-100 text-slate-400 opacity-55 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-500';
          } else if (inBounds) {
            boxClass =
              'border-sky-200 bg-white text-slate-900 dark:border-sky-800/80 dark:bg-slate-900 dark:text-slate-100';
          }

          const itemKey = itemIds?.[idx] ?? `cell-${idx}`;

          return (
            <motion.div
              key={itemKey}
              layout
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              className="flex flex-col items-center gap-1"
            >
              <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                {dpLabels?.[idx] ?? idx}
              </span>
              <motion.div
                animate={{
                  scale: isSwapped ? 1.07 : isActive || isMatched ? 1.04 : 1,
                }}
                transition={{ duration: 0.16 }}
                className={`flex h-11 min-w-11 items-center justify-center rounded-lg border px-2 font-mono text-xs font-semibold tabular-nums transition-colors ${boxClass}`}
              >
                {String(val)}
              </motion.div>
              <div
                className={`h-0.5 w-full rounded-full transition-colors ${
                  inBounds ? 'bg-sky-500/70 dark:bg-sky-400/70' : 'bg-transparent'
                }`}
              />
              <div className="flex min-h-5 flex-wrap items-center justify-center gap-1">
                {(pointersByIdx[idx] ?? []).map((ptrName) => (
                  <motion.span
                    key={ptrName}
                    layout
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                      ptrName === 'mid' || ptrName === 'min'
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300'
                        : 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300'
                    }`}
                  >
                    {ptrName}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function BarsAndWaterStage({ visual }: { visual: TraceVisualState }) {
  const values = (visual.arrayValues ?? []).map(Number);
  const maxVal = Math.max(1, ...values);
  const pointersByIdx: Record<number, string[]> = {};
  if (visual.pointers) {
    for (const [name, idx] of Object.entries(visual.pointers)) {
      if (!pointersByIdx[idx]) pointersByIdx[idx] = [];
      pointersByIdx[idx].push(name);
    }
  }
  const water = visual.waterArea;

  return (
    <div className="space-y-3">
      {visual.arrayLabel && (
        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {visual.arrayLabel}
        </div>
      )}

      <div className="relative rounded-lg border border-slate-200 bg-white px-4 pt-6 pb-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-40 items-end justify-center gap-2">
          {values.map((h, idx) => {
            const pct = Math.max(8, Math.round((h / maxVal) * 100));
            const isMatched = visual.matchedIndices?.includes(idx);
            const isActive = visual.activeIndices?.includes(idx);
            const insideWater =
              water && idx > water.left && idx < water.right;
            const waterPct = water
              ? Math.round((water.height / maxVal) * 100)
              : 0;

            let barColor = 'bg-slate-300 dark:bg-slate-700';
            if (isMatched) barColor = 'bg-emerald-500 dark:bg-emerald-400';
            else if (isActive) barColor = 'bg-sky-600 dark:bg-sky-400';

            return (
              <div
                key={idx}
                className="relative flex h-full min-w-8 flex-1 max-w-12 flex-col items-center justify-end"
              >
                {insideWater && waterPct > 0 && (
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-6 rounded-t-sm bg-sky-400/20 border-t border-dashed border-sky-500/60"
                    style={{ height: `${Math.round((waterPct / 100) * 124)}px` }}
                  />
                )}
                <span className="mb-1 font-mono text-[10px] font-semibold text-slate-700 tabular-nums dark:text-slate-300">
                  {h}
                </span>
                <motion.div
                  layout
                  transition={{ duration: 0.2 }}
                  style={{ height: `${Math.round((pct / 100) * 108)}px` }}
                  className={`relative z-10 w-5 rounded-t-md ${barColor}`}
                />
                <span className="mt-1 font-mono text-[10px] text-slate-400 tabular-nums">
                  {idx}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-1 flex items-center justify-center gap-2">
          {values.map((_, idx) => (
            <div
              key={idx}
              className="min-w-8 flex-1 max-w-12 text-center font-mono text-[11px] font-semibold text-sky-700 dark:text-sky-400"
            >
              {pointersByIdx[idx]?.join(', ') ?? ''}
            </div>
          ))}
        </div>

        {water && (
          <div className="mt-2 text-center font-mono text-xs text-sky-700 dark:text-sky-300">
            Current container: width ({water.right - water.left}) × height ({water.height}) ={' '}
            <span className="font-bold">{water.area}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function LinkedListStage({ visual }: { visual: TraceVisualState }) {
  const nodes = visual.nodes ?? [];
  const edges = visual.edges ?? [];
  const nodePointers: Record<string, string[]> = {};
  if (visual.nodePointers) {
    for (const [label, nodeId] of Object.entries(visual.nodePointers)) {
      if (!nodePointers[nodeId]) nodePointers[nodeId] = [];
      nodePointers[nodeId].push(label);
    }
  }

  const width = Math.max(340, nodes.length * 88 + 20);
  const posMap = new Map<string, { x: number; y: number }>();
  nodes.forEach((n, idx) => {
    posMap.set(n.id, { x: 48 + idx * 84, y: 78 });
  });

  return (
    <div className="space-y-3">
      <div className="flex justify-center overflow-x-auto rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <svg
          viewBox={`0 0 ${width} 150`}
          className="h-36 w-full max-w-xl"
          role="img"
          aria-label="Linked List state"
        >
          <defs>
            <marker
              id="ll-arrow"
              markerWidth="7"
              markerHeight="7"
              refX="6"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 7 3.5, 0 7" className="fill-slate-400 dark:fill-slate-500" />
            </marker>
            <marker
              id="ll-arrow-active"
              markerWidth="7"
              markerHeight="7"
              refX="6"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 7 3.5, 0 7" className="fill-sky-600 dark:fill-sky-400" />
            </marker>
          </defs>

          {edges.map((edge, idx) => {
            const p1 = posMap.get(edge.from);
            const p2 = posMap.get(edge.to);
            if (!p1 || !p2) return null;
            const isBackward = p2.x < p1.x;
            const pathD = isBackward
              ? `M ${p1.x} ${p1.y - 20} Q ${(p1.x + p2.x) / 2} 14 ${p2.x} ${p2.y - 22}`
              : `M ${p1.x + 20} ${p1.y} L ${p2.x - 24} ${p2.y}`;
            return (
              <path
                key={idx}
                d={pathD}
                fill="none"
                strokeWidth={edge.active ? 2.2 : 1.5}
                markerEnd={edge.active ? 'url(#ll-arrow-active)' : 'url(#ll-arrow)'}
                className={
                  edge.active
                    ? 'stroke-sky-600 dark:stroke-sky-400'
                    : 'stroke-slate-300 dark:stroke-slate-700'
                }
              />
            );
          })}

          {nodes.map((node) => {
            const pos = posMap.get(node.id)!;
            const ptrLabels = nodePointers[node.id];
            return (
              <g key={node.id}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={19}
                  strokeWidth={2}
                  className={getSvgNodeColors(node.state)}
                />
                <text
                  x={pos.x}
                  y={pos.y + 4}
                  textAnchor="middle"
                  className="fill-current font-mono text-xs font-semibold"
                >
                  {node.label}
                </text>
                {ptrLabels && ptrLabels.length > 0 && (
                  <text
                    x={pos.x}
                    y={pos.y + 38}
                    textAnchor="middle"
                    className="fill-sky-700 font-mono text-[11px] font-bold dark:fill-sky-400"
                  >
                    {ptrLabels.join(', ')}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function TreeGraphStage({ visual }: { visual: TraceVisualState }) {
  const nodes = visual.nodes ?? [];
  const edges = visual.edges ?? [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const isGraph = visual.mode === 'graph';

  return (
    <div className="space-y-3">
      <div className="flex justify-center overflow-x-auto rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <svg
          viewBox="0 0 365 190"
          className="h-52 w-full max-w-md"
          role="img"
          aria-label="Tree or Graph execution diagram"
        >
          {isGraph && (
            <defs>
              <marker
                id="g-arrow"
                markerWidth="6"
                markerHeight="6"
                refX="5"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 6 3, 0 6" className="fill-slate-400 dark:fill-slate-500" />
              </marker>
              <marker
                id="g-arrow-active"
                markerWidth="6"
                markerHeight="6"
                refX="5"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 6 3, 0 6" className="fill-sky-600 dark:fill-sky-400" />
              </marker>
            </defs>
          )}

          {edges.map((edge, idx) => {
            const from = nodeMap.get(edge.from);
            const to = nodeMap.get(edge.to);
            if (!from || !to) return null;
            const x1 = from.x ?? 60;
            const y1 = from.y ?? 60;
            const x2 = to.x ?? 120;
            const y2 = to.y ?? 120;

            const dx = x2 - x1;
            const dy = y2 - y1;
            const len = Math.max(1, Math.hypot(dx, dy));
            const endX = isGraph ? x2 - (dx / len) * 23 : x2;
            const endY = isGraph ? y2 - (dy / len) * 23 : y2;

            return (
              <g key={idx}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={endX}
                  y2={endY}
                  strokeWidth={edge.active ? 2.5 : 1.5}
                  markerEnd={
                    isGraph
                      ? edge.active
                        ? 'url(#g-arrow-active)'
                        : 'url(#g-arrow)'
                      : undefined
                  }
                  className={
                    edge.active
                      ? 'stroke-sky-600 dark:stroke-sky-400'
                      : 'stroke-slate-300 dark:stroke-slate-700'
                  }
                />
                {edge.label && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 6}
                    textAnchor="middle"
                    className="fill-slate-600 font-mono text-[10px] font-semibold dark:fill-slate-300"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {nodes.map((node) => {
            const cx = node.x ?? 60;
            const cy = node.y ?? 60;
            return (
              <g key={node.id}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={21}
                  strokeWidth={2}
                  className={getSvgNodeColors(node.state)}
                />
                <text
                  x={cx}
                  y={cy + 4}
                  textAnchor="middle"
                  className="fill-current font-mono text-[10px] font-semibold"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {visual.callStack && visual.callStack.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Recursion Call Stack (Top = Right)
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {visual.callStack.map((frame, i) => (
              <span
                key={`${frame}-${i}`}
                className={`rounded-md border px-2 py-0.5 font-mono text-[11px] ${
                  i === visual.callStack!.length - 1
                    ? 'border-sky-500 bg-sky-50 font-semibold text-sky-900 dark:border-sky-400 dark:bg-sky-950/60 dark:text-sky-200'
                    : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
                }`}
              >
                {frame}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GridStage({ visual }: { visual: TraceVisualState }) {
  const grid = visual.dpGrid ?? [];
  return (
    <div className="flex justify-center py-3">
      <div className="inline-grid gap-1.5 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        {grid.map((row, r) => (
          <div key={r} className="flex gap-1.5">
            {row.map((cell, c) => {
              const isFocus =
                visual.dpHighlight &&
                visual.dpHighlight[0] === r &&
                visual.dpHighlight[1] === c;
              const strVal = String(cell);
              const isVisited = strVal === '#';
              const isLand = strVal === '1';

              let cls =
                'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-500';
              if (isFocus) {
                cls =
                  'border-sky-600 bg-sky-100 text-sky-900 dark:border-sky-400 dark:bg-sky-950/80 dark:text-sky-100';
              } else if (isVisited) {
                cls =
                  'border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-950/50 dark:text-emerald-200';
              } else if (isLand) {
                cls =
                  'border-amber-400 bg-amber-50 text-amber-900 dark:border-amber-500/70 dark:bg-amber-950/40 dark:text-amber-200';
              }

              return (
                <motion.div
                  key={c}
                  animate={{ scale: isFocus ? 1.07 : 1 }}
                  transition={{ duration: 0.15 }}
                  className={`flex h-12 w-12 items-center justify-center rounded-md border font-mono text-sm font-semibold ${cls}`}
                >
                  {strVal}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LiveAlgorithmStage({ step }: LiveAlgorithmStageProps) {
  const { visual } = step;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Live Algorithm Stage · {step.phase}
          </div>
          <div className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
            {step.title}
          </div>
        </div>
        <span className="font-mono text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
          Step {step.stepIndex + 1}
        </span>
      </div>

      <div className="flex-1 space-y-4 bg-slate-50/70 p-4 dark:bg-slate-950/50">
        {visual.operationBadge && (
          <div className="rounded-lg border border-sky-200 bg-sky-50/80 px-3 py-2 text-center font-mono text-xs font-medium text-sky-900 dark:border-sky-900/70 dark:bg-sky-950/50 dark:text-sky-200">
            {visual.operationBadge}
          </div>
        )}

        {(visual.mode === 'bars' || visual.mode === 'water-container') && (
          <BarsAndWaterStage visual={visual} />
        )}

        {(visual.mode === 'array' ||
          visual.mode === 'string' ||
          visual.mode === 'two-pointers' ||
          visual.mode === 'sliding-window' ||
          visual.mode === 'hash-buckets' ||
          visual.mode === 'dp-1d' ||
          visual.mode === 'binary-search') &&
          visual.arrayValues && (
            <ArrayBoxes
              label={visual.arrayLabel}
              values={visual.arrayValues}
              itemIds={visual.arrayItemIds}
              pointers={visual.pointers}
              activeIndices={visual.activeIndices}
              matchedIndices={visual.matchedIndices}
              discardedIndices={visual.discardedIndices}
              swapPair={visual.swapPair}
              compareIndices={visual.compareIndices}
              searchBounds={visual.searchBounds}
              windowRange={visual.windowRange}
              dpLabels={visual.dpLabels}
            />
          )}

        {visual.secondaryArrayValues && (
          <ArrayBoxes
            label={visual.secondaryArrayLabel}
            values={visual.secondaryArrayValues}
            pointers={
              visual.mode === 'string' && visual.pointers?.i !== undefined
                ? { i: visual.pointers.i }
                : undefined
            }
            activeIndices={
              visual.mode === 'string' ? visual.activeIndices : undefined
            }
            matchedIndices={
              visual.mode === 'array' || visual.mode === 'binary-search'
                ? visual.matchedIndices
                : undefined
            }
          />
        )}

        {visual.mode === 'linked-list' && <LinkedListStage visual={visual} />}

        {(visual.mode === 'tree' || visual.mode === 'graph') && (
          <TreeGraphStage visual={visual} />
        )}

        {visual.mode === 'grid' && <GridStage visual={visual} />}

        <AuxStructureCard title={visual.auxTitle} entries={visual.auxEntries} />

        {visual.resultBadge && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-emerald-500/40 bg-emerald-50 px-3.5 py-2.5 text-center font-mono text-xs font-semibold text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-950/50 dark:text-emerald-200"
          >
            {visual.resultBadge}
          </motion.div>
        )}
      </div>
    </div>
  );
}
