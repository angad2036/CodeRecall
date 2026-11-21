import type { DsaProblem } from '../types/dsa';
import type { ProblemGeneratorEntry } from './generatorsBatch1';
import {
  TraceBuilder,
  createArrayItemIds,
  parseIntArray,
  swapArraySnapshot,
} from './traceHelpers';

export const BINARY_SEARCH_PROBLEM: DsaProblem = {
  id: 'binary-search',
  number: 31,
  title: 'Binary Search',
  category: 'Arrays',
  difficulty: 'Beginner',
  estimatedMinutes: 10,
  pattern: 'Search Space Halving · Low / Mid / High Pointers',
  coreIdea:
    'Because the input array is sorted ascending, comparing the middle element nums[mid] against target lets us eliminate half of the remaining candidates on every step in O(log n) time.',
  statement:
    'Given a sorted array of integers nums in ascending order and an integer target, return the index of target if it exists in nums. Otherwise, return -1. Your algorithm must run in O(log n) runtime complexity.',
  examples: [
    {
      input: 'nums = [-1, 0, 3, 5, 9, 12], target = 9',
      output: '4',
      explanation: '9 exists in nums and its index is 4.',
    },
    {
      input: 'nums = [-1, 0, 3, 5, 9, 12], target = 2',
      output: '-1',
      explanation: '2 does not exist in nums so return -1.',
    },
  ],
  constraints: [
    '1 <= nums.length <= 10^4',
    'All integers in nums are unique and sorted ascending',
    '-10^4 < nums[i], target < 10^4',
  ],
  starterCode: {
    python: `def search(nums: list[int], target: int) -> int:\n    pass`,
    java: `class Solution {\n    public int search(int[] nums, int target) {\n        return -1;\n    }\n}`,
    cpp: `class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        return -1;\n    }\n};`,
  },
  visualizerKind: 'array',
  visualizationSteps: [],
  explainChapters: [],
  approaches: [
    {
      tier: 'Brute Force',
      title: 'Linear Scan',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      summary: 'Check each index sequentially from 0 to n - 1 until target is found.',
      dryRun: ['Scan index 0..n-1 and compare nums[i] == target.'],
      code: {
        python: `def search(nums: list[int], target: int) -> int:\n    for i, val in enumerate(nums):\n        if val == target:\n            return i\n    return -1`,
        java: `class Solution {\n    public int search(int[] nums, int target) {\n        for (int i = 0; i < nums.length; i++) {\n            if (nums[i] == target) return i;\n        }\n        return -1;\n    }\n}`,
        cpp: `class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        for (int i = 0; i < (int)nums.size(); ++i) {\n            if (nums[i] == target) return i;\n        }\n        return -1;\n    }\n};`,
      },
      lineByLine: [],
    },
    {
      tier: 'Optimal',
      title: 'Binary Search (Halving Boundaries)',
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1)',
      summary:
        'Track inclusive bounds [low, high]. Probe mid = low + (high - low) // 2 and shrink the half that cannot contain target.',
      dryRun: ['Probe mid, compare nums[mid] with target, discard half, repeat while low <= high.'],
      code: {
        python: `def search(nums: list[int], target: int) -> int:\n    low, high = 0, len(nums) - 1\n    while low <= high:\n        mid = low + (high - low) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1`,
        java: `class Solution {\n    public int search(int[] nums, int target) {\n        int low = 0, high = nums.length - 1;\n        while (low <= high) {\n            int mid = low + (high - low) / 2;\n            if (nums[mid] == target) {\n                return mid;\n            } else if (nums[mid] < target) {\n                low = mid + 1;\n            } else {\n                high = mid - 1;\n            }\n        }\n        return -1;\n    }\n}`,
        cpp: `class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        int low = 0, high = (int)nums.size() - 1;\n        while (low <= high) {\n            int mid = low + (high - low) / 2;\n            if (nums[mid] == target) {\n                return mid;\n            } else if (nums[mid] < target) {\n                low = mid + 1;\n            } else {\n                high = mid - 1;\n            }\n        }\n        return -1;\n    }\n};`,
      },
      lineByLine: [
        { lines: '1-2', explanation: 'Initialize inclusive search boundaries low = 0 and high = n - 1.' },
        { lines: '3-4', explanation: 'While the range [low, high] is non-empty, compute overflow-safe midpoint mid.' },
        { lines: '5-10', explanation: 'Return mid on match; otherwise shift low or high past mid to discard half.' },
      ],
    },
  ],
};

