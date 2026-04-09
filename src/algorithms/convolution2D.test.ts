import { describe, it, expect } from 'vitest';
import { run2DConvolution, DEFAULT_INPUT, DEFAULT_KERNEL } from './convolution2D';

describe('run2DConvolution', () => {
  // ── Output size ────────────────────────────────────────────────────────────
  it('produces the correct output size for full convolution (H+KH-1 × W+KW-1)', () => {
    const input = [[1, 2], [3, 4]];
    const kernel = [[1, 0], [0, 0]];
    const steps = run2DConvolution(input, kernel);
    const output = steps[steps.length - 1].data.output;
    expect(output.length).toBe(3);      // 2 + 2 - 1
    expect(output[0].length).toBe(3);   // 2 + 2 - 1
  });

  it('produces a 5×7 output for the 3×5 default input with a 3×3 kernel', () => {
    const steps = run2DConvolution(DEFAULT_INPUT, DEFAULT_KERNEL);
    const output = steps[steps.length - 1].data.output;
    expect(output.length).toBe(5);      // 3 + 3 - 1
    expect(output[0].length).toBe(7);   // 5 + 3 - 1
  });

  // ── Correctness ───────────────────────────────────────────────────────────
  it('correctly convolves a 2×2 input with a simple 2×2 kernel', () => {
    // kernel [[1,0],[0,0]] flipped h-then-v → [[0,0],[0,1]]
    // output[oy][ox] = Σ flipped[ky][kx] * paddedInput[oy-1+ky][ox-1+kx]
    // Expected full output (3×3):
    //   [[1, 2, 0],
    //    [3, 4, 0],
    //    [0, 0, 0]]
    const input = [[1, 2], [3, 4]];
    const kernel = [[1, 0], [0, 0]];
    const steps = run2DConvolution(input, kernel);
    const output = steps[steps.length - 1].data.output;
    expect(output[0][0]).toBe(1);
    expect(output[0][1]).toBe(2);
    expect(output[0][2]).toBe(0);
    expect(output[1][0]).toBe(3);
    expect(output[1][1]).toBe(4);
    expect(output[1][2]).toBe(0);
    expect(output[2][0]).toBe(0);
    expect(output[2][1]).toBe(0);
    expect(output[2][2]).toBe(0);
  });

  it('correctly handles a 1D (single-row) kernel — verifies horizontal flip', () => {
    // input = [[1, 0, 0, 0]], kernel = [[1, 2, 3]]
    // flip-h: [[3, 2, 1]], flip-v: [[3, 2, 1]] (single row, unchanged by v-flip)
    // Full 1×6 output: [1, 2, 3, 0, 0, 0]
    const input = [[1, 0, 0, 0]];
    const kernel = [[1, 2, 3]];
    const steps = run2DConvolution(input, kernel);
    const output = steps[steps.length - 1].data.output;
    expect(output[0]).toEqual([1, 2, 3, 0, 0, 0]);
  });

  it('identity kernel (symmetric) produces zero-padded input centered in a larger output', () => {
    // [[0,0,0],[0,1,0],[0,0,0]] is symmetric — flip has no effect
    // output[oy][ox] = input[oy-1][ox-1] or 0 (shifted by 1 in each direction)
    const input = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    const kernel = [[0, 0, 0], [0, 1, 0], [0, 0, 0]];
    const steps = run2DConvolution(input, kernel);
    const output = steps[steps.length - 1].data.output;
    // output size: 5×5
    expect(output.length).toBe(5);
    // Corners: padded, must be 0
    expect(output[0][0]).toBe(0);
    expect(output[4][4]).toBe(0);
    // Interior: shifted input
    expect(output[1][1]).toBe(1);  // input[0][0]
    expect(output[2][2]).toBe(5);  // input[1][1]
    expect(output[3][3]).toBe(9);  // input[2][2]
    expect(output[1][3]).toBe(3);  // input[0][2]
    expect(output[3][1]).toBe(7);  // input[2][0]
  });

  // ── Kernel flip ───────────────────────────────────────────────────────────
  it('records the correct kernel state at each flip step', () => {
    // Step layout (new, with padding step prepended):
    //   steps[0] = padding step       → kernel still original
    //   steps[1] = flip-h description → kernel still original (about to flip)
    //   steps[2] = after h-flip       → kernel h-flipped
    //   steps[3] = after v-flip       → kernel fully flipped
    const steps = run2DConvolution([[1]], [[1, 2, 3]]);
    expect(steps[0].data.kernel).toEqual([[1, 2, 3]]); // padding step, original kernel
    expect(steps[1].data.kernel).toEqual([[1, 2, 3]]); // showing original, about to flip-h
    expect(steps[2].data.kernel).toEqual([[3, 2, 1]]); // after h-flip
    expect(steps[3].data.kernel).toEqual([[3, 2, 1]]); // after v-flip (1-row: unchanged)
  });

  it('correctly h-flips and v-flips a 2×2 kernel', () => {
    // [[1,2],[3,4]] → h-flip → [[2,1],[4,3]] → v-flip → [[4,3],[2,1]]
    const steps = run2DConvolution([[0]], [[1, 2], [3, 4]]);
    expect(steps[2].data.kernel).toEqual([[2, 1], [4, 3]]); // h-flipped
    expect(steps[3].data.kernel).toEqual([[4, 3], [2, 1]]); // h+v-flipped
  });

  // ── Padding step ──────────────────────────────────────────────────────────
  it('marks the first step as a padding step with highlightPadding=true', () => {
    const steps = run2DConvolution([[1]], [[1]]);
    expect(steps[0].data.highlightPadding).toBe(true);
  });

  it('all subsequent steps have highlightPadding=false', () => {
    const steps = run2DConvolution([[1]], [[1]]);
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i].data.highlightPadding).toBe(false);
    }
  });

  // ── Products include kernelVal ────────────────────────────────────────────
  it('activeProducts contain correct kernelVal and inputVal', () => {
    // input=[[5]], kernel=[[2]]; flipped kernel=[[2]]; only one product: 2×5=10
    const steps = run2DConvolution([[5]], [[2]]);
    // Multiply step: steps[5] (after 5 init steps)
    const multiplyStep = steps[5];
    expect(multiplyStep.data.activeProducts).not.toBeNull();
    const p = multiplyStep.data.activeProducts![0];
    expect(p.kernelVal).toBe(2);
    expect(p.inputVal).toBe(5);
    expect(p.product).toBe(10);
  });

  // ── Step count ────────────────────────────────────────────────────────────
  it('generates the correct number of steps for default inputs (3×5 input, 3×3 kernel)', () => {
    // outH = 3+3-1 = 5, outW = 5+3-1 = 7, totalPositions = 35
    // 5 init (pad + orig + h-flip + v-flip + pos)
    // + 35 × 3 compute (multiply + sum + output)
    // + 34 move steps (all positions except the last)
    // + 1 final done step
    // = 5 + 105 + 34 + 1 = 145
    const steps = run2DConvolution(DEFAULT_INPUT, DEFAULT_KERNEL);
    expect(steps.length).toBe(145);
  });

  it('generates the correct number of steps for a minimal 1×1 input and 1×1 kernel', () => {
    // 5 init + 1×3 compute + 0 moves + 1 final = 9
    const steps = run2DConvolution([[5]], [[3]]);
    expect(steps.length).toBe(9);
    const output = steps[steps.length - 1].data.output;
    // [[3]] flipped 180° is still [[3]] (symmetric); 5×3 = 15
    expect(output[0][0]).toBe(15);
  });
});
