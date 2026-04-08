---
trigger: always_on
---

# Technical Rules & Standards

## Tech Stack

- Framework: Next.js (App Router), TypeScript
- Styling: Tailwind CSS
- Animation: Motion for React (previously Framer Motion) for state transitions and algorithm steps
- State Management: Zustand (for algorithm snapshots and playback control)
- Testing: Vitest for unit tests; Playwright for integration tests

## Code Quality & Style

- TypeScript: Strict mode enabled. Avoid 'any'. Use Interfaces/Types for algorithm states.
- Linting/Formatting: Always adhere to ESLint and Prettier configurations.
- Naming: Use descriptive camelCase for variables/functions and PascalCase for components.
- Modularity: - Keep components small (<100 lines where possible).
  - Extract algorithm logic into pure TypeScript utility functions or custom hooks (`/hooks`, `/utils`).
  - Separate "Visual" components from "Logic" controllers.
  - Avoid editing files shared across different visualisations when implementing one of the visualisations.

## Project Structure

All code must be organized into this modular hierarchy:

- `src/types/`: Shared TypeScript interfaces and type definitions.
- `src/algorithms/`: Pure TypeScript logic. Functions here MUST return `AlgorithmResult<T>`.
- `src/hooks/`: Reusable logic, specifically `useAlgorithm.ts` for playback state.
- `src/components/shared/`: Layout shells, playback controllers, and pseudocode displays.
- `src/components/visualizers/`: Algorithm-specific UI components (e.g., `ConvolutionViz.tsx`).

## Core Interface Contract
All visualizers must adhere to the snapshot pattern defined in `src/types/algorithm.ts`:

```typescript
export interface AlgorithmStep<T> {
  data: T;                   
  highlightedLines: number[]; // Supports multi-line highlights
  description: string;       // User-facing explanation
  metadata?: Record<string, string | number | boolean | null>;
}

export type AlgorithmResult<T> = AlgorithmStep<T>[];
```
