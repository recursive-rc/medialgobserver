import { BrowserRouter, Routes, Route } from 'react-router';
import { ThemeToggle } from './components/shared/ThemeToggle';
import { AlgorithmCard } from './components/shared/AlgorithmCard';
import { 
  WavesVisual, 
  Convolution1DVisual, 
  Convolution2DVisual, 
  HuffmanVisual, 
  RLEVisual,
  LZWVisual 
} from './components/shared/AlgorithmVisuals';
import { motion } from 'motion/react';

const Home = () => {
  const algorithms = [
    {
      title: 'Discretizing Waves',
      description: 'Visualize the process of sampling and quantizing continuous analog waves into digital signals.',
      path: '/waves',
      visual: <WavesVisual />,
    },
    {
      title: '1D Convolution',
      description: 'Explore linear convolution in one dimension, essential for filtering and processing discrete signals.',
      path: '/convolution-1d',
      visual: <Convolution1DVisual />,
    },
    {
      title: '2D Convolution',
      description: 'Understand how 2D kernels are applied to matrices to perform image processing tasks like blurring and edge detection.',
      path: '/convolution-2d',
      visual: <Convolution2DVisual />,
    },
    {
      title: 'Huffman Coding',
      description: 'Learn about lossless data compression using variable-length prefix codes and binary trees.',
      path: '/huffman',
      visual: <HuffmanVisual />,
    },
    {
      title: 'Run Length Encoding',
      description: 'Visualize how consecutive identical symbols are compressed into a count and a single symbol.',
      path: '/rle',
      visual: <RLEVisual />,
    },
    {
      title: 'LZW Coding',
      description: 'Explore the Lempel-Ziv-Welch dictionary-based compression algorithm used in GIF and ZIP formats.',
      path: '/lzw',
      visual: <LZWVisual />,
    },
  ];

  return (
    <div className="min-h-screen bg-bg transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold">
              M
            </div>
            <span className="text-xl font-bold text-text-h tracking-tight">MediAlgObserver</span>
          </motion.div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-extrabold text-text-h mb-6 tracking-tight"
          >
            Master Media Algorithms
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-text max-w-2xl mx-auto leading-relaxed"
          >
            Interactive, step-by-step visualizations of core concepts in signal processing and data compression.
          </motion.p>
        </div>

        {/* Algorithm Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {algorithms.map((algo, index) => (
            <motion.div
              key={algo.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              <AlgorithmCard {...algo} />
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-10 text-center text-sm text-text">
        <p>© 2026 MediAlgObserver • Designed for Media Computing Students</p>
      </footer>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Placeholder routes for future visualizers */}
        <Route path="/waves" element={<div className="p-20 text-text-h">Wave Discretization Visualizer coming soon...</div>} />
        <Route path="/convolution-1d" element={<div className="p-20 text-text-h">1D Convolution Visualizer coming soon...</div>} />
        <Route path="/convolution-2d" element={<div className="p-20 text-text-h">2D Convolution Visualizer coming soon...</div>} />
        <Route path="/huffman" element={<div className="p-20 text-text-h">Huffman Coding Visualizer coming soon...</div>} />
        <Route path="/rle" element={<div className="p-20 text-text-h">Run Length Encoding Visualizer coming soon...</div>} />
        <Route path="/lzw" element={<div className="p-20 text-text-h">LZW Coding Visualizer coming soon...</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
