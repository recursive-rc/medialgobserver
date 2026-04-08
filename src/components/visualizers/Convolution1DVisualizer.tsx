import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VisualizerShell } from '../shared/VisualizerShell';
import { run1DConvolution, type Convolution1DState } from '../../algorithms/convolution1D';

const PSEUDOCODE = [
  "Flip h around",
  "Align h[end] with x[start]",
  "Repeat until no overlap:",
  "    Multiply overlapping pairs",
  "    Sum products",
  "    Store sum to output",
  "    Shift h right by 1"
];

const StemPlot = ({ 
  data, 
  flipped = false, 
  label,
  colorClass = "bg-accent",
  textClass = "text-accent",
  activeIndex = null,
  overlapSpan = null,
  shiftOffset = 0, // in slot units
  minGridIndex = 0,
  maxGridIndex = 0
}: {
  data: (number | null)[];
  flipped?: boolean;
  label: string;
  colorClass?: string;
  textClass?: string;
  activeIndex?: number | null;
  overlapSpan?: [number, number] | null;
  shiftOffset?: number;
  minGridIndex: number;
  maxGridIndex: number;
}) => {
  const slots = maxGridIndex - minGridIndex + 1;
  const grid = Array.from({ length: slots }).map((_, i) => minGridIndex + i);

  const maxVal = Math.max(1, ...data.map(v => Math.abs(v ?? 0)));
  const HEIGHT_SCALE = 60 / maxVal; 

  const getValueAtGrid = (g: number): { val: number | null, origIndex: number } => {
    if (!flipped) {
      const origIndex = g - shiftOffset;
      if (origIndex >= 0 && origIndex < data.length) {
        return { val: data[origIndex], origIndex };
      }
    } else {
      const origIndex = shiftOffset - g;
      if (origIndex >= 0 && origIndex < data.length) {
        return { val: data[origIndex], origIndex };
      }
    }
    return { val: null, origIndex: -1 };
  };

  return (
    <div className="flex border-b border-border/50 pb-2 relative mb-6">
      <div className="absolute right-full mr-4 bottom-2 font-bold opacity-50 w-16 whitespace-nowrap text-right">{label}</div>
      {grid.map(g => {
        const { val, origIndex } = getValueAtGrid(g);
        const isActive = activeIndex === g;
        // User requested distinguishing overlaps visually
        const isOverlap = overlapSpan !== null && g >= overlapSpan[0] && g <= overlapSpan[1] && val !== null;
        
        // Highlight logic
        const stemColor = isOverlap ? 'bg-pink-500' : colorClass;
        const stemText = isOverlap ? 'text-pink-500' : textClass;

        return (
          <div key={g} className="relative w-12 flex flex-col items-center justify-end h-[100px]">
             {val !== null ? (
               <motion.div 
                 layoutId={`${label}-stem-${origIndex}`}
                 className="flex flex-col items-center gap-1 group w-full"
                 // No opacity fading here; keep stems full visible
                 animate={{ opacity: 1 }}
               >
                 <motion.span 
                   className={`text-xs font-mono mb-1 ${isActive ? 'font-bold scale-125 ' + stemText : stemText}`}
                   animate={{ y: isActive ? -5 : 0 }}
                 >
                   {val}
                 </motion.span>
                 <motion.div 
                   className={`w-3 h-3 rounded-full ${stemColor}`}
                   initial={false}
                   animate={{ scale: isActive ? 1.5 : 1 }}
                 />
                 <motion.div 
                   className={`w-[2px] rounded-t-full transition-colors ${stemColor}`} 
                   animate={{ height: Math.abs(val * HEIGHT_SCALE) }}
                 />
               </motion.div>
             ) : (
               <div className="w-full h-full flex flex-col items-center justify-end opacity-10">
                 <div className="w-1 h-1 rounded-full bg-text-h mb-1" />
               </div>
             )}
             <div className="absolute -bottom-6 text-[10px] text-text/30">{g}</div>
          </div>
        );
      })}
    </div>
  );
};

