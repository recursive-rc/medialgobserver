/**
 * Generic interface for a single "frame" or "step" of an algorithm.
 * T represents the shape of the data being visualized (e.g., a 2D grid, a tree, or a string).
 */
export interface AlgorithmStep<T> {
  /**
   * The state of the data at this specific step
   */
  data: T;

  /**
   * The line numbers in the pseudocode to highlight (1-indexed)
   */
  highlightedLines: number[];

  /**
   * A human-readable explanation of what is happening in this step
   */
  explanation: string;

  /**
   * Optional: Key-value pairs for a "Watch" window (e.g., { i: 0, current_char: 'A' })
   */
  metadata?: Record<string, string | number | boolean | null>;
}

/**
 * The output of any algorithm function in this project.
 */
export type AlgorithmResult<T> = AlgorithmStep<T>[];
