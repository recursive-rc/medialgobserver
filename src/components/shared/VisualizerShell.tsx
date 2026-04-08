import { useState, type ReactNode, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronRightSquare,
  ChevronLeftSquare,
  Code2,
  Variable, 
  Info,
  Settings2,
  Home
} from 'lucide-react';
import { Link } from 'react-router';
import { useAlgorithm } from '../../hooks/useAlgorithm';
import { PseudocodeDisplay } from './PseudocodeDisplay';
import { WatchWindow } from './WatchWindow';
import { ThemeToggle } from './ThemeToggle';
import type { AlgorithmStep } from '../../types/algorithm';

interface VisualizerShellProps<T> {
  title: string;
  steps: AlgorithmStep<T>[];
  pseudocode: string[];
  renderStage: (data: T, stepIndex: number) => ReactNode;
  onEditInput?: () => void;
}

export function VisualizerShell<T>({ 
  title, 
  steps, 
  pseudocode, 
  renderStage,
  onEditInput
}: VisualizerShellProps<T>) {
  const {
    currentStepIndex,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    nextStep,
    prevStep,
    goToStep,
  } = useAlgorithm(steps);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(450);
  const isResizing = useRef(false);

  // We define these handlers first to avoid hoisting issues, but since they 
  // need to refer to each other or state, we use the callback pattern carefully.
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    
    // Calculate new width: viewport width - mouse X position
    // User requested NO min/max constraints
    const newWidth = window.innerWidth - e.clientX;
    setSidebarWidth(newWidth);
  }, []);

  const stopResizingRef = useRef<() => void>(() => {});

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizingRef.current);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, [handleMouseMove]);

  useEffect(() => {
    stopResizingRef.current = stopResizing;
  }, [stopResizing]);

  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [handleMouseMove, stopResizing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResizing);
    };
  }, [handleMouseMove, stopResizing]);

  // Calculate progress percentage for the custom slider track
  const progressPercent = (currentStepIndex / (totalSteps - 1)) * 100;

  return (
    <div className="flex flex-col h-full w-full bg-bg transition-colors duration-300 overflow-hidden">
      {/* Top Header/Bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-bg/50 backdrop-blur-md z-10 w-full">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-2 rounded-lg hover:bg-accent/10 text-text transition-colors flex items-center justify-center border border-transparent hover:border-accent-border"
            title="Back to Home"
          >
            <Home size={20} />
          </Link>
          <div className="w-px h-6 bg-border mx-1" />
          <h1 className="text-xl font-bold text-text-h tracking-tight">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          {onEditInput && (
            <button
              onClick={onEditInput}
              className="p-2 rounded-lg hover:bg-accent/10 text-text transition-colors flex items-center gap-2 group border border-transparent hover:border-accent-border"
              title="Edit Algorithm Input"
            >
              <Settings2 size={20} className="group-hover:text-accent" />
              <span className="text-sm font-medium hidden md:inline group-hover:text-accent">Edit Input</span>
            </button>
          )}
          <div className="w-px h-6 bg-border mx-1" />
          <ThemeToggle />
          <div className="w-px h-6 bg-border mx-1" />
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-accent/10 text-text transition-colors flex items-center gap-2 group"
          >
            {isSidebarOpen ? <ChevronRightSquare size={20} className="group-hover:text-accent" /> : <ChevronLeftSquare size={20} className="group-hover:text-accent" />}
            <span className="text-sm font-medium hidden sm:inline">{isSidebarOpen ? 'Hide Panel' : 'Show Panel'}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden w-full">
        {/* Main Stage & Footer Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-code-bg/30">
          {/* Stage Area */}
          <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
            <motion.div
              key={currentStepIndex}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full h-full flex items-center justify-center"
            >
              {renderStage(currentStep.data, currentStepIndex)}
            </motion.div>
          </div>

          {/* Controls & Info Panel (Integrated Footer) */}
          <div className="border-t border-border bg-bg/80 backdrop-blur-md p-6 w-full">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Info Area */}
              <div className="flex gap-4 items-start p-4 rounded-xl bg-accent-bg border border-accent-border shadow-sm">
                <Info size={24} className="text-accent mt-1 shrink-0" />
                <div className="text-left w-full">
                  <h3 className="text-xs font-bold text-accent uppercase tracking-widest mb-1">Status</h3>
                  <p className="text-text-h leading-relaxed font-medium">
                    {currentStep.explanation}
                  </p>
                </div>
              </div>

              {/* Control Bar */}
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center gap-2 bg-text-h/5 p-1 rounded-2xl border border-border">
                  <button
                    onClick={prevStep}
                    disabled={isFirstStep}
                    className="p-3 rounded-xl hover:bg-bg disabled:opacity-20 disabled:cursor-not-allowed text-text-h transition-all active:scale-95"
                    aria-label="Previous Step"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  
                  <div className="px-3 min-w-[120px] text-center">
                    <span className="text-sm font-bold text-text-h tabular-nums">
                      Step {currentStepIndex + 1} <span className="text-text/40 font-normal">/ {totalSteps}</span>
                    </span>
                  </div>

                  <button
                    onClick={nextStep}
                    disabled={isLastStep}
                    className="p-3 rounded-xl hover:bg-bg disabled:opacity-20 disabled:cursor-not-allowed text-text-h transition-all active:scale-95"
                    aria-label="Next Step"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>

                <div className="flex-1 flex items-center gap-4 w-full group">
                  <span className="text-xs font-mono text-text/60 w-8">1</span>
                  <div className="relative flex-1 flex items-center">
                    <input
                      type="range"
                      min="0"
                      max={totalSteps - 1}
                      aria-label="Seek algorithm step"
                      title="Seek algorithm step"
                      value={currentStepIndex}
                      onChange={(e) => goToStep(parseInt(e.target.value))}
                      className="progress-slider flex-1 w-full h-6 appearance-none bg-transparent cursor-pointer z-10"
                      style={{ '--range-progress': `${progressPercent}%` } as React.CSSProperties}
                    />
                  </div>
                  <span className="text-xs font-mono text-text/60 w-8">{totalSteps}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Resize Handle */}
              <div
                onMouseDown={startResizing}
                className="w-1 hover:w-1.5 bg-border hover:bg-accent cursor-col-resize transition-all z-30 shrink-0"
                title="Drag to resize"
              />
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: sidebarWidth, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="border-l border-border bg-bg flex flex-col shadow-2xl relative z-20 overflow-hidden shrink-0"
              >
                {/* Stacked Layout Header */}
                <div className="px-6 py-4 border-b border-border bg-text-h/5 flex items-center gap-2">
                  <Code2 size={18} className="text-accent" />
                  <h2 className="text-sm font-bold text-text-h uppercase tracking-wider mb-0">Algorithm Details</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-0 flex flex-col divide-y divide-border custom-scrollbar">
                  {/* Pseudocode Section (Prioritized) */}
                  <section className="flex-2 flex flex-col min-h-0 bg-code-bg/10">
                    <div className="px-6 py-3 flex items-center gap-2 text-text opacity-70 sticky top-0 bg-bg/80 backdrop-blur-sm z-10 border-b border-border/10">
                      <Code2 size={16} />
                      <span className="text-xs font-bold uppercase tracking-tight">Pseudocode</span>
                    </div>
                    <div className="p-4 flex-1">
                      <PseudocodeDisplay 
                        code={pseudocode} 
                        highlightedLines={currentStep.highlightedLines} 
                      />
                    </div>
                  </section>

                  {/* Variables Section */}
                  <section className="flex-1 flex flex-col min-h-0">
                    <div className="px-6 py-3 flex items-center gap-2 text-text opacity-70 sticky top-0 bg-bg/80 backdrop-blur-sm z-10 border-b border-border/10">
                      <Variable size={16} />
                      <span className="text-xs font-bold uppercase tracking-tight">Watch Variables</span>
                    </div>
                    <div className="p-4 flex-1">
                      <WatchWindow metadata={currentStep.metadata} />
                    </div>
                  </section>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