export const TWO_SUM_SORTED_PROBLEM: DsaProblem = {
  id: 'two-sum-sorted',
  number: 32,
  title: 'Two Sum (Array Swapping + Two Pointers)',
  category: 'Two Pointers',
  difficulty: 'Beginner',
  estimatedMinutes: 12,
  pattern: 'In-Place Swap Ordering + Converging Left/Right Pointers',
  coreIdea:
    'Sort elements in-place using pairwise swaps so smaller values move left and larger values move right, then converge left and right pointers toward each other based on whether nums[left] + nums[right] is below or above target.',
  statement:
    'Given an array of integers nums and an integer target, first reorder the array into ascending sequence via tracked swaps while remembering original indices, then walk two converging pointers (left and right) to locate the pair summing to target.',
  examples: [
    {
      input: 'nums = [7, 2, 15, 11], target = 9',
      output: '[0, 1] (values 2 + 7)',
      explanation: 'Swapping puts [2, 7, 11, 15] in order; left=0 (2) and right=1 (7) sum to 9.',
    },
  ],
  constraints: ['2 <= nums.length <= 10', 'Exactly one valid pair exists in standard cases'],
  starterCode: {
    python: `def two_sum_two_pointers(nums: list[int], target: int) -> list[int]:\n    pass`,
    java: `class Solution {\n    public int[] twoSumSorted(int[] nums, int target) {\n        return new int[]{};\n    }\n}`,
    cpp: `class Solution {\npublic:\n    vector<int> twoSumSorted(vector<int>& nums, int target) {\n        return {};\n    }\n};`,
  },
  visualizerKind: 'array',
  visualizationSteps: [],
  explainChapters: [],
  approaches: [
    {
      tier: 'Optimal',
      title: 'Swap-Sort + Converging Two Pointers',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)',
      summary:
        'Order pairs of (value, originalIndex) by swapping smaller elements forward, then sweep left and right pointers inward until nums[left] + nums[right] == target.',
      dryRun: ['Swap unsorted minimum into position i, then walk left & right pointers inward.'],
      code: {
        python: `def two_sum_two_pointers(nums: list[int], target: int) -> list[int]:\n    pairs = [[val, idx] for idx, val in enumerate(nums)]\n    for i in range(len(pairs)):\n        min_idx = min(range(i, len(pairs)), key=lambda k: pairs[k][0])\n        pairs[i], pairs[min_idx] = pairs[min_idx], pairs[i]\n    left, right = 0, len(pairs) - 1\n    while left < right:\n        curr_sum = pairs[left][0] + pairs[right][0]\n        if curr_sum == target:\n            return [pairs[left][1], pairs[right][1]]\n        elif curr_sum < target:\n            left += 1\n        else:\n            right -= 1\n    return []`,
        java: `class Solution {\n    public int[] twoSumSorted(int[] nums, int target) {\n        int[][] pairs = new int[nums.length][2];\n        for (int i = 0; i < nums.length; i++) pairs[i] = new int[]{nums[i], i};\n        for (int i = 0; i < pairs.length; i++) {\n            int minIdx = i;\n            for (int j = i + 1; j < pairs.length; j++) if (pairs[j][0] < pairs[minIdx][0]) minIdx = j;\n            int[] tmp = pairs[i]; pairs[i] = pairs[minIdx]; pairs[minIdx] = tmp;\n        }\n        int left = 0, right = pairs.length - 1;\n        while (left < right) {\n            int currSum = pairs[left][0] + pairs[right][0];\n            if (currSum == target) {\n                return new int[]{pairs[left][1], pairs[right][1]};\n            } else if (currSum < target) {\n                left++;\n            } else {\n                right--;\n            }\n        }\n        return new int[]{};\n    }\n}`,
        cpp: `class Solution {\npublic:\n    vector<int> twoSumSorted(vector<int>& nums, int target) {\n        vector<pair<int, int>> pairs;\n        for (int i = 0; i < (int)nums.size(); ++i) pairs.push_back({nums[i], i});\n        for (int i = 0; i < (int)pairs.size(); ++i) {\n            int minIdx = i;\n            for (int j = i + 1; j < (int)pairs.size(); ++j) if (pairs[j].first < pairs[minIdx].first) minIdx = j;\n            swap(pairs[i], pairs[minIdx]);\n        }\n        int left = 0, right = (int)pairs.size() - 1;\n        while (left < right) {\n            int currSum = pairs[left].first + pairs[right].first;\n            if (currSum == target) {\n                return {pairs[left].second, pairs[right].second};\n            } else if (currSum < target) {\n                ++left;\n            } else {\n                --right;\n            }\n        }\n        return {};\n    }\n};`,
      },
      lineByLine: [
        { lines: '1-5', explanation: 'Pair each value with its original index and swap elements into ascending order.' },
        { lines: '6-14', explanation: 'Initialize left=0, right=n-1 and move pointers inward based on curr_sum vs target.' },
      ],
    },
  ],
};

