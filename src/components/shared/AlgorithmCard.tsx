import { motion } from 'motion/react';
import { NavLink } from 'react-router';
import type { ReactNode } from 'react';

interface AlgorithmCardProps {
  title: string;
  description: string;
  path: string;
  visual: ReactNode;
}

export const AlgorithmCard = ({ title, description, path, visual }: AlgorithmCardProps) => {
  return (
    <NavLink to={path} className="no-underline">
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group relative h-full p-6 rounded-2xl bg-bg border border-border shadow-md hover:shadow-xl hover:border-accent transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
      >
        {/* Background Gradient Glow */}
        <div className="absolute inset-0 bg-linear-to-br from-accent-bg to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Visual Content Area */}
        <div className="relative w-full h-32 mb-6 flex items-center justify-center bg-code-bg rounded-xl border border-border overflow-hidden">
          {visual}
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h2 className="text-xl font-semibold mb-2 text-text-h group-hover:text-accent transition-colors">
            {title}
          </h2>
          <p className="text-sm text-text leading-relaxed">
            {description}
          </p>
        </div>
      </motion.div>
    </NavLink>
  );
};

