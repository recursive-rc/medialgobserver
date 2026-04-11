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
      inputConfig={{
        title: "Edit Example Input",
        fields: [
          { name: "input", label: "Input Value", placeholder: "e.g. 42" }
        ],
        currentValues: { input: inputStr },
        samples: [
          { label: "Simple", values: { input: "42" } },
          { label: "Complex", values: { input: "100" } },
        ],
        validate: (values) => {
          if (isNaN(Number(values.input))) return "Must be a number.";
          return null;
        },
        onSubmit: (values) => setInputStr(values.input),
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

## 3. Input Editing (`inputConfig`)

The `VisualizerShell` provides a built-in input editor modal via the `inputConfig` prop (defined in `src/types/inputEditor.ts`). This replaces the old `onEditInput` callback pattern.

### `InputEditorConfig` fields

| Field | Type | Description |
|---|---|---|
| `title` | `string?` | Modal heading (defaults to "Edit Input"). |
| `fields` | `InputFieldConfig[]` | Text fields rendered in the form (name, label, placeholder). |
| `currentValues` | `Record<string, string>` | Current values to pre-fill the form with. |
| `samples` | `InputSample[]?` | Preset sample buttons the user can click to auto-fill. |
| `validate` | `(values) => string \| null` | Return an error message or `null` if valid. |
| `onSubmit` | `(values) => void` | Called with validated values when the user saves. |
| `disabled` | `boolean?` | Set `true` to completely hide the "Edit Input" button. |

### Key patterns
- **Disable editing**: Set `disabled: true` or omit `inputConfig` entirely.
- **Preset samples**: Provide a `samples` array. Active sample is highlighted automatically.
- **Validation**: Return a string from `validate` to show a styled error message.
- **Multi-field**: Add multiple entries to `fields` (e.g. signal + kernel for convolution).

## 4. Sidebar Features

### Pseudocode Highlighting
The `highlightedLines` array in each `AlgorithmStep` corresponds to the 1-indexed line numbers in your `PSEUDOCODE` array. These will glow and animate as the user steps through.

### Watch Variables
The `metadata` object in each `AlgorithmStep` is automatically rendered in the **Watch Variables** section of the sidebar. 
- Use key-value pairs like `{ i: 5, current_char: 'A', status: 'Checking' }`.
- Booleans are automatically styled (green for true, red for false).

## 5. Layout & Behavior
- **Full Width**: The shell automatically utilizes the full browser width.
- **Stacked Sidebar**: Pseudocode and Variables are stacked vertically on desktop to prioritize information density.
- **Collapsible**: Users can collapse the sidebar to focus on the visualization.
- **Theme**: Light/Dark mode transitions are handled automatically by the shell's header.

## 6. Summary Checklist
- [ ] Logic returns `AlgorithmResult` (array of steps).
- [ ] `renderStage` handles the visualization of `data`.
- [ ] `metadata` provides live variable insights.
- [ ] `highlightedLines` match the pseudocode array.
- [ ] `inputConfig` provides preset samples and validation.
- [ ] UI is verified for legibility in both **Light** and **Dark** modes.