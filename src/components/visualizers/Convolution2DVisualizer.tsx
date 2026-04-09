import { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VisualizerShell } from '../shared/VisualizerShell';
import {
  run2DConvolution,
  type Convolution2DState,
  type ProductItem,
  DEFAULT_INPUT,
  DEFAULT_KERNEL,
} from '../../algorithms/convolution2D';

// ── Pseudocode — "Pad input" is now its own line; "Position kernel" stays outside loop
const PSEUDOCODE = [
  'Pad input with zeros',
  'Flip kernel horizontally',
  'Flip kernel vertically',
  'Position kernel at top-left of input',
  'Repeat:',
  '    Pointwise multiply overlapping pixels',
  '    Sum up products',
  '    Output sum',
  '    Move kernel',
];

// ── Module-level constants derived from defaults ──────────────────────────
const KH = DEFAULT_KERNEL.length;       // 3
const KW = DEFAULT_KERNEL[0].length;    // 3
const H  = DEFAULT_INPUT.length;        // 3
const W  = DEFAULT_INPUT[0].length;     // 5
const PAD_H = H + 2 * (KH - 1);        // 7
const PAD_W = W + 2 * (KW - 1);        // 9

// Cell pixel dimensions
const PADDED_CELL = 52;   // slightly larger to accommodate the equation badge
const KERNEL_CELL = 56;
const OUTPUT_CELL = 42;

// ── Helpers ───────────────────────────────────────────────────────────────
function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/** Returns '#000' or '#fff' for maximum readability against a greyscale bg. */
function contrastText(brightness: number): string {
  return brightness > 140 ? '#000000' : '#ffffff';
}

/**
 * Returns the background and text colors for a badge overlaid on a greyscale
 * pixel, ensuring the badge is always readable regardless of pixel brightness.
 */
function badgeStyle(brightness: number): { backgroundColor: string; color: string } {
  return brightness > 128
    ? { backgroundColor: 'rgba(0,0,0,0.78)', color: '#ffffff' }
    : { backgroundColor: 'rgba(255,255,255,0.88)', color: '#000000' };
}

// ── Sub-components ────────────────────────────────────────────────────────

interface PaddedInputGridProps {
  input: number[][];
  outputPos: { row: number; col: number } | null;
  activeProducts: ProductItem[] | null;
  highlightPadding: boolean;
}

