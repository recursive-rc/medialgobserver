import { motion, AnimatePresence } from 'motion/react';

interface WatchWindowProps {
  metadata?: Record<string, string | number | boolean | null>;
}

export const WatchWindow = ({ metadata }: WatchWindowProps) => {
  if (!metadata || Object.keys(metadata).length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text/40 text-sm italic">
        No variables to watch in this step.
      </div>
    );
  }

  return (
    <div className="bg-code-bg rounded-lg border border-border overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-text-h/5 text-text-h font-semibold border-b border-border">
          <tr>
            <th className="px-4 py-2">Variable</th>
            <th className="px-4 py-2">Value</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout">
            {Object.entries(metadata).map(([key, value]) => (
              <motion.tr
                key={key}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="border-b border-border/50 hover:bg-accent/5 transition-colors"
              >
                <td className="px-4 py-2 font-mono text-accent">{key}</td>
                <td className="px-4 py-2 font-mono">
                  {typeof value === 'boolean' ? (
                    <span className={value ? 'text-green-500' : 'text-red-500'}>
                      {value.toString()}
                    </span>
                  ) : (
                    value
                  )}
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};
