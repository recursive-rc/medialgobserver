import { motion } from 'motion/react';

// Visual Components for each algorithm
export const WavesVisual = () => (
  <svg width="120" height="60" viewBox="0 0 120 60" className="text-accent opacity-70 group-hover:opacity-100 transition-opacity">
    <path
      d="M 0 30 Q 15 10 30 30 T 60 30 T 90 30 T 120 30"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="animate-[pulse_3s_ease-in-out_infinite]"
    />
    <circle cx="30" cy="30" r="3" fill="currentColor" />
    <circle cx="60" cy="30" r="3" fill="currentColor" />
    <circle cx="90" cy="30" r="3" fill="currentColor" />
  </svg>
);

export const Convolution1DVisual = () => (
  <div className="flex items-end gap-1 h-12">
    {[4, 8, 12, 6, 10, 5, 9, 3].map((h, i) => (
      <div key={i} className="flex flex-col items-center gap-1">
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: h * 2 }}
          className="w-1 bg-accent rounded-full" 
        />
        <div className="w-2 h-2 rounded-full bg-accent" />
      </div>
    ))}
  </div>
);

// Static opacities for pure rendering of the 2D convolution grid
const CONVOLUTION_GRID_OPACITIES = [
  0.2, 0.5, 0.8, 0.3,
  0.6, 0.9, 0.4, 0.7,
  0.3, 0.7, 0.5, 0.2,
  0.8, 0.4, 0.9, 0.6,
];

export const Convolution2DVisual = () => (
  <div className="grid grid-cols-4 gap-1 p-2 bg-text-h/5 rounded-lg">
    {CONVOLUTION_GRID_OPACITIES.map((opacity, i) => (
      <div 
        key={i} 
        className="w-4 h-4 rounded-sm"
        style={{ backgroundColor: 'var(--accent)', opacity }}
      />
    ))}
  </div>
);

export const HuffmanVisual = () => (
  <svg width="80" height="60" viewBox="0 0 80 60" className="text-accent opacity-70 group-hover:opacity-100 transition-opacity">
    <line x1="40" y1="10" x2="20" y2="30" stroke="currentColor" strokeWidth="2" />
    <line x1="40" y1="10" x2="60" y2="30" stroke="currentColor" strokeWidth="2" />
    <line x1="20" y1="30" x2="10" y2="50" stroke="currentColor" strokeWidth="2" />
    <line x1="20" y1="30" x2="30" y2="50" stroke="currentColor" strokeWidth="2" />
    <circle cx="40" cy="10" r="4" fill="currentColor" />
    <circle cx="20" cy="30" r="4" fill="currentColor" />
    <circle cx="60" cy="30" r="4" fill="currentColor" />
    <circle cx="10" cy="50" r="4" fill="currentColor" />
    <circle cx="30" cy="50" r="4" fill="currentColor" />
  </svg>
);

export const RLEVisual = () => (
  <div className="flex gap-1 font-mono text-xs items-center">
    <div className="flex flex-col items-center">
      <span className="text-accent/50">AAAA</span>
      <span className="text-accent font-bold">4A</span>
    </div>
    <div className="w-2 h-px bg-accent/20" />
    <div className="flex flex-col items-center">
      <span className="text-accent/50">BBB</span>
      <span className="text-accent font-bold">3B</span>
    </div>
  </div>
);

export const LZWVisual = () => (
  <div className="flex gap-2 font-mono text-xs text-accent">
    <div className="p-1 px-2 border border-accent/30 rounded bg-accent/10">A</div>
    <div className="p-1 px-2 border border-accent/30 rounded bg-accent/10">B</div>
    <div className="p-1 px-2 border border-accent/30 rounded bg-accent/10">AB</div>
    <motion.div 
      animate={{ opacity: [0, 1, 0] }}
      transition={{ repeat: Infinity, duration: 2 }}
      className="p-1 px-2 border border-accent border-dashed rounded"
    >
      ABA
    </motion.div>
  </div>
);
