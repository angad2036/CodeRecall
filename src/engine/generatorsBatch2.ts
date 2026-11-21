import type { DsaProblem, VisEdge, VisNode } from '../types/dsa';
import { TraceBuilder, parseIntArray } from './traceHelpers';
import type { ProblemGeneratorEntry } from './generatorsBatch1';
import type { AuxEntry } from './types';

function isAlnum(ch: string): boolean {
  return /^[a-z0-9]$/i.test(ch);
}

export const GENERATORS_BATCH_2: Record<string, ProblemGeneratorEntry> = {
  'valid-palindrome': {
    presets: [
      {
        id: 'vp-true',
        label: 'Example 1 · "r,a:c-e,c:ar"',
        summary: 'Skips punctuation and confirms symmetry in O(1) space',
        inputs: { s: 'r,a:c-e,c:ar' },
      },
      {
        id: 'vp-false',
        label: 'Mismatch · "race a car"',
        summary: 'Detects mismatch "e" != "a" without allocating a filtered copy',
        inputs: { s: 'race a car' },
      },
    ],
    customSpec: {
      fields: [{ key: 's', label: 'String s', placeholder: 'r,a:c-e,c:ar', helper: '1 to 14 characters' }],
      defaultValues: { s: 'r,a:c-e,c:ar' },
    },
    generate(problem, inputs) {
      const s = (inputs.s ?? 'r,a:c-e,c:ar').slice(0, 14);
      if (!s) return { steps: [], error: 'Enter a non-empty string up to 14 characters.' };

      const tb = new TraceBuilder(problem);
      let l = 0;
      let r = s.length - 1;
      const matched: number[] = [];

      tb.push({
        phase: 'Initialize',
        title: `Place opposite pointers l = 0, r = ${r}`,
        lines: {
          python: 'l, r = 0, len(s) - 1',
          java: 'int l = 0, r = s.length() - 1',
          cpp: 'int l = 0, r = (int)s.size() - 1',
        },
        codeNote: `l = 0, r = ${r}`,
        vars: [
          { name: 'l', value: l },
          { name: 'r', value: r },
          { name: 's[l]', value: `'${s[l]}'` },
          { name: 's[r]', value: `'${s[r]}'` },
        ],
        visual: {
          mode: 'two-pointers',
          arrayLabel: 'String s',
          arrayValues: s.split(''),
          pointers: { l, r },
          activeIndices: [l, r],
        },
        teaching: {
          happening: `Start two pointers at the outer boundaries: l = 0 and r = ${r}.`,
          whyLine: 'Comparing ends inward validates palindrome symmetry in O(1) extra memory.',
          condition: `l (${l}) < r (${r}) is true.`,
          memoryChange: 'Two integer indices allocated.',
          whatNext: 'Skip any non-alphanumeric characters on either side, then compare lowercased chars.',
        },
      });

      while (l < r) {
        while (l < r && !isAlnum(s[l])) {
          const skipped = l;
          l++;
          tb.push({
            phase: 'Skip Left',
            title: `Skip non-alphanumeric '${s[skipped]}' at l = ${skipped}`,
            lines: {
              python: 'while l < r and not s[l].isalnum()',
              java: 'while (l < r && !Character.isLetterOrDigit(s.charAt(l)))',
              cpp: 'while (l < r && !isalnum((unsigned char)s[l]))',
            },
            codeNote: `l: ${skipped} -> ${l}`,
            vars: [
              { name: 'l', value: l, tone: 'active' },
              { name: 'r', value: r },
              { name: 'skipped', value: `'${s[skipped]}'` },
            ],
            visual: {
              mode: 'two-pointers',
              arrayLabel: 'String s',
              arrayValues: s.split(''),
              pointers: { l, r },
              activeIndices: [l, r],
              matchedIndices: [...matched],
              discardedIndices: [skipped],
            },
            teaching: {
              happening: `s[${skipped}] = '${s[skipped]}' is punctuation/space, so advance l to ${l}.`,
              whyLine: 'Problem ignores spaces and punctuation without building a filtered copy.',
              condition: `l < r && !isalnum(s[${skipped}]) is true.`,
              memoryChange: `l incremented to ${l}.`,
              whatNext: 'Continue checking validity of s[l] and s[r].',
            },
          });
        }
        while (l < r && !isAlnum(s[r])) {
          const skipped = r;
          r--;
          tb.push({
            phase: 'Skip Right',
            title: `Skip non-alphanumeric '${s[skipped]}' at r = ${skipped}`,
            lines: {
              python: 'while l < r and not s[r].isalnum()',
              java: 'while (l < r && !Character.isLetterOrDigit(s.charAt(r)))',
              cpp: 'while (l < r && !isalnum((unsigned char)s[r]))',
            },
            codeNote: `r: ${skipped} -> ${r}`,
            vars: [
              { name: 'l', value: l },
              { name: 'r', value: r, tone: 'active' },
              { name: 'skipped', value: `'${s[skipped]}'` },
            ],
            visual: {
              mode: 'two-pointers',
              arrayLabel: 'String s',
              arrayValues: s.split(''),
              pointers: { l, r },
              activeIndices: [l, r],
              matchedIndices: [...matched],
              discardedIndices: [skipped],
            },
            teaching: {
              happening: `s[${skipped}] = '${s[skipped]}' is punctuation/space, so step r left to ${r}.`,
              whyLine: 'Must guard l < r inside both skip loops so pointers never cross silently.',
              condition: `l < r && !isalnum(s[${skipped}]) is true.`,
              memoryChange: `r decremented to ${r}.`,
              whatNext: 'Compare s[l].lower() vs s[r].lower().',
            },
          });
        }

        if (l >= r) break;

        const cl = s[l].toLowerCase();
        const cr = s[r].toLowerCase();
        if (cl !== cr) {
          tb.push({
            phase: 'Mismatch',
            title: `Mismatch: '${cl}' != '${cr}' -> return false`,
            lines: {
              python: 'if s[l].lower() != s[r].lower()',
              java: 'if (Character.toLowerCase(s.charAt(l)) !=',
              cpp: 'if (tolower((unsigned char)s[l]) !=',
            },
            codeNote: `'${cl}' != '${cr}' -> false`,
            vars: [
              { name: 'l', value: l },
              { name: 'r', value: r },
              { name: 's[l].lower()', value: cl, tone: 'warning' },
              { name: 's[r].lower()', value: cr, tone: 'warning' },
              { name: 'result', value: 'false', tone: 'warning' },
            ],
            visual: {
              mode: 'two-pointers',
              arrayLabel: 'String s',
              arrayValues: s.split(''),
              pointers: { l, r },
              activeIndices: [l, r],
              matchedIndices: [...matched],
              resultBadge: `Mismatch at (${l}, ${r}): '${cl}' != '${cr}' -> false`,
            },
            teaching: {
              happening: `Lowercased characters '${cl}' (index ${l}) and '${cr}' (index ${r}) do not match!`,
              whyLine: 'A single symmetric mismatch proves the cleaned string is not a palindrome.',
              condition: `'${cl}' != '${cr}' is true -> early return false.`,
              memoryChange: 'Terminating immediately.',
              whatNext: 'Return false.',
            },
          });
          return { steps: tb.build() };
        }

        matched.push(l, r);
        tb.push({
          phase: 'Match Pair',
          title: `Match '${cl}' == '${cr}' at (${l}, ${r}) -> move inward`,
          lines: {
            python: 'l += 1',
            java: 'l++; r--;',
            cpp: 'l++; r--;',
          },
          codeNote: `'${cl}' == '${cr}' -> l=${l + 1}, r=${r - 1}`,
          vars: [
            { name: 'l', value: l + 1, tone: 'active' },
            { name: 'r', value: r - 1, tone: 'active' },
            { name: 'matchedChar', value: `'${cl}'`, tone: 'positive' },
          ],
          visual: {
            mode: 'two-pointers',
            arrayLabel: 'String s',
            arrayValues: s.split(''),
            pointers: { l, r },
            matchedIndices: [...matched],
          },
          teaching: {
            happening: `Symmetric characters '${cl}' and '${cr}' match! Advance l to ${l + 1} and r to ${r - 1}.`,
            whyLine: 'Once outer ends match, the problem reduces to checking the inner substring.',
            condition: `'${cl}' == '${cr}' -> continue converging.`,
            memoryChange: `l = ${l + 1}, r = ${r - 1}.`,
            whatNext: l + 1 < r - 1 ? 'Compare next symmetric pair.' : 'Pointers meet/cross -> return true.',
          },
        });
        l++;
        r--;
      }

      tb.push({
        phase: 'Return',
        title: 'Pointers met/crossed -> Valid Palindrome (true)',
        lines: { python: 'return True', java: 'return true;', cpp: 'return true;' },
        codeNote: 'return true',
        vars: [
          { name: 'l', value: l },
          { name: 'r', value: r },
          { name: 'result', value: 'true', tone: 'positive' },
        ],
        visual: {
          mode: 'two-pointers',
          arrayLabel: 'String s',
          arrayValues: s.split(''),
          matchedIndices: s.split('').map((c, idx) => (isAlnum(c) ? idx : -1)).filter((i) => i >= 0),
          resultBadge: `Output: true ("${s}" is a valid palindrome)`,
        },
        teaching: {
          happening: 'All alphanumeric characters matched symmetrically from outside in.',
          whyLine: 'Loop condition l < r ended without any mismatch.',
          condition: `l (${l}) >= r (${r}).`,
          memoryChange: 'O(1) extra space maintained throughout.',
          whatNext: 'Return true.',
        },
      });

      return { steps: tb.build() };
    },
  },

  'three-sum': {
    presets: [
      {
        id: '3s-std',
        label: 'Example 1 · [-1, 0, 1, 2, -1, -4]',
        summary: 'Sorts array and finds [[-1, -1, 2], [-1, 0, 1]]',
        inputs: { nums: '-1, 0, 1, 2, -1, -4' },
      },
      {
        id: '3s-dups',
        label: 'Heavy Duplicates · [-2, 0, 0, 2, 2]',
        summary: 'Demonstrates duplicate skipping on anchor and l pointer',
        inputs: { nums: '-2, 0, 0, 2, 2' },
      },
    ],
    customSpec: {
      fields: [{ key: 'nums', label: 'nums (comma-separated)', placeholder: '-1, 0, 1, 2, -1, -4', helper: '3 to 9 integers' }],
      defaultValues: { nums: '-1, 0, 1, 2, -1, -4' },
    },
    generate(problem, inputs) {
      const raw = parseIntArray(inputs.nums ?? '-1, 0, 1, 2, -1, -4', 3, 9);
      if (!raw) return { steps: [], error: 'Enter 3–9 integers for nums.' };

      const nums = [...raw].sort((a, b) => a - b);
      const tb = new TraceBuilder(problem);
      const res: number[][] = [];

      tb.push({
        phase: 'Sort Input',
        title: `Sort array -> [${nums.join(', ')}]`,
        lines: {
          python: 'nums.sort()',
          java: 'Arrays.sort(nums)',
          cpp: 'sort(nums.begin(), nums.end())',
        },
        codeNote: `sorted = [${nums.join(', ')}]`,
        vars: [
          { name: 'sorted', value: `[${nums.join(', ')}]`, tone: 'active' },
          { name: 'foundCount', value: 0 },
        ],
        visual: {
          mode: 'two-pointers',
          arrayLabel: 'Sorted nums',
          arrayValues: nums,
          auxTitle: 'Unique Triplets Found',
          auxKind: 'buckets',
          auxEntries: [],
        },
        teaching: {
          happening: `Sorted [${raw.join(', ')}] into [${nums.join(', ')}] before fixing anchor pointers.`,
          whyLine: 'Sorting enables two-pointer convergence AND puts duplicate values side-by-side for O(1) duplicate skipping.',
          condition: 'O(n log n) sort done; remaining work is O(n^2).',
          memoryChange: 'Array ordered non-decreasingly.',
          whatNext: 'Iterate anchor i from 0 to n - 3.',
        },
      });

      for (let i = 0; i < nums.length - 2; i++) {
        if (nums[i] > 0) {
          tb.push({
            phase: 'Early Break',
            title: `nums[${i}] = ${nums[i]} > 0 -> break early`,
            lines: { python: 'if nums[i] > 0:', java: 'if (nums[i] > 0) break;', cpp: 'if (nums[i] > 0) break;' },
            codeNote: `${nums[i]} > 0 -> impossible to sum to 0`,
            vars: [
              { name: 'i', value: i },
              { name: 'nums[i]', value: nums[i], tone: 'warning' },
              { name: 'triplets', value: res.length },
            ],
            visual: {
              mode: 'two-pointers',
              arrayLabel: 'Sorted nums',
              arrayValues: nums,
              pointers: { i },
              discardedIndices: Array.from({ length: nums.length - i }, (_, k) => i + k),
              auxTitle: 'Unique Triplets Found',
              auxKind: 'buckets',
              auxEntries: res.map((t, idx) => ({ key: `#${idx + 1}`, value: `[${t.join(', ')}]`, highlight: 'match' })),
            },
            teaching: {
              happening: `Smallest remaining value nums[${i}] = ${nums[i]} is positive.`,
              whyLine: 'Since the array is sorted, any three elements from i onward sum strictly > 0.',
              condition: 'nums[i] > 0 -> break loop.',
              memoryChange: 'None.',
              whatNext: 'Return collected triplets.',
            },
          });
          break;
        }
        if (i > 0 && nums[i] === nums[i - 1]) {
          tb.push({
            phase: 'Skip Duplicate Anchor',
            title: `Skip duplicate anchor i = ${i} (val = ${nums[i]})`,
            lines: {
              python: 'if i > 0 and nums[i] == nums[i - 1]:',
              java: 'if (i > 0 && nums[i] == nums[i - 1]) continue;',
              cpp: 'if (i > 0 && nums[i] == nums[i - 1]) continue;',
            },
            codeNote: `nums[${i}] == nums[${i - 1}] -> skip`,
            vars: [
              { name: 'i', value: i, tone: 'warning' },
              { name: 'nums[i]', value: nums[i] },
            ],
            visual: {
              mode: 'two-pointers',
              arrayLabel: 'Sorted nums',
              arrayValues: nums,
              pointers: { i },
              discardedIndices: [i],
              auxTitle: 'Unique Triplets Found',
              auxKind: 'buckets',
              auxEntries: res.map((t, idx) => ({ key: `#${idx + 1}`, value: `[${t.join(', ')}]`, highlight: 'match' })),
            },
            teaching: {
              happening: `Anchor value ${nums[i]} at i=${i} already anchored every valid triplet when it first appeared at i=${i - 1}.`,
              whyLine: 'Skipping duplicate anchors prevents duplicate triplets in the output.',
              condition: `nums[${i}] == nums[${i - 1}] -> continue.`,
              memoryChange: 'No change.',
              whatNext: `Advance anchor to i = ${i + 1}.`,
            },
          });
          continue;
        }

        let l = i + 1;
        let r = nums.length - 1;
        while (l < r) {
          const s = nums[i] + nums[l] + nums[r];
          if (s < 0) {
            tb.push({
              phase: 'Sum Too Small',
              title: `i=${i}, l=${l}, r=${r}: sum ${s} < 0 -> l++`,
              lines: { python: 'l += 1', java: 'if (sum < 0) l++', cpp: 'if (s < 0) l++' },
              codeNote: `${nums[i]}+(${nums[l]})+${nums[r]} = ${s} < 0`,
              vars: [
                { name: 'i', value: i },
                { name: 'l', value: l, tone: 'active' },
                { name: 'r', value: r },
                { name: 'sum', value: s },
              ],
              visual: {
                mode: 'two-pointers',
                arrayLabel: 'Sorted nums',
                arrayValues: nums,
                pointers: { i, l, r },
                activeIndices: [i, l, r],
                auxTitle: 'Unique Triplets Found',
                auxKind: 'buckets',
                auxEntries: res.map((t, idx) => ({ key: `#${idx + 1}`, value: `[${t.join(', ')}]` })),
              },
              teaching: {
                happening: `Sum ${nums[i]} + ${nums[l]} + ${nums[r]} = ${s} is smaller than 0.`,
                whyLine: 'Array is sorted, so advancing l rightward strictly increases (or maintains) the sum.',
                condition: `${s} < 0 -> increment l.`,
                memoryChange: `l moves from ${l} to ${l + 1}.`,
                whatNext: 'Re-evaluate triplet sum with new l.',
              },
            });
            l++;
          } else if (s > 0) {
            tb.push({
              phase: 'Sum Too Large',
              title: `i=${i}, l=${l}, r=${r}: sum ${s} > 0 -> r--`,
              lines: { python: 'r -= 1', java: 'else if (sum > 0) r--', cpp: 'else if (s > 0) r--' },
              codeNote: `${nums[i]}+(${nums[l]})+${nums[r]} = ${s} > 0`,
              vars: [
                { name: 'i', value: i },
                { name: 'l', value: l },
                { name: 'r', value: r, tone: 'active' },
                { name: 'sum', value: s },
              ],
              visual: {
                mode: 'two-pointers',
                arrayLabel: 'Sorted nums',
                arrayValues: nums,
                pointers: { i, l, r },
                activeIndices: [i, l, r],
                auxTitle: 'Unique Triplets Found',
                auxKind: 'buckets',
                auxEntries: res.map((t, idx) => ({ key: `#${idx + 1}`, value: `[${t.join(', ')}]` })),
              },
              teaching: {
                happening: `Sum ${nums[i]} + ${nums[l]} + ${nums[r]} = ${s} exceeds 0.`,
                whyLine: 'Stepping r leftward brings a smaller right-end value into the sum.',
                condition: `${s} > 0 -> decrement r.`,
                memoryChange: `r moves from ${r} to ${r - 1}.`,
                whatNext: 'Re-evaluate triplet sum with new r.',
              },
            });
            r--;
          } else {
            const triplet = [nums[i], nums[l], nums[r]];
            res.push(triplet);
            tb.push({
              phase: 'Triplet Found',
              title: `Match! [${triplet.join(', ')}] sums to 0`,
              lines: {
                python: 'res.append([nums[i], nums[l], nums[r]])',
                java: 'res.add(Arrays.asList(',
                cpp: 'res.push_back({nums[i], nums[l], nums[r]})',
              },
              codeNote: `Found [${triplet.join(', ')}]`,
              vars: [
                { name: 'i', value: i },
                { name: 'l', value: l },
                { name: 'r', value: r },
                { name: 'sum', value: 0, tone: 'positive' },
                { name: 'found', value: `[${triplet.join(', ')}]`, tone: 'positive' },
              ],
              visual: {
                mode: 'two-pointers',
                arrayLabel: 'Sorted nums',
                arrayValues: nums,
                pointers: { i, l, r },
                matchedIndices: [i, l, r],
                auxTitle: 'Unique Triplets Found',
                auxKind: 'buckets',
                auxEntries: res.map((t, idx) => ({
                  key: `#${idx + 1}`,
                  value: `[${t.join(', ')}]`,
                  highlight: idx === res.length - 1 ? 'match' : 'default',
                })),
              },
              teaching: {
                happening: `${nums[i]} + ${nums[l]} + ${nums[r]} = 0! Recorded [${triplet.join(', ')}], then skip duplicate nums[l].`,
                whyLine: 'Moving both pointers inward while skipping duplicate l values guarantees every emitted triplet is distinct.',
                condition: 'sum == 0 -> record and advance inward.',
                memoryChange: `Appended [${triplet.join(', ')}] (total ${res.length}).`,
                whatNext: 'Continue searching remaining window for anchor i.',
              },
            });
            l++;
            r--;
            while (l < r && nums[l] === nums[l - 1]) l++;
          }
        }
      }

      tb.push({
        phase: 'Return',
        title: `Return ${res.length} unique triplet(s)`,
        lines: { python: 'return res', java: 'return res;', cpp: 'return res;' },
        codeNote: `${res.length} triplet(s)`,
        vars: [{ name: 'result', value: JSON.stringify(res), tone: 'positive' }],
        visual: {
          mode: 'two-pointers',
          arrayLabel: 'Sorted nums',
          arrayValues: nums,
          auxTitle: 'Final Result Triplets',
          auxKind: 'buckets',
          auxEntries: res.map((t, idx) => ({ key: `#${idx + 1}`, value: `[${t.join(', ')}]`, highlight: 'match' })),
          resultBadge: `Output: ${JSON.stringify(res)}`,
        },
        teaching: {
          happening: `Finished scanning all anchors. Found ${res.length} unique triplet(s).`,
          whyLine: 'Two-pointer convergence solved 3Sum in O(n^2) time without hash-set deduplication.',
          condition: 'All anchors processed.',
          memoryChange: 'Final list returned.',
          whatNext: 'Done.',
        },
      });

      return { steps: tb.build() };
    },
  },

  'container-with-most-water': {
    presets: [
      {
        id: 'cw-std',
        label: 'Example 1 · [1, 8, 6, 2, 5, 4, 8, 3, 7]',
        summary: 'Optimal pair (1, 8) yields width 7 * height 7 = 49',
        inputs: { height: '1, 8, 6, 2, 5, 4, 8, 3, 7' },
      },
      {
        id: 'cw-mid',
        label: 'Tall Center · [2, 3, 10, 5, 7, 8, 9]',
        summary: 'Shows greedy shorter-wall elimination reaching (2, 6)',
        inputs: { height: '2, 3, 10, 5, 7, 8, 9' },
      },
    ],
    customSpec: {
      fields: [
        { key: 'height', label: 'height (comma-separated)', placeholder: '1, 8, 6, 2, 5, 4, 8, 3, 7', helper: '2 to 10 non-negative integers' },
      ],
      defaultValues: { height: '1, 8, 6, 2, 5, 4, 8, 3, 7' },
    },
    generate(problem, inputs) {
      const height = parseIntArray(inputs.height ?? '1, 8, 6, 2, 5, 4, 8, 3, 7', 2, 10);
      if (!height || height.some((h) => h < 0)) {
        return { steps: [], error: 'Enter 2–10 non-negative wall heights.' };
      }

      const tb = new TraceBuilder(problem);
      let l = 0;
      let r = height.length - 1;
      let best = 0;
      let bestPair: [number, number] = [0, r];

      while (l < r) {
        const w = r - l;
        const limitingH = Math.min(height[l], height[r]);
        const area = w * limitingH;
        const improved = area > best;
        if (improved) {
          best = area;
          bestPair = [l, r];
        }
        const moveLeft = height[l] < height[r];

        tb.push({
          phase: improved ? 'New Max Area' : 'Evaluate & Shrink',
          title: `l=${l} (h=${height[l]}), r=${r} (h=${height[r]}) -> area ${area}`,
          lines: {
            python: moveLeft ? 'l += 1' : 'r -= 1',
            java: moveLeft ? 'if (height[l] < height[r]) l++' : 'else r--;',
            cpp: moveLeft ? 'if (height[l] < height[r]) l++' : 'else r--;',
          },
          codeNote: `width=${w} * minH=${limitingH} = ${area}${improved ? ' (BEST)' : ''}`,
          vars: [
            { name: 'l', value: `${l} (h=${height[l]})` },
            { name: 'r', value: `${r} (h=${height[r]})` },
            { name: 'area', value: area, tone: improved ? 'positive' : 'active' },
            { name: 'best', value: best, tone: improved ? 'positive' : 'neutral' },
          ],
          visual: {
            mode: 'water-container',
            arrayLabel: 'Container Walls & Water Level',
            arrayValues: height,
            pointers: { l, r },
            activeIndices: [l, r],
            matchedIndices: bestPair,
            waterArea: { left: l, right: r, height: limitingH, area },
          },
          teaching: {
            happening: `Width = ${r} - ${l} = ${w}, limiting wall = min(${height[l]}, ${height[r]}) = ${limitingH}, so water volume = ${area}.`,
            whyLine: `Because ${moveLeft ? `left wall (${height[l]}) <= right wall (${height[r]})` : `right wall (${height[r]}) <= left wall (${height[l]})`}, keeping that shorter wall while narrowing width can never beat ${area}—so we discard it.`,
            condition: `${moveLeft ? `height[l] < height[r] -> move l right` : `height[l] >= height[r] -> move r left`}.`,
            memoryChange: improved ? `Updated best = ${best} at walls (${l}, ${r}).` : `best remains ${best}.`,
            whatNext: l + 1 < r ? 'Evaluate narrower container.' : `Loop ends; return best = ${best}.`,
          },
        });

        if (moveLeft) l++;
        else r--;
      }

      tb.push({
        phase: 'Return',
        title: `Return best = ${best}`,
        lines: { python: 'return best', java: 'return best;', cpp: 'return best;' },
        codeNote: `return ${best}`,
        vars: [
          { name: 'best', value: best, tone: 'positive' },
          { name: 'bestWalls', value: `(${bestPair[0]}, ${bestPair[1]})` },
        ],
        visual: {
          mode: 'water-container',
          arrayLabel: 'Optimal Water Container',
          arrayValues: height,
          pointers: { l: bestPair[0], r: bestPair[1] },
          matchedIndices: bestPair,
          waterArea: {
            left: bestPair[0],
            right: bestPair[1],
            height: Math.min(height[bestPair[0]], height[bestPair[1]]),
            area: best,
          },
          resultBadge: `Max Water: ${best} (walls ${bestPair[0]} and ${bestPair[1]})`,
        },
        teaching: {
          happening: `Pointers met after evaluating all candidate widths in O(n) time.`,
          whyLine: 'Greedy elimination of the shorter wall guaranteed we never skipped the optimal pair.',
          condition: 'l == r -> loop complete.',
          memoryChange: 'Final answer ready.',
          whatNext: 'Done.',
        },
      });

      return { steps: tb.build() };
    },
  },

  'longest-substring-without-repeating-characters': {
    presets: [
      {
        id: 'ls-std',
        label: 'Example 1 · "abcabcbb"',
        summary: 'Jumps l past repeated characters, max len 3',
        inputs: { s: 'abcabcbb' },
      },
      {
        id: 'ls-stale',
        label: 'Stale Index Trap · "abba"',
        summary: 'Proves why last[ch] >= l guards against jumping backward!',
        inputs: { s: 'abba' },
      },
    ],
    customSpec: {
      fields: [{ key: 's', label: 'String s', placeholder: 'abcabcbb', helper: '1 to 12 characters' }],
      defaultValues: { s: 'abcabcbb' },
    },
    generate(problem, inputs) {
      const s = (inputs.s ?? 'abcabcbb').slice(0, 12);
      if (!s) return { steps: [], error: 'Enter 1–12 characters for string s.' };

      const tb = new TraceBuilder(problem);
      const last = new Map<string, number>();
      let l = 0;
      let best = 0;
      let bestWin: [number, number] = [0, 0];

      for (let r = 0; r < s.length; r++) {
        const ch = s[r];
        const prevIdx = last.get(ch);
        const jumped = prevIdx !== undefined && prevIdx >= l;
        if (jumped) {
          l = prevIdx + 1;
        }
        last.set(ch, r);
        const curLen = r - l + 1;
        const improved = curLen > best;
        if (improved) {
          best = curLen;
          bestWin = [l, r];
        }

        tb.push({
          phase: jumped ? 'Duplicate Jump' : 'Expand Window',
          title: `r=${r} ('${ch}'): ${jumped ? `jump l -> ${l}` : `unique -> window [${l}..${r}]`}`,
          lines: {
            python: jumped ? 'l = last[ch] + 1' : 'best = max(best, r - l + 1)',
            java: jumped ? 'if (last.containsKey(c))' : 'best = Math.max(best, r - l + 1)',
            cpp: jumped ? 'l = max(l, last[c] + 1)' : 'best = max(best, r - l + 1)',
          },
          codeNote: `win="${s.slice(l, r + 1)}" (len=${curLen})`,
          vars: [
            { name: 'l', value: l, tone: jumped ? 'warning' : 'neutral' },
            { name: 'r', value: r, tone: 'active' },
            { name: 'ch', value: `'${ch}'` },
            { name: 'winLen', value: curLen },
            { name: 'best', value: best, tone: improved ? 'positive' : 'neutral' },
          ],
          visual: {
            mode: 'sliding-window',
            arrayLabel: 'String s (Active Unique Window)',
            arrayValues: s.split(''),
            pointers: { l, r },
            windowRange: [l, r],
            matchedIndices: improved ? Array.from({ length: curLen }, (_, k) => l + k) : undefined,
            auxTitle: 'lastSeen Index Map',
            auxKind: 'hashmap',
            auxEntries: Array.from(last.entries()).map(([k, v]) => ({
              key: `'${k}'`,
              value: `idx ${v}`,
              highlight: k === ch ? 'active' : 'default',
            })),
          },
          teaching: {
            happening: jumped
              ? `'${ch}' already appeared inside the current window at index ${prevIdx} (>= l), so jump l directly to ${l}.`
              : prevIdx !== undefined
                ? `'${ch}' appeared earlier at ${prevIdx}, which is strictly left of l (${l})—stale! Keep l unchanged.`
                : `'${ch}' is new in the window; expand window to [${l}..${r}] (len ${curLen}).`,
            whyLine: 'Checking last[ch] >= l prevents l from ever sliding backward on stale repeats like "abba".',
            condition: jumped ? `prevIdx (${prevIdx}) >= l -> jump l.` : 'Window invariant (all unique) holds.',
            memoryChange: `last['${ch}'] = ${r}${improved ? `, new best = ${best}` : ''}.`,
            whatNext: r + 1 < s.length ? `Advance r to ${r + 1}.` : `Return best = ${best}.`,
          },
        });
      }

      tb.push({
        phase: 'Return',
        title: `Return best = ${best}`,
        lines: { python: 'return best', java: 'return best;', cpp: 'return best;' },
        codeNote: `return ${best}`,
        vars: [
          { name: 'best', value: best, tone: 'positive' },
          { name: 'bestSubstr', value: `"${s.slice(bestWin[0], bestWin[1] + 1)}"` },
        ],
        visual: {
          mode: 'sliding-window',
          arrayLabel: 'Longest Unique Substring',
          arrayValues: s.split(''),
          windowRange: bestWin,
          matchedIndices: Array.from({ length: bestWin[1] - bestWin[0] + 1 }, (_, k) => bestWin[0] + k),
          resultBadge: `Max Length: ${best} ("${s.slice(bestWin[0], bestWin[1] + 1)}")`,
        },
        teaching: {
          happening: `Single pass finished; longest unique substring is "${s.slice(bestWin[0], bestWin[1] + 1)}" of length ${best}.`,
          whyLine: 'Every character visited once -> O(n) time.',
          condition: 'Complete.',
          memoryChange: 'Done.',
          whatNext: 'Done.',
        },
      });

      return { steps: tb.build() };
    },
  },

  'minimum-window-substring': {
    presets: [
      {
        id: 'mw-std',
        label: 'Example 1 · s="ADOBECODEBANC", t="ABC"',
        summary: 'Expands to cover ABC, shrinks cleanly to "BANC" (len 4)',
        inputs: { s: 'ADOBECODEBANC', t: 'ABC' },
      },
      {
        id: 'mw-dups',
        label: 'Duplicate Need · s="AAABBC", t="AABC"',
        summary: 'Requires two A’s, one B, one C -> "AABBC"',
        inputs: { s: 'AAABBC', t: 'AABC' },
      },
    ],
    customSpec: {
      fields: [
        { key: 's', label: 'String s', placeholder: 'ADOBECODEBANC', helper: '1 to 14 characters' },
        { key: 't', label: 'Target t', placeholder: 'ABC', helper: '1 to 6 characters' },
      ],
      defaultValues: { s: 'ADOBECODEBANC', t: 'ABC' },
    },
    generate(problem, inputs) {
      const s = (inputs.s ?? 'ADOBECODEBANC').trim().slice(0, 14);
      const t = (inputs.t ?? 'ABC').trim().slice(0, 6);
      if (!s || !t) return { steps: [], error: 'Enter non-empty strings s (<=14 chars) and t (<=6 chars).' };

      const tb = new TraceBuilder(problem);
      const need = new Map<string, number>();
      for (const c of t) need.set(c, (need.get(c) ?? 0) + 1);
      let rem = t.length;
      let l = 0;
      let bestStart = 0;
      let bestLen = Infinity;

      tb.push({
        phase: 'Initialize',
        title: `Build deficit map for t = "${t}" (remaining = ${rem})`,
        lines: {
          python: 'need = Counter(t)',
          java: 'int[] need = new int[128]',
          cpp: 'int need[128] = {0}',
        },
        codeNote: `rem = ${rem}`,
        vars: [
          { name: 'rem', value: rem },
          { name: 'l', value: 0 },
          { name: 'best', value: '""' },
        ],
        visual: {
          mode: 'sliding-window',
          arrayLabel: 'String s',
          arrayValues: s.split(''),
          auxTitle: 'need Deficit Map (>0 still needed, <=0 surplus)',
          auxKind: 'hashmap',
          auxEntries: Array.from(need.entries()).map(([k, v]) => ({ key: `'${k}'`, value: `need ${v}`, highlight: 'active' })),
        },
        teaching: {
          happening: `Record required counts of each character in "${t}" and set remaining deficit counter rem = ${rem}.`,
          whyLine: 'A single integer rem lets us test whether the window covers all of t in O(1) time.',
          condition: 'Before scanning s.',
          memoryChange: `Initialized need map for "${t}".`,
          whatNext: 'Expand r across s to satisfy all needed characters.',
        },
      });

      for (let r = 0; r < s.length; r++) {
        const c = s[r];
        const before = need.get(c) ?? 0;
        const satisfiedOne = before > 0;
        if (satisfiedOne) rem--;
        need.set(c, before - 1);

        if (satisfiedOne || rem === 0) {
          tb.push({
            phase: 'Expand Right',
            title: `r=${r} ('${c}'): ${satisfiedOne ? `deficit drops to rem=${rem}` : 'surplus/irrelevant'}`,
            lines: {
              python: 'if need[c] > 0:',
              java: 'if (need[s.charAt(r)]-- > 0)',
              cpp: 'if (need[(unsigned char)s[r]]-- > 0)',
            },
            codeNote: `window "${s.slice(l, r + 1)}", rem=${rem}`,
            vars: [
              { name: 'l', value: l },
              { name: 'r', value: r, tone: 'active' },
              { name: 'rem', value: rem, tone: rem === 0 ? 'positive' : 'neutral' },
              { name: 'best', value: bestLen === Infinity ? '""' : `"${s.slice(bestStart, bestStart + bestLen)}"` },
            ],
            visual: {
              mode: 'sliding-window',
              arrayLabel: 'String s',
              arrayValues: s.split(''),
              pointers: { l, r },
              windowRange: [l, r],
              auxTitle: 'need Deficit Map',
              auxKind: 'hashmap',
              auxEntries: Array.from(need.entries())
                .filter(([k]) => t.includes(k))
                .map(([k, v]) => ({
                  key: `'${k}'`,
                  value: v > 0 ? `need ${v}` : v === 0 ? 'exact (0)' : `surplus ${-v}`,
                  highlight: v <= 0 ? 'match' : 'active',
                })),
            },
            teaching: {
              happening: satisfiedOne
                ? `'${c}' was still needed (need > 0), so including it decreases rem to ${rem}.`
                : `'${c}' was not needed right now; deficit remains ${rem}.`,
              whyLine: 'Only characters whose need count was > 0 reduce rem.',
              condition: rem === 0 ? 'rem == 0 -> window is VALID! Enter shrink loop.' : `rem = ${rem} > 0 -> keep expanding r.`,
              memoryChange: `need['${c}'] becomes ${need.get(c)}.`,
              whatNext: rem === 0 ? 'Shrink left pointer l to minimize valid window length.' : 'Advance r.',
            },
          });
        }

        while (rem === 0) {
          const curLen = r - l + 1;
          const improved = curLen < bestLen;
          if (improved) {
            bestLen = curLen;
            bestStart = l;
          }
          const lc = s[l];
          const nextNeed = (need.get(lc) ?? 0) + 1;
          need.set(lc, nextNeed);
          const broke = nextNeed > 0;
          if (broke) rem++;

          tb.push({
            phase: 'Shrink Left',
            title: `Valid "${s.slice(l, r + 1)}" (len ${curLen}) -> drop '${lc}' at l=${l}`,
            lines: {
              python: 'while rem == 0:',
              java: 'while (remaining == 0)',
              cpp: 'while (rem == 0)',
            },
            codeNote: `${improved ? `NEW BEST "${s.slice(l, r + 1)}"` : `len=${curLen}`}, l->${l + 1}`,
            vars: [
              { name: 'l', value: l + 1, tone: 'active' },
              { name: 'r', value: r },
              { name: 'rem', value: rem, tone: broke ? 'warning' : 'positive' },
              { name: 'best', value: `"${s.slice(bestStart, bestStart + bestLen)}"`, tone: improved ? 'positive' : 'neutral' },
            ],
            visual: {
              mode: 'sliding-window',
              arrayLabel: 'String s',
              arrayValues: s.split(''),
              pointers: { l, r },
              windowRange: [l, r],
              matchedIndices: Array.from({ length: curLen }, (_, k) => l + k),
              auxTitle: 'need Deficit Map',
              auxKind: 'hashmap',
              auxEntries: Array.from(need.entries())
                .filter(([k]) => t.includes(k))
                .map(([k, v]) => ({
                  key: `'${k}'`,
                  value: v > 0 ? `need ${v}` : v === 0 ? 'exact (0)' : `surplus ${-v}`,
                  highlight: v <= 0 ? 'match' : 'active',
                })),
            },
            teaching: {
              happening: `Window "${s.slice(l, r + 1)}" covers "${t}". ${improved ? `Recorded new shortest length ${bestLen}.` : ''} Remove '${lc}' from left.`,
              whyLine: 'Once valid, shrinking l discards extra/surplus prefix characters until validity breaks.',
              condition: broke ? `Dropping '${lc}' pushed need['${lc}'] > 0 -> rem becomes 1 (exit shrink).` : `rem still 0 -> keep shrinking!`,
              memoryChange: `l incremented to ${l + 1}, rem = ${rem}.`,
              whatNext: broke ? 'Resume expanding r.' : 'Continue shrinking l.',
            },
          });
          l++;
        }
      }

      const ans = bestLen === Infinity ? '' : s.slice(bestStart, bestStart + bestLen);
      tb.push({
        phase: 'Return',
        title: `Return "${ans}"`,
        lines: { python: 'return "" if best_len', java: 'return bestLen ==', cpp: 'return bestLen ==' },
        codeNote: `return "${ans}"`,
        vars: [{ name: 'result', value: `"${ans}"`, tone: 'positive' }],
        visual: {
          mode: 'sliding-window',
          arrayLabel: 'Minimum Window Substring',
          arrayValues: s.split(''),
          windowRange: ans ? [bestStart, bestStart + bestLen - 1] : undefined,
          matchedIndices: ans ? Array.from({ length: bestLen }, (_, k) => bestStart + k) : undefined,
          resultBadge: ans ? `Minimum Window: "${ans}" (length ${bestLen})` : 'Output: "" (no valid window)',
        },
        teaching: {
          happening: ans ? `Shortest valid window is "${ans}" of length ${bestLen}.` : 'No window covers all characters of t.',
          whyLine: 'Both r and l traversed s at most once -> O(m + n) time.',
          condition: 'Complete.',
          memoryChange: 'Final slice returned.',
          whatNext: 'Done.',
        },
      });

      return { steps: tb.build() };
    },
  },

  'sliding-window-maximum': {
    presets: [
      {
        id: 'swm-std',
        label: 'Example 1 · [1, 3, -1, -3, 5, 3, 6, 7], k = 3',
        summary: 'Monotonic deque outputs [3, 3, 5, 5, 6, 7]',
        inputs: { nums: '1, 3, -1, -3, 5, 3, 6, 7', k: '3' },
      },
      {
        id: 'swm-desc',
        label: 'Decreasing · [9, 7, 5, 3, 1], k = 2',
        summary: 'Front index expires cleanly as window slides',
        inputs: { nums: '9, 7, 5, 3, 1', k: '2' },
      },
    ],
    customSpec: {
      fields: [
        { key: 'nums', label: 'nums (comma-separated)', placeholder: '1, 3, -1, -3, 5, 3, 6, 7', helper: '2 to 10 integers' },
        { key: 'k', label: 'window size k', placeholder: '3', helper: '1 <= k <= len(nums)' },
      ],
      defaultValues: { nums: '1, 3, -1, -3, 5, 3, 6, 7', k: '3' },
    },
    generate(problem, inputs) {
      const nums = parseIntArray(inputs.nums ?? '1, 3, -1, -3, 5, 3, 6, 7', 2, 10);
      const k = Number((inputs.k ?? '3').trim());
      if (!nums || !Number.isInteger(k) || k < 1 || k > nums.length) {
        return { steps: [], error: `Enter 2–10 integers and 1 <= k <= array length.` };
      }

      const tb = new TraceBuilder(problem);
      const dq: number[] = [];
      const res: number[] = [];

      for (let i = 0; i < nums.length; i++) {
        let expired: number | null = null;
        if (dq.length > 0 && dq[0] <= i - k) {
          expired = dq.shift()!;
        }
        const popped: number[] = [];
        while (dq.length > 0 && nums[dq[dq.length - 1]] <= nums[i]) {
          popped.push(dq.pop()!);
        }
        dq.push(i);
        const ready = i >= k - 1;
        if (ready) res.push(nums[dq[0]]);

        const winStart = Math.max(0, i - k + 1);
        tb.push({
          phase: ready ? 'Window Max Recorded' : 'Warm Up Window',
          title: `i=${i} (val=${nums[i]}): ${popped.length ? `popped smaller ${popped.map((idx) => nums[idx]).join(',')}; ` : ''}${ready ? `max = ${nums[dq[0]]}` : `building window`}`,
          lines: {
            python: popped.length ? 'while dq and nums[dq[-1]] <= v' : ready ? 'res.append(nums[dq[0]])' : 'dq.append(i)',
            java: popped.length ? 'while (!dq.isEmpty() && nums[dq.peekLast()]' : ready ? 'if (i >= k - 1) res[' : 'dq.offerLast(i)',
            cpp: popped.length ? 'while (!dq.empty() && nums[dq.back()]' : ready ? 'if (i >= k - 1) res.push_back' : 'dq.push_back(i)',
          },
          codeNote: ready ? `window[${winStart}..${i}] max=${nums[dq[0]]}` : `deque=[${dq.map((idx) => nums[idx]).join(', ')}]`,
          vars: [
            { name: 'i', value: i, tone: 'active' },
            { name: 'nums[i]', value: nums[i] },
            { name: 'window', value: `[${winStart}..${i}]` },
            { name: 'dequeFront', value: `${nums[dq[0]]} (idx ${dq[0]})`, tone: ready ? 'positive' : 'neutral' },
            { name: 'res', value: `[${res.join(', ')}]` },
          ],
          visual: {
            mode: 'sliding-window',
            arrayLabel: `nums (Window size k = ${k})`,
            arrayValues: nums,
            pointers: { winL: winStart, i },
            windowRange: [winStart, i],
            matchedIndices: [dq[0]],
            auxTitle: 'Monotonic Decreasing Deque (value @ index)',
            auxKind: 'deque',
            auxEntries: dq.map((idx, pos) => ({
              key: pos === 0 ? 'FRONT (max)' : `#${pos}`,
              value: `${nums[idx]} (i=${idx})`,
              highlight: pos === 0 ? 'match' : 'active',
            })),
          },
          teaching: {
            happening: `${expired !== null ? `Expired out-of-window front index ${expired}. ` : ''}${popped.length ? `Evicted dominated tail value(s) <= ${nums[i]}. ` : ''}Pushed index ${i} (${nums[i]}).${ready ? ` Window [${winStart}..${i}] max is ${nums[dq[0]]}.` : ''}`,
            whyLine: 'Smaller older elements inside the window can NEVER become maximum once a newer larger value enters.',
            condition: ready ? `i >= k - 1 (${i} >= ${k - 1}) -> emit deque front.` : `Window not full yet (${i + 1}/${k}).`,
            memoryChange: `Deque holds ${dq.length} candidate(s); res = [${res.join(', ')}].`,
            whatNext: i + 1 < nums.length ? `Slide window to i = ${i + 1}.` : `Return [${res.join(', ')}].`,
          },
        });
      }

      tb.push({
        phase: 'Return',
        title: `Return [${res.join(', ')}]`,
        lines: { python: 'return res', java: 'return res;', cpp: 'return res;' },
        codeNote: `return [${res.join(', ')}]`,
        vars: [{ name: 'result', value: `[${res.join(', ')}]`, tone: 'positive' }],
        visual: {
          mode: 'sliding-window',
          arrayLabel: 'nums',
          arrayValues: nums,
          auxTitle: 'Sliding Window Maxima',
          auxKind: 'deque',
          auxEntries: res.map((v, idx) => ({ key: `win ${idx}`, value: String(v), highlight: 'match' })),
          resultBadge: `Output: [${res.join(', ')}]`,
        },
        teaching: {
          happening: `Completed all ${res.length} windows in amortized O(n) time.`,
          whyLine: 'Each index entered and left the deque at most once.',
          condition: 'Done.',
          memoryChange: 'Final array returned.',
          whatNext: 'Done.',
        },
      });

      return { steps: tb.build() };
    },
  },

  'reverse-linked-list': {
    presets: [
      {
        id: 'rl-4',
        label: 'Example 1 · 1 -> 2 -> 3 -> 4',
        summary: 'Rewires every next pointer in-place using prev, curr, nxt',
        inputs: { nodes: '1, 2, 3, 4' },
      },
      {
        id: 'rl-2',
        label: 'Short List · 10 -> 20',
        summary: 'Minimal 2-node reversal edge case',
        inputs: { nodes: '10, 20' },
      },
    ],
    customSpec: {
      fields: [{ key: 'nodes', label: 'Node values (comma-separated)', placeholder: '1, 2, 3, 4', helper: '2 to 6 integers' }],
      defaultValues: { nodes: '1, 2, 3, 4' },
    },
    generate(problem, inputs) {
      const vals = parseIntArray(inputs.nodes ?? '1, 2, 3, 4', 2, 6);
      if (!vals) return { steps: [], error: 'Enter 2–6 integer node values.' };

      const tb = new TraceBuilder(problem);
      const n = vals.length;

      const buildListSnapshot = (reversedCount: number, currIdx: number | null): { nodes: VisNode[]; edges: VisEdge[] } => {
        const nodes: VisNode[] = vals.map((v, idx) => ({
          id: `n${idx}`,
          label: String(v),
          state:
            idx < reversedCount
              ? 'match'
              : idx === currIdx
                ? 'active'
                : 'default',
        }));
        const edges: VisEdge[] = [];
        for (let i = 0; i < n; i++) {
          if (i < reversedCount) {
            if (i > 0) edges.push({ from: `n${i}`, to: `n${i - 1}`, active: true, label: 'rev' });
          } else if (i + 1 < n) {
            edges.push({ from: `n${i}`, to: `n${i + 1}`, active: false });
          }
        }
        return { nodes, edges };
      };

      const initSnap = buildListSnapshot(0, 0);
      tb.push({
        phase: 'Initialize',
        title: `Set prev = null, curr = head (${vals[0]})`,
        lines: {
          python: 'prev, curr = None, head',
          java: 'ListNode prev = null, curr = head',
          cpp: 'ListNode *prev = nullptr, *curr = head',
        },
        codeNote: `prev = null, curr = ${vals[0]}`,
        vars: [
          { name: 'prev', value: 'null' },
          { name: 'curr', value: vals[0], tone: 'active' },
          { name: 'nxt', value: '-' },
        ],
        visual: {
          mode: 'linked-list',
          nodes: initSnap.nodes,
          edges: initSnap.edges,
          nodePointers: { curr: 'n0' },
        },
        teaching: {
          happening: `Initialize prev = null (new tail target) and curr = head (${vals[0]}).`,
          whyLine: 'The original head will become the tail of the reversed list, pointing to null.',
          condition: `curr != null (${vals[0]}).`,
          memoryChange: 'Two node pointers initialized in O(1) space.',
          whatNext: 'Save nxt = curr.next before flipping curr.next.',
        },
      });

      for (let i = 0; i < n; i++) {
        const nxtVal = i + 1 < n ? String(vals[i + 1]) : 'null';
        const prevVal = i > 0 ? String(vals[i - 1]) : 'null';
        const flipSnap = buildListSnapshot(i + 1, i + 1 < n ? i + 1 : null);
        const nodePtrs: Record<string, string> = { prev: `n${i}` };
        if (i + 1 < n) nodePtrs.curr = `n${i + 1}`;

        tb.push({
          phase: 'Rewire & Advance',
          title: `Node ${vals[i]}: save nxt=${nxtVal}, set ${vals[i]}.next=${prevVal}`,
          lines: {
            python: 'curr.next = prev',
            java: 'curr.next = prev;',
            cpp: 'curr->next = prev;',
          },
          codeNote: `${vals[i]}.next -> ${prevVal}; prev=${vals[i]}, curr=${nxtVal}`,
          vars: [
            { name: 'nxt (saved)', value: nxtVal },
            { name: 'rewired', value: `${vals[i]} -> ${prevVal}`, tone: 'positive' },
            { name: 'prev', value: vals[i], tone: 'active' },
            { name: 'curr', value: nxtVal, tone: 'active' },
          ],
          visual: {
            mode: 'linked-list',
            nodes: flipSnap.nodes,
            edges: flipSnap.edges,
            nodePointers: nodePtrs,
          },
          teaching: {
            happening: `Saved nxt = ${nxtVal}, flipped ${vals[i]}.next backward to ${prevVal}, then slid prev -> ${vals[i]} and curr -> ${nxtVal}.`,
            whyLine: 'Saving nxt first prevents losing the remainder of the linked list when curr.next is overwritten.',
            condition: i + 1 < n ? `curr (${nxtVal}) != null -> continue.` : 'curr became null -> loop exits!',
            memoryChange: `${vals[i]}.next pointer reversed in-place.`,
            whatNext: i + 1 < n ? `Flip node ${nxtVal} next.` : `Return prev = ${vals[i]} as new head.`,
          },
        });
      }

      const doneSnap = buildListSnapshot(n, null);
      tb.push({
        phase: 'Return',
        title: `Return prev (new head = ${vals[n - 1]})`,
        lines: { python: 'return prev', java: 'return prev;', cpp: 'return prev;' },
        codeNote: `return Node(${vals[n - 1]})`,
        vars: [{ name: 'newHead', value: vals[n - 1], tone: 'positive' }],
        visual: {
          mode: 'linked-list',
          nodes: doneSnap.nodes,
          edges: doneSnap.edges,
          nodePointers: { newHead: `n${n - 1}` },
          resultBadge: `Reversed: ${[...vals].reverse().join(' -> ')} -> null`,
        },
        teaching: {
          happening: `All ${n} links reversed in O(n) time and O(1) space.`,
          whyLine: 'When curr reaches null, prev sits right on the original tail (now the head).',
          condition: 'curr == null.',
          memoryChange: 'Reversal complete.',
          whatNext: 'Done.',
        },
      });

      return { steps: tb.build() };
    },
  },

  'linked-list-cycle': {
    presets: [
      {
        id: 'llc-cycle',
        label: 'Cycle Present · [3, 2, 0, -4], pos = 1',
        summary: 'Fast laps slow and both collide at node -4',
        inputs: { mode: 'cycle' },
      },
      {
        id: 'llc-acyclic',
        label: 'No Cycle · [3, 2, 0, -4], pos = -1',
        summary: 'Fast hits null safely and returns false',
        inputs: { mode: 'acyclic' },
      },
    ],
    generate(problem, inputs) {
      const hasCycle = (inputs.mode ?? 'cycle') === 'cycle';
      const vals = [3, 2, 0, -4];
      const tb = new TraceBuilder(problem);

      const makeGraph = (slowIdx: number, fastIdx: number | null, matched?: number): { nodes: VisNode[]; edges: VisEdge[] } => {
        const nodes: VisNode[] = vals.map((v, idx) => ({
          id: String(idx),
          label: String(v),
          state:
            matched === idx
              ? 'match'
              : idx === slowIdx || idx === fastIdx
                ? 'active'
                : 'default',
        }));
        const edges: VisEdge[] = [
          { from: '0', to: '1' },
          { from: '1', to: '2' },
          { from: '2', to: '3' },
        ];
        if (hasCycle) edges.push({ from: '3', to: '1', label: 'cycle', active: true });
        return { nodes, edges };
      };

      const nextNode = (idx: number | null): number | null => {
        if (idx === null) return null;
        if (idx < 3) return idx + 1;
        return hasCycle ? 1 : null;
      };

      let slow: number | null = 0;
      let fast: number | null = 0;

      const s0 = makeGraph(0, 0);
      tb.push({
        phase: 'Initialize',
        title: 'Start slow and fast at head (3)',
        lines: {
          python: 'slow = fast = head',
          java: 'ListNode slow = head, fast = head',
          cpp: 'ListNode *slow = head, *fast = head',
        },
        codeNote: 'slow=3, fast=3',
        vars: [
          { name: 'slow', value: '3 (idx 0)' },
          { name: 'fast', value: '3 (idx 0)' },
        ],
        visual: {
          mode: 'linked-list',
          nodes: s0.nodes,
          edges: s0.edges,
          nodePointers: { 'slow,fast': '0' },
        },
        teaching: {
          happening: 'Place both tortoise (slow) and hare (fast) at head node 3.',
          whyLine: 'Moving at speeds 1 and 2 detects any cycle in O(1) extra memory without a visited HashSet.',
          condition: 'Before entering while loop.',
          memoryChange: 'Two pointers initialized.',
          whatNext: 'Check fast and fast.next, then step slow +1 and fast +2.',
        },
      });

      let stepNum = 0;
      while (fast !== null && nextNode(fast) !== null && stepNum < 8) {
        stepNum++;
        slow = nextNode(slow);
        fast = nextNode(nextNode(fast));
        const collided = slow !== null && fast !== null && slow === fast;
        const snap = makeGraph(slow ?? -1, fast, collided ? slow! : undefined);
        const ptrs: Record<string, string> = {};
        if (collided && slow !== null) {
          ptrs['COLLISION (slow==fast)'] = String(slow);
        } else {
          if (slow !== null) ptrs.slow = String(slow);
          if (fast !== null) ptrs.fast = String(fast);
        }

        tb.push({
          phase: collided ? 'Collision!' : 'Advance Pointers',
          title: `Step ${stepNum}: slow -> ${slow !== null ? vals[slow] : 'null'}, fast -> ${fast !== null ? vals[fast] : 'null'}`,
          lines: {
            python: collided ? 'if slow is fast:' : 'fast = fast.next.next',
            java: collided ? 'if (slow == fast) return true' : 'fast = fast.next.next',
            cpp: collided ? 'if (slow == fast) return true' : 'fast = fast->next->next',
          },
          codeNote: collided ? `slow == fast at ${vals[slow!]} -> true` : `slow=${vals[slow!]}, fast=${fast !== null ? vals[fast] : 'null'}`,
          vars: [
            { name: 'step', value: stepNum },
            { name: 'slow', value: slow !== null ? vals[slow] : 'null', tone: collided ? 'positive' : 'active' },
            { name: 'fast', value: fast !== null ? vals[fast] : 'null', tone: collided ? 'positive' : 'active' },
          ],
          visual: {
            mode: 'linked-list',
            nodes: snap.nodes,
            edges: snap.edges,
            nodePointers: ptrs,
            resultBadge: collided ? `Cycle Detected! Collided at node ${vals[slow!]}` : undefined,
          },
          teaching: {
            happening: collided
              ? `slow and fast both landed on node ${vals[slow!]}! Inside a cycle, fast closes the gap by 1 node each tick.`
              : `slow took 1 step to ${vals[slow!]}, while fast took 2 steps to ${fast !== null ? vals[fast] : 'null'}.`,
            whyLine: 'A relative speed of 1 step/iteration ensures fast can never jump over slow inside a loop.',
            condition: collided ? 'slow == fast -> return true!' : 'slow != fast -> continue loop.',
            memoryChange: 'Pointers updated in O(1) space.',
            whatNext: collided ? 'Return true.' : 'Check fast && fast.next for next step.',
          },
        });

        if (collided) return { steps: tb.build() };
      }

      const endSnap = makeGraph(slow ?? -1, null);
      tb.push({
        phase: 'Return',
        title: 'fast reached null -> No Cycle (false)',
        lines: { python: 'return False', java: 'return false;', cpp: 'return false;' },
        codeNote: 'return false',
        vars: [{ name: 'hasCycle', value: 'false', tone: 'neutral' }],
        visual: {
          mode: 'linked-list',
          nodes: endSnap.nodes,
          edges: endSnap.edges,
          nodePointers: slow !== null ? { slow: String(slow) } : undefined,
          resultBadge: 'Output: false (fast reached end of list)',
        },
        teaching: {
          happening: 'fast (or fast.next) reached null, proving the linked list terminates cleanly.',
          whyLine: 'Only acyclic lists have a null tail.',
          condition: 'while fast and fast.next is false.',
          memoryChange: 'None.',
          whatNext: 'Return false.',
        },
      });

      return { steps: tb.build() };
    },
  },

  'merge-k-sorted-lists': {
    presets: [
      {
        id: 'mk-3',
        label: 'Example 1 · [[1,4,5], [1,3,4], [2,6]]',
        summary: 'Pairwise divide-and-conquer merges k=3 lists in O(N log k)',
        inputs: { mode: 'standard' },
      },
      {
        id: 'mk-4',
        label: '4 Lists · [[1,7], [2,5], [3,8], [4,6]]',
        summary: 'Shows two balanced halving rounds (4 -> 2 -> 1)',
        inputs: { mode: 'four' },
      },
    ],
    generate(problem, inputs) {
      const lists: number[][] =
        (inputs.mode ?? 'standard') === 'four'
          ? [[1, 7], [2, 5], [3, 8], [4, 6]]
          : [[1, 4, 5], [1, 3, 4], [2, 6]];

      const tb = new TraceBuilder(problem);
      const mergeTwo = (a: number[], b: number[]) => {
        const out: number[] = [];
        let i = 0;
        let j = 0;
        while (i < a.length && j < b.length) {
          out.push(a[i] <= b[j] ? a[i++] : b[j++]);
        }
        while (i < a.length) out.push(a[i++]);
        while (j < b.length) out.push(b[j++]);
        return out;
      };

      const work = lists.map((l) => [...l]);
      let step = 1;
      const toEntries = (arr: number[][], highlightIdx?: number): AuxEntry[] =>
        arr.map((list, idx) => ({
          key: `lists[${idx}]`,
          value: list.join(' -> '),
          highlight: idx === highlightIdx ? 'match' : 'default',
        }));

      tb.push({
        phase: 'Initialize',
        title: `Start with k = ${work.length} sorted linked lists`,
        lines: {
          python: 'step = 1',
          java: 'int interval = 1',
          cpp: 'for (int step = 1',
        },
        codeNote: `k = ${work.length}, stride = 1`,
        vars: [
          { name: 'k', value: work.length },
          { name: 'step', value: 1 },
        ],
        visual: {
          mode: 'hash-buckets',
          arrayLabel: 'List Slots',
          arrayValues: work.map((_, idx) => `L${idx}`),
          auxTitle: 'Active Lists Array',
          auxKind: 'buckets',
          auxEntries: toEntries(work),
        },
        teaching: {
          happening: `We have ${work.length} sorted lists. Instead of merging sequentially 0+1+2..., we pair them in balanced rounds.`,
          whyLine: 'Halving the number of lists each round cuts total work from O(N*k) down to O(N log k) with O(1) space.',
          condition: `step (1) < k (${work.length}).`,
          memoryChange: 'In-place pointer merging across existing list heads.',
          whatNext: 'Merge adjacent pairs (0, 1), (2, 3), ... at stride 1.',
        },
      });

      while (step < work.length) {
        for (let i = 0; i + step < work.length; i += step * 2) {
          const leftStr = work[i].join('->');
          const rightStr = work[i + step].join('->');
          work[i] = mergeTwo(work[i], work[i + step]);
          tb.push({
            phase: `Stride ${step} Merge`,
            title: `Merge lists[${i}] (${leftStr}) & lists[${i + step}] (${rightStr})`,
            lines: {
              python: 'lists[i] = merge_two(lists[i], lists[i + step])',
              java: 'lists[i] = mergeTwo(lists[i], lists[i + interval])',
              cpp: 'lists[i] = mergeTwo(lists[i], lists[i + step])',
            },
            codeNote: `lists[${i}] = [${work[i].join(', ')}]`,
            vars: [
              { name: 'step', value: step },
              { name: 'pair', value: `(${i}, ${i + step})`, tone: 'active' },
              { name: `lists[${i}]`, value: `[${work[i].join(', ')}]`, tone: 'positive' },
            ],
            visual: {
              mode: 'hash-buckets',
              arrayLabel: 'List Slots',
              arrayValues: work.map((_, idx) => `L${idx}`),
              activeIndices: [i, i + step],
              matchedIndices: [i],
              auxTitle: 'Lists After Pairwise Merge',
              auxKind: 'buckets',
              auxEntries: toEntries(work, i),
            },
            teaching: {
              happening: `Merged sorted lists[${i}] and lists[${i + step}] into lists[${i}] = [${work[i].join(', ')}].`,
              whyLine: 'Two-pointer merge combines two sorted lists in linear time and O(1) extra space.',
              condition: `i + step (${i + step}) < ${work.length}.`,
              memoryChange: `lists[${i}] now stores the merged sorted chain.`,
              whatNext: i + step * 3 < work.length ? 'Merge next pair in this round.' : 'Double stride (step *= 2) for next round.',
            },
          });
        }
        step *= 2;
      }

      tb.push({
        phase: 'Return',
        title: 'Return lists[0] (single fully merged list)',
        lines: { python: 'return lists[0]', java: 'return lists[0];', cpp: 'return lists[0];' },
        codeNote: `[${work[0].join(', ')}]`,
        vars: [{ name: 'merged', value: `[${work[0].join(', ')}]`, tone: 'positive' }],
        visual: {
          mode: 'linked-list',
          nodes: work[0].map((v, idx) => ({ id: `r${idx}`, label: String(v), state: 'match' })),
          edges: work[0].slice(0, -1).map((_, idx) => ({ from: `r${idx}`, to: `r${idx + 1}`, active: true })),
          nodePointers: { head: 'r0' },
          resultBadge: `Merged Output: ${work[0].join(' -> ')}`,
        },
        teaching: {
          happening: `All ${lists.length} lists merged cleanly into one sorted list of ${work[0].length} nodes.`,
          whyLine: 'Only O(log k) merge rounds were needed.',
          condition: `step (${step}) >= k.`,
          memoryChange: 'Final head lists[0] returned.',
          whatNext: 'Done.',
        },
      });

      return { steps: tb.build() };
    },
  },

  'invert-binary-tree': {
    presets: [
      {
        id: 'ibt-full',
        label: 'Example 1 · [4, 2, 7, 1, 3, 6, 9]',
        summary: 'Preorder DFS swaps children top-down at every node',
        inputs: { mode: 'full' },
      },
      {
        id: 'ibt-asym',
        label: 'Asymmetric · [4, 2, 7, 1, null, 6]',
        summary: 'Shows child swapping when some children are null',
        inputs: { mode: 'asym' },
      },
    ],
    generate(problem, inputs) {
      const asym = (inputs.mode ?? 'full') === 'asym';
      const tb = new TraceBuilder(problem);

      interface TNode {
        id: string;
        val: number;
        left: TNode | null;
        right: TNode | null;
      }

      const makeNode = (val: number, left: TNode | null = null, right: TNode | null = null): TNode => ({
        id: `n${val}`,
        val,
        left,
        right,
      });

      const root = asym
        ? makeNode(4, makeNode(2, makeNode(1), null), makeNode(7, makeNode(6), null))
        : makeNode(
            4,
            makeNode(2, makeNode(1), makeNode(3)),
            makeNode(7, makeNode(6), makeNode(9)),
          );

      const layoutTree = (
        r: TNode | null,
        activeId?: string,
        doneIds = new Set<string>(),
      ): { nodes: VisNode[]; edges: VisEdge[] } => {
        const nodes: VisNode[] = [];
        const edges: VisEdge[] = [];
        const walk = (n: TNode | null, x: number, y: number, spread: number) => {
          if (!n) return;
          nodes.push({
            id: n.id,
            label: String(n.val),
            x,
            y,
            state: n.id === activeId ? 'active' : doneIds.has(n.id) ? 'match' : 'default',
          });
          if (n.left) {
            edges.push({ from: n.id, to: n.left.id, active: n.id === activeId });
            walk(n.left, x - spread, y + 60, spread * 0.5);
          }
          if (n.right) {
            edges.push({ from: n.id, to: n.right.id, active: n.id === activeId });
            walk(n.right, x + spread, y + 60, spread * 0.5);
          }
        };
        walk(r, 180, 28, 86);
        return { nodes, edges };
      };

      const done = new Set<string>();
      const stack: string[] = [];

      const sInit = layoutTree(root);
      tb.push({
        phase: 'Start DFS',
        title: 'Call invertTree(root = 4)',
        lines: { python: 'if not root:', java: 'if (root == null) return null', cpp: 'if (!root) return nullptr' },
        codeNote: 'root = 4',
        vars: [{ name: 'root', value: 4 }],
        visual: { mode: 'tree', nodes: sInit.nodes, edges: sInit.edges, callStack: ['invertTree(4)'] },
        teaching: {
          happening: 'Begin recursive DFS at root 4.',
          whyLine: 'Mirroring a tree means swapping left and right subtrees at every non-null node.',
          condition: 'root != null.',
          memoryChange: 'Call stack: [invertTree(4)].',
          whatNext: 'Swap children of 4 and recurse into subtrees.',
        },
      });

      const dfs = (n: TNode | null) => {
        if (!n) return;
        stack.push(`invertTree(${n.val})`);
        const tmp = n.left;
        n.left = n.right;
        n.right = tmp;
        done.add(n.id);
        const snap = layoutTree(root, n.id, done);
        tb.push({
          phase: 'Swap Children',
          title: `Node ${n.val}: swap left (${n.right?.val ?? 'null'}) <-> right (${n.left?.val ?? 'null'})`,
          lines: {
            python: 'root.left, root.right =',
            java: 'TreeNode tmp = root.left',
            cpp: 'swap(root->left, root->right)',
          },
          codeNote: `swapped children of ${n.val}`,
          vars: [
            { name: 'node', value: n.val, tone: 'active' },
            { name: 'newLeft', value: n.left?.val ?? 'null' },
            { name: 'newRight', value: n.right?.val ?? 'null' },
          ],
          visual: {
            mode: 'tree',
            nodes: snap.nodes,
            edges: snap.edges,
            callStack: [...stack],
          },
          teaching: {
            happening: `Swapped left and right pointers at node ${n.val}: new left is ${n.left?.val ?? 'null'}, new right is ${n.right?.val ?? 'null'}.`,
            whyLine: 'Every subtree needs the same mirror transformation recursively.',
            condition: `node (${n.val}) != null.`,
            memoryChange: `Mutated pointers of node ${n.val} in-place.`,
            whatNext: 'Recurse into left and right children.',
          },
        });
        if (n.left) dfs(n.left);
        if (n.right) dfs(n.right);
        stack.pop();
      };

      dfs(root);
      const finalSnap = layoutTree(root, undefined, done);
      tb.push({
        phase: 'Return',
        title: 'Tree inversion complete -> return root (4)',
        lines: { python: 'return root', java: 'return root;', cpp: 'return root;' },
        codeNote: 'return root',
        vars: [{ name: 'swappedNodes', value: done.size, tone: 'positive' }],
        visual: {
          mode: 'tree',
          nodes: finalSnap.nodes,
          edges: finalSnap.edges,
          resultBadge: 'Binary Tree Fully Inverted!',
        },
        teaching: {
          happening: `Every node's children have been swapped in O(n) time and O(h) recursion stack space.`,
          whyLine: 'Base cases returned cleanly on all null leaves.',
          condition: 'Recursion unwound.',
          memoryChange: 'Tree mirrored in-place.',
          whatNext: 'Done.',
        },
      });

      return { steps: tb.build() };
    },
  },
};