const PaddedInputGrid = ({
  input,
  outputPos,
  activeProducts,
  highlightPadding,
}: PaddedInputGridProps) => {
  // Map: "paddedRow,paddedCol" → ProductItem (only populated during multiply step)
  const productMap = useMemo<Map<string, ProductItem>>(() => {
    if (!activeProducts || !outputPos) return new Map();
    const m = new Map<string, ProductItem>();
    activeProducts.forEach((item) => {
      const pr = outputPos.row + item.ky;
      const pc = outputPos.col + item.kx;
      m.set(`${pr},${pc}`, item);
    });
    return m;
  }, [activeProducts, outputPos]);

  // Kernel top-left in padded-grid coordinates equals outputPos
  const ktl = outputPos;

  return (
    <div className="flex flex-col items-center gap-3 shrink-0">
      <p className="text-xs font-bold text-text/50 uppercase tracking-widest">
        Input <span className="font-normal">(zero-padded)</span>
      </p>

      <div className="relative">
        {/* ── Grid cells ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${PAD_W}, ${PADDED_CELL}px)`,
            gridTemplateRows: `repeat(${PAD_H}, ${PADDED_CELL}px)`,
          }}
          className="rounded-lg overflow-hidden border border-border/30"
        >
          {Array.from({ length: PAD_H }).flatMap((_, pr) =>
            Array.from({ length: PAD_W }).map((_, pc) => {
              const ir = pr - (KH - 1);
              const ic = pc - (KW - 1);
              const isActual = ir >= 0 && ir < H && ic >= 0 && ic < W;
              const val = isActual ? input[ir][ic] : 0;
              const brightness = clamp(val, 0, 255);

              // Is this cell covered by the sliding kernel?
              const inKernel =
                ktl !== null &&
                pr >= ktl.row &&
                pr < ktl.row + KH &&
                pc >= ktl.col &&
                pc < ktl.col + KW;

              // Product item for this cell (only present during multiply step)
              const item = productMap.get(`${pr},${pc}`);
              const hasProduct = item !== undefined;

              return (
                <div
                  key={`${pr}-${pc}`}
                  className={`relative overflow-hidden flex flex-col items-center justify-center border transition-colors duration-150 ${
                    isActual ? 'border-border/20' : 'border-border/10'
                  }`}
                  style={{
                    width: PADDED_CELL,
                    height: PADDED_CELL,
                    // Actual pixels: greyscale bg; padding: use CSS class below
                    backgroundColor: isActual
                      ? `rgb(${brightness},${brightness},${brightness})`
                      : undefined,
                  }}
                >
                  {/* Padding cell base colour */}
                  {!isActual && (
                    <div
                      className={`absolute inset-0 transition-colors duration-300 ${
                        highlightPadding ? 'bg-accent-bg/70' : 'bg-accent-bg/20'
                      }`}
                    />
                  )}

                  {/* Kernel-region tint overlay (on top of greyscale / padding bg) */}
                  {inKernel && !highlightPadding && (
                    <div className="absolute inset-0 bg-accent/25 pointer-events-none" />
                  )}

                  {/* ── Cell content (above overlays) ── */}
                  <div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-0.5 px-0.5">
                    {/* Pixel / padding value */}
                    <span
                      className={`text-[11px] font-mono font-bold leading-none ${
                        !isActual
                          ? highlightPadding
                            ? 'text-accent/80'
                            : 'text-text/25'
                          : ''
                      }`}
                      style={isActual ? { color: contrastText(brightness) } : undefined}
                    >
                      {val}
                    </span>

                    {/* Multiplication equation badge (multiply step only) */}
                    <AnimatePresence>
                      {hasProduct && item && (
                        <motion.span
                          key="eq"
                          initial={{ opacity: 0, scale: 0.75 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.75 }}
                          className="text-[8px] font-mono font-bold rounded-sm px-0.5 leading-tight whitespace-nowrap"
                          style={badgeStyle(brightness)}
                        >
                          {item.kernelVal}×{item.inputVal}={item.product}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Animated kernel-overlay border box ── */}
        <AnimatePresence>
          {ktl && (
            <motion.div
              key="kernel-box"
              className="absolute border-[3px] border-accent rounded pointer-events-none"
              style={{
                width: KW * PADDED_CELL,
                height: KH * PADDED_CELL,
              }}
              initial={{ opacity: 0, top: 0, left: 0 }}
              animate={{
                opacity: 1,
                top: ktl.row * PADDED_CELL,
                left: ktl.col * PADDED_CELL,
              }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────

interface KernelDisplayProps {
  kernel: number[][];
  activeProducts: ProductItem[] | null;
  currentSum: number | null;
}

const KernelDisplay = ({ kernel, activeProducts, currentSum }: KernelDisplayProps) => {
  const productMap = useMemo<Map<string, ProductItem>>(() => {
    const m = new Map<string, ProductItem>();
    activeProducts?.forEach((p) => m.set(`${p.ky},${p.kx}`, p));
    return m;
  }, [activeProducts]);

  const rows = kernel.length;
  const cols = kernel[0]?.length ?? 0;

  return (
    <div className="flex flex-col items-center gap-3 shrink-0">
      <p className="text-xs font-bold text-text/50 uppercase tracking-widest">Kernel</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${KERNEL_CELL}px)`,
          gridTemplateRows: `repeat(${rows}, ${KERNEL_CELL}px)`,
        }}
        className="rounded-lg overflow-hidden border border-border/40"
      >
        {kernel.map((row, ky) =>
          row.map((val, kx) => {
            const item = productMap.get(`${ky},${kx}`);
            const hasProduct = item !== undefined;

            return (
              <motion.div
                key={`${ky}-${kx}`}
                layout
                className={`flex flex-col items-center justify-center border border-border/30 transition-colors duration-150 ${
                  hasProduct ? 'bg-accent/15' : 'bg-accent-bg/60'
                }`}
                style={{ width: KERNEL_CELL, height: KERNEL_CELL }}
              >
                {/* Kernel weight */}
                <span className="text-base font-bold text-accent leading-tight">{val}</span>

                {/* ×inputVal = product — shown during multiply/sum step */}
                <AnimatePresence>
                  {hasProduct && item && (
                    <motion.div
                      key="product"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex flex-col items-center leading-none"
                    >
                      <span className="text-[9px] font-mono text-text/55">×{item.inputVal}</span>
                      <span className="text-[11px] font-bold font-mono text-text-h">
                        ={item.product}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Sum chip */}
      <AnimatePresence>
        {currentSum !== null && (
          <motion.div
            key="sum"
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="px-4 py-2 rounded-xl bg-accent/20 border border-accent/40 text-text-h font-bold text-sm font-mono"
          >
            Σ = {currentSum}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────

interface OutputGridProps {
  output: (number | null)[][];
  outputPos: { row: number; col: number } | null;
  maxVal: number;
}

const OutputGrid = ({ output, outputPos, maxVal }: OutputGridProps) => {
  const rows = output.length;
  const cols = output[0]?.length ?? 0;

  return (
    <div className="flex flex-col items-center gap-3 shrink-0">
      <p className="text-xs font-bold text-text/50 uppercase tracking-widest">Output</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${OUTPUT_CELL}px)`,
          gridTemplateRows: `repeat(${rows}, ${OUTPUT_CELL}px)`,
        }}
        className="rounded-lg overflow-hidden border border-border/30"
      >
        {output.map((row, oy) =>
          row.map((val, ox) => {
            const isActive =
              outputPos !== null && outputPos.row === oy && outputPos.col === ox;
            const isFilled = val !== null;
            const brightness = isFilled
              ? Math.round(clamp(val / maxVal, 0, 1) * 255)
              : 0;

            return (
              <motion.div
                key={`${oy}-${ox}`}
                className={`flex items-center justify-center border border-border/20 transition-all duration-150 ${
                  isActive ? 'ring-2 ring-inset ring-accent' : ''
                }`}
                style={{
                  width: OUTPUT_CELL,
                  height: OUTPUT_CELL,
                  backgroundColor: isFilled
                    ? `rgb(${brightness},${brightness},${brightness})`
                    : undefined,
                }}
                animate={isFilled ? { opacity: 1 } : { opacity: 0.3 }}
              >
                {isFilled ? (
                  <span
                    className="text-[8px] font-mono font-bold leading-none"
                    style={{ color: contrastText(brightness) }}
                  >
                    {val}
                  </span>
                ) : (
                  <span className="text-[10px] text-text/15">·</span>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ── Main visualizer ───────────────────────────────────────────────────────

export const Convolution2DVisualizer = () => {
  const steps = useMemo(
    () => run2DConvolution(DEFAULT_INPUT, DEFAULT_KERNEL),
    []
  );

  // Pre-compute the max output value for normalised greyscale mapping
  const maxOutputVal = useMemo(() => {
    const lastOutput = steps[steps.length - 1].data.output;
    const vals = lastOutput.flat().filter((v): v is number => v !== null);
    return Math.max(1, ...vals);
  }, [steps]);

  return (
    <VisualizerShell<Convolution2DState>
      title="2D Linear Convolution"
      steps={steps}
      pseudocode={PSEUDOCODE}
      renderStage={(data) => (
        <div className="flex flex-row items-center justify-center gap-6 p-6 overflow-x-auto w-full h-full">
          {/* Padded Input */}
          <PaddedInputGrid
            input={data.input}
            outputPos={data.outputPos}
            activeProducts={data.activeProducts}
            highlightPadding={data.highlightPadding}
          />

          {/* × operator */}
          <div className="shrink-0 self-center">
            <span className="text-2xl font-bold text-text/30">✕</span>
          </div>

          {/* Kernel + Σ chip */}
          <KernelDisplay
            kernel={data.kernel}
            activeProducts={data.activeProducts}
            currentSum={data.currentSum}
          />

          {/* = operator */}
          <div className="shrink-0 self-center">
            <span className="text-2xl font-bold text-text/30">=</span>
          </div>

          {/* Output */}
          <OutputGrid
            output={data.output}
            outputPos={data.outputPos}
            maxVal={maxOutputVal}
          />
        </div>
      )}
    />
  );
};
