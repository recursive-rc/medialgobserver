import { motion } from 'motion/react';

interface PseudocodeDisplayProps {
  code: string[];
  highlightedLines: number[];
}

export const PseudocodeDisplay = ({ code, highlightedLines }: PseudocodeDisplayProps) => {
  return (
    <div className="font-mono text-sm bg-code-bg rounded-lg border border-border overflow-hidden">
      {code.map((line, index) => {
        const lineNumber = index + 1;
        const isHighlighted = highlightedLines.includes(lineNumber);

        return (
          <div
            key={index}
            className={`relative flex py-1 px-4 transition-colors duration-200 border-l-4 ${
              isHighlighted ? 'bg-accent/15 border-l-accent' : 'border-l-transparent'
            }`}
          >
            <span className={`w-8 select-none mr-2 transition-all ${
              isHighlighted ? 'text-accent font-bold' : 'text-text/40'
            }`}>
              {lineNumber}
            </span>
            <pre className={`whitespace-pre transition-all ${isHighlighted ? 'text-accent font-bold' : 'text-text'}`}>
              {line}
            </pre>
            {isHighlighted && (
              <motion.div
                layoutId="highlight-glow"
                className="absolute inset-0 bg-accent/5 pointer-events-none"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
