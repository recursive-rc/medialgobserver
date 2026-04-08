import type { AlgorithmResult } from '../types/algorithm';

export interface Convolution1DState {
  signal: number[];
  kernel: number[];
  output: (number | null)[];
  n: number | null;
  showProducts: boolean;
  currentSum: number | null;
  overlapSpan: [number, number] | null;
}

export function run1DConvolution(signal: number[], kernel: number[]): AlgorithmResult<Convolution1DState> {
  const steps: AlgorithmResult<Convolution1DState> = [];
  const N = signal.length;
  const M = kernel.length;
  const outputLength = N + M - 1;
  const output: (number | null)[] = Array(outputLength).fill(null);

  // Helper
  const pushStep = (
    n: number | null, 
    showProducts: boolean,
    currentSum: number | null, 
    overlapSpan: [number, number] | null,
    highlightedLines: number[], 
    explanation: string
  ) => {
    steps.push({
      data: {
        signal: [...signal],
        kernel: [...kernel],
        output: [...output],
        n,
        showProducts,
        currentSum,
        overlapSpan
      },
      highlightedLines,
      explanation,
      metadata: {
        'n': n !== null ? n : '-',
        'Overlap range (k)': overlapSpan ? `[${overlapSpan[0]}, ${overlapSpan[1]}]` : '-',
        'sum': currentSum !== null ? currentSum : '-',
      }
    });
  };

  // 1. Flip h around
  pushStep(null, false, null, null, [1], "Reversing the kernel before convolution.");

  // 2. Align h[end] with x[start]
  pushStep(0, false, null, null, [2], "Shift kernel so the rightmost element of flipped kernel aligns with the first element of the signal (n=0).");

  let n = 0;
  // 3. Repeat until no overlap:
  while (n < outputLength) {
    const kStart = Math.max(0, n - M + 1);
    const kEnd = Math.min(N - 1, n);
    const overlapSpan: [number, number] = [kStart, kEnd];

    pushStep(n, false, null, overlapSpan, [3], `Shift n = ${n}. Identify the overlapping pairs.`);

    let sum = 0;
    const products: number[] = [];
    for (let k = kStart; k <= kEnd; k++) {
      const indexH = n - k;
      const product = signal[k] * kernel[indexH];
      products.push(product);
      sum += product;
    }

    // 4. Multiply overlapping pairs
    // All at once
    pushStep(n, true, null, overlapSpan, [4], `Multiply all overlapping element pairs.`);

    // 5. Sum products
    pushStep(n, true, sum, overlapSpan, [5], `Sum the products together: [${products.join(' + ')}] = ${sum}.`);

    // 6. Store sum to output
    output[n] = sum;
    pushStep(n, false, sum, overlapSpan, [6], `Store final accumulated sum (${sum}) to output at index ${n}.`);

    // 7. Shift h right by 1
    if (n < outputLength - 1) {
      pushStep(n + 1, false, sum, null, [7], `Shift the flipped kernel right by 1 position (n=${n+1}).`);
    } else {
      pushStep(n, false, sum, null, [3], `No more overlaps possible, the kernel has passed the signal completely.`);
    }
    
    n++;
  }

  // Final Step 
  steps.push({
    data: {
      signal: [...signal],
      kernel: [...kernel],
      output: [...output],
      n: null,
      showProducts: false,
      currentSum: null,
      overlapSpan: null
    },
    highlightedLines: [],
    explanation: '1D Linear Convolution complete!',
    metadata: {}
  });

  return steps;
}
