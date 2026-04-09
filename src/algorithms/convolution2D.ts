import type { AlgorithmResult } from '../types/algorithm';

export interface ProductItem {
  ky: number;
  kx: number;
  inputVal: number;
  kernelVal: number; // the flipped-kernel weight at this position
  product: number;
}

export interface Convolution2DState {
  input: number[][];
  /** Current state of the kernel: original → h-flipped → fully flipped (180°) */
  kernel: number[][];
  output: (number | null)[][];
  /** Which output cell is currently being computed (null before/after loop) */
  outputPos: { row: number; col: number } | null;
  /** Kernel top-left relative to the actual input (can be negative during padding) */
  kernelPos: { row: number; col: number } | null;
  activeProducts: ProductItem[] | null;
  currentSum: number | null;
  /** True during the explicit padding step so the UI can highlight padding cells */
  highlightPadding: boolean;
}

/** Default 3×5 greyscale input — varied brightness to create an interesting image. */
export const DEFAULT_INPUT: number[][] = [
  [ 20,  80, 150, 210, 240],
  [ 50, 110, 170, 220, 250],
  [ 40,  90, 130, 190, 230],
];

/** Default 3×3 kernel — clearly asymmetric so the flip steps are visually obvious. */
export const DEFAULT_KERNEL: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

export function run2DConvolution(
  input: number[][],
  rawKernel: number[][]
): AlgorithmResult<Convolution2DState> {
  const steps: AlgorithmResult<Convolution2DState> = [];
  const H = input.length;
  const W = input[0].length;
  const KH = rawKernel.length;
  const KW = rawKernel[0].length;
  const outH = H + KH - 1;
  const outW = W + KW - 1;

  const output: (number | null)[][] = Array.from({ length: outH }, () =>
    Array<number | null>(outW).fill(null)
  );

  const snap = (kernel: number[][]): number[][] => kernel.map((r) => [...r]);

  const pushStep = (
    kernelState: number[][],
    outputPos: { row: number; col: number } | null,
    kernelPos: { row: number; col: number } | null,
    activeProducts: ProductItem[] | null,
    currentSum: number | null,
    highlightPadding: boolean,
    highlightedLines: number[],
    explanation: string,
    metadata?: Record<string, string | number | boolean | null>
  ) => {
    steps.push({
      data: {
        input: input.map((r) => [...r]),
        kernel: snap(kernelState),
        output: output.map((r) => [...r]),
        outputPos,
        kernelPos,
        activeProducts,
        currentSum,
        highlightPadding,
      },
      highlightedLines,
      explanation,
      metadata: metadata ?? {},
    });
  };

  // ── Step 1: Pad input ─────────────────────────────────────────────────────
  pushStep(rawKernel, null, null, null, null, true, [1],
    `Pad the ${H}×${W} input with ${KH - 1} row(s)/col(s) of zeros on every side. ` +
    `This lets the kernel slide over every pixel — including those on the edges.`);

  // ── Step 2: Show original kernel — about to flip horizontally ─────────────
  pushStep(rawKernel, null, null, null, null, false, [2],
    'Flip the kernel horizontally: reverse the elements in each row.');

  // ── Step 3: H-flipped — about to flip vertically ──────────────────────────
  const hFlipped = rawKernel.map((row) => [...row].reverse());
  pushStep(hFlipped, null, null, null, null, false, [3],
    'Kernel flipped horizontally. Now flip it vertically: reverse the row order.');

  // ── Step 4: Fully flipped (180° rotation) ─────────────────────────────────
  const flippedKernel = [...hFlipped].reverse();
  pushStep(flippedKernel, null, null, null, null, false, [4],
    'Kernel rotated 180°. Position it so its bottom-right corner aligns with input[0][0].');

  // ── Step 5: Kernel at initial position ────────────────────────────────────
  pushStep(
    flippedKernel,
    { row: 0, col: 0 },
    { row: -(KH - 1), col: -(KW - 1) },
    null, null, false, [4],
    `Kernel positioned: bottom-right corner at input[0][0]. Starting convolution loop.`
  );

  // ── Main sliding loop ──────────────────────────────────────────────────────
  for (let oy = 0; oy < outH; oy++) {
    for (let ox = 0; ox < outW; ox++) {
      const kernelPos = { row: oy - (KH - 1), col: ox - (KW - 1) };
      const outputPos = { row: oy, col: ox };
      const isLast = oy === outH - 1 && ox === outW - 1;

      // Compute products for every kernel cell
      const products: ProductItem[] = [];
      let sum = 0;
      for (let ky = 0; ky < KH; ky++) {
        for (let kx = 0; kx < KW; kx++) {
          const ir = kernelPos.row + ky;
          const ic = kernelPos.col + kx;
          const inputVal =
            ir >= 0 && ir < H && ic >= 0 && ic < W ? input[ir][ic] : 0;
          const kernelVal = flippedKernel[ky][kx];
          const product = inputVal * kernelVal;
          products.push({ ky, kx, inputVal, kernelVal, product });
          sum += product;
        }
      }

      // Step 6: Pointwise multiply
      pushStep(flippedKernel, outputPos, kernelPos, products, null, false, [6],
        `output[${oy}][${ox}]: Multiply each kernel weight with its overlapping (zero-padded) input pixel.`,
        { 'Output row': oy, 'Output col': ox });

      // Step 7: Sum products
      pushStep(flippedKernel, outputPos, kernelPos, products, sum, false, [7],
        `Sum the ${products.length} products: ${products.map((p) => p.product).join(' + ')} = ${sum}`,
        { 'Output row': oy, 'Output col': ox, 'Sum': sum });

      // Step 8: Write to output
      output[oy][ox] = sum;
      pushStep(flippedKernel, outputPos, kernelPos, null, sum, false, [8],
        `Write ${sum} to output[${oy}][${ox}].`,
        { 'Output row': oy, 'Output col': ox, 'Output value': sum });

      // Step 9: Move kernel (skip for last position)
      if (!isLast) {
        const nextOx = (ox + 1) % outW;
        const nextOy = nextOx === 0 ? oy + 1 : oy;
        const nextKernelPos = { row: nextOy - (KH - 1), col: nextOx - (KW - 1) };
        pushStep(
          flippedKernel,
          { row: nextOy, col: nextOx },
          nextKernelPos,
          null, null, false, [9],
          `Move kernel${nextOx === 0 ? ' to next row,' : ''} → output position (${nextOy}, ${nextOx}).`,
          { 'Output row': nextOy, 'Output col': nextOx }
        );
      }
    }
  }

  // ── Final step ─────────────────────────────────────────────────────────────
  pushStep(flippedKernel, null, null, null, null, false, [],
    '2D Linear Convolution complete! All output values have been computed.',
    {});

  return steps;
}