export const Convolution1DVisualizer = () => {
  const [signalStr, setSignalStr] = useState("3, 0, 5, 2, 8, 1");
  const [kernelStr, setKernelStr] = useState("4, 3, 2, 1");
  const [showEdit, setShowEdit] = useState(false);

  const signal = useMemo(() => signalStr.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n)), [signalStr]);
  const kernel = useMemo(() => kernelStr.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n)), [kernelStr]);

  const steps = useMemo(() => {
    if (signal.length === 0 || kernel.length === 0) return run1DConvolution([0], [0]);
    return run1DConvolution(signal, kernel);
  }, [signal, kernel]);

  const minGridIndex = -(kernel.length - 1);
  const maxGridIndex = signal.length + kernel.length - 2;

  const handleSave = (e: React.SubmitEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const sfElement = form.elements.namedItem('signal') as HTMLInputElement;
    const kfElement = form.elements.namedItem('kernel') as HTMLInputElement;
    setSignalStr(sfElement.value);
    setKernelStr(kfElement.value);
    setShowEdit(false);
  };

  const getOverlappingProducts = (data: Convolution1DState) => {
    if (!data.showProducts || !data.overlapSpan || data.n === null) return [];
    
    const products = [];
    const [start, end] = data.overlapSpan;
    
    for (let k = start; k <= end; k++) {
      const idxKernel = data.n - k;
      if (k >= 0 && k < data.signal.length && idxKernel >= 0 && idxKernel < data.kernel.length) {
        products.push({
          k,
          val: data.signal[k] * data.kernel[idxKernel] // Removed the 'x'
        });
      }
    }
    return products;
  };

  return (
    <>
      <VisualizerShell<Convolution1DState>
        title="1D Linear Convolution"
        steps={steps}
        pseudocode={PSEUDOCODE}
        onEditInput={() => setShowEdit(true)}
        renderStage={(data) => (
          <div className="flex flex-col items-start gap-8 bg-bg p-8 rounded-xl shadow-inner border border-text/5 w-full overflow-x-auto min-h-[500px]">
            <div className="pb-8 pl-20 pr-8 pt-4">
              <StemPlot 
                data={data.signal}
                label="x"
                colorClass="bg-blue-500"
                textClass="text-blue-500"
                activeIndex={null} 
                overlapSpan={data.overlapSpan}
                shiftOffset={0}
                minGridIndex={minGridIndex}
                maxGridIndex={maxGridIndex}
              />
              
              <StemPlot 
                data={data.kernel}
                label="h"
                flipped={true}
                colorClass="bg-emerald-500"
                textClass="text-emerald-500"
                activeIndex={null} 
                overlapSpan={data.overlapSpan}
                shiftOffset={data.n ?? 0}
                minGridIndex={minGridIndex}
                maxGridIndex={maxGridIndex}
              />

              <div className="h-px bg-border/50 my-6 flex items-center justify-center relative">
                <AnimatePresence>
                  {getOverlappingProducts(data).map((prod) => (
                    <motion.div 
                      key={prod.k}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      // text-black forces the text to be visible in all modes, as requested.
                      className="absolute bg-accent text-black px-3 py-1 rounded-full text-xs font-bold border border-accent/20 z-10 shadow-lg"
                      style={{ left: `calc(3rem * ${prod.k - minGridIndex + 0.5} + 3rem)`, transform: 'translateX(-50%)' }}
                    >
                      {prod.val}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <StemPlot 
                data={data.output}
                label="output"
                colorClass="bg-purple-500"
                textClass="text-purple-500"
                activeIndex={data.n}
                shiftOffset={0}
                minGridIndex={minGridIndex}
                maxGridIndex={maxGridIndex}
              />
            </div>
          </div>
        )}
      />

      <AnimatePresence>
        {showEdit && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-accent-bg border border-accent-border p-6 rounded-2xl shadow-2xl w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4 text-text-h">Edit Inputs</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-text">Signal x[k] (max 15)</label>
                  <input 
                    name="signal"
                    defaultValue={signalStr}
                    type="text" 
                    className="w-full bg-bg border border-border rounded-lg p-2 font-mono text-sm text-text-h"
                    pattern="^([0-9-]+\s*,\s*){0,14}[0-9-]+$"
                    title="Comma separated numbers, max 15 items"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-text">Kernel h[k] (max 15)</label>
                  <input 
                    name="kernel"
                    defaultValue={kernelStr}
                    type="text" 
                    className="w-full bg-bg border border-border rounded-lg p-2 font-mono text-sm text-text-h"
                    pattern="^([0-9-]+\s*,\s*){0,14}[0-9-]+$"
                    title="Comma separated numbers, max 15 items"
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowEdit(false)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-bg text-text transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-accent text-white hover:opacity-90 transition-opacity"
                  >
                    Save & Restart
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
