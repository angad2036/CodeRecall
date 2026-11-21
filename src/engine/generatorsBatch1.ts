import type { DsaProblem } from '../types/dsa';
import {
  TraceBuilder,
  parseIntArray,
  parseStringList,
} from './traceHelpers';
import type {
  AuxEntry,
  CustomInputSpec,
  ExecutionPreset,
  TraceStep,
} from './types';

export interface ProblemGeneratorEntry {
  presets: ExecutionPreset[];
  customSpec?: CustomInputSpec;
  generate: (
    problem: DsaProblem,
    inputs: Record<string, string>,
  ) => { steps: TraceStep[]; error?: string };
}

function mapEntries(map: Map<string | number, string | number>, activeKey?: string | number, matchKey?: string | number): AuxEntry[] {
  if (map.size === 0) return [];
  return Array.from(map.entries()).map(([k, v]) => ({
    key: String(k),
    value: String(v),
    highlight:
      matchKey !== undefined && String(k) === String(matchKey)
        ? 'match'
        : activeKey !== undefined && String(k) === String(activeKey)
          ? 'active'
          : 'default',
  }));
}

export const GENERATORS_BATCH_1: Record<string, ProblemGeneratorEntry> = {
  'two-sum': {
    presets: [
      {
        id: 'ts-standard',
        label: 'Example 1 · [2, 11, 7, 15], target = 9',
        summary: 'Match found mid-scan via complement lookup',
        inputs: { nums: '2, 11, 7, 15', target: '9' },
      },
      {
        id: 'ts-dup',
        label: 'Duplicates · [3, 2, 3], target = 6',
        summary: 'Shows why check-before-insert handles identical values',
        inputs: { nums: '3, 2, 3', target: '6' },
      },
    ],
    customSpec: {
      fields: [
        { key: 'nums', label: 'nums (comma-separated)', placeholder: '2, 11, 7, 15', helper: '2 to 10 integers' },
        { key: 'target', label: 'target', placeholder: '9', helper: 'Target integer sum' },
      ],
      defaultValues: { nums: '2, 11, 7, 15', target: '9' },
    },
    generate(problem, inputs) {
      const nums = parseIntArray(inputs.nums ?? '2, 11, 7, 15', 2, 10);
      const target = Number((inputs.target ?? '9').trim());
      if (!nums || !Number.isInteger(target)) {
        return { steps: [], error: 'Enter 2–10 integers for nums and an integer target.' };
      }

      const tb = new TraceBuilder(problem);
      const seen = new Map<number, number>();

      tb.push({
        phase: 'Initialize',
        title: 'Create empty complement hash map',
        lines: {
          python: 'seen:',
          java: 'Map<Integer, Integer> seen',
          cpp: 'unordered_map<int, int> seen',
        },
        codeNote: 'seen = {}',
        vars: [
          { name: 'target', value: target },
          { name: 'i', value: '-' },
          { name: 'seen.size', value: 0 },
        ],
        visual: {
          mode: 'array',
          arrayLabel: 'nums',
          arrayValues: nums,
          auxTitle: 'seen HashMap (value -> index)',
          auxKind: 'hashmap',
          auxEntries: [],
        },
        teaching: {
          happening: 'We allocate an empty hash map named seen before scanning the array.',
          whyLine: 'Storing visited value -> index pairs lets us answer "have we seen target - num?" in O(1) time instead of rescanning earlier elements.',
          condition: 'Loop has not started yet.',
          memoryChange: 'seen is initialized to empty {} in memory.',
          whatNext: 'Begin iterating from index i = 0.',
        },
      });

      for (let i = 0; i < nums.length; i++) {
        const num = nums[i];
        const comp = target - num;

        tb.push({
          phase: 'Compute Complement',
          title: `Check partner needed at i = ${i} (num = ${num})`,
          lines: {
            python: 'complement = target - num',
            java: 'int complement = target - nums[i]',
            cpp: 'int complement = target - nums[i]',
          },
          codeNote: `complement = ${target} - ${num} = ${comp}`,
          vars: [
            { name: 'target', value: target },
            { name: 'i', value: i, tone: 'active' },
            { name: 'num', value: num },
            { name: 'complement', value: comp, tone: 'active' },
            { name: 'seen.size', value: seen.size },
          ],
          visual: {
            mode: 'array',
            arrayLabel: 'nums',
            arrayValues: nums,
            pointers: { i },
            activeIndices: [i],
            auxTitle: 'seen HashMap (value -> index)',
            auxKind: 'hashmap',
            auxEntries: mapEntries(seen),
          },
          teaching: {
            happening: `At index ${i}, the element is ${num}. To reach target ${target}, its partner must be ${comp}.`,
            whyLine: 'Rearranging nums[i] + x = target turns a two-number search into a single exact lookup.',
            condition: `i = ${i} < ${nums.length} (inside array bounds).`,
            memoryChange: `Computed local variable complement = ${comp}.`,
            whatNext: `Query whether ${comp} already exists as a key inside seen.`,
          },
        });

        if (seen.has(comp)) {
          const matchIdx = seen.get(comp)!;
          tb.push({
            phase: 'Match Found',
            title: `Found complement ${comp} at index ${matchIdx}!`,
            lines: {
              python: 'return [seen[complement], i]',
              java: 'return new int[]{seen.get(complement), i}',
              cpp: 'return {seen[complement], i}',
            },
            codeNote: `return [${matchIdx}, ${i}]`,
            vars: [
              { name: 'target', value: target },
              { name: 'i', value: i },
              { name: 'num', value: num },
              { name: 'complement', value: comp, tone: 'positive' },
              { name: 'result', value: `[${matchIdx}, ${i}]`, tone: 'positive' },
            ],
            visual: {
              mode: 'array',
              arrayLabel: 'nums',
              arrayValues: nums,
              pointers: { j: matchIdx, i },
              matchedIndices: [matchIdx, i],
              auxTitle: 'seen HashMap (value -> index)',
              auxKind: 'hashmap',
              auxEntries: mapEntries(seen, undefined, comp),
              resultBadge: `Answer: [${matchIdx}, ${i}] (${nums[matchIdx]} + ${num} = ${target})`,
            },
            teaching: {
              happening: `Hash lookup succeeds! ${comp} is already stored in seen at index ${matchIdx}.`,
              whyLine: 'Checking seen BEFORE inserting nums[i] guarantees we never pair an element with itself.',
              condition: `${comp} in seen === true -> early return [${matchIdx}, ${i}].`,
              memoryChange: 'No mutation needed; returning result pair immediately.',
              whatNext: 'Execution terminates and returns the valid index pair.',
            },
          });
          return { steps: tb.build() };
        }

        seen.set(num, i);
        tb.push({
          phase: 'Insert Seen',
          title: `Complement ${comp} absent — store ${num} -> ${i}`,
          lines: {
            python: 'seen[num] = i',
            java: 'seen.put(nums[i], i)',
            cpp: 'seen[nums[i]] = i',
          },
          codeNote: `seen[${num}] = ${i}`,
          vars: [
            { name: 'target', value: target },
            { name: 'i', value: i },
            { name: 'num', value: num },
            { name: 'complement', value: comp },
            { name: 'seen.size', value: seen.size, tone: 'active' },
          ],
          visual: {
            mode: 'array',
            arrayLabel: 'nums',
            arrayValues: nums,
            pointers: { i },
            activeIndices: [i],
            auxTitle: 'seen HashMap (value -> index)',
            auxKind: 'hashmap',
            auxEntries: mapEntries(seen, num),
          },
          teaching: {
            happening: `${comp} was not seen to the left of index ${i}, so we record ${num} -> ${i} in seen.`,
            whyLine: 'Future elements to the right may need ${num} as their complement.',
            condition: `${comp} in seen === false.`,
            memoryChange: `Inserted entry ${num} -> ${i} into seen (size now ${seen.size}).`,
            whatNext: i + 1 < nums.length ? `Advance loop to index ${i + 1}.` : 'Loop finishes; return empty array.',
          },
        });
      }

      tb.push({
        phase: 'Return',
        title: 'No valid pair found',
        lines: { python: 'return []', java: 'return new int[]{}', cpp: 'return {}' },
        codeNote: 'return []',
        vars: [
          { name: 'target', value: target },
          { name: 'result', value: '[]', tone: 'warning' },
        ],
        visual: {
          mode: 'array',
          arrayLabel: 'nums',
          arrayValues: nums,
          auxTitle: 'seen HashMap',
          auxKind: 'hashmap',
          auxEntries: mapEntries(seen),
          resultBadge: 'No pair sums to target',
        },
        teaching: {
          happening: 'Scanned all elements without finding a matching pair.',
          whyLine: 'Reached end of loop cleanly.',
          condition: 'Loop completed.',
          memoryChange: 'No further changes.',
          whatNext: 'Return empty list.',
        },
      });

      return { steps: tb.build() };
    },
  },

  'best-time-to-buy-and-sell-stock': {
    presets: [
      {
        id: 'bt-standard',
        label: 'Example 1 · [7, 1, 5, 3, 6, 4]',
        summary: 'Buy at 1 (day 1), sell at 6 (day 4) for profit 5',
        inputs: { prices: '7, 1, 5, 3, 6, 4' },
      },
      {
        id: 'bt-decline',
        label: 'Falling Market · [7, 6, 4, 3, 1]',
        summary: 'Strictly decreasing prices return 0 profit',
        inputs: { prices: '7, 6, 4, 3, 1' },
      },
    ],
    customSpec: {
      fields: [
        { key: 'prices', label: 'prices (comma-separated)', placeholder: '7, 1, 5, 3, 6, 4', helper: '2 to 10 non-negative integers' },
      ],
      defaultValues: { prices: '7, 1, 5, 3, 6, 4' },
    },
    generate(problem, inputs) {
      const prices = parseIntArray(inputs.prices ?? '7, 1, 5, 3, 6, 4', 2, 10);
      if (!prices || prices.some((p) => p < 0)) {
        return { steps: [], error: 'Enter 2–10 non-negative integer stock prices.' };
      }

      const tb = new TraceBuilder(problem);
      let minPrice = Infinity;
      let minIdx = -1;
      let maxProfit = 0;
      let bestBuyIdx = 0;
      let bestSellIdx = 0;

      tb.push({
        phase: 'Initialize',
        title: 'Initialize minPrice = +∞ and maxProfit = 0',
        lines: {
          python: 'min_price = float',
          java: 'int minPrice = Integer.MAX_VALUE',
          cpp: 'int minPrice = INT_MAX',
        },
        codeNote: 'minPrice = ∞, maxProfit = 0',
        vars: [
          { name: 'minPrice', value: '∞' },
          { name: 'maxProfit', value: 0 },
          { name: 'day', value: '-' },
        ],
        visual: {
          mode: 'bars',
          arrayLabel: 'Stock Prices by Day',
          arrayValues: prices,
        },
        teaching: {
          happening: 'Initialize minPrice to infinity so Day 0 automatically becomes our first candidate buy price, and maxProfit to 0.',
          whyLine: 'Starting maxProfit at 0 guarantees we return 0 if prices fall every single day.',
          condition: 'Before scanning Day 0.',
          memoryChange: 'minPrice = +∞, maxProfit = 0.',
          whatNext: 'Inspect Day 0 price.',
        },
      });

      for (let i = 0; i < prices.length; i++) {
        const price = prices[i];
        if (price < minPrice) {
          minPrice = price;
          minIdx = i;
          tb.push({
            phase: 'Update Minimum',
            title: `Day ${i}: New lowest buy price ${price}`,
            lines: {
              python: 'min_price = price',
              java: 'if (price < minPrice) minPrice = price',
              cpp: 'minPrice = min(minPrice, price)',
            },
            codeNote: `minPrice = ${price}`,
            vars: [
              { name: 'day', value: i, tone: 'active' },
              { name: 'price', value: price },
              { name: 'minPrice', value: minPrice, tone: 'active' },
              { name: 'maxProfit', value: maxProfit },
            ],
            visual: {
              mode: 'bars',
              arrayLabel: 'Stock Prices by Day',
              arrayValues: prices,
              pointers: { buy: minIdx, i },
              activeIndices: [i],
              matchedIndices: maxProfit > 0 ? [bestBuyIdx, bestSellIdx] : undefined,
            },
            teaching: {
              happening: `Today's price (${price}) is lower than any previous day, so buying today beats all earlier entry points.`,
              whyLine: 'Any future sale benefits from the lowest possible prior purchase price.',
              condition: `price (${price}) < previous minPrice -> true.`,
              memoryChange: `Updated minPrice to ${minPrice} (Day ${i}).`,
              whatNext: i + 1 < prices.length ? `Move to Day ${i + 1}.` : 'Finish scan and return maxProfit.',
            },
          });
        } else {
          const profit = price - minPrice;
          const improved = profit > maxProfit;
          if (improved) {
            maxProfit = profit;
            bestBuyIdx = minIdx;
            bestSellIdx = i;
          }
          tb.push({
            phase: improved ? 'New Best Profit' : 'Evaluate Sale',
            title: `Day ${i}: Sell at ${price} vs min ${minPrice} -> profit ${profit}`,
            lines: {
              python: 'max_profit = max(max_profit, price - min_price)',
              java: 'else maxProfit = Math.max(maxProfit, price - minPrice)',
              cpp: 'maxProfit = max(maxProfit, price - minPrice)',
            },
            codeNote: `profit = ${price} - ${minPrice} = ${profit}`,
            vars: [
              { name: 'day', value: i },
              { name: 'price', value: price },
              { name: 'minPrice', value: minPrice },
              { name: 'todayProfit', value: profit, tone: improved ? 'positive' : 'neutral' },
              { name: 'maxProfit', value: maxProfit, tone: improved ? 'positive' : 'neutral' },
            ],
            visual: {
              mode: 'bars',
              arrayLabel: 'Stock Prices by Day',
              arrayValues: prices,
              pointers: { buy: minIdx, sell: i },
              activeIndices: [i],
              matchedIndices: maxProfit > 0 ? [bestBuyIdx, bestSellIdx] : undefined,
            },
            teaching: {
              happening: `Price ${price} is >= minPrice (${minPrice}), so we evaluate selling today for profit ${profit}.`,
              whyLine: 'To maximize profit selling on day i, we pair it with the minimum price strictly before day i.',
              condition: improved ? `${profit} > previous maxProfit -> new record!` : `${profit} <= maxProfit (${maxProfit}) -> keep existing best.`,
              memoryChange: improved ? `Updated maxProfit to ${maxProfit}.` : 'maxProfit unchanged.',
              whatNext: i + 1 < prices.length ? `Inspect Day ${i + 1}.` : 'Return final maxProfit.',
            },
          });
        }
      }

      tb.push({
        phase: 'Return',
        title: `Return maxProfit = ${maxProfit}`,
        lines: {
          python: 'return max_profit',
          java: 'return maxProfit',
          cpp: 'return maxProfit',
        },
        codeNote: `return ${maxProfit}`,
        vars: [
          { name: 'minPrice', value: minPrice },
          { name: 'maxProfit', value: maxProfit, tone: 'positive' },
        ],
        visual: {
          mode: 'bars',
          arrayLabel: 'Stock Prices by Day',
          arrayValues: prices,
          matchedIndices: maxProfit > 0 ? [bestBuyIdx, bestSellIdx] : undefined,
          resultBadge: maxProfit > 0 ? `Best Profit: ${maxProfit} (Buy Day ${bestBuyIdx}, Sell Day ${bestSellIdx})` : 'Best Profit: 0 (no profitable trade)',
        },
        teaching: {
          happening: `Single pass finished. Maximum achievable profit is ${maxProfit}.`,
          whyLine: 'All days have been evaluated in O(n) time and O(1) memory.',
          condition: 'Loop terminated.',
          memoryChange: 'Final answer ready.',
          whatNext: 'Done.',
        },
      });

      return { steps: tb.build() };
    },
  },

  'maximum-subarray': {
    presets: [
      {
        id: 'ms-standard',
        label: 'Example 1 · [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
        summary: 'Subarray [4, -1, 2, 1] achieves sum 6',
        inputs: { nums: '-2, 1, -3, 4, -1, 2, 1, -5, 4' },
      },
      {
        id: 'ms-neg',
        label: 'All Negative · [-5, -2, -8, -1]',
        summary: 'Proves why curr/best start at nums[0] instead of 0',
        inputs: { nums: '-5, -2, -8, -1' },
      },
    ],
    customSpec: {
      fields: [
        { key: 'nums', label: 'nums (comma-separated)', placeholder: '-2, 1, -3, 4, -1, 2, 1', helper: '1 to 10 integers' },
      ],
      defaultValues: { nums: '-2, 1, -3, 4, -1, 2, 1, -5, 4' },
    },
    generate(problem, inputs) {
      const nums = parseIntArray(inputs.nums ?? '-2, 1, -3, 4, -1, 2, 1, -5, 4', 1, 10);
      if (!nums) return { steps: [], error: 'Enter 1–10 integers for nums.' };

      const tb = new TraceBuilder(problem);
      let curr = nums[0];
      let best = nums[0];
      let currStart = 0;
      let bestRange: [number, number] = [0, 0];

      tb.push({
        phase: 'Seed State',
        title: `Initialize curr = best = nums[0] (${nums[0]})`,
        lines: {
          python: 'curr = best = nums[0]',
          java: 'int curr = nums[0]',
          cpp: 'int curr = nums[0]',
        },
        codeNote: `curr = ${curr}, best = ${best}`,
        vars: [
          { name: 'i', value: 0 },
          { name: 'curr', value: curr },
          { name: 'best', value: best },
          { name: 'window', value: '[0..0]' },
        ],
        visual: {
          mode: 'sliding-window',
          arrayLabel: 'nums (Kadane Active Subarray)',
          arrayValues: nums,
          pointers: { start: 0, i: 0 },
          windowRange: [0, 0],
          activeIndices: [0],
        },
        teaching: {
          happening: `Seed both curr and best with nums[0] = ${nums[0]}.`,
          whyLine: 'Initializing to nums[0] rather than 0 handles all-negative arrays where at least one element must be chosen.',
          condition: 'Base case for subarray ending at index 0.',
          memoryChange: `curr = ${curr}, best = ${best}.`,
          whatNext: nums.length > 1 ? 'Compare extending vs restarting from index 1.' : 'Return best.',
        },
      });

      for (let i = 1; i < nums.length; i++) {
        const num = nums[i];
        const extended = curr + num;
        const restart = num > extended;
        curr = restart ? num : extended;
        if (restart) currStart = i;
        const newBest = curr > best;
        if (newBest) {
          best = curr;
          bestRange = [currStart, i];
        }

        tb.push({
          phase: restart ? 'Restart Fresh' : 'Extend Subarray',
          title: `i = ${i} (${num}): ${restart ? `Restart at ${num}` : `Extend to ${extended}`}`,
          lines: {
            python: 'curr = max(num, curr + num)',
            java: 'curr = Math.max(nums[i], curr + nums[i])',
            cpp: 'curr = max(nums[i], curr + nums[i])',
          },
          codeNote: `max(${num}, ${extended}) = ${curr}`,
          vars: [
            { name: 'i', value: i, tone: 'active' },
            { name: 'nums[i]', value: num },
            { name: 'curr', value: curr, tone: restart ? 'warning' : 'active' },
            { name: 'best', value: best, tone: newBest ? 'positive' : 'neutral' },
            { name: 'window', value: `[${currStart}..${i}]` },
          ],
          visual: {
            mode: 'sliding-window',
            arrayLabel: 'nums (Kadane Active Subarray)',
            arrayValues: nums,
            pointers: { start: currStart, i },
            windowRange: [currStart, i],
            matchedIndices: newBest ? Array.from({ length: i - currStart + 1 }, (_, k) => currStart + k) : undefined,
          },
          teaching: {
            happening: restart
              ? `Previous sum dragged ${num} down (${extended} < ${num}), so we discard the negative prefix and restart at index ${i}.`
              : `Previous prefix was positive, so appending ${num} boosts our sum to ${curr}.`,
            whyLine: 'Kadane chooses between starting fresh at nums[i] or extending the best subarray ending at i-1.',
            condition: `${num} ${restart ? '>' : '<='} ${extended} -> ${restart ? 'restart' : 'extend'}.`,
            memoryChange: `curr = ${curr}${newBest ? `, new best = ${best}` : ''}.`,
            whatNext: i + 1 < nums.length ? `Advance to index ${i + 1}.` : `Finish loop and return best = ${best}.`,
          },
        });
      }

      const bestIndices = Array.from(
        { length: bestRange[1] - bestRange[0] + 1 },
        (_, k) => bestRange[0] + k,
      );
      tb.push({
        phase: 'Return',
        title: `Return best = ${best}`,
        lines: { python: 'return best', java: 'return best', cpp: 'return best' },
        codeNote: `return ${best}`,
        vars: [
          { name: 'best', value: best, tone: 'positive' },
          { name: 'bestRange', value: `[${bestRange[0]}..${bestRange[1]}]` },
        ],
        visual: {
          mode: 'sliding-window',
          arrayLabel: 'Maximum Contiguous Subarray',
          arrayValues: nums,
          windowRange: bestRange,
          matchedIndices: bestIndices,
          resultBadge: `Max Sum: ${best} (subarray [${nums.slice(bestRange[0], bestRange[1] + 1).join(', ')}])`,
        },
        teaching: {
          happening: `Kadane's scan completed with maximum subarray sum ${best}.`,
          whyLine: 'Every index was examined once in O(n) time and O(1) extra space.',
          condition: 'End of array reached.',
          memoryChange: 'Final answer returned.',
          whatNext: 'Done.',
        },
      });

      return { steps: tb.build() };
    },
  },

  'product-of-array-except-self': {
    presets: [
      {
        id: 'pa-standard',
        label: 'Example 1 · [1, 2, 3, 4]',
        summary: 'Prefix pass [1, 1, 2, 6] then suffix pass [24, 12, 8, 6]',
        inputs: { nums: '1, 2, 3, 4' },
      },
      {
        id: 'pa-zero',
        label: 'Contains Zero · [-1, 1, 0, -3, 3]',
        summary: 'Zero-safe without division: [0, 0, 9, 0, 0]',
        inputs: { nums: '-1, 1, 0, -3, 3' },
      },
    ],
    customSpec: {
      fields: [
        { key: 'nums', label: 'nums (comma-separated)', placeholder: '1, 2, 3, 4', helper: '2 to 8 integers' },
      ],
      defaultValues: { nums: '1, 2, 3, 4' },
    },
    generate(problem, inputs) {
      const nums = parseIntArray(inputs.nums ?? '1, 2, 3, 4', 2, 8);
      if (!nums) return { steps: [], error: 'Enter 2–8 integers for nums.' };

      const tb = new TraceBuilder(problem);
      const n = nums.length;
      const res = new Array<number>(n).fill(1);
      let prefix = 1;

      tb.push({
        phase: 'Initialize',
        title: 'Allocate output array res filled with 1s',
        lines: {
          python: 'res = [1] * n',
          java: 'int[] res = new int[n]',
          cpp: 'vector<int> res(n, 1)',
        },
        codeNote: `n = ${n}, prefix = 1`,
        vars: [
          { name: 'pass', value: 'Prefix (L -> R)' },
          { name: 'prefix', value: 1 },
          { name: 'suffix', value: 1 },
        ],
        visual: {
          mode: 'array',
          arrayLabel: 'nums (input)',
          arrayValues: nums,
          secondaryArrayLabel: 'res (output accumulator)',
          secondaryArrayValues: [...res],
        },
        teaching: {
          happening: 'We prepare output array res of length n and scalar prefix = 1.',
          whyLine: 'Reusing the output array to hold left products avoids allocating separate left/right arrays.',
          condition: 'Ready for forward prefix pass.',
          memoryChange: `Allocated res of length ${n}.`,
          whatNext: 'Sweep left to right writing strict left products into res[i].',
        },
      });

      for (let i = 0; i < n; i++) {
        res[i] = prefix;
        const nextPrefix = prefix * nums[i];
        tb.push({
          phase: 'Prefix Pass',
          title: `i = ${i}: write res[${i}] = ${prefix}, then prefix *= ${nums[i]}`,
          lines: {
            python: 'res[i] = prefix',
            java: 'res[i] = prefix;',
            cpp: 'res[i] = prefix;',
          },
          codeNote: `res[${i}] = ${prefix}, next prefix = ${nextPrefix}`,
          vars: [
            { name: 'pass', value: 'Prefix (L -> R)' },
            { name: 'i', value: i, tone: 'active' },
            { name: 'prefix_written', value: prefix, tone: 'positive' },
            { name: 'next_prefix', value: nextPrefix, tone: 'active' },
          ],
          visual: {
            mode: 'array',
            arrayLabel: 'nums (input)',
            arrayValues: nums,
            pointers: { i },
            activeIndices: [i],
            secondaryArrayLabel: 'res (left products so far)',
            secondaryArrayValues: [...res],
          },
          teaching: {
            happening: `Write current prefix ${prefix} (product of elements strictly left of ${i}) into res[${i}], then multiply prefix by nums[${i}] = ${nums[i]}.`,
            whyLine: 'Writing before multiplying excludes nums[i] itself from its left product.',
            condition: `i = ${i} < ${n}.`,
            memoryChange: `res[${i}] = ${prefix}, prefix updated from ${prefix} to ${nextPrefix}.`,
            whatNext: i + 1 < n ? `Advance prefix sweep to i = ${i + 1}.` : 'Start reverse suffix sweep from n - 1.',
          },
        });
        prefix = nextPrefix;
      }

      let suffix = 1;
      for (let i = n - 1; i >= 0; i--) {
        const leftPart = res[i];
        res[i] = leftPart * suffix;
        const nextSuffix = suffix * nums[i];
        tb.push({
          phase: 'Suffix Pass',
          title: `i = ${i}: res[${i}] = ${leftPart} * ${suffix} = ${res[i]}`,
          lines: {
            python: 'res[i] *= suffix',
            java: 'res[i] *= suffix;',
            cpp: 'res[i] *= suffix;',
          },
          codeNote: `res[${i}] = ${leftPart} * ${suffix} = ${res[i]}`,
          vars: [
            { name: 'pass', value: 'Suffix (R -> L)' },
            { name: 'i', value: i, tone: 'active' },
            { name: 'suffix', value: suffix },
            { name: 'res[i]', value: res[i], tone: 'positive' },
            { name: 'next_suffix', value: nextSuffix },
          ],
          visual: {
            mode: 'array',
            arrayLabel: 'nums (input)',
            arrayValues: nums,
            pointers: { i },
            matchedIndices: Array.from({ length: n - i }, (_, k) => i + k),
            secondaryArrayLabel: 'res (left * right finalized)',
            secondaryArrayValues: [...res],
          },
          teaching: {
            happening: `Multiply stored left product (${leftPart}) by running right product suffix (${suffix}) to finalize res[${i}] = ${res[i]}.`,
            whyLine: 'Every element except self equals (left product) * (right product), naturally handling zeros with zero division.',
            condition: `i = ${i} >= 0.`,
            memoryChange: `res[${i}] finalized to ${res[i]}; suffix updated to ${nextSuffix}.`,
            whatNext: i > 0 ? `Move leftward to i = ${i - 1}.` : 'Return finalized res array.',
          },
        });
        suffix = nextSuffix;
      }

      tb.push({
        phase: 'Return',
        title: `Return [${res.join(', ')}]`,
        lines: { python: 'return res', java: 'return res;', cpp: 'return res;' },
        codeNote: `return [${res.join(', ')}]`,
        vars: [{ name: 'result', value: `[${res.join(', ')}]`, tone: 'positive' }],
        visual: {
          mode: 'array',
          arrayLabel: 'nums (input)',
          arrayValues: nums,
          matchedIndices: nums.map((_, idx) => idx),
          secondaryArrayLabel: 'Final Answer',
          secondaryArrayValues: res,
          resultBadge: `Output: [${res.join(', ')}]`,
        },
        teaching: {
          happening: 'Both prefix and suffix passes finished.',
          whyLine: 'Computed all products except self in O(n) time and O(1) extra space.',
          condition: 'Complete.',
          memoryChange: 'Final output ready.',
          whatNext: 'Done.',
        },
      });

      return { steps: tb.build() };
    },
  },

  'valid-anagram': {
    presets: [
      {
        id: 'va-true',
        label: 'Example 1 · "anagram" vs "nagaram"',
        summary: 'All 26 frequency counters balance back to zero',
        inputs: { s: 'anagram', t: 'nagaram' },
      },
      {
        id: 'va-false',
        label: 'Mismatch · "rat" vs "car"',
        summary: 'Non-zero buckets (+t, -c) reveal mismatch',
        inputs: { s: 'rat', t: 'car' },
      },
    ],
    customSpec: {
      fields: [
        { key: 's', label: 'String s (lowercase)', placeholder: 'anagram', helper: '1 to 10 letters a-z' },
        { key: 't', label: 'String t (lowercase)', placeholder: 'nagaram', helper: '1 to 10 letters a-z' },
      ],
      defaultValues: { s: 'anagram', t: 'nagaram' },
    },
    generate(problem, inputs) {
      const s = (inputs.s ?? 'anagram').trim().toLowerCase().replace(/[^a-z]/g, '').slice(0, 10);
      const t = (inputs.t ?? 'nagaram').trim().toLowerCase().replace(/[^a-z]/g, '').slice(0, 10);
      if (!s || !t) {
        return { steps: [], error: 'Enter non-empty lowercase strings s and t.' };
      }

      const tb = new TraceBuilder(problem);
      if (s.length !== t.length) {
        tb.push({
          phase: 'Length Guard',
          title: `Lengths differ (${s.length} != ${t.length}) -> false`,
          lines: {
            python: 'if len(s) != len(t)',
            java: 'if (s.length() != t.length()) return false',
            cpp: 'if (s.size() != t.size()) return false',
          },
          codeNote: `${s.length} != ${t.length} -> false`,
          vars: [
            { name: 'len(s)', value: s.length },
            { name: 'len(t)', value: t.length },
            { name: 'result', value: 'false', tone: 'warning' },
          ],
          visual: {
            mode: 'string',
            arrayLabel: 'String s',
            arrayValues: s.split(''),
            secondaryArrayLabel: 'String t',
            secondaryArrayValues: t.split(''),
            resultBadge: 'Output: false (length mismatch)',
          },
          teaching: {
            happening: `"${s}" has length ${s.length} while "${t}" has length ${t.length}.`,
            whyLine: 'Anagrams must have the exact same character count overall.',
            condition: 'len(s) != len(t) is true -> immediate early exit.',
            memoryChange: 'Zero extra array allocation needed.',
            whatNext: 'Return false.',
          },
        });
        return { steps: tb.build() };
      }

      const counts = new Map<string, number>();
      const chars = Array.from(new Set([...s.split(''), ...t.split('')])).sort();
      chars.forEach((c) => counts.set(c, 0));

      for (let i = 0; i < s.length; i++) {
        const a = s[i];
        const b = t[i];
        counts.set(a, (counts.get(a) ?? 0) + 1);
        counts.set(b, (counts.get(b) ?? 0) - 1);

        tb.push({
          phase: 'Balance Counts',
          title: `i = ${i}: +1 for s[${i}]='${a}', -1 for t[${i}]='${b}'`,
          lines: {
            python: 'counts[ord(a) - 97] += 1',
            java: "counts[s.charAt(i) - 'a']++",
            cpp: "counts[s[i] - 'a']++",
          },
          codeNote: `net['${a}']=${counts.get(a)}, net['${b}']=${counts.get(b)}`,
          vars: [
            { name: 'i', value: i, tone: 'active' },
            { name: 's[i] (+1)', value: a },
            { name: 't[i] (-1)', value: b },
            { name: 'nonZero', value: Array.from(counts.values()).filter((v) => v !== 0).length },
          ],
          visual: {
            mode: 'string',
            arrayLabel: 'String s (+1)',
            arrayValues: s.split(''),
            secondaryArrayLabel: 'String t (-1)',
            secondaryArrayValues: t.split(''),
            pointers: { i },
            activeIndices: [i],
            auxTitle: '26-Letter Balance Buckets (non-empty subset)',
            auxKind: 'buckets',
            auxEntries: Array.from(counts.entries()).map(([k, v]) => ({
              key: k,
              value: v > 0 ? `+${v}` : String(v),
              highlight: k === a || k === b ? 'active' : v === 0 ? 'match' : 'default',
            })),
          },
          teaching: {
            happening: `At index ${i}, increment bucket '${a}' for string s and decrement bucket '${b}' for string t.`,
            whyLine: 'Matching character frequencies cancel out (+1 and -1 = 0) regardless of character order.',
            condition: `i = ${i} < ${s.length}.`,
            memoryChange: `Updated buckets for '${a}' and '${b}'.`,
            whatNext: i + 1 < s.length ? `Advance to index ${i + 1}.` : 'Verify every bucket equals 0.',
          },
        });
      }

      const isValid = Array.from(counts.values()).every((v) => v === 0);
      tb.push({
        phase: 'Verify Balance',
        title: isValid ? 'All buckets zero -> Valid Anagram (true)' : 'Non-zero buckets remain -> false',
        lines: {
          python: 'return all(c == 0',
          java: 'for (int c : counts) if (c != 0) return false',
          cpp: 'for (int c : counts) if (c != 0) return false',
        },
        codeNote: `return ${isValid}`,
        vars: [
          { name: 'allZero', value: String(isValid), tone: isValid ? 'positive' : 'warning' },
          { name: 'result', value: String(isValid), tone: isValid ? 'positive' : 'warning' },
        ],
        visual: {
          mode: 'string',
          arrayLabel: 'String s',
          arrayValues: s.split(''),
          secondaryArrayLabel: 'String t',
          secondaryArrayValues: t.split(''),
          matchedIndices: isValid ? s.split('').map((_, idx) => idx) : undefined,
          auxTitle: 'Final 26-Letter Balance',
          auxKind: 'buckets',
          auxEntries: Array.from(counts.entries()).map(([k, v]) => ({
            key: k,
            value: v > 0 ? `+${v}` : String(v),
            highlight: v === 0 ? 'match' : 'active',
          })),
          resultBadge: `Output: ${isValid}`,
        },
        teaching: {
          happening: isValid
            ? 'Every single character count canceled back to 0.'
            : 'At least one character bucket is non-zero, proving differing letter counts.',
          whyLine: 'Constant-size 26-slot array verifies permutation equivalence in O(1) extra space.',
          condition: `all(c == 0) === ${isValid}.`,
          memoryChange: 'Final check complete.',
          whatNext: `Return ${isValid}.`,
        },
      });

      return { steps: tb.build() };
    },
  },

  'longest-palindromic-substring': {
    presets: [
      {
        id: 'lp-odd',
        label: 'Odd Center · "babad"',
        summary: 'Center at index 1 ("a") expands to "bab"',
        inputs: { s: 'babad' },
      },
      {
        id: 'lp-even',
        label: 'Even Center · "cbbd"',
        summary: 'Between indices 1 and 2 expands to "bb"',
        inputs: { s: 'cbbd' },
      },
    ],
    customSpec: {
      fields: [{ key: 's', label: 'String s', placeholder: 'babad', helper: '1 to 9 characters' }],
      defaultValues: { s: 'babad' },
    },
    generate(problem, inputs) {
      const s = (inputs.s ?? 'babad').trim().slice(0, 9);
      if (!s) return { steps: [], error: 'Enter a non-empty string up to 9 characters.' };

      const tb = new TraceBuilder(problem);
      let start = 0;
      let maxLen = 1;

      const expandTrace = (initL: number, initR: number, kind: 'Odd' | 'Even', centerIdx: number) => {
        let l = initL;
        let r = initR;
        while (l >= 0 && r < s.length && s[l] === s[r]) {
          l--;
          r++;
        }
        const len = r - l - 1;
        const validL = l + 1;
        const validR = r - 1;
        const beatBest = len > maxLen;
        if (beatBest) {
          maxLen = len;
          start = centerIdx - Math.floor((len - 1) / 2);
        }
        if (len >= 1) {
          tb.push({
            phase: `${kind} Center`,
            title: `${kind} center i = ${centerIdx}: "${s.slice(validL, validR + 1)}" (len ${len})`,
            lines: {
              python: kind === 'Odd' ? 'expand(i, i)' : 'expand(i, i + 1)',
              java: kind === 'Odd' ? 'expand(s, i, i)' : 'expand(s, i, i + 1)',
              cpp: kind === 'Odd' ? 'expand(s, i, i)' : 'expand(s, i, i + 1)',
            },
            codeNote: `[${validL}..${validR}] len=${len}${beatBest ? ' -> NEW BEST!' : ''}`,
            vars: [
              { name: 'center_i', value: centerIdx },
              { name: 'mode', value: `${kind} (${initL}, ${initR})` },
              { name: 'pal', value: `"${s.slice(validL, validR + 1)}"` },
              { name: 'best', value: `"${s.slice(start, start + maxLen)}"`, tone: beatBest ? 'positive' : 'neutral' },
              { name: 'maxLen', value: maxLen, tone: beatBest ? 'positive' : 'neutral' },
            ],
            visual: {
              mode: 'sliding-window',
              arrayLabel: 'String s',
              arrayValues: s.split(''),
              pointers: { l: validL, r: validR },
              windowRange: [validL, validR],
              matchedIndices: Array.from({ length: len }, (_, k) => validL + k),
            },
            teaching: {
              happening: `Expanded ${kind.toLowerCase()} center around i=${centerIdx} while s[l] == s[r], finding "${s.slice(validL, validR + 1)}".`,
              whyLine: 'Testing both (i, i) and (i, i+1) checks all odd and even palindrome symmetries.',
              condition: beatBest ? `len (${len}) > maxLen -> update best!` : `len (${len}) <= maxLen (${maxLen}).`,
              memoryChange: beatBest ? `start = ${start}, maxLen = ${maxLen}.` : 'Best substring unchanged.',
              whatNext: 'Test next center.',
            },
          });
        }
      };

      for (let i = 0; i < s.length; i++) {
        expandTrace(i, i, 'Odd', i);
        if (i + 1 < s.length && s[i] === s[i + 1]) {
          expandTrace(i, i + 1, 'Even', i);
        }
      }

      const ans = s.slice(start, start + maxLen);
      tb.push({
        phase: 'Return',
        title: `Return "${ans}"`,
        lines: {
          python: 'return s[start:start + max_len]',
          java: 'return s.substring(start, start + maxLen)',
          cpp: 'return s.substr(start, maxLen)',
        },
        codeNote: `return "${ans}"`,
        vars: [
          { name: 'start', value: start },
          { name: 'maxLen', value: maxLen },
          { name: 'result', value: `"${ans}"`, tone: 'positive' },
        ],
        visual: {
          mode: 'sliding-window',
          arrayLabel: 'Longest Palindromic Substring',
          arrayValues: s.split(''),
          windowRange: [start, start + maxLen - 1],
          matchedIndices: Array.from({ length: maxLen }, (_, k) => start + k),
          resultBadge: `Longest Palindrome: "${ans}" (length ${maxLen})`,
        },
        teaching: {
          happening: `Finished expanding from all centers; longest palindrome is "${ans}".`,
          whyLine: 'Slicing only at the end avoids O(n) substring allocations inside the loop.',
          condition: 'All centers checked.',
          memoryChange: 'Returned slice.',
          whatNext: 'Done.',
        },
      });

      return { steps: tb.build() };
    },
  },

  'group-anagrams': {
    presets: [
      {
        id: 'ga-std',
        label: 'Example 1 · ["eat","tea","tan","ate","nat","bat"]',
        summary: 'Buckets words into 3 canonical 26-count signatures',
        inputs: { strs: 'eat, tea, tan, ate, nat, bat' },
      },
      {
        id: 'ga-mix',
        label: 'Pairs · ["ab","ba","cd","dc","e"]',
        summary: 'Demonstrates 3 distinct frequency buckets',
        inputs: { strs: 'ab, ba, cd, dc, e' },
      },
    ],
    customSpec: {
      fields: [{ key: 'strs', label: 'words (comma-separated)', placeholder: 'eat, tea, tan, ate', helper: '1 to 8 lowercase words' }],
      defaultValues: { strs: 'eat, tea, tan, ate, nat, bat' },
    },
    generate(problem, inputs) {
      const strs = parseStringList(inputs.strs ?? 'eat, tea, tan, ate, nat, bat', 1, 8)?.map((w) =>
        w.toLowerCase().replace(/[^a-z]/g, ''),
      );
      if (!strs || strs.some((w) => w.length === 0)) {
        return { steps: [], error: 'Enter 1–8 non-empty lowercase words separated by commas.' };
      }

      const tb = new TraceBuilder(problem);
      const groups = new Map<string, string[]>();

      for (let i = 0; i < strs.length; i++) {
        const s = strs[i];
        const counts: Record<string, number> = {};
        for (const ch of s) counts[ch] = (counts[ch] ?? 0) + 1;
        const sig = Object.entries(counts)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k}${v}`)
          .join('');
        const bucket = groups.get(sig) ?? [];
        bucket.push(s);
        groups.set(sig, bucket);

        tb.push({
          phase: 'Bucket Word',
          title: `Hash "${s}" -> signature "${sig}"`,
          lines: {
            python: 'groups[tuple(counts)].append(s)',
            java: 'map.computeIfAbsent(sb.toString()',
            cpp: 'mp[key].push_back(s)',
          },
          codeNote: `sig("${s}") = "${sig}"`,
          vars: [
            { name: 'i', value: i, tone: 'active' },
            { name: 'word', value: `"${s}"` },
            { name: 'signature', value: sig, tone: 'active' },
            { name: 'groups.size', value: groups.size },
          ],
          visual: {
            mode: 'hash-buckets',
            arrayLabel: 'Input Strings',
            arrayValues: strs,
            pointers: { i },
            activeIndices: [i],
            auxTitle: 'groups HashMap (signature -> anagram bucket)',
            auxKind: 'hashmap',
            auxEntries: Array.from(groups.entries()).map(([k, list]) => ({
              key: k,
              value: `[${list.join(', ')}]`,
              highlight: k === sig ? 'match' : 'default',
            })),
          },
          teaching: {
            happening: `Counted character frequencies of "${s}" into canonical key "${sig}" and appended "${s}" to that bucket.`,
            whyLine: 'Counting 26 letters avoids O(k log k) sorting per word, cutting runtime to O(n * k).',
            condition: bucket.length > 1 ? `Signature "${sig}" already existed -> joined existing anagram group.` : `New signature "${sig}" -> created new bucket.`,
            memoryChange: `Bucket "${sig}" now holds [${bucket.join(', ')}].`,
            whatNext: i + 1 < strs.length ? `Process "${strs[i + 1]}".` : 'Return all grouped buckets.',
          },
        });
      }

      tb.push({
        phase: 'Return',
        title: `Return ${groups.size} anagram groups`,
        lines: {
          python: 'return list(groups.values())',
          java: 'return new ArrayList<>(map.values())',
          cpp: 'return res;',
        },
        codeNote: `${groups.size} groups`,
        vars: [{ name: 'totalGroups', value: groups.size, tone: 'positive' }],
        visual: {
          mode: 'hash-buckets',
          arrayLabel: 'Input Strings',
          arrayValues: strs,
          matchedIndices: strs.map((_, idx) => idx),
          auxTitle: 'Final Anagram Groups',
          auxKind: 'hashmap',
          auxEntries: Array.from(groups.entries()).map(([k, list]) => ({
            key: k,
            value: `[${list.join(', ')}]`,
            highlight: 'match',
          })),
          resultBadge: `Grouped into ${groups.size} bucket(s)`,
        },
        teaching: {
          happening: `All ${strs.length} strings grouped into ${groups.size} anagram buckets.`,
          whyLine: 'Hash map values directly form the required list of lists.',
          condition: 'All inputs processed.',
          memoryChange: 'Final output materialized.',
          whatNext: 'Done.',
        },
      });

      return { steps: tb.build() };
    },
  },

  'contains-duplicate': {
    presets: [
      {
        id: 'cd-hit',
        label: 'Example 1 · [1, 2, 3, 1]',
        summary: 'Short-circuits on duplicate 1 at index 3',
        inputs: { nums: '1, 2, 3, 1' },
      },
      {
        id: 'cd-distinct',
        label: 'Distinct · [4, 7, 2, 9, 5]',
        summary: 'Scans entire array and returns false',
        inputs: { nums: '4, 7, 2, 9, 5' },
      },
    ],
    customSpec: {
      fields: [{ key: 'nums', label: 'nums (comma-separated)', placeholder: '1, 2, 3, 1', helper: '1 to 10 integers' }],
      defaultValues: { nums: '1, 2, 3, 1' },
    },
    generate(problem, inputs) {
      const nums = parseIntArray(inputs.nums ?? '1, 2, 3, 1', 1, 10);
      if (!nums) return { steps: [], error: 'Enter 1–10 integers for nums.' };

      const tb = new TraceBuilder(problem);
      const seen = new Map<number, number>();

      for (let i = 0; i < nums.length; i++) {
        const val = nums[i];
        if (seen.has(val)) {
          const prevIdx = seen.get(val)!;
          tb.push({
            phase: 'Duplicate Hit',
            title: `Collision at i = ${i}: ${val} already in seen!`,
            lines: {
              python: 'return True',
              java: 'if (!seen.add(n)) return true',
              cpp: 'if (!seen.insert(n).second) return true',
            },
            codeNote: `${val} in seen -> return true`,
            vars: [
              { name: 'i', value: i, tone: 'active' },
              { name: 'n', value: val },
              { name: 'result', value: 'true', tone: 'positive' },
            ],
            visual: {
              mode: 'array',
              arrayLabel: 'nums',
              arrayValues: nums,
              pointers: { first: prevIdx, dup: i },
              matchedIndices: [prevIdx, i],
              auxTitle: 'seen HashSet',
              auxKind: 'hashset',
              auxEntries: mapEntries(seen, undefined, val),
              resultBadge: `Duplicate Found: ${val} (indices ${prevIdx} and ${i})`,
            },
            teaching: {
              happening: `Element ${val} at index ${i} is already inside seen (from index ${prevIdx}).`,
              whyLine: 'Checking membership as we iterate lets us short-circuit immediately without scanning remaining items.',
              condition: `${val} in seen === true.`,
              memoryChange: 'No insertion needed; exiting early.',
              whatNext: 'Return true.',
            },
          });
          return { steps: tb.build() };
        }

        seen.set(val, i);
        tb.push({
          phase: 'Insert Unique',
          title: `i = ${i}: ${val} is new -> add to seen`,
          lines: {
            python: 'seen.add(n)',
            java: 'if (!seen.add(n))',
            cpp: 'if (!seen.insert(n).second)',
          },
          codeNote: `seen.add(${val})`,
          vars: [
            { name: 'i', value: i, tone: 'active' },
            { name: 'n', value: val },
            { name: 'seen.size', value: seen.size, tone: 'active' },
          ],
          visual: {
            mode: 'array',
            arrayLabel: 'nums',
            arrayValues: nums,
            pointers: { i },
            activeIndices: [i],
            auxTitle: 'seen HashSet',
            auxKind: 'hashset',
            auxEntries: mapEntries(seen, val),
          },
          teaching: {
            happening: `${val} has not been seen yet, so insert it into our hash set.`,
            whyLine: 'O(1) average hash set insertion prepares future duplicate checks.',
            condition: `${val} in seen === false.`,
            memoryChange: `Added ${val} to seen (size = ${seen.size}).`,
            whatNext: i + 1 < nums.length ? `Inspect index ${i + 1}.` : 'Loop finishes; return false.',
          },
        });
      }

      tb.push({
        phase: 'Return',
        title: 'All elements distinct -> return false',
        lines: { python: 'return False', java: 'return false;', cpp: 'return false;' },
        codeNote: 'return false',
        vars: [{ name: 'result', value: 'false', tone: 'neutral' }],
        visual: {
          mode: 'array',
          arrayLabel: 'nums',
          arrayValues: nums,
          auxTitle: 'seen HashSet',
          auxKind: 'hashset',
          auxEntries: mapEntries(seen),
          resultBadge: 'Output: false (all elements distinct)',
        },
        teaching: {
          happening: 'Scanned every element with zero collisions.',
          whyLine: 'Every element entered the set cleanly.',
          condition: 'Loop completed without duplicate.',
          memoryChange: 'None.',
          whatNext: 'Return false.',
        },
      });

      return { steps: tb.build() };
    },
  },

  'top-k-frequent-elements': {
    presets: [
      {
        id: 'tk-std',
        label: 'Example 1 · [1, 1, 1, 2, 2, 3], k = 2',
        summary: 'Bucket sort collects 1 (freq 3) and 2 (freq 2)',
        inputs: { nums: '1, 1, 1, 2, 2, 3', k: '2' },
      },
      {
        id: 'tk-tie',
        label: 'Mixed · [4, 1, -1, 2, -1, 2, 3], k = 2',
        summary: 'Handles negative numbers cleanly via bucket indices',
        inputs: { nums: '4, 1, -1, 2, -1, 2, 3', k: '2' },
      },
    ],
    customSpec: {
      fields: [
        { key: 'nums', label: 'nums (comma-separated)', placeholder: '1, 1, 1, 2, 2, 3', helper: '1 to 10 integers' },
        { key: 'k', label: 'k', placeholder: '2', helper: '1 <= k <= unique count' },
      ],
      defaultValues: { nums: '1, 1, 1, 2, 2, 3', k: '2' },
    },
    generate(problem, inputs) {
      const nums = parseIntArray(inputs.nums ?? '1, 1, 1, 2, 2, 3', 1, 10);
      const k = Number((inputs.k ?? '2').trim());
      if (!nums || !Number.isInteger(k) || k < 1) {
        return { steps: [], error: 'Enter 1–10 integers for nums and k >= 1.' };
      }

      const freq = new Map<number, number>();
      for (const n of nums) freq.set(n, (freq.get(n) ?? 0) + 1);
      if (k > freq.size) {
        return { steps: [], error: `k (${k}) cannot exceed unique count (${freq.size}).` };
      }

      const tb = new TraceBuilder(problem);

      tb.push({
        phase: 'Count Frequencies',
        title: `Count frequencies of all ${nums.length} elements`,
        lines: {
          python: 'freq = Counter(nums)',
          java: 'Map<Integer, Integer> freq',
          cpp: 'unordered_map<int, int> freq',
        },
        codeNote: `${freq.size} unique values`,
        vars: [
          { name: 'n', value: nums.length },
          { name: 'k', value: k },
          { name: 'unique', value: freq.size },
        ],
        visual: {
          mode: 'hash-buckets',
          arrayLabel: 'Input nums',
          arrayValues: nums,
          auxTitle: 'freq Map (num -> count)',
          auxKind: 'hashmap',
          auxEntries: Array.from(freq.entries()).map(([num, c]) => ({
            key: String(num),
            value: `count = ${c}`,
            highlight: 'active',
          })),
        },
        teaching: {
          happening: `Counted occurrences of every number into freq map (${freq.size} unique keys).`,
          whyLine: 'Any number appears at most n times, allowing O(n) bucket sort by frequency.',
          condition: `Max possible frequency = ${nums.length}.`,
          memoryChange: 'Populated frequency hash map.',
          whatNext: 'Place each number into bucket[frequency].',
        },
      });

      const buckets: number[][] = Array.from({ length: nums.length + 1 }, () => []);
      for (const [num, c] of freq.entries()) {
        buckets[c].push(num);
      }

      tb.push({
        phase: 'Bucket Sort',
        title: 'Place values into buckets indexed 0..n by frequency',
        lines: {
          python: 'buckets[count].append(num)',
          java: 'buckets[f].add(key)',
          cpp: 'buckets[c].push_back(num)',
        },
        codeNote: 'Bucket index = frequency',
        vars: [
          { name: 'k', value: k },
          { name: 'maxBucket', value: nums.length },
        ],
        visual: {
          mode: 'array',
          arrayLabel: 'Frequency Buckets (index = frequency)',
          arrayValues: buckets.map((b) => (b.length ? `[${b.join(',')}]` : '[]')),
          activeIndices: buckets.map((b, i) => (b.length > 0 ? i : -1)).filter((i) => i >= 0),
          auxTitle: 'freq Map',
          auxKind: 'buckets',
          auxEntries: Array.from(freq.entries()).map(([num, c]) => ({
            key: `freq ${c}`,
            value: String(num),
          })),
        },
        teaching: {
          happening: 'Inverted the frequency map: index f now holds all numbers with frequency f.',
          whyLine: 'Grouping by count turns frequency ranking into a simple backward array scan—no O(n log n) sort needed.',
          condition: 'All numbers bucketed in O(n) time.',
          memoryChange: `Filled ${nums.length + 1} buckets.`,
          whatNext: `Scan buckets backward from f = ${nums.length} down to 1 until ${k} elements are collected.`,
        },
      });

      const res: number[] = [];
      for (let f = buckets.length - 1; f > 0 && res.length < k; f--) {
        if (buckets[f].length === 0) continue;
        for (const num of buckets[f]) {
          res.push(num);
          tb.push({
            phase: 'Collect Top K',
            title: `Bucket f = ${f}: collect ${num} (${res.length}/${k})`,
            lines: {
              python: 'res.append(num)',
              java: 'res[idx++] = val',
              cpp: 'res.push_back(val)',
            },
            codeNote: `picked ${num} from bucket[${f}]`,
            vars: [
              { name: 'f', value: f, tone: 'active' },
              { name: 'picked', value: num, tone: 'positive' },
              { name: 'res', value: `[${res.join(', ')}]`, tone: 'positive' },
            ],
            visual: {
              mode: 'array',
              arrayLabel: 'Frequency Buckets (scanning right -> left)',
              arrayValues: buckets.map((b) => (b.length ? `[${b.join(',')}]` : '[]')),
              pointers: { f },
              matchedIndices: [f],
              auxTitle: 'Collected Top-K Result',
              auxKind: 'buckets',
              auxEntries: res.map((v, idx) => ({
                key: `#${idx + 1}`,
                value: String(v),
                highlight: 'match',
              })),
            },
            teaching: {
              happening: `Popped ${num} from frequency bucket ${f}. Collected ${res.length} of ${k} items.`,
              whyLine: 'Descending from highest bucket index guarantees largest frequencies come first.',
              condition: res.length === k ? `len(res) == k (${k}) -> stop immediately!` : `Need ${k - res.length} more item(s).`,
              memoryChange: `Appended ${num} to res.`,
              whatNext: res.length === k ? `Return [${res.join(', ')}].` : 'Continue scanning lower frequency buckets.',
            },
          });
          if (res.length === k) break;
        }
      }

      return { steps: tb.build() };
    },
  },

  'longest-consecutive-sequence': {
    presets: [
      {
        id: 'lc-std',
        label: 'Example 1 · [100, 4, 200, 1, 3, 2]',
        summary: 'Skips 4/3/2 and walks chain 1->2->3->4 in O(n)',
        inputs: { nums: '100, 4, 200, 1, 3, 2' },
      },
      {
        id: 'lc-two',
        label: 'Two Runs · [9, 1, 4, 7, 3, -1, 0, 5, 8, 6]',
        summary: 'Finds [-1,0,1] (3) vs [3..9] (7)',
        inputs: { nums: '9, 1, 4, 7, 3, -1, 0, 5, 8, 6' },
      },
    ],
    customSpec: {
      fields: [{ key: 'nums', label: 'nums (comma-separated)', placeholder: '100, 4, 200, 1, 3, 2', helper: '1 to 10 integers' }],
      defaultValues: { nums: '100, 4, 200, 1, 3, 2' },
    },
    generate(problem, inputs) {
      const nums = parseIntArray(inputs.nums ?? '100, 4, 200, 1, 3, 2', 1, 10);
      if (!nums) return { steps: [], error: 'Enter 1–10 integers for nums.' };

      const tb = new TraceBuilder(problem);
      const numSet = new Set(nums);
      const uniqueList = Array.from(numSet);
      let best = 0;
      let bestSeq: number[] = [];

      tb.push({
        phase: 'Build HashSet',
        title: `Insert unique values into numSet (${uniqueList.length} keys)`,
        lines: {
          python: 'num_set = set(nums)',
          java: 'Set<Integer> set = new HashSet<>()',
          cpp: 'unordered_set<int> s(',
        },
        codeNote: `set size = ${uniqueList.length}`,
        vars: [
          { name: 'best', value: 0 },
          { name: 'uniqueCount', value: uniqueList.length },
        ],
        visual: {
          mode: 'array',
          arrayLabel: 'Unique Values in numSet',
          arrayValues: uniqueList,
          auxTitle: 'numSet (O(1) lookup)',
          auxKind: 'hashset',
          auxEntries: uniqueList.map((v) => ({ key: String(v), value: 'present' })),
        },
        teaching: {
          happening: 'Store all input numbers in a HashSet to deduplicate and enable O(1) neighbor checks.',
          whyLine: 'Sorting takes O(n log n); HashSet lets us check num - 1 and num + 1 in O(1) time.',
          condition: 'Ready to scan unique elements.',
          memoryChange: `Populated set with ${uniqueList.length} unique values.`,
          whatNext: 'Check each number to see if it starts a consecutive run.',
        },
      });

      for (let idx = 0; idx < uniqueList.length; idx++) {
        const n = uniqueList[idx];
        if (numSet.has(n - 1)) {
          tb.push({
            phase: 'Skip Non-Start',
            title: `Skip ${n} because ${n - 1} is in set`,
            lines: {
              python: 'if n - 1 not in num_set',
              java: 'if (!set.contains(n - 1))',
              cpp: 'if (!s.count(n - 1))',
            },
            codeNote: `${n - 1} exists -> skip ${n}`,
            vars: [
              { name: 'n', value: n, tone: 'active' },
              { name: 'n - 1', value: n - 1 },
              { name: 'best', value: best },
            ],
            visual: {
              mode: 'array',
              arrayLabel: 'Unique Values in numSet',
              arrayValues: uniqueList,
              pointers: { skip: idx },
              discardedIndices: [idx],
              auxTitle: 'numSet',
              auxKind: 'hashset',
              auxEntries: uniqueList.map((v) => ({
                key: String(v),
                value: v === n - 1 ? 'predecessor!' : 'present',
                highlight: v === n - 1 ? 'active' : 'default',
              })),
            },
            teaching: {
              happening: `${n} is NOT the beginning of a sequence because ${n - 1} already exists in numSet.`,
              whyLine: 'Skipping middle elements ensures the inner while loop only runs once per chain—keeping total complexity strictly O(n).',
              condition: `${n - 1} in numSet === true -> skip.`,
              memoryChange: 'No state changed.',
              whatNext: 'Move to next element in numSet.',
            },
          });
        } else {
          let curr = n;
          const chain = [n];
          while (numSet.has(curr + 1)) {
            curr++;
            chain.push(curr);
          }
          const len = curr - n + 1;
          const improved = len > best;
          if (improved) {
            best = len;
            bestSeq = chain;
          }
          const chainIndices = uniqueList
            .map((v, i) => (chain.includes(v) ? i : -1))
            .filter((i) => i >= 0);

          tb.push({
            phase: 'Expand Start',
            title: `${n} starts a sequence: [${chain.join(', ')}] (len ${len})`,
            lines: {
              python: 'while curr + 1 in num_set',
              java: 'while (set.contains(curr + 1))',
              cpp: 'while (s.count(curr + 1))',
            },
            codeNote: `chain ${n}..${curr} (len=${len})`,
            vars: [
              { name: 'n (start)', value: n, tone: 'positive' },
              { name: 'curr (end)', value: curr },
              { name: 'len', value: len, tone: improved ? 'positive' : 'neutral' },
              { name: 'best', value: best, tone: improved ? 'positive' : 'neutral' },
            ],
            visual: {
              mode: 'array',
              arrayLabel: 'Unique Values in numSet',
              arrayValues: uniqueList,
              pointers: { start: idx },
              matchedIndices: chainIndices,
              auxTitle: 'Discovered Consecutive Chain',
              auxKind: 'hashset',
              auxEntries: chain.map((v) => ({ key: String(v), value: 'in chain', highlight: 'match' })),
            },
            teaching: {
              happening: `${n - 1} is absent, so ${n} is a true sequence start! Counting upward hits [${chain.join(', ')}] of length ${len}.`,
              whyLine: 'Each element is visited at most twice overall (once in outer loop, once inside a chain walk).',
              condition: `${n - 1} not in numSet === true -> walked until ${curr + 1} missing.`,
              memoryChange: improved ? `Updated best = ${best}.` : `best remains ${best}.`,
              whatNext: idx + 1 < uniqueList.length ? 'Check next number in numSet.' : `Return best = ${best}.`,
            },
          });
        }
      }

      tb.push({
        phase: 'Return',
        title: `Return best = ${best}`,
        lines: { python: 'return best', java: 'return best;', cpp: 'return best;' },
        codeNote: `return ${best}`,
        vars: [
          { name: 'best', value: best, tone: 'positive' },
          { name: 'longestChain', value: `[${bestSeq.join(', ')}]` },
        ],
        visual: {
          mode: 'array',
          arrayLabel: 'Unique Values in numSet',
          arrayValues: uniqueList,
          matchedIndices: uniqueList.map((v, i) => (bestSeq.includes(v) ? i : -1)).filter((i) => i >= 0),
          resultBadge: `Longest Consecutive Length: ${best} ([${bestSeq.join(', ')}])`,
        },
        teaching: {
          happening: `Finished scanning all sequence starts. Longest consecutive length is ${best}.`,
          whyLine: 'Total work across outer and inner loops is strictly O(n).',
          condition: 'All keys inspected.',
          memoryChange: 'Final answer returned.',
          whatNext: 'Done.',
        },
      });

      return { steps: tb.build() };
    },
  },
};
