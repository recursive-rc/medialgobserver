import { VisualizerShell } from '../shared/VisualizerShell';
import type { AlgorithmResult } from '../../types/algorithm';

interface DemoData {
  count: number;
}

const DEMO_STEPS: AlgorithmResult<DemoData> = [
  {
    data: { count: 0 },
    explanation: "Starting the demo visualization. Initialize counter to 0.",
    highlightedLines: [1],
    metadata: { counter: 0, status: 'Initializing' }
  },
  {
    data: { count: 1 },
    explanation: "Incrementing counter. First step complete.",
    highlightedLines: [2],
    metadata: { counter: 1, status: 'Running', flag: true }
  },
  {
    data: { count: 10 },
    explanation: "Big jump to 10. Showing how slider works.",
    highlightedLines: [3],
    metadata: { counter: 10, status: 'Running', flag: false }
  },
  {
    data: { count: 20 },
    explanation: "Algorithm finished.",
    highlightedLines: [4],
    metadata: { counter: 20, status: 'Finished' }
  }
];

const DEMO_PSEUDOCODE = [
  "int x = 0;",
  "x = x + 1;",
  "x = x + 9;",
  "return x;"
];

export const DemoVisualizer = () => {
  return (
    <VisualizerShell
      title="Demo Visualizer"
      steps={DEMO_STEPS}
      pseudocode={DEMO_PSEUDOCODE}
      onEditInput={() => alert("Edit Input clicked! Use this callback to open your settings form.")}
      renderStage={(data) => (
        <div className="flex flex-col items-center gap-8">
          <div className="text-8xl font-black text-accent drop-shadow-2xl">
            {data.count}
          </div>
          <div className="w-64 h-4 bg-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent transition-all duration-500" 
              style={{ width: `${(data.count / 20) * 100}%` }}
            />
          </div>
        </div>
      )}
    />
  );
};
