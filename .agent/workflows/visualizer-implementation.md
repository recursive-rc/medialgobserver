---
description: Implement a new algorithm visualizer
---

# Algorithm Visualizer Implementation Guide

This explains how to use the `VisualizerShell` and `useAlgorithm` hook to create interactive, step-by-step visualizations.

## 1. Prepare the Algorithm Logic

All algorithm logic should live in `src/algorithms/`. The function should return an `AlgorithmResult<T>`, which is an array of `AlgorithmStep<T>`.

```typescript
// src/algorithms/example.ts
import { AlgorithmResult } from '../types/algorithm';

export function runExample(input: string): AlgorithmResult<number> {
  const steps: AlgorithmResult<number> = [];
  
  // Step 1: Initialization
  steps.push({
    data: 0,
    explanation: "Initializing...",
    highlightedLines: [1],
    metadata: { state: 'Init' }
  });
  
  return steps;
}
```

## 2. Using the VisualizerShell

The `VisualizerShell` is the standard wrapper for all visualizers. It provides the stage, sidebar (Pseudocode/Variables), and controls.

### Implementation Pattern

Create your component in `src/components/visualizers/`.

```tsx
import { VisualizerShell } from '../shared/VisualizerShell';
import { runExample } from '../../algorithms/example';

const PSEUDOCODE = [
  "int x = 0;",
  "x = x + 1;",
  "return x;"
];

export const ExampleVisualizer = () => {
  // 1. Get your steps
  const steps = runExample("input");

  return (
    <VisualizerShell
      title="Example Algorithm"
      steps={steps}
      pseudocode={PSEUDOCODE}
      onEditInput={() => {
        // 2. Handle input editing (e.g., open a modal)
        console.log("Edit input clicked");
      }}
      renderStage={(data, stepIndex) => (
        // 3. Define how 'data' is rendered on the stage
        <div className="text-6xl font-bold text-accent">
          Value: {data}
        </div>
      )}
    />
  );
};
```

## 3. Sidebar Features

### Pseudocode Highlighting
The `highlightedLines` array in each `AlgorithmStep` corresponds to the 1-indexed line numbers in your `PSEUDOCODE` array. These will glow and animate as the user steps through.

### Watch Variables
The `metadata` object in each `AlgorithmStep` is automatically rendered in the **Watch Variables** section of the sidebar. 
- Use key-value pairs like `{ i: 5, current_char: 'A', status: 'Checking' }`.
- Booleans are automatically styled (green for true, red for false).

## 4. Layout & Behavior
- **Full Width**: The shell automatically utilizes the full browser width.
- **Stacked Sidebar**: Pseudocode and Variables are stacked vertically on desktop to prioritize information density.
- **Collapsible**: Users can collapse the sidebar to focus on the visualization.
- **Theme**: Light/Dark mode transitions are handled automatically by the shell's header.

## 5. Summary Checklist
- [ ] Logic returns `AlgorithmResult` (array of steps).
- [ ] `renderStage` handles the visualization of `data`.
- [ ] `metadata` provides live variable insights.
- [ ] `highlightedLines` match the pseudocode array.
- [ ] UI is verified for legibility in both **Light** and **Dark** modes.