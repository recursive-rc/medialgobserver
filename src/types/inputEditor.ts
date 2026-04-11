/**
 * Configuration types for the standardised Input Editor Modal.
 *
 * Visualizers provide an `InputEditorConfig` to the `VisualizerShell` to get
 * built-in editing support: preset samples, custom text fields with
 * validation, and the ability to disable editing entirely.
 */

/** A single text field rendered inside the editor modal. */
export interface InputFieldConfig {
  /** Unique key used in the values record (e.g. "signal", "kernel"). */
  name: string;
  /** Human-readable label shown above the field. */
  label: string;
  /** Placeholder text shown when the field is empty. */
  placeholder?: string;
}

/** A preset sample that auto-fills every field in the editor. */
export interface InputSample {
  /** Short label shown on the sample button (e.g. "Simple", "Edge Case"). */
  label: string;
  /** Map from field `name` → pre-filled value. */
  values: Record<string, string>;
}

/**
 * Full configuration object passed to `VisualizerShell` via the
 * `inputConfig` prop. When present the shell renders the "Edit Input"
 * button and manages the modal lifecycle internally.
 */
export interface InputEditorConfig {
  /** Modal heading (defaults to "Edit Input"). */
  title?: string;
  /** One or more text fields the user can fill in. */
  fields: InputFieldConfig[];
  /** The current values for each field (used as default values in the form). */
  currentValues: Record<string, string>;
  /** Optional curated samples the user can pick with one click. */
  samples?: InputSample[];
  /**
   * Validate the current field values.
   * Return `null` if everything is valid, or a string error message to
   * display below the form.
   */
  validate?: (values: Record<string, string>) => string | null;
  /** Called when the user clicks "Save & Restart" with valid values. */
  onSubmit: (values: Record<string, string>) => void;
  /**
   * When `true` the "Edit Input" button is hidden entirely.
   * Useful for visualizers that only support a fixed input.
   */
  disabled?: boolean;
}
