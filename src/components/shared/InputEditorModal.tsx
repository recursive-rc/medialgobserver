import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Beaker } from 'lucide-react';
import type { InputEditorConfig } from '../../types/inputEditor';

interface InputEditorModalProps {
  config: InputEditorConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const InputEditorModal = ({ config, isOpen, onClose }: InputEditorModalProps) => {
  // State is initialized from props; parent uses a key to force remount on open
  const [values, setValues] = useState<Record<string, string>>({ ...config.currentValues });
  const [error, setError] = useState<string | null>(null);


  const handleFieldChange = (name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSampleClick = (sampleValues: Record<string, string>) => {
    setValues({ ...sampleValues });
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (config.validate) {
      const validationError = config.validate(values);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    config.onSubmit(values);
    onClose();
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-bg border border-border p-6 rounded-2xl shadow-2xl w-full max-w-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-h">
                {config.title ?? 'Edit Input'}
              </h2>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-accent/10 text-text transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Preset Samples */}
            {config.samples && config.samples.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Beaker size={14} className="text-accent" />
                  <span className="text-xs font-bold text-text uppercase tracking-wider">
                    Preset Samples
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {config.samples.map((sample) => {
                    const isActive = config.fields.every(
                      f => values[f.name] === sample.values[f.name]
                    );
                    return (
                      <button
                        key={sample.label}
                        type="button"
                        onClick={() => handleSampleClick(sample.values)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${
                          isActive
                            ? 'bg-accent text-white border-accent shadow-sm'
                            : 'bg-accent-bg text-text border-border hover:border-accent-border'
                        }`}
                      >
                        {sample.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {config.fields.map((field) => (
                <div key={field.name}>
                  <label
                    htmlFor={`input-editor-${field.name}`}
                    className="block text-sm font-semibold mb-1 text-text"
                  >
                    {field.label}
                  </label>
                  <input
                    id={`input-editor-${field.name}`}
                    type="text"
                    value={values[field.name] ?? ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full bg-code-bg border border-border rounded-lg p-2.5 font-mono text-sm text-text-h focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
                    required
                  />
                </div>
              ))}

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-sm font-medium bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent/10 text-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-accent text-white hover:opacity-90 transition-opacity"
                >
                  Save &amp; Restart
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