export interface BaseVisualizationProfile {
  algorithmId: 'two-sum' | 'two-sum-sorted' | 'binary-search';
  problem: DsaProblem;
  shortLabel: string;
  badge: string;
  primitives: string[];
  summary: string;
}

export const BASE_ALGORITHM_GENERATORS: Record<string, ProblemGeneratorEntry> = {
  'binary-search': {
    presets: [
      {
        id: 'bs-found',
        label: 'Target Found · [-1, 0, 3, 5, 9, 12], target = 9',
        summary: 'Right half probe converges on index 4 in 2 probes',
        inputs: { nums: '-1, 0, 3, 5, 9, 12', target: '9' },
      },
      {
        id: 'bs-missing',
        label: 'Not Found · [-1, 0, 3, 5, 9, 12], target = 2',
        summary: 'Demonstrates search bounds crossing (low > high) and returning -1',
        inputs: { nums: '-1, 0, 3, 5, 9, 12', target: '2' },
      },
      {
        id: 'bs-left-edge',
        label: 'Left Edge · [1, 4, 7, 11, 15, 20], target = 1',
        summary: 'Halves repeatedly to index 0',
        inputs: { nums: '1, 4, 7, 11, 15, 20', target: '1' },
      },
    ],
    customSpec: {
      fields: [
        {
          key: 'nums',
          label: 'nums (sorted ascending)',
          placeholder: '-1, 0, 3, 5, 9, 12',
          helper: '1 to 12 ascending integers',
        },
        {
          key: 'target',
          label: 'target',
          placeholder: '9',
          helper: 'Integer to locate',
        },
      ],
      defaultValues: { nums: '-1, 0, 3, 5, 9, 12', target: '9' },
    },
    generate(problem, inputs) {
      const nums = parseIntArray(inputs.nums ?? '-1, 0, 3, 5, 9, 12', 1, 12);
      const target = Number((inputs.target ?? '9').trim());
      if (!nums || !Number.isInteger(target)) {
        return { steps: [], error: 'Enter 1–12 integers for nums and an integer target.' };
      }
      for (let i = 1; i < nums.length; i++) {
        if (nums[i] < nums[i - 1]) {
          return { steps: [], error: 'Binary Search requires nums sorted in ascending order.' };
        }
      }

      const tb = new TraceBuilder(problem);
      const itemIds = createArrayItemIds(nums.length, 'bs');
      let low = 0;
      let high = nums.length - 1;
      const discarded = new Set<number>();

      tb.push({
        phase: 'Initialize Bounds',
        title: `Set search window [low = 0, high = ${high}]`,
        lines: {
          python: 'low, high = 0',
          java: 'int low = 0, high',
          cpp: 'int low = 0, high',
        },
        codeNote: `low = 0, high = ${high}, target = ${target}`,
        vars: [
          { name: 'target', value: target },
          { name: 'low', value: low, tone: 'active' },
          { name: 'high', value: high, tone: 'active' },
          { name: 'mid', value: '-' },
        ],
        visual: {
          mode: 'binary-search',
          arrayLabel: 'Sorted nums',
          arrayValues: nums,
          arrayItemIds: itemIds,
          pointers: { low, high },
          searchBounds: [low, high],
          operationBadge: `Active Search Window [${low} .. ${high}]`,
        },
        teaching: {
          happening: `We bracket the entire sorted array with low = 0 and high = ${high}.`,
          whyLine: 'Tracking inclusive endpoints lets us track the exact candidate interval still in play.',
          condition: `Initial window size = ${nums.length}.`,
          memoryChange: `Allocated scalar pointers low = 0 and high = ${high} (O(1) extra space).`,
          whatNext: `Enter while (low <= high) and compute the midpoint index.`,
        },
      });

      let stepSafety = 0;
      while (low <= high && stepSafety < 20) {
        stepSafety++;
        const mid = low + Math.floor((high - low) / 2);
        const midVal = nums[mid];

        tb.push({
          phase: 'Probe Midpoint',
          title: `Probe mid = ${mid} (nums[${mid}] = ${midVal}) vs target ${target}`,
          lines: {
            python: 'mid = low + (high - low) // 2',
            java: 'int mid = low + (high - low) / 2',
            cpp: 'int mid = low + (high - low) / 2',
          },
          codeNote: `mid = ${low} + (${high} - ${low}) // 2 = ${mid}`,
          vars: [
            { name: 'target', value: target },
            { name: 'low', value: low },
            { name: 'mid', value: mid, tone: 'active' },
            { name: 'high', value: high },
            { name: 'nums[mid]', value: midVal, tone: 'active' },
          ],
          visual: {
            mode: 'binary-search',
            arrayLabel: 'Sorted nums',
            arrayValues: nums,
            arrayItemIds: itemIds,
            pointers: { low, mid, high },
            activeIndices: [mid],
            discardedIndices: Array.from(discarded),
            searchBounds: [low, high],
            operationBadge: `Compare nums[${mid}] (${midVal}) vs target (${target})`,
          },
          teaching: {
            happening: `Compute midpoint index mid = ${mid}, whose value is ${midVal}.`,
            whyLine: 'Probing the exact center eliminates half of the remaining search space regardless of outcome.',
            condition: `low (${low}) <= high (${high}) is true.`,
            memoryChange: `Updated mid = ${mid}.`,
            whatNext:
              midVal === target
                ? `nums[${mid}] == ${target} -> return ${mid}!`
                : midVal < target
                  ? `${midVal} < ${target}: target must lie strictly right of mid.`
                  : `${midVal} > ${target}: target must lie strictly left of mid.`,
          },
        });

        if (midVal === target) {
          tb.push({
            phase: 'Target Found',
            title: `Match! nums[${mid}] == ${target}, return ${mid}`,
            lines: {
              python: 'return mid',
              java: 'return mid;',
              cpp: 'return mid;',
            },
            codeNote: `return ${mid}`,
            vars: [
              { name: 'target', value: target },
              { name: 'mid', value: mid, tone: 'positive' },
              { name: 'nums[mid]', value: midVal, tone: 'positive' },
              { name: 'result', value: mid, tone: 'positive' },
            ],
            visual: {
              mode: 'binary-search',
              arrayLabel: 'Sorted nums',
              arrayValues: nums,
              arrayItemIds: itemIds,
              pointers: { mid },
              matchedIndices: [mid],
              discardedIndices: Array.from(discarded),
              searchBounds: [low, high],
              resultBadge: `Output: ${mid} (Found ${target} at index ${mid})`,
            },
            teaching: {
              happening: `nums[${mid}] equals target ${target}, so we return index ${mid} immediately.`,
              whyLine: 'Once the midpoint matches target, no remaining candidates need inspection.',
              condition: `nums[${mid}] == ${target} evaluated to true.`,
              memoryChange: 'No further pointer updates; function returns result.',
              whatNext: 'Execution completes.',
            },
          });
          return { steps: tb.build() };
        }

        if (midVal < target) {
          for (let k = low; k <= mid; k++) discarded.add(k);
          const prevLow = low;
          low = mid + 1;
          tb.push({
            phase: 'Shrink Left Half',
            title: `${midVal} < ${target}: discard [${prevLow}..${mid}], move low -> ${low}`,
            lines: {
              python: 'low = mid + 1',
              java: 'low = mid + 1;',
              cpp: 'low = mid + 1;',
            },
            codeNote: `low = ${mid} + 1 = ${low}`,
            vars: [
              { name: 'target', value: target },
              { name: 'low', value: low, tone: 'warning' },
              { name: 'high', value: high },
              { name: 'eliminated', value: `[${prevLow}..${mid}]` },
            ],
            visual: {
              mode: 'binary-search',
              arrayLabel: 'Sorted nums',
              arrayValues: nums,
              arrayItemIds: itemIds,
              pointers: low <= high ? { low, high } : { high, low },
              discardedIndices: Array.from(discarded),
              searchBounds: low <= high ? [low, high] : undefined,
              operationBadge: `Discarded [${prevLow}..${mid}] · Moved low → ${low}`,
            },
            teaching: {
              happening: `Since nums[${mid}] = ${midVal} is smaller than ${target} and the array is sorted, indices ${prevLow}..${mid} are all too small.`,
              whyLine: 'Advancing low to mid + 1 cuts out mid and everything to its left in one move.',
              condition: `nums[mid] (${midVal}) < target (${target}) is true.`,
              memoryChange: `low updated from ${prevLow} to ${low}.`,
              whatNext:
                low <= high
                  ? `Loop continues with narrowed window [${low}..${high}].`
                  : `low (${low}) > high (${high}), so search space is empty.`,
            },
          });
        } else {
          for (let k = mid; k <= high; k++) discarded.add(k);
          const prevHigh = high;
          high = mid - 1;
          tb.push({
            phase: 'Shrink Right Half',
            title: `${midVal} > ${target}: discard [${mid}..${prevHigh}], move high -> ${high}`,
            lines: {
              python: 'high = mid - 1',
              java: 'high = mid - 1;',
              cpp: 'high = mid - 1;',
            },
            codeNote: `high = ${mid} - 1 = ${high}`,
            vars: [
              { name: 'target', value: target },
              { name: 'low', value: low },
              { name: 'high', value: high, tone: 'warning' },
              { name: 'eliminated', value: `[${mid}..${prevHigh}]` },
            ],
            visual: {
              mode: 'binary-search',
              arrayLabel: 'Sorted nums',
              arrayValues: nums,
              arrayItemIds: itemIds,
              pointers: low <= high ? { low, high } : { high, low },
              discardedIndices: Array.from(discarded),
              searchBounds: low <= high ? [low, high] : undefined,
              operationBadge: `Discarded [${mid}..${prevHigh}] · Moved high → ${high}`,
            },
            teaching: {
              happening: `Since nums[${mid}] = ${midVal} exceeds ${target}, indices ${mid}..${prevHigh} are all too large.`,
              whyLine: 'Moving high to mid - 1 cuts out mid and everything to its right.',
              condition: `nums[mid] (${midVal}) > target (${target}) is true.`,
              memoryChange: `high updated from ${prevHigh} to ${high}.`,
              whatNext:
                low <= high
                  ? `Loop continues with narrowed window [${low}..${high}].`
                  : `low (${low}) > high (${high}), so search space is empty.`,
            },
          });
        }
      }

      tb.push({
        phase: 'Not Found',
        title: `Bounds crossed (low = ${low} > high = ${high}), return -1`,
        lines: {
          python: 'return -1',
          java: 'return -1;',
          cpp: 'return -1;',
        },
        codeNote: 'return -1',
        vars: [
          { name: 'target', value: target },
          { name: 'low', value: low },
          { name: 'high', value: high },
          { name: 'result', value: -1, tone: 'warning' },
        ],
        visual: {
          mode: 'binary-search',
          arrayLabel: 'Sorted nums',
          arrayValues: nums,
          arrayItemIds: itemIds,
          discardedIndices: nums.map((_, idx) => idx),
          resultBadge: `Output: -1 (${target} is not in nums)`,
        },
        teaching: {
          happening: `low (${low}) crossed high (${high}), leaving zero candidate elements.`,
          whyLine: 'Returning -1 signals that target does not appear anywhere in nums.',
          condition: `while (low <= high) is now false.`,
          memoryChange: 'No state changes remain.',
          whatNext: 'Execution completes.',
        },
      });

      return { steps: tb.build() };
    },
  },

  'two-sum-sorted': {
    presets: [
      {
        id: 'tss-swap',
        label: 'Swap-Sort + Pointers · [7, 2, 15, 11], target = 9',
        summary: 'Shows animated array swapping before left/right pointers converge',
        inputs: { nums: '7, 2, 15, 11', target: '9' },
      },
      {
        id: 'tss-reverse',
        label: 'Reverse Order · [8, 3, 5, 1], target = 8',
        summary: 'Multiple element swaps followed by narrowing pointer scan',
        inputs: { nums: '8, 3, 5, 1', target: '8' },
      },
    ],
    customSpec: {
      fields: [
        {
          key: 'nums',
          label: 'nums (comma-separated)',
          placeholder: '7, 2, 15, 11',
          helper: '2 to 8 integers',
        },
        {
          key: 'target',
          label: 'target',
          placeholder: '9',
          helper: 'Target sum',
        },
      ],
      defaultValues: { nums: '7, 2, 15, 11', target: '9' },
    },
    generate(problem, inputs) {
      const rawNums = parseIntArray(inputs.nums ?? '7, 2, 15, 11', 2, 8);
      const target = Number((inputs.target ?? '9').trim());
      if (!rawNums || !Number.isInteger(target)) {
        return { steps: [], error: 'Enter 2–8 integers for nums and an integer target.' };
      }

      const tb = new TraceBuilder(problem);
      let pairs = rawNums.map((val, idx) => ({ val, origIdx: idx }));
      let itemIds = createArrayItemIds(rawNums.length, 'ts');

      const pairAux = () =>
        pairs.map((p, idx) => ({
          key: `[${idx}] val=${p.val}`,
          value: `orig=${p.origIdx}`,
          highlight: 'default' as const,
        }));

      tb.push({
        phase: 'Pair & Prepare',
        title: 'Tag each element with its original index before swapping',
        lines: {
          python: 'pairs = [[val, idx]',
          java: 'int[][] pairs = new int',
          cpp: 'vector<pair<int, int>> pairs',
        },
        codeNote: `pairs = [${pairs.map((p) => `(${p.val},#${p.origIdx})`).join(', ')}]`,
        vars: [
          { name: 'target', value: target },
          { name: 'phase', value: 'Swap-Sort' },
          { name: 'swaps', value: 0 },
        ],
        visual: {
          mode: 'two-pointers',
          arrayLabel: 'nums (animated array order)',
          arrayValues: pairs.map((p) => p.val),
          arrayItemIds: itemIds,
          auxTitle: 'Tracked Original Indices',
          auxKind: 'buckets',
          auxEntries: pairAux(),
          operationBadge: 'Preparing array for in-place ordering',
        },
        teaching: {
          happening: 'We pair each number with its original array index so sorting swaps never lose track of the answer indices.',
          whyLine: 'Two Pointers requires monotonic sorted order, yet Two Sum asks for original indices.',
          condition: 'Initialization step.',
          memoryChange: 'Stored (value, originalIndex) tuples in pairs.',
          whatNext: 'Sweep i from 0..n-1 and swap the minimum remaining element into slot i.',
        },
      });

      let swapCount = 0;
      for (let i = 0; i < pairs.length - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < pairs.length; j++) {
          if (pairs[j].val < pairs[minIdx].val) minIdx = j;
        }
        if (minIdx !== i) {
          const leftVal = pairs[i].val;
          const rightVal = pairs[minIdx].val;
          const snap = swapArraySnapshot(pairs, itemIds, i, minIdx);
          pairs = snap.values;
          itemIds = snap.itemIds;
          swapCount++;

          tb.push({
            phase: 'Array Swap',
            title: `Swap index ${i} (${leftVal}) ↔ index ${minIdx} (${rightVal})`,
            lines: {
              python: 'pairs[i], pairs[min_idx] = pairs[min_idx], pairs[i]',
              java: 'int[] tmp = pairs[i]; pairs[i] = pairs[minIdx]; pairs[minIdx] = tmp;',
              cpp: 'swap(pairs[i], pairs[minIdx]);',
            },
            codeNote: `swap(pairs[${i}], pairs[${minIdx}])`,
            vars: [
              { name: 'target', value: target },
              { name: 'i', value: i, tone: 'active' },
              { name: 'minIdx', value: minIdx, tone: 'warning' },
              { name: 'swaps', value: swapCount, tone: 'active' },
            ],
            visual: {
              mode: 'two-pointers',
              arrayLabel: 'nums (swapping into sorted order)',
              arrayValues: pairs.map((p) => p.val),
              arrayItemIds: itemIds,
              pointers: { i, min: minIdx },
              swapPair: [i, minIdx],
              operationBadge: `⇄ Swapped ${leftVal} ↔ ${rightVal} into ascending slot ${i}`,
              auxTitle: 'Tracked Original Indices',
              auxKind: 'buckets',
              auxEntries: pairs.map((p, idx) => ({
                key: `[${idx}] val=${p.val}`,
                value: `orig=${p.origIdx}`,
                highlight: idx === i || idx === minIdx ? 'active' : 'default',
              })),
            },
            teaching: {
              happening: `Swapped element ${rightVal} from index ${minIdx} into index ${i} (displacing ${leftVal}).`,
              whyLine: 'Placing the smallest remaining element at i guarantees prefix [0..i] is sorted.',
              condition: `pairs[${minIdx}] (${rightVal}) < pairs[${i}] (${leftVal}).`,
              memoryChange: `Exchanged positions ${i} and ${minIdx} in-place (swap #${swapCount}).`,
              whatNext: 'Continue sorting remaining suffix before starting Two Pointers.',
            },
          });
        }
      }

      let left = 0;
      let right = pairs.length - 1;

      tb.push({
        phase: 'Two Pointers Init',
        title: `Array sorted! Place pointers left = 0, right = ${right}`,
        lines: {
          python: 'left, right = 0',
          java: 'int left = 0, right',
          cpp: 'int left = 0, right',
        },
        codeNote: `left = 0 (${pairs[left].val}), right = ${right} (${pairs[right].val})`,
        vars: [
          { name: 'target', value: target },
          { name: 'left', value: left, tone: 'active' },
          { name: 'right', value: right, tone: 'active' },
          { name: 'swaps', value: swapCount },
        ],
        visual: {
          mode: 'two-pointers',
          arrayLabel: 'Sorted nums',
          arrayValues: pairs.map((p) => p.val),
          arrayItemIds: itemIds,
          pointers: { left, right },
          searchBounds: [left, right],
          compareIndices: [left, right],
          operationBadge: `Two Pointers active on [left=${left}, right=${right}]`,
          auxTitle: 'Tracked Original Indices',
          auxKind: 'buckets',
          auxEntries: pairAux(),
        },
        teaching: {
          happening: `With the array sorted, we place left at the minimum (${pairs[left].val}) and right at the maximum (${pairs[right].val}).`,
          whyLine: 'Moving left rightward increases the sum; moving right leftward decreases the sum.',
          condition: `left (0) < right (${right}).`,
          memoryChange: `Initialized left = 0 and right = ${right}.`,
          whatNext: `Evaluate currSum = ${pairs[left].val} + ${pairs[right].val}.`,
        },
      });

      while (left < right) {
        const sum = pairs[left].val + pairs[right].val;
        const leftOrig = pairs[left].origIdx;
        const rightOrig = pairs[right].origIdx;

        if (sum === target) {
          tb.push({
            phase: 'Match Found',
            title: `${pairs[left].val} + ${pairs[right].val} == ${target}! Return [${leftOrig}, ${rightOrig}]`,
            lines: {
              python: 'return [pairs[left][1], pairs[right][1]]',
              java: 'return new int[]{pairs[left][1], pairs[right][1]};',
              cpp: 'return {pairs[left].second, pairs[right].second};',
            },
            codeNote: `return [${leftOrig}, ${rightOrig}]`,
            vars: [
              { name: 'target', value: target },
              { name: 'left', value: left, tone: 'positive' },
              { name: 'right', value: right, tone: 'positive' },
              { name: 'currSum', value: sum, tone: 'positive' },
              { name: 'result', value: `[${leftOrig}, ${rightOrig}]`, tone: 'positive' },
            ],
            visual: {
              mode: 'two-pointers',
              arrayLabel: 'Sorted nums',
              arrayValues: pairs.map((p) => p.val),
              arrayItemIds: itemIds,
              pointers: { left, right },
              matchedIndices: [left, right],
              compareIndices: [left, right],
              auxTitle: 'Tracked Original Indices',
              auxKind: 'buckets',
              auxEntries: pairs.map((p, idx) => ({
                key: `[${idx}] val=${p.val}`,
                value: `orig=${p.origIdx}`,
                highlight: idx === left || idx === right ? 'match' : 'default',
              })),
              resultBadge: `Output: [${leftOrig}, ${rightOrig}] (${pairs[left].val} + ${pairs[right].val} = ${target})`,
            },
            teaching: {
              happening: `Sum ${pairs[left].val} + ${pairs[right].val} equals target ${target}. Original indices are [${leftOrig}, ${rightOrig}].`,
              whyLine: 'We read original indices from the tracked tuples so sorting swaps never affect correctness.',
              condition: `currSum (${sum}) == target (${target}) is true.`,
              memoryChange: 'No mutations; returning matched index pair.',
              whatNext: 'Execution completes.',
            },
          });
          return { steps: tb.build() };
        }

        if (sum < target) {
          const prevLeft = left;
          left++;
          tb.push({
            phase: 'Advance Left Pointer',
            title: `${pairs[prevLeft].val} + ${pairs[right].val} = ${sum} < ${target}: move left -> ${left}`,
            lines: {
              python: 'left += 1',
              java: 'left++;',
              cpp: '++left;',
            },
            codeNote: `${sum} < ${target} -> left = ${left}`,
            vars: [
              { name: 'target', value: target },
              { name: 'currSum', value: sum, tone: 'warning' },
              { name: 'left', value: left, tone: 'active' },
              { name: 'right', value: right },
            ],
            visual: {
              mode: 'two-pointers',
              arrayLabel: 'Sorted nums',
              arrayValues: pairs.map((p) => p.val),
              arrayItemIds: itemIds,
              pointers: { left, right },
              searchBounds: [left, right],
              activeIndices: [left, right],
              compareIndices: [left, right],
              operationBadge: `Sum ${sum} < ${target} · Move left → ${left} to increase sum`,
              auxTitle: 'Tracked Original Indices',
              auxKind: 'buckets',
              auxEntries: pairAux(),
            },
            teaching: {
              happening: `Sum ${sum} is too small compared to ${target}, so we step left forward from ${prevLeft} to ${left}.`,
              whyLine: 'Because nums[right] is already the largest element in range, pairing nums[prevLeft] with anything smaller would also be < target.',
              condition: `currSum (${sum}) < target (${target}).`,
              memoryChange: `left moved ${prevLeft} -> ${left}.`,
              whatNext: left < right ? `Re-evaluate nums[${left}] + nums[${right}].` : 'Pointers met.',
            },
          });
        } else {
          const prevRight = right;
          right--;
          tb.push({
            phase: 'Retreat Right Pointer',
            title: `${pairs[left].val} + ${pairs[prevRight].val} = ${sum} > ${target}: move right -> ${right}`,
            lines: {
              python: 'right -= 1',
              java: 'right--;',
              cpp: '--right;',
            },
            codeNote: `${sum} > ${target} -> right = ${right}`,
            vars: [
              { name: 'target', value: target },
              { name: 'currSum', value: sum, tone: 'warning' },
              { name: 'left', value: left },
              { name: 'right', value: right, tone: 'active' },
            ],
            visual: {
              mode: 'two-pointers',
              arrayLabel: 'Sorted nums',
              arrayValues: pairs.map((p) => p.val),
              arrayItemIds: itemIds,
              pointers: { left, right },
              searchBounds: [left, right],
              activeIndices: [left, right],
              compareIndices: [left, right],
              operationBadge: `Sum ${sum} > ${target} · Move right → ${right} to decrease sum`,
              auxTitle: 'Tracked Original Indices',
              auxKind: 'buckets',
              auxEntries: pairAux(),
            },
            teaching: {
              happening: `Sum ${sum} exceeds ${target}, so we step right backward from ${prevRight} to ${right}.`,
              whyLine: 'Because nums[left] is the smallest available candidate, pairing nums[prevRight] with anything larger would also exceed target.',
              condition: `currSum (${sum}) > target (${target}).`,
              memoryChange: `right moved ${prevRight} -> ${right}.`,
              whatNext: left < right ? `Re-evaluate nums[${left}] + nums[${right}].` : 'Pointers met.',
            },
          });
        }
      }

      tb.push({
        phase: 'No Pair Found',
        title: 'Pointers crossed (left >= right), return []',
        lines: {
          python: 'return []',
          java: 'return new int[]{};',
          cpp: 'return {};',
        },
        codeNote: 'return []',
        vars: [
          { name: 'target', value: target },
          { name: 'left', value: left },
          { name: 'right', value: right },
          { name: 'result', value: '[]', tone: 'warning' },
        ],
        visual: {
          mode: 'two-pointers',
          arrayLabel: 'Sorted nums',
          arrayValues: pairs.map((p) => p.val),
          arrayItemIds: itemIds,
          discardedIndices: pairs.map((_, idx) => idx),
          resultBadge: `Output: [] (No pair sums to ${target})`,
        },
        teaching: {
          happening: 'left and right met without finding a pair equal to target.',
          whyLine: 'Once left >= right, all distinct candidate pairs have been ruled out.',
          condition: 'while (left < right) is now false.',
          memoryChange: 'No state changes remain.',
          whatNext: 'Execution completes.',
        },
      });

      return { steps: tb.build() };
    },
  },
};
