import type { DsaProblem, VisEdge, VisNode } from '../types/dsa';
import { TraceBuilder, parseIntArray } from './traceHelpers';
import type { ProblemGeneratorEntry } from './generatorsBatch1';

export const GENERATORS_BATCH_3: Record<string, ProblemGeneratorEntry> = {
  'binary-tree-level-order-traversal': {
    presets: [
      {
        id: 'lot-std',
        label: 'Example 1 · [3, 9, 20, null, null, 15, 7]',
        summary: 'Groups nodes depth-by-depth using levelSize = len(q)',
        inputs: { mode: 'standard' },
      },
      {
        id: 'lot-full',
        label: 'Complete Tree · [1, 2, 3, 4, 5, 6, 7]',
        summary: 'Traces 3 complete levels of sizes 1, 2, and 4',
        inputs: { mode: 'complete' },
      },
    ],
    generate(problem, inputs) {
      const complete = (inputs.mode ?? 'standard') === 'complete';
      const tb = new TraceBuilder(problem);

      interface BNode {
        id: string;
        val: number;
        x: number;
        y: number;
        left?: BNode;
        right?: BNode;
      }

      const nodesById = new Map<string, BNode>();
      const edges: VisEdge[] = [];
      let root: BNode;

      if (complete) {
        const n4: BNode = { id: '4', val: 4, x: 50, y: 156 };
        const n5: BNode = { id: '5', val: 5, x: 120, y: 156 };
        const n6: BNode = { id: '6', val: 6, x: 240, y: 156 };
        const n7: BNode = { id: '7', val: 7, x: 310, y: 156 };
        const n2: BNode = { id: '2', val: 2, x: 85, y: 90, left: n4, right: n5 };
        const n3: BNode = { id: '3', val: 3, x: 275, y: 90, left: n6, right: n7 };
        root = { id: '1', val: 1, x: 180, y: 26, left: n2, right: n3 };
        [root, n2, n3, n4, n5, n6, n7].forEach((n) => nodesById.set(n.id, n));
        edges.push(
          { from: '1', to: '2' }, { from: '1', to: '3' },
          { from: '2', to: '4' }, { from: '2', to: '5' },
          { from: '3', to: '6' }, { from: '3', to: '7' },
        );
      } else {
        const n15: BNode = { id: '15', val: 15, x: 205, y: 156 };
        const n7: BNode = { id: '7', val: 7, x: 305, y: 156 };
        const n9: BNode = { id: '9', val: 9, x: 95, y: 90 };
        const n20: BNode = { id: '20', val: 20, x: 255, y: 90, left: n15, right: n7 };
        root = { id: '3', val: 3, x: 180, y: 26, left: n9, right: n20 };
        [root, n9, n20, n15, n7].forEach((n) => nodesById.set(n.id, n));
        edges.push(
          { from: '3', to: '9' }, { from: '3', to: '20' },
          { from: '20', to: '15' }, { from: '20', to: '7' },
        );
      }

      const visited = new Set<string>();
      const snapshotNodes = (qIds: string[], levelIds: string[]): VisNode[] =>
        Array.from(nodesById.values()).map((n) => ({
          id: n.id,
          label: String(n.val),
          x: n.x,
          y: n.y,
          state: levelIds.includes(n.id)
            ? 'match'
            : qIds.includes(n.id)
              ? 'active'
              : visited.has(n.id)
                ? 'visited'
                : 'default',
        }));

      const q: BNode[] = [root];
      const res: number[][] = [];
      let depth = 0;

      tb.push({
        phase: 'Initialize Queue',
        title: `Enqueue root ${root.val}`,
        lines: {
          python: 'q, res = deque([root]), []',
          java: 'q.offer(root);',
          cpp: 'queue<TreeNode*> q; q.push(root);',
        },
        codeNote: `q = [${root.val}]`,
        vars: [
          { name: 'depth', value: 0 },
          { name: 'queue', value: `[${root.val}]` },
          { name: 'res', value: '[]' },
        ],
        visual: {
          mode: 'tree',
          nodes: snapshotNodes([root.id], []),
          edges,
          auxTitle: 'BFS FIFO Queue',
          auxKind: 'queue',
          auxEntries: [{ key: 'front', value: String(root.val), highlight: 'active' }],
        },
        teaching: {
          happening: `Seed BFS queue with root node ${root.val}.`,
          whyLine: 'BFS naturally visits nodes in non-decreasing depth order.',
          condition: 'root != null.',
          memoryChange: `Queue initialized to [${root.val}].`,
          whatNext: 'Freeze current queue size to process Depth 0.',
        },
      });

      while (q.length > 0) {
        const size = q.length;
        const levelVals: number[] = [];
        const levelIds: string[] = [];
        for (let i = 0; i < size; i++) {
          const cur = q.shift()!;
          levelVals.push(cur.val);
          levelIds.push(cur.id);
          visited.add(cur.id);
          if (cur.left) q.push(cur.left);
          if (cur.right) q.push(cur.right);
        }
        res.push(levelVals);
        const qIds = q.map((n) => n.id);

        tb.push({
          phase: `Level ${depth}`,
          title: `Snapshot size=${size}: drained [${levelVals.join(', ')}], enqueued [${q.map((n) => n.val).join(', ')}]`,
          lines: {
            python: 'for _ in range(len(q)):',
            java: 'int size = q.size();',
            cpp: 'int sz = q.size();',
          },
          codeNote: `level ${depth} -> [${levelVals.join(', ')}]`,
          vars: [
            { name: 'depth', value: depth, tone: 'active' },
            { name: 'levelSize', value: size },
            { name: 'level', value: `[${levelVals.join(', ')}]`, tone: 'positive' },
            { name: 'nextQueue', value: `[${q.map((n) => n.val).join(', ')}]` },
            { name: 'res', value: JSON.stringify(res) },
          ],
          visual: {
            mode: 'tree',
            nodes: snapshotNodes(qIds, levelIds),
            edges: edges.map((e) => ({
              ...e,
              active: levelIds.includes(e.from) && qIds.includes(e.to),
            })),
            auxTitle: 'BFS FIFO Queue (after level drain)',
            auxKind: 'queue',
            auxEntries: q.map((n, idx) => ({
              key: idx === 0 ? 'front' : `#${idx}`,
              value: String(n.val),
              highlight: 'active',
            })),
          },
          teaching: {
            happening: `Froze queue length = ${size} before popping. Popped [${levelVals.join(', ')}] for depth ${depth} while enqueueing their ${q.length} child(ren).`,
            whyLine: 'Freezing queue length prevents children of depth d+1 from mixing into depth d’s output list.',
            condition: q.length > 0 ? 'Queue still non-empty -> process next depth.' : 'Queue empty -> traversal finished!',
            memoryChange: `Appended [${levelVals.join(', ')}] to res.`,
            whatNext: q.length > 0 ? `Process depth ${depth + 1}.` : `Return ${JSON.stringify(res)}.`,
          },
        });
        depth++;
      }

      return { steps: tb.build() };
    },
  },

  'validate-binary-search-tree': {
    presets: [
      {
        id: 'vbst-invalid',
        label: 'Invalid BST · [5, 1, 4, null, null, 3, 6]',
        summary: 'Right child 4 violates ancestor lower bound (5, +∞)',
        inputs: { mode: 'invalid' },
      },
      {
        id: 'vbst-valid',
        label: 'Valid BST · [5, 1, 7, null, null, 6, 8]',
        summary: 'Every node satisfies strict ancestor bounds (low, high)',
        inputs: { mode: 'valid' },
      },
    ],
    generate(problem, inputs) {
      const validTree = (inputs.mode ?? 'invalid') === 'valid';
      const tb = new TraceBuilder(problem);

      interface VNode {
        id: string;
        val: number;
        x: number;
        y: number;
        left?: VNode;
        right?: VNode;
      }

      const nodesMap = new Map<string, VNode>();
      const edges: VisEdge[] = [];

      const n1: VNode = { id: 'n1', val: 1, x: 95, y: 90 };
      const n3: VNode = { id: 'n3', val: validTree ? 6 : 3, x: 205, y: 156 };
      const n6: VNode = { id: 'n6', val: validTree ? 8 : 6, x: 305, y: 156 };
      const nRight: VNode = { id: 'nr', val: validTree ? 7 : 4, x: 255, y: 90, left: n3, right: n6 };
      const root: VNode = { id: 'n5', val: 5, x: 180, y: 26, left: n1, right: nRight };
      [root, n1, nRight, n3, n6].forEach((n) => nodesMap.set(n.id, n));
      edges.push(
        { from: root.id, to: n1.id },
        { from: root.id, to: nRight.id },
        { from: nRight.id, to: n3.id },
        { from: nRight.id, to: n6.id },
      );

      const passed = new Set<string>();
      const stack: string[] = [];

      const makeSnapshot = (focusId?: string): VisNode[] =>
        Array.from(nodesMap.values()).map((n) => ({
          id: n.id,
          label: String(n.val),
          x: n.x,
          y: n.y,
          state: n.id === focusId ? 'active' : passed.has(n.id) ? 'match' : 'default',
        }));

      const fmtBound = (b: number) => (b === -Infinity ? '-∞' : b === Infinity ? '+∞' : String(b));

      const dfs = (n: VNode | undefined, low: number, high: number): boolean => {
        if (!n) return true;
        stack.push(`valid(${n.val}, ${fmtBound(low)}, ${fmtBound(high)})`);
        const ok = n.val > low && n.val < high;
        if (!ok) {
          tb.push({
            phase: 'BST Violation!',
            title: `Node ${n.val} violates (${fmtBound(low)}, ${fmtBound(high)}) -> false`,
            lines: {
              python: 'if not (low < n.val < high):',
              java: 'if (n.val <= low || n.val >= high) return false',
              cpp: 'if (n->val <= low || n->val >= high) return false',
            },
            codeNote: `${n.val} not in (${fmtBound(low)}, ${fmtBound(high)})!`,
            vars: [
              { name: 'node.val', value: n.val, tone: 'warning' },
              { name: 'low', value: fmtBound(low) },
              { name: 'high', value: fmtBound(high) },
              { name: 'valid', value: 'false', tone: 'warning' },
            ],
            visual: {
              mode: 'tree',
              nodes: makeSnapshot(n.id),
              edges: edges.map((e) => ({ ...e, active: e.to === n.id })),
              callStack: [...stack],
              resultBadge: `BST Violation at ${n.val}: must be strictly inside (${fmtBound(low)}, ${fmtBound(high)})`,
            },
            teaching: {
              happening: `Node ${n.val} sits in the right subtree of 5, requiring ${n.val} > ${fmtBound(low)}. Because ${n.val} <= ${fmtBound(low)}, the BST invariant breaks!`,
              whyLine: 'Propagating ancestor (low, high) bounds catches deep violations that local left < parent < right checks miss.',
              condition: `${fmtBound(low)} < ${n.val} < ${fmtBound(high)} is FALSE.`,
              memoryChange: 'Propagating false immediately up the call stack.',
              whatNext: 'Return false.',
            },
          });
          stack.pop();
          return false;
        }

        passed.add(n.id);
        tb.push({
          phase: 'Check Bounds',
          title: `Node ${n.val} in (${fmtBound(low)}, ${fmtBound(high)}) -> OK`,
          lines: {
            python: 'return valid(n.left, low, n.val)',
            java: 'return valid(n.left, low, n.val)',
            cpp: 'return valid(n->left, low, n->val)',
          },
          codeNote: `${fmtBound(low)} < ${n.val} < ${fmtBound(high)} OK`,
          vars: [
            { name: 'node.val', value: n.val, tone: 'positive' },
            { name: 'low', value: fmtBound(low) },
            { name: 'high', value: fmtBound(high) },
            { name: 'leftBounds', value: `(${fmtBound(low)}, ${n.val})` },
            { name: 'rightBounds', value: `(${n.val}, ${fmtBound(high)})` },
          ],
          visual: {
            mode: 'tree',
            nodes: makeSnapshot(n.id),
            edges,
            callStack: [...stack],
          },
          teaching: {
            happening: `Node ${n.val} strictly satisfies (${fmtBound(low)}, ${fmtBound(high)}).`,
            whyLine: `Going left tightens high = ${n.val}; going right tightens low = ${n.val}.`,
            condition: `${fmtBound(low)} < ${n.val} < ${fmtBound(high)} is TRUE.`,
            memoryChange: `Marked ${n.val} valid.`,
            whatNext: 'Validate left and right subtrees with narrowed bounds.',
          },
        });

        const leftOk = dfs(n.left, low, n.val);
        if (!leftOk) {
          stack.pop();
          return false;
        }
        const rightOk = dfs(n.right, n.val, high);
        stack.pop();
        return rightOk;
      };

      const overall = dfs(root, -Infinity, Infinity);
      if (overall) {
        tb.push({
          phase: 'Return',
          title: 'All subtrees satisfied ancestor bounds -> true',
          lines: { python: 'return valid(root,', java: 'return valid(root,', cpp: 'return valid(root,' },
          codeNote: 'return true',
          vars: [{ name: 'isValidBST', value: 'true', tone: 'positive' }],
          visual: {
            mode: 'tree',
            nodes: makeSnapshot(),
            edges,
            resultBadge: 'Output: true (Valid Binary Search Tree)',
          },
          teaching: {
            happening: 'Every node passed its ancestor (low, high) check.',
            whyLine: 'Time is O(n) and space is O(h).',
            condition: 'Both left and right subtrees valid.',
            memoryChange: 'Complete.',
            whatNext: 'Done.',
          },
        });
      }

      return { steps: tb.build() };
    },
  },

  'lowest-common-ancestor-of-a-binary-tree': {
    presets: [
      {
        id: 'lca-split',
        label: 'Split Point · p = 5, q = 1 -> LCA = 3',
        summary: 'p and q return from opposite branches, bubbling up root 3',
        inputs: { p: '5', q: '1' },
      },
      {
        id: 'lca-self',
        label: 'Ancestor Case · p = 5, q = 4 -> LCA = 5',
        summary: 'Early return at p=5 bubbles directly up when other branch is null',
        inputs: { p: '5', q: '4' },
      },
    ],
    generate(problem, inputs) {
      const pVal = Number(inputs.p ?? '5');
      const qVal = Number(inputs.q ?? '1');
      const tb = new TraceBuilder(problem);

      interface LNode {
        id: string;
        val: number;
        x: number;
        y: number;
        left?: LNode;
        right?: LNode;
      }

      const n6: LNode = { id: '6', val: 6, x: 48, y: 158 };
      const n4: LNode = { id: '4', val: 4, x: 145, y: 158 };
      const n5: LNode = { id: '5', val: 5, x: 96, y: 92, left: n6, right: n4 };
      const n0: LNode = { id: '0', val: 0, x: 220, y: 158 };
      const n8: LNode = { id: '8', val: 8, x: 316, y: 158 };
      const n1: LNode = { id: '1', val: 1, x: 268, y: 92, left: n0, right: n8 };
      const root: LNode = { id: '3', val: 3, x: 182, y: 26, left: n5, right: n1 };

      const all = [root, n5, n1, n6, n4, n0, n8];
      const edges: VisEdge[] = [
        { from: '3', to: '5' }, { from: '3', to: '1' },
        { from: '5', to: '6' }, { from: '5', to: '4' },
        { from: '1', to: '0' }, { from: '1', to: '8' },
      ];
      const results = new Map<string, string>();
      const stack: string[] = [];

      const snapNodes = (activeId?: string, lcaId?: string): VisNode[] =>
        all.map((n) => ({
          id: n.id,
          label: n.val === pVal ? `${n.val}(p)` : n.val === qVal ? `${n.val}(q)` : String(n.val),
          x: n.x,
          y: n.y,
          state:
            n.id === lcaId || n.val === pVal || n.val === qVal
              ? 'match'
              : n.id === activeId
                ? 'active'
                : results.has(n.id)
                  ? 'visited'
                  : 'default',
        }));

      const dfs = (n?: LNode): number | null => {
        if (!n) return null;
        stack.push(`lca(${n.val})`);
        if (n.val === pVal || n.val === qVal) {
          results.set(n.id, String(n.val));
          tb.push({
            phase: 'Target Hit',
            title: `Found target ${n.val} -> return ${n.val} upward immediately`,
            lines: {
              python: 'if not root or root is p or root is q:',
              java: 'if (root == null || root == p || root == q)',
              cpp: 'if (!root || root == p || root == q)',
            },
            codeNote: `hit ${n.val} -> return ${n.val}`,
            vars: [
              { name: 'node', value: n.val, tone: 'positive' },
              { name: 'returning', value: n.val, tone: 'positive' },
            ],
            visual: {
              mode: 'tree',
              nodes: snapNodes(n.id),
              edges,
              callStack: [...stack],
            },
            teaching: {
              happening: `Current node ${n.val} matches ${n.val === pVal ? 'p' : 'q'}! Return ${n.val} immediately to parent.`,
              whyLine: 'Even if the other target lives below this node, bubbling this node upward still produces the exact LCA!',
              condition: 'root == p || root == q is true.',
              memoryChange: `Returning reference ${n.val}.`,
              whatNext: 'Bubble result up to parent postorder check.',
            },
          });
          stack.pop();
          return n.val;
        }

        const left = dfs(n.left);
        const right = dfs(n.right);
        const ret = left !== null && right !== null ? n.val : left ?? right;
        results.set(n.id, ret !== null ? String(ret) : 'null');

        if (left !== null || right !== null || n.val === 3) {
          const isSplit = left !== null && right !== null;
          tb.push({
            phase: isSplit ? 'LCA Split Found!' : 'Postorder Bubble',
            title: `Node ${n.val}: left=${left ?? 'null'}, right=${right ?? 'null'} -> return ${ret ?? 'null'}`,
            lines: {
              python: isSplit ? 'if left and right:' : 'return left or right',
              java: isSplit ? 'if (left != null && right != null)' : 'return left != null ? left : right',
              cpp: isSplit ? 'if (l && r) return root' : 'return l ? l : r',
            },
            codeNote: isSplit ? `BOTH NON-NULL -> LCA = ${n.val}` : `bubble ${ret ?? 'null'}`,
            vars: [
              { name: 'node', value: n.val },
              { name: 'leftResult', value: left ?? 'null' },
              { name: 'rightResult', value: right ?? 'null' },
              { name: 'returning', value: ret ?? 'null', tone: isSplit ? 'positive' : 'active' },
            ],
            visual: {
              mode: 'tree',
              nodes: snapNodes(n.id, isSplit ? n.id : undefined),
              edges: edges.map((e) => ({ ...e, active: e.from === n.id })),
              callStack: [...stack],
              resultBadge: isSplit ? `LCA Found: Node ${n.val}` : undefined,
            },
            teaching: {
              happening: isSplit
                ? `Left returned ${left} and right returned ${right}! Since p and q split across opposite sides of ${n.val}, ${n.val} is their Lowest Common Ancestor.`
                : `Propagating non-null child result (${ret}) upward through node ${n.val}.`,
              whyLine: 'Postorder DFS combines left and right subtree discoveries in a single bottom-up pass.',
              condition: isSplit ? 'left != null && right != null -> return root.' : 'At most one side non-null -> bubble up.',
              memoryChange: `lca(${n.val}) resolved to ${ret ?? 'null'}.`,
              whatNext: stack.length > 1 ? 'Return to caller.' : `Final LCA = ${ret}!`,
            },
          });
        }
        stack.pop();
        return ret;
      };

      const finalLca = dfs(root);
      if (finalLca !== null) {
        tb.push({
          phase: 'Return',
          title: `Final Answer: Node ${finalLca}`,
          lines: {
            python: 'return left or right',
            java: 'return left != null ? left : right',
            cpp: 'return l ? l : r',
          },
          codeNote: `LCA(${pVal}, ${qVal}) = ${finalLca}`,
          vars: [{ name: 'LCA', value: finalLca, tone: 'positive' }],
          visual: {
            mode: 'tree',
            nodes: snapNodes(undefined, String(finalLca)),
            edges,
            resultBadge: `Lowest Common Ancestor(${pVal}, ${qVal}) = ${finalLca}`,
          },
          teaching: {
            happening: `Completed single O(n) traversal; LCA is ${finalLca}.`,
            whyLine: 'Every node was visited at most once.',
            condition: 'Recursion finished.',
            memoryChange: 'Done.',
            whatNext: 'Done.',
          },
        });
      }

      return { steps: tb.build() };
    },
  },

  'number-of-islands': {
    presets: [
      {
        id: 'ni-two',
        label: 'Example 1 · 2 Islands (3x3)',
        summary: 'Flood-fills 4-cell island, then isolated cell (2,2)',
        inputs: { mode: 'two' },
      },
      {
        id: 'ni-three',
        label: 'Three Islands · 3x4 Grid',
        summary: 'Shows diagonal land cells remain disconnected islands',
        inputs: { mode: 'three' },
      },
    ],
    generate(problem, inputs) {
      const three = (inputs.mode ?? 'two') === 'three';
      const grid: string[][] = three
        ? [
            ['1', '1', '0', '0'],
            ['0', '0', '1', '0'],
            ['0', '0', '0', '1'],
          ]
        : [
            ['1', '1', '0'],
            ['1', '1', '0'],
            ['0', '0', '1'],
          ];

      const tb = new TraceBuilder(problem);
      const m = grid.length;
      const n = grid[0].length;
      let count = 0;

      const cloneGrid = (g: string[][]) => g.map((row) => [...row]);

      tb.push({
        phase: 'Start Scan',
        title: `Scan ${m}x${n} binary grid for unvisited land ('1')`,
        lines: {
          python: 'for r in range(m):',
          java: 'for (int r = 0; r < grid.length; r++)',
          cpp: 'for (int r = 0; r < (int)grid.size(); r++)',
        },
        codeNote: 'islands = 0',
        vars: [
          { name: 'islands', value: 0 },
          { name: 'gridSize', value: `${m} x ${n}` },
        ],
        visual: {
          mode: 'grid',
          dpGrid: cloneGrid(grid),
        },
        teaching: {
          happening: `Prepare to scan the ${m}x${n} grid row by row.`,
          whyLine: 'Each unvisited "1" initiates a DFS flood fill that sinks its entire connected island.',
          condition: 'Outer scan starting at (0, 0).',
          memoryChange: 'Grid ready.',
          whatNext: 'Look for the first "1".',
        },
      });

      const sinkDfs = (r: number, c: number, islandId: number) => {
        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] !== '1') return;
        grid[r][c] = '#';
        tb.push({
          phase: `Flood Fill #${islandId}`,
          title: `Sink land cell (${r}, ${c}) -> '#'`,
          lines: {
            python: "grid[r][c] = '0'",
            java: "g[r][c] = '0';",
            cpp: "g[r][c] = '0';",
          },
          codeNote: `marked (${r}, ${c}) visited`,
          vars: [
            { name: 'islands', value: count, tone: 'positive' },
            { name: 'r', value: r, tone: 'active' },
            { name: 'c', value: c, tone: 'active' },
          ],
          visual: {
            mode: 'grid',
            dpGrid: cloneGrid(grid),
            dpHighlight: [r, c],
          },
          teaching: {
            happening: `DFS visited (${r}, ${c}) == '1' and marked it visited ('#') before exploring its 4 orthogonal neighbors.`,
            whyLine: 'Marking before recursing prevents infinite ping-pong cycles between adjacent land cells.',
            condition: `grid[${r}][${c}] == '1' -> sink & recurse 4 ways.`,
            memoryChange: `Cell (${r}, ${c}) converted from '1' to '#'.`,
            whatNext: 'Explore Up/Down/Left/Right neighbors.',
          },
        });
        sinkDfs(r + 1, c, islandId);
        sinkDfs(r - 1, c, islandId);
        sinkDfs(r, c + 1, islandId);
        sinkDfs(r, c - 1, islandId);
      };

      for (let r = 0; r < m; r++) {
        for (let c = 0; c < n; c++) {
          if (grid[r][c] === '1') {
            count++;
            tb.push({
              phase: 'New Island Found',
              title: `Discovered unvisited land at (${r}, ${c}) -> islands = ${count}`,
              lines: {
                python: 'count += 1',
                java: 'if (grid[r][c] == \'1\') { count++;',
                cpp: 'if (grid[r][c] == \'1\') { cnt++;',
              },
              codeNote: `islands = ${count} at (${r}, ${c})`,
              vars: [
                { name: 'islands', value: count, tone: 'positive' },
                { name: 'startCell', value: `(${r}, ${c})`, tone: 'active' },
              ],
              visual: {
                mode: 'grid',
                dpGrid: cloneGrid(grid),
                dpHighlight: [r, c],
              },
              teaching: {
                happening: `Hit unvisited '1' at (${r}, ${c}). Increment islands to ${count}!`,
                whyLine: 'Only the first cell encountered in a connected component triggers count++.',
                condition: `grid[${r}][${c}] == '1' === true.`,
                memoryChange: `islands incremented to ${count}.`,
                whatNext: `Run DFS flood fill from (${r}, ${c}) to sink the entire component.`,
              },
            });
            sinkDfs(r, c, count);
          }
        }
      }

      tb.push({
        phase: 'Return',
        title: `Return count = ${count}`,
        lines: { python: 'return count', java: 'return count;', cpp: 'return cnt;' },
        codeNote: `return ${count}`,
        vars: [{ name: 'islands', value: count, tone: 'positive' }],
        visual: {
          mode: 'grid',
          dpGrid: cloneGrid(grid),
          resultBadge: `Total Islands Found: ${count}`,
        },
        teaching: {
          happening: `Every cell in the ${m}x${n} grid has been scanned. Total islands = ${count}.`,
          whyLine: 'Each cell is visited O(1) times -> O(m * n) total time.',
          condition: 'Grid scan complete.',
          memoryChange: 'Done.',
          whatNext: 'Done.',
        },
      });

      return { steps: tb.build() };
    },
  },

  'clone-graph': {
    presets: [
      {
        id: 'cg-cycle',
        label: '4-Cycle · [[2,4],[1,3],[2,4],[1,3]]',
        summary: 'Caches Clone(u) in map BEFORE recursing to handle cycle edges',
        inputs: { mode: 'cycle' },
      },
      {
        id: 'cg-tri',
        label: 'Triangle · [[2,3],[1,3],[1,2]]',
        summary: 'Traces memoized clone lookups across 3-node clique',
        inputs: { mode: 'tri' },
      },
    ],
    generate(problem, inputs) {
      const tri = (inputs.mode ?? 'cycle') === 'tri';
      const tb = new TraceBuilder(problem);

      const adj: Record<number, number[]> = tri
        ? { 1: [2, 3], 2: [1, 3], 3: [1, 2] }
        : { 1: [2, 4], 2: [1, 3], 3: [2, 4], 4: [1, 3] };

      const coords: Record<number, { x: number; y: number }> = tri
        ? { 1: { x: 180, y: 34 }, 2: { x: 90, y: 148 }, 3: { x: 270, y: 148 } }
        : { 1: { x: 100, y: 42 }, 2: { x: 260, y: 42 }, 3: { x: 260, y: 148 }, 4: { x: 100, y: 148 } };

      const allIds = Object.keys(adj).map(Number);
      const allEdges: VisEdge[] = [];
      for (const u of allIds) {
        for (const v of adj[u]) {
          if (u < v) allEdges.push({ from: String(u), to: String(v) });
        }
      }

      const clones = new Set<number>();
      const clonedEdges = new Set<string>();
      const stack: string[] = [];

      const snap = (focus?: number, activeEdge?: [number, number]): { nodes: VisNode[]; edges: VisEdge[] } => ({
        nodes: allIds.map((id) => ({
          id: String(id),
          label: clones.has(id) ? `${id}'` : String(id),
          x: coords[id].x,
          y: coords[id].y,
          state: id === focus ? 'active' : clones.has(id) ? 'match' : 'default',
        })),
        edges: allEdges.map((e) => {
          const isAct =
            activeEdge &&
            ((Number(e.from) === activeEdge[0] && Number(e.to) === activeEdge[1]) ||
              (Number(e.from) === activeEdge[1] && Number(e.to) === activeEdge[0]));
          const key = `${Math.min(Number(e.from), Number(e.to))}-${Math.max(Number(e.from), Number(e.to))}`;
          return { ...e, active: Boolean(isAct || clonedEdges.has(key)) };
        }),
      });

      const dfs = (u: number) => {
        stack.push(`dfs(${u})`);
        if (clones.has(u)) {
          stack.pop();
          return;
        }
        clones.add(u);
        const s1 = snap(u);
        tb.push({
          phase: `Clone Node ${u}`,
          title: `Allocate ${u}' and cache clones[${u}] = ${u}' BEFORE neighbors`,
          lines: {
            python: 'clones[cur] = copy',
            java: 'clones.put(node, copy);',
            cpp: 'clones[node] = copy;',
          },
          codeNote: `cached ${u} -> ${u}'`,
          vars: [
            { name: 'cur', value: u, tone: 'active' },
            { name: 'clones.size', value: clones.size },
          ],
          visual: {
            mode: 'graph',
            nodes: s1.nodes,
            edges: s1.edges,
            callStack: [...stack],
            auxTitle: 'clones HashMap (old -> new)',
            auxKind: 'hashmap',
            auxEntries: Array.from(clones).map((k) => ({ key: `Node(${k})`, value: `Clone(${k}')`, highlight: k === u ? 'match' : 'default' })),
          },
          teaching: {
            happening: `Created deep-copy node ${u}' and immediately registered ${u} -> ${u}' inside clones map.`,
            whyLine: 'Caching BEFORE recursing into neighbors is critical—when a cycle leads back to ${u}, clones[${u}] already exists!',
            condition: `${u} not in clones -> allocate & store.`,
            memoryChange: `clones[${u}] = ${u}'.`,
            whatNext: `Clone/attach neighbors of ${u}: [${adj[u].join(', ')}].`,
          },
        });

        for (const nei of adj[u]) {
          const edgeKey = `${Math.min(u, nei)}-${Math.max(u, nei)}`;
          if (clones.has(nei)) {
            clonedEdges.add(edgeKey);
            const sHit = snap(u, [u, nei]);
            tb.push({
              phase: 'Cycle Cache Hit',
              title: `Neighbor ${nei} already in clones -> attach ${u}' -> ${nei}'`,
              lines: {
                python: 'if cur in clones:',
                java: 'if (clones.containsKey(node))',
                cpp: 'if (clones.count(node))',
              },
              codeNote: `cache hit: ${nei}' reused!`,
              vars: [
                { name: 'cur', value: u },
                { name: 'neighbor', value: nei, tone: 'positive' },
                { name: 'action', value: `wire ${u}' <-> ${nei}'` },
              ],
              visual: {
                mode: 'graph',
                nodes: sHit.nodes,
                edges: sHit.edges,
                callStack: [...stack],
                auxTitle: 'clones HashMap',
                auxKind: 'hashmap',
                auxEntries: Array.from(clones).map((k) => ({
                  key: `Node(${k})`,
                  value: `Clone(${k}')`,
                  highlight: k === nei ? 'match' : 'default',
                })),
              },
              teaching: {
                happening: `When exploring edge ${u} -> ${nei}, clones[${nei}] already exists! Reuse ${nei}' instead of looping infinitely.`,
                whyLine: 'Memo map breaks every graph cycle in O(1) lookup time.',
                condition: `${nei} in clones === true -> return cached ${nei}'.`,
                memoryChange: `Added ${nei}' to ${u}'.neighbors.`,
                whatNext: 'Check next neighbor or return.',
              },
            });
          } else {
            clonedEdges.add(edgeKey);
            dfs(nei);
          }
        }
        stack.pop();
      };

      dfs(1);
      const sDone = snap();
      tb.push({
        phase: 'Return',
        title: `Return Clone(1') — deep copy of all ${allIds.length} nodes complete`,
        lines: { python: 'return dfs(node)', java: 'return copy;', cpp: 'return copy;' },
        codeNote: `cloned ${allIds.length} nodes`,
        vars: [{ name: 'clonedNodes', value: allIds.length, tone: 'positive' }],
        visual: {
          mode: 'graph',
          nodes: sDone.nodes,
          edges: sDone.edges,
          auxTitle: 'clones HashMap',
          auxKind: 'hashmap',
          auxEntries: allIds.map((k) => ({ key: `Node(${k})`, value: `Clone(${k}')`, highlight: 'match' })),
          resultBadge: `Deep Copy Complete (${allIds.length} vertices, ${allEdges.length} edges)`,
        },
        teaching: {
          happening: `All ${allIds.length} nodes and ${allEdges.length} edges have been deep-copied in O(V + E) time.`,
          whyLine: 'Each vertex was cloned once and each directed neighbor edge processed once.',
          condition: 'DFS finished.',
          memoryChange: 'Independent cloned graph ready.',
          whatNext: 'Done.',
        },
      });

      return { steps: tb.build() };
    },
  },

  'course-schedule': {
    presets: [
      {
        id: 'cs-dag',
        label: 'Valid DAG · 4 Courses (Acyclic)',
        summary: 'Kahn’s topological sort peels all 4 courses cleanly -> true',
        inputs: { mode: 'dag' },
      },
      {
        id: 'cs-cycle',
        label: 'Cycle Deadlock · 3 Courses (1 <-> 2)',
        summary: 'Deadlocked cycle never reaches indegree 0 -> false',
        inputs: { mode: 'cycle' },
      },
    ],
    generate(problem, inputs) {
      const hasCycle = (inputs.mode ?? 'dag') === 'cycle';
      const tb = new TraceBuilder(problem);

      const n = hasCycle ? 3 : 4;
      // edge [to, pre] -> pre -> to
      const prereqs: [number, number][] = hasCycle
        ? [[1, 0], [2, 1], [1, 2]]
        : [[1, 0], [2, 0], [3, 1], [3, 2]];

      const coords: Record<number, { x: number; y: number }> = hasCycle
        ? { 0: { x: 75, y: 95 }, 1: { x: 185, y: 45 }, 2: { x: 285, y: 135 } }
        : { 0: { x: 70, y: 95 }, 1: { x: 180, y: 42 }, 2: { x: 180, y: 148 }, 3: { x: 290, y: 95 } };

      const adj: number[][] = Array.from({ length: n }, () => []);
      const indeg = new Array<number>(n).fill(0);
      for (const [a, b] of prereqs) {
        adj[b].push(a);
        indeg[a]++;
      }

      const doneSet = new Set<number>();
      const q: number[] = [];
      for (let i = 0; i < n; i++) if (indeg[i] === 0) q.push(i);
      let done = 0;

      const makeGraph = (activeNode?: number): { nodes: VisNode[]; edges: VisEdge[] } => ({
        nodes: Array.from({ length: n }, (_, i) => ({
          id: String(i),
          label: `${i} (in=${indeg[i]})`,
          x: coords[i].x,
          y: coords[i].y,
          state:
            i === activeNode
              ? 'active'
              : doneSet.has(i)
                ? 'match'
                : q.includes(i)
                  ? 'active'
                  : 'default',
        })),
        edges: prereqs.map(([a, b]) => ({
          from: String(b),
          to: String(a),
          active: b === activeNode || doneSet.has(b),
        })),
      });

      const s0 = makeGraph();
      tb.push({
        phase: 'Compute Indegrees',
        title: `Initialize indegrees & enqueue 0-indegree courses: [${q.join(', ')}]`,
        lines: {
          python: 'q = deque(i for i in range(numCourses)',
          java: 'if (indeg[i] == 0) q.offer(i)',
          cpp: 'if (indeg[i] == 0) q.push(i)',
        },
        codeNote: `indeg=[${indeg.join(',')}], q=[${q.join(',')}]`,
        vars: [
          { name: 'numCourses', value: n },
          { name: 'done', value: 0 },
          { name: 'indegrees', value: `[${indeg.join(', ')}]` },
          { name: 'queue', value: `[${q.join(', ')}]` },
        ],
        visual: {
          mode: 'graph',
          nodes: s0.nodes,
          edges: s0.edges,
          auxTitle: 'Kahn’s 0-Indegree Queue',
          auxKind: 'queue',
          auxEntries: q.map((c, idx) => ({ key: idx === 0 ? 'front' : `#${idx}`, value: `Course ${c}`, highlight: 'active' })),
        },
        teaching: {
          happening: `Built prerequisite graph and counted incoming dependencies (indegree). Only courses with indegree 0 can be taken immediately: [${q.join(', ')}].`,
          whyLine: 'Kahn’s algorithm peels nodes with zero unmet prerequisites iteratively.',
          condition: `Initial ready queue size = ${q.length}.`,
          memoryChange: `indeg = [${indeg.join(', ')}].`,
          whatNext: 'Pop ready courses and decrement their dependents’ indegree.',
        },
      });

      while (q.length > 0) {
        const u = q.shift()!;
        done++;
        doneSet.add(u);
        const unlocked: number[] = [];
        for (const v of adj[u]) {
          indeg[v]--;
          if (indeg[v] === 0) {
            q.push(v);
            unlocked.push(v);
          }
        }
        const s = makeGraph(u);
        tb.push({
          phase: 'Peel Course',
          title: `Take course ${u} -> done=${done}/${n}${unlocked.length ? `, unlocked [${unlocked.join(', ')}]` : ''}`,
          lines: {
            python: 'indeg[v] -= 1',
            java: 'if (--indeg[v] == 0) q.offer(v)',
            cpp: 'if (--indeg[v] == 0) q.push(v)',
          },
          codeNote: `popped ${u}; indeg=[${indeg.join(',')}]`,
          vars: [
            { name: 'popped', value: u, tone: 'positive' },
            { name: 'done', value: `${done} / ${n}`, tone: 'active' },
            { name: 'indegrees', value: `[${indeg.join(', ')}]` },
            { name: 'queue', value: `[${q.join(', ')}]` },
          ],
          visual: {
            mode: 'graph',
            nodes: s.nodes,
            edges: s.edges,
            auxTitle: 'Kahn’s 0-Indegree Queue',
            auxKind: 'queue',
            auxEntries: q.map((c, idx) => ({ key: idx === 0 ? 'front' : `#${idx}`, value: `Course ${c}`, highlight: 'active' })),
          },
          teaching: {
            happening: `Completed course ${u} (done=${done}) and reduced indegree on its dependents [${adj[u].join(', ') || 'none'}].${unlocked.length ? ` Course(s) [${unlocked.join(', ')}] hit indegree 0 and enter queue!` : ''}`,
            whyLine: 'Completing a prerequisite unlocks dependent courses once all their prerequisites finish.',
            condition: q.length > 0 ? 'Queue still has ready courses.' : 'Queue emptied -> compare done vs numCourses.',
            memoryChange: `done = ${done}, indeg = [${indeg.join(', ')}].`,
            whatNext: q.length > 0 ? 'Pop next 0-indegree course.' : `Check done (${done}) == numCourses (${n}).`,
          },
        });
      }

      const ok = done === n;
      const sEnd = makeGraph();
      tb.push({
        phase: 'Return',
        title: ok ? `done (${done}) == ${n} -> true (No Cycle!)` : `done (${done}) < ${n} -> false (Cycle Deadlock!)`,
        lines: {
          python: 'return done == numCourses',
          java: 'return done == numCourses;',
          cpp: 'return done == n;',
        },
        codeNote: `return ${ok}`,
        vars: [
          { name: 'done', value: done },
          { name: 'numCourses', value: n },
          { name: 'canFinish', value: String(ok), tone: ok ? 'positive' : 'warning' },
        ],
        visual: {
          mode: 'graph',
          nodes: sEnd.nodes,
          edges: sEnd.edges,
          resultBadge: ok ? `Output: true (All ${n} courses completed)` : `Output: false (Cycle trapped ${n - done} course(s)!)`,
        },
        teaching: {
          happening: ok
            ? `Every course was peeled cleanly (done == ${n}), proving the graph is a valid DAG.`
            : `Only ${done} of ${n} courses completed because a directed cycle keeps remaining indegrees > 0 forever.`,
          whyLine: 'Kahn’s BFS completes in O(V + E) time.',
          condition: `done == numCourses is ${ok}.`,
          memoryChange: 'Final boolean returned.',
          whatNext: 'Done.',
        },
      });

      return { steps: tb.build() };
    },
  },

  'network-delay-time': {
    presets: [
      {
        id: 'nd-reach',
        label: 'Example 1 · n=4, k=2 -> 2',
        summary: 'Dijkstra relaxes 2->1 (1), 2->3 (1), 3->4 (2)',
        inputs: { mode: 'reachable' },
      },
      {
        id: 'nd-unreach',
        label: 'Disconnected · n=4, k=2 -> -1',
        summary: 'Node 4 stays at +∞ -> returns -1',
        inputs: { mode: 'unreachable' },
      },
    ],
    generate(problem, inputs) {
      const unreach = (inputs.mode ?? 'reachable') === 'unreachable';
      const n = 4;
      const k = 2;
      const edgesList: [number, number, number][] = unreach
        ? [[2, 1, 1], [2, 3, 2]]
        : [[2, 1, 1], [2, 3, 1], [3, 4, 1], [1, 4, 4]];

      const coords: Record<number, { x: number; y: number }> = {
        2: { x: 75, y: 95 },
        1: { x: 190, y: 36 },
        3: { x: 190, y: 152 },
        4: { x: 300, y: 95 },
      };

      const adj: Array<[number, number][]> = Array.from({ length: n + 1 }, () => []);
      for (const [u, v, w] of edgesList) adj[u].push([v, w]);

      const dist = new Array<number>(n + 1).fill(Infinity);
      dist[k] = 0;
      const settled = new Set<number>();
      const heap: Array<[number, number]> = [[0, k]];
      const tb = new TraceBuilder(problem);

      const snap = (activeU?: number): { nodes: VisNode[]; edges: VisEdge[] } => ({
        nodes: [1, 2, 3, 4].map((id) => ({
          id: String(id),
          label: `${id} (${dist[id] === Infinity ? '∞' : dist[id]})`,
          x: coords[id].x,
          y: coords[id].y,
          state: id === activeU ? 'active' : settled.has(id) ? 'match' : 'default',
        })),
        edges: edgesList.map(([u, v, w]) => ({
          from: String(u),
          to: String(v),
          label: String(w),
          active: u === activeU || (settled.has(u) && settled.has(v)),
        })),
      });

      const fmtDist = () => [1, 2, 3, 4].map((id) => `${id}:${dist[id] === Infinity ? '∞' : dist[id]}`).join(' ');

      const s0 = snap();
      tb.push({
        phase: 'Seed Dijkstra',
        title: `Set dist[${k}] = 0 and push (0, node ${k}) to min-heap`,
        lines: {
          python: 'heap = [(0, k)]',
          java: 'pq.offer(new int[]{0, k});',
          cpp: 'pq.push({0, k});',
        },
        codeNote: `dist[${k}] = 0`,
        vars: [
          { name: 'source k', value: k },
          { name: 'dist', value: fmtDist() },
          { name: 'heap', value: '[(0, 2)]' },
        ],
        visual: {
          mode: 'graph',
          nodes: s0.nodes,
          edges: s0.edges,
          auxTitle: 'Min-Heap & Shortest Distances',
          auxKind: 'heap',
          auxEntries: [{ key: 'top', value: `(d=0, u=${k})`, highlight: 'active' }],
        },
        teaching: {
          happening: `Signal starts at node ${k} at time 0; all other nodes start at +∞.`,
          whyLine: 'Because weights >= 0, popping the minimum tentative distance from a min-heap finalizes one vertex per step.',
          condition: 'heap is non-empty.',
          memoryChange: `dist[${k}] = 0.`,
          whatNext: 'Pop minimum-distance node from heap and relax outgoing edges.',
        },
      });

      while (heap.length > 0) {
        heap.sort((a, b) => a[0] - b[0]);
        const [d, u] = heap.shift()!;
        if (d > dist[u]) {
          continue;
        }
        settled.add(u);
        for (const [v, w] of adj[u]) {
          if (d + w < dist[v]) {
            dist[v] = d + w;
            heap.push([dist[v], v]);
          }
        }
        heap.sort((a, b) => a[0] - b[0]);
        const s = snap(u);
        tb.push({
          phase: `Settle Node ${u}`,
          title: `Pop (${d}, node ${u}) & relax outgoing edges`,
          lines: {
            python: 'd, u = heapq.heappop(heap)',
            java: 'int d = top[0], u = top[1];',
            cpp: 'auto [d, u] = pq.top(); pq.pop();',
          },
          codeNote: `settled ${u} at t=${d}; ${fmtDist()}`,
          vars: [
            { name: 'u', value: u, tone: 'positive' },
            { name: 'd', value: d },
            { name: 'dist', value: fmtDist(), tone: 'active' },
            { name: 'heapSize', value: heap.length },
          ],
          visual: {
            mode: 'graph',
            nodes: s.nodes,
            edges: s.edges,
            auxTitle: 'Min-Heap Frontier',
            auxKind: 'heap',
            auxEntries: heap.map(([hd, hu], idx) => ({
              key: idx === 0 ? 'min' : `#${idx}`,
              value: `(d=${hd}, node=${hu})`,
              highlight: idx === 0 ? 'active' : 'default',
            })),
          },
          teaching: {
            happening: `Popped node ${u} with finalized arrival time ${d}, and relaxed its neighbors: [${adj[u].map(([v, w]) => `${u}->${v}(w=${w})`).join(', ') || 'none'}].`,
            whyLine: 'When d + w < dist[v], we found a shorter path to v and push the updated distance onto the heap.',
            condition: 'd <= dist[u] (not stale) -> settled!',
            memoryChange: `dist = [${fmtDist()}].`,
            whatNext: heap.length > 0 ? 'Pop next smallest distance from min-heap.' : 'Compute max(dist[1..n]).',
          },
        });
      }

      const maxD = Math.max(...dist.slice(1));
      const ans = maxD === Infinity ? -1 : maxD;
      const sEnd = snap();
      tb.push({
        phase: 'Return',
        title: ans === -1 ? 'Unreachable node(s) remain at ∞ -> return -1' : `All nodes reached -> max arrival time = ${ans}`,
        lines: {
          python: 'return -1 if ans ==',
          java: 'return ans;',
          cpp: 'return ans == INT_MAX ? -1 : ans',
        },
        codeNote: `return ${ans}`,
        vars: [{ name: 'result', value: ans, tone: ans === -1 ? 'warning' : 'positive' }],
        visual: {
          mode: 'graph',
          nodes: sEnd.nodes,
          edges: sEnd.edges,
          resultBadge: ans === -1 ? 'Output: -1 (node 4 unreachable)' : `Total Network Delay: ${ans}`,
        },
        teaching: {
          happening: ans === -1 ? 'Node 4 remained at infinity, so signal cannot reach all nodes.' : `Slowest reached node took ${ans} units of time.`,
          whyLine: 'Broadcast finishes when the farthest node receives the signal.',
          condition: `max(dist[1..n]) == ${ans === -1 ? '∞' : ans}.`,
          memoryChange: 'Final time returned.',
          whatNext: 'Done.',
        },
      });

      return { steps: tb.build() };
    },
  },

  'climbing-stairs': {
    presets: [
      {
        id: 'csdp-5',
        label: 'Example · n = 5 -> 8 ways',
        summary: 'Rolls a, b = b, a + b forward in O(1) memory',
        inputs: { n: '5' },
      },
      {
        id: 'csdp-3',
        label: 'Example 2 · n = 3 -> 3 ways',
        summary: 'Short staircase transition',
        inputs: { n: '3' },
      },
    ],
    customSpec: {
      fields: [{ key: 'n', label: 'Stair count n', placeholder: '5', helper: 'Integer between 1 and 12' }],
      defaultValues: { n: '5' },
    },
    generate(problem, inputs) {
      const n = Number((inputs.n ?? '5').trim());
      if (!Number.isInteger(n) || n < 1 || n > 12) {
        return { steps: [], error: 'Enter an integer n between 1 and 12.' };
      }

      const tb = new TraceBuilder(problem);
      if (n <= 2) {
        tb.push({
          phase: 'Base Case',
          title: `n = ${n} <= 2 -> return ${n}`,
          lines: { python: 'return n', java: 'if (n <= 2) return n;', cpp: 'if (n <= 2) return n;' },
          codeNote: `return ${n}`,
          vars: [
            { name: 'n', value: n },
            { name: 'ways', value: n, tone: 'positive' },
          ],
          visual: {
            mode: 'dp-1d',
            arrayLabel: 'DP Stair States',
            arrayValues: Array.from({ length: n }, (_, idx) => idx + 1),
            dpLabels: Array.from({ length: n }, (_, idx) => `step ${idx + 1}`),
            matchedIndices: [n - 1],
            resultBadge: `Distinct Ways for n = ${n}: ${n}`,
          },
          teaching: {
            happening: `Base case: 1 step has 1 way, 2 steps has 2 ways.`,
            whyLine: 'No recurrence loop needed for n <= 2.',
            condition: 'n <= 2 is true.',
            memoryChange: 'None.',
            whatNext: `Return ${n}.`,
          },
        });
        return { steps: tb.build() };
      }

      const dpValues: (number | string)[] = new Array(n + 1).fill('?');
      dpValues[0] = 1;
      dpValues[1] = 1;
      dpValues[2] = 2;
      let a = 1;
      let b = 2;

      tb.push({
        phase: 'Seed Base Cases',
        title: 'Initialize a = ways(1) = 1, b = ways(2) = 2',
        lines: { python: 'a, b = 1, 2', java: 'int a = 1, b = 2;', cpp: 'int a = 1, b = 2;' },
        codeNote: 'a = 1, b = 2',
        vars: [
          { name: 'n', value: n },
          { name: 'a (i-2)', value: a },
          { name: 'b (i-1)', value: b },
        ],
        visual: {
          mode: 'dp-1d',
          arrayLabel: 'Ways to Reach Step i',
          arrayValues: [...dpValues],
          dpLabels: dpValues.map((_, idx) => `dp[${idx}]`),
          matchedIndices: [1, 2],
        },
        teaching: {
          happening: 'Set the two base states: 1 way to reach step 1, and 2 ways to reach step 2.',
          whyLine: 'Every step i only depends on (i-1) and (i-2), letting us compress the DP array into two rolling variables a and b.',
          condition: 'Loop starts at i = 3.',
          memoryChange: 'a = 1, b = 2.',
          whatNext: `Compute step 3 as a + b = ${a + b}.`,
        },
      });

      for (let i = 3; i <= n; i++) {
        const next = a + b;
        a = b;
        b = next;
        dpValues[i] = next;

        tb.push({
          phase: 'DP Transition',
          title: `Step ${i}: ways(${i}) = ways(${i - 1}) + ways(${i - 2}) = ${next}`,
          lines: {
            python: 'a, b = b, a + b',
            java: 'int c = a + b; a = b; b = c;',
            cpp: 'int c = a + b; a = b; b = c;',
          },
          codeNote: `dp[${i}] = ${next}`,
          vars: [
            { name: 'i', value: i, tone: 'active' },
            { name: 'a (i-1)', value: a },
            { name: 'b (ways[i])', value: b, tone: 'positive' },
          ],
          visual: {
            mode: 'dp-1d',
            arrayLabel: 'Ways to Reach Step i',
            arrayValues: [...dpValues],
            dpLabels: dpValues.map((_, idx) => `dp[${idx}]`),
            pointers: { i },
            activeIndices: [i - 2, i - 1],
            matchedIndices: [i],
          },
          teaching: {
            happening: `You can land on step ${i} from step ${i - 1} (1-step hop) or step ${i - 2} (2-step hop), giving ${next} total ways.`,
            whyLine: 'Rolling a and b forward eliminates the O(n) DP table completely.',
            condition: `i = ${i} <= ${n}.`,
            memoryChange: `Rolled (a, b) -> (${a}, ${b}).`,
            whatNext: i < n ? `Compute step ${i + 1}.` : `Return b = ${b}.`,
          },
        });
      }

      tb.push({
        phase: 'Return',
        title: `Return b = ${b}`,
        lines: { python: 'return b', java: 'return b;', cpp: 'return b;' },
        codeNote: `return ${b}`,
        vars: [{ name: 'result', value: b, tone: 'positive' }],
        visual: {
          mode: 'dp-1d',
          arrayLabel: 'Ways to Reach Step i',
          arrayValues: dpValues,
          dpLabels: dpValues.map((_, idx) => `dp[${idx}]`),
          matchedIndices: [n],
          resultBadge: `Distinct Ways for n = ${n}: ${b}`,
        },
        teaching: {
          happening: `Reached top stair ${n} with ${b} distinct paths.`,
          whyLine: 'O(n) time and O(1) space.',
          condition: 'Loop finished.',
          memoryChange: 'Done.',
          whatNext: 'Done.',
        },
      });

      return { steps: tb.build() };
    },
  },

  'coin-change': {
    presets: [
      {
        id: 'cc-std',
        label: 'Example 1 · coins=[1, 2, 5], amount=7',
        summary: 'Computes minimum coins bottom-up -> 2 (5 + 2)',
        inputs: { coins: '1, 2, 5', amount: '7' },
      },
      {
        id: 'cc-nongreedy',
        label: 'Greedy Trap · coins=[1, 3, 4], amount=6',
        summary: 'Proves why DP finds 3+3 (2 coins) instead of greedy 4+1+1 (3)',
        inputs: { coins: '1, 3, 4', amount: '6' },
      },
    ],
    customSpec: {
      fields: [
        { key: 'coins', label: 'coins (comma-separated)', placeholder: '1, 2, 5', helper: '1 to 5 positive integers' },
        { key: 'amount', label: 'amount', placeholder: '7', helper: 'Integer 0 to 12' },
      ],
      defaultValues: { coins: '1, 2, 5', amount: '7' },
    },
    generate(problem, inputs) {
      const coins = parseIntArray(inputs.coins ?? '1, 2, 5', 1, 5);
      const amount = Number((inputs.amount ?? '7').trim());
      if (!coins || coins.some((c) => c <= 0) || !Number.isInteger(amount) || amount < 0 || amount > 12) {
        return { steps: [], error: 'Enter 1–5 positive coin denominations and integer amount 0–12.' };
      }

      const tb = new TraceBuilder(problem);
      const INF = amount + 1;
      const dp = new Array<number>(amount + 1).fill(INF);
      dp[0] = 0;

      const fmtDp = () => dp.map((v) => (v > amount ? '∞' : v));
      const labels = dp.map((_, x) => `dp[${x}]`);

      tb.push({
        phase: 'Initialize Table',
        title: `dp[0] = 0, dp[1..${amount}] = ∞ (sentinel ${INF})`,
        lines: {
          python: 'dp = [amount + 1] * (amount + 1)',
          java: 'Arrays.fill(dp, amount + 1);',
          cpp: 'vector<int> dp(amount + 1, amount + 1);',
        },
        codeNote: `sentinel = ${INF}`,
        vars: [
          { name: 'coins', value: `[${coins.join(', ')}]` },
          { name: 'amount', value: amount },
          { name: 'dp[0]', value: 0 },
        ],
        visual: {
          mode: 'dp-1d',
          arrayLabel: 'dp[x] = Min Coins for Amount x',
          arrayValues: fmtDp(),
          dpLabels: labels,
          matchedIndices: [0],
        },
        teaching: {
          happening: `Base case dp[0] = 0 coins for amount 0. All other amounts start at sentinel ${INF} ("impossible so far").`,
          whyLine: 'Using amount + 1 as infinity avoids integer overflow when computing 1 + dp[x - c].',
          condition: 'Ready to tabulate x = 1..amount.',
          memoryChange: `Allocated dp array of length ${amount + 1}.`,
          whatNext: amount >= 1 ? 'Compute minimum coins for sub-amount x = 1.' : 'Return 0.',
        },
      });

      for (let x = 1; x <= amount; x++) {
        let chosenCoin: number | null = null;
        const deps: number[] = [];
        for (const c of coins) {
          if (c <= x) {
            deps.push(x - c);
            if (1 + dp[x - c] < dp[x]) {
              dp[x] = 1 + dp[x - c];
              chosenCoin = c;
            }
          }
        }

        tb.push({
          phase: 'Tabulate Amount',
          title:
            chosenCoin !== null
              ? `x = ${x}: best is 1 + dp[${x - chosenCoin}] (coin ${chosenCoin}) = ${dp[x]}`
              : `x = ${x}: no coin fits or reachable -> remains ∞`,
          lines: {
            python: 'dp[x] = min(dp[x], 1 + dp[x - c])',
            java: 'if (c <= x) dp[x] = Math.min(dp[x], 1 + dp[x - c])',
            cpp: 'if (c <= x) dp[x] = min(dp[x], 1 + dp[x - c])',
          },
          codeNote: dp[x] <= amount ? `dp[${x}] = ${dp[x]} (via coin ${chosenCoin})` : `dp[${x}] = ∞`,
          vars: [
            { name: 'x', value: x, tone: 'active' },
            { name: 'dp[x]', value: dp[x] > amount ? '∞' : dp[x], tone: dp[x] <= amount ? 'positive' : 'warning' },
            { name: 'bestCoin', value: chosenCoin ?? 'none' },
          ],
          visual: {
            mode: 'dp-1d',
            arrayLabel: 'dp[x] = Min Coins for Amount x',
            arrayValues: fmtDp(),
            dpLabels: labels,
            pointers: { x },
            activeIndices: deps,
            matchedIndices: dp[x] <= amount ? [x] : undefined,
          },
          teaching: {
            happening:
              chosenCoin !== null
                ? `Tried all coins <= ${x} (looking back at dp[${deps.join('], dp[')}]). Taking coin ${chosenCoin} gives fewest coins: 1 + dp[${x - chosenCoin}] = ${dp[x]}.`
                : `No valid sub-amount reached x = ${x}, so dp[${x}] stays unreachable (∞).`,
            whyLine: 'Testing every coin as the final coin guarantees global optimality even when greedy fails.',
            condition: `x = ${x} <= ${amount}.`,
            memoryChange: `dp[${x}] = ${dp[x] > amount ? '∞' : dp[x]}.`,
            whatNext: x < amount ? `Compute dp[${x + 1}].` : `Return ${dp[amount] > amount ? -1 : dp[amount]}.`,
          },
        });
      }

      const ans = dp[amount] > amount ? -1 : dp[amount];
      tb.push({
        phase: 'Return',
        title: `Return ${ans}`,
        lines: {
          python: 'return -1 if dp[amount] > amount',
          java: 'return dp[amount] > amount ? -1 : dp[amount]',
          cpp: 'return dp[amount] > amount ? -1 : dp[amount]',
        },
        codeNote: `return ${ans}`,
        vars: [{ name: 'result', value: ans, tone: ans === -1 ? 'warning' : 'positive' }],
        visual: {
          mode: 'dp-1d',
          arrayLabel: 'Final Coin Change DP Table',
          arrayValues: fmtDp(),
          dpLabels: labels,
          matchedIndices: ans >= 0 ? [amount] : undefined,
          resultBadge: ans === -1 ? `Output: -1 (cannot make amount ${amount})` : `Minimum Coins for ${amount}: ${ans}`,
        },
        teaching: {
          happening: ans === -1 ? `dp[${amount}] stayed > amount, so amount ${amount} cannot be formed.` : `dp[${amount}] = ${ans} minimum coins.`,
          whyLine: 'Bottom-up tabulation solved all sub-amounts in O(amount * len(coins)) time.',
          condition: 'Table complete.',
          memoryChange: 'Done.',
          whatNext: 'Done.',
        },
      });

      return { steps: tb.build() };
    },
  },

  'longest-increasing-subsequence': {
    presets: [
      {
        id: 'lis-std',
        label: 'Example 1 · [10, 9, 2, 5, 3, 7, 101, 18]',
        summary: 'Maintains minimal tails array via binary search -> length 4',
        inputs: { nums: '10, 9, 2, 5, 3, 7, 101, 18' },
      },
      {
        id: 'lis-ex2',
        label: 'Example 2 · [0, 1, 0, 3, 2, 3]',
        summary: 'Replaces equal/larger tails cleanly -> length 4',
        inputs: { nums: '0, 1, 0, 3, 2, 3' },
      },
    ],
    customSpec: {
      fields: [{ key: 'nums', label: 'nums (comma-separated)', placeholder: '10, 9, 2, 5, 3, 7, 101, 18', helper: '1 to 10 integers' }],
      defaultValues: { nums: '10, 9, 2, 5, 3, 7, 101, 18' },
    },
    generate(problem, inputs) {
      const nums = parseIntArray(inputs.nums ?? '10, 9, 2, 5, 3, 7, 101, 18', 1, 10);
      if (!nums) return { steps: [], error: 'Enter 1–10 integers for nums.' };

      const tb = new TraceBuilder(problem);
      const tails: number[] = [];

      for (let i = 0; i < nums.length; i++) {
        const x = nums[i];
        let l = 0;
        let r = tails.length;
        while (l < r) {
          const m = (l + r) >> 1;
          if (tails[m] < x) l = m + 1;
          else r = m;
        }
        const appended = l === tails.length;
        if (appended) tails.push(x);
        else tails[l] = x;

        tb.push({
          phase: appended ? 'Extend Tails' : 'Tighten Tail',
          title: `x=${x}: binary-search slot ${l} -> ${appended ? `append ${x}` : `replace tails[${l}] with ${x}`}`,
          lines: {
            python: appended ? 'tails.append(x)' : 'tails[idx] = x',
            java: appended ? 'if (l == size) size++' : 'tails[l] = x;',
            cpp: appended ? 'if (it == tails.end()) tails.push_back(x)' : 'else *it = x;',
          },
          codeNote: `tails = [${tails.join(', ')}] (len=${tails.length})`,
          vars: [
            { name: 'i', value: i, tone: 'active' },
            { name: 'x', value: x },
            { name: 'slot_idx', value: l, tone: 'active' },
            { name: 'tails', value: `[${tails.join(', ')}]`, tone: appended ? 'positive' : 'active' },
            { name: 'LIS_len', value: tails.length, tone: appended ? 'positive' : 'neutral' },
          ],
          visual: {
            mode: 'binary-search',
            arrayLabel: 'Input nums',
            arrayValues: nums,
            pointers: { i },
            activeIndices: [i],
            secondaryArrayLabel: 'tails (sorted minimal end-values per length)',
            secondaryArrayValues: [...tails],
          },
          teaching: {
            happening: appended
              ? `${x} is strictly greater than every element in tails, so it extends our longest increasing subsequence to length ${tails.length}.`
              : `Lower-bound binary search found first tail >= ${x} at index ${l}. Replacing it with smaller ${x} preserves sorted order and leaves more room for future extensions.`,
            whyLine: 'Keeping tails as small as possible for each subsequence length maximizes future extension opportunities in O(log n) per element.',
            condition: appended ? `idx (${l}) == len(tails) -> append.` : `idx (${l}) < len(tails) -> overwrite.`,
            memoryChange: `tails updated to [${tails.join(', ')}].`,
            whatNext: i + 1 < nums.length ? `Process nums[${i + 1}] = ${nums[i + 1]}.` : `Return len(tails) = ${tails.length}.`,
          },
        });
      }

      tb.push({
        phase: 'Return',
        title: `Return LIS length = ${tails.length}`,
        lines: { python: 'return len(tails)', java: 'return size;', cpp: 'return tails.size();' },
        codeNote: `return ${tails.length}`,
        vars: [{ name: 'result', value: tails.length, tone: 'positive' }],
        visual: {
          mode: 'binary-search',
          arrayLabel: 'Input nums',
          arrayValues: nums,
          secondaryArrayLabel: 'Final tails Array',
          secondaryArrayValues: tails,
          resultBadge: `LIS Length: ${tails.length} (final tails: [${tails.join(', ')}])`,
        },
        teaching: {
          happening: `Finished patience sorting over ${nums.length} elements; LIS length is ${tails.length}.`,
          whyLine: 'Note that tails holds optimal end values per length (whose length equals LIS length) in O(n log n) time.',
          condition: 'Complete.',
          memoryChange: 'Done.',
          whatNext: 'Done.',
        },
      });

      return { steps: tb.build() };
    },
  },
};
