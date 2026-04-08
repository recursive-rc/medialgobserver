---
description: Development workflow
---

## "Bite-Sized" Mandate
- Break features into incremental Git commits.
- Stop and ask for review after completing a logic file or a UI component.

## Standard Implementation Pipeline
When tasked with adding a new algorithm (e.g., LZW), follow these steps in order:

### Step 1: Define the Data Shape

Create or update types in `src/types/`. Define what `T` looks like for this specific algorithm (e.g., `interface LZWData`).

### Step 2: Write Pure Logic

Create a file in `src/algorithms/`. Implement the algorithm so that it "records" its progress by pushing an `AlgorithmStep<T>` into an array at every meaningful line of execution.

- Output: `AlgorithmResult<T>`

### Step 3: Unit Testing

Create a `vitest` file to ensure the `AlgorithmResult` array contains the expected number of steps and correct data snapshots.

### Step 4: Build the Visualizer Component

Create a component in `src/components/visualizers/`

- Use the shared `VisualizerShell` (if available)
- Connect the logic to the UI using the `useAlgorithm` hook
- Map the `data` property of the current step to the visual elements (SVG, Canvas, or HTML)

### Step 5: Sync Pseudocode

Ensure the `codeLine` property from the current snapshot correctly triggers the highlight in the pseudocode display component.

## 3. Refactoring Protocol

- If a component exceeds 100 lines, extract sub-components into `src/components/visualizers/parts/`
- Ensure all shared UI (buttons, sliders) are pulled from `src/components/shared/`