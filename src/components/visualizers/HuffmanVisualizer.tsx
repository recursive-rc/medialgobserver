import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VisualizerShell } from '../shared/VisualizerShell';
import { runHuffman, HUFFMAN_PSEUDOCODE, type HuffmanState, type HuffmanNode } from '../../algorithms/huffman';

export const HuffmanVisualizer = () => {
  const [inputStr, setInputStr] = useState("BCCABBDDAE");
  const [showEdit, setShowEdit] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const steps = useMemo(() => runHuffman(inputStr), [inputStr]);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const inputEl = form.elements.namedItem('input') as HTMLInputElement;
    const val = inputEl.value.toUpperCase();
    
    // Calculate unique chars
    const unique = new Set(val.split('')).size;
    if (unique > 10) {
      setErrorMsg(`Too many unique characters (${unique}). Max is 10 to keep tree readable.`);
      return;
    }
    if (unique < 2) {
      setErrorMsg(`At least 2 unique characters required to build a tree.`);
      return;
    }
    
    setErrorMsg("");
    setInputStr(val);
    setShowEdit(false);
  };

  return (
    <>
      <VisualizerShell<HuffmanState>
        title="Huffman Coding"
        steps={steps}
        pseudocode={HUFFMAN_PSEUDOCODE}
        onEditInput={() => setShowEdit(true)}
        renderStage={(data) => {
          const NODE_SPACING_X = 70;
          const NODE_SPACING_Y = 100;
          const NODE_RADIUS = 24;

          // Compute bounding box to center the SVG
          let maxX = 0;
          let maxY = 0;
          
          Object.values(data.allNodes).forEach(n => {
            if (n.x > maxX) maxX = n.x;
            if (n.y > maxY) maxY = n.y;
          });

          const svgWidth = Math.max(maxX * NODE_SPACING_X + 100, 300); // minimum width
          const svgHeight = maxY * NODE_SPACING_Y + 100;
          
          // Map x, y to SVG x, y
          const getPos = (n: HuffmanNode) => ({
             x: (n.x * NODE_SPACING_X) + 50, // 50px padding left
             y: (n.y * NODE_SPACING_Y) + 50  // 50px padding top
          });


          // Helper to get reachable nodes to only draw what's currently built
          const drawableNodeIds = new Set<string>();
          const edgeLines: { id: string, source: HuffmanNode, target: HuffmanNode, label?: string, isHighlighted: boolean, isPath: boolean }[] = [];

          const traverse = (nodeId: string) => {
            if (drawableNodeIds.has(nodeId)) return;
            drawableNodeIds.add(nodeId);
            const n = data.allNodes[nodeId];
            if (n.leftId) {
              const edgeId = `${n.id}-${n.leftId}`;
              edgeLines.push({
                id: edgeId,
                source: n,
                target: data.allNodes[n.leftId],
                label: data.allNodes[n.leftId].edgeLabel,
                isHighlighted: data.highlightedEdgeIds.includes(edgeId),
                isPath: data.highlightedEdgeIds.includes(edgeId)
              });
              traverse(n.leftId);
            }
            if (n.rightId) {
              const edgeId = `${n.id}-${n.rightId}`;
              edgeLines.push({
                id: edgeId,
                source: n,
                target: data.allNodes[n.rightId],
                label: data.allNodes[n.rightId].edgeLabel,
                isHighlighted: data.highlightedEdgeIds.includes(edgeId),
                isPath: data.highlightedEdgeIds.includes(edgeId)
              });
              traverse(n.rightId);
            }
          };

          data.activeQueueIds.forEach(traverse);

          return (
            <div className="flex flex-col h-full w-full gap-4">
               {/* Original String & Frequency Table */}
               <div className="flex flex-col md:flex-row gap-4 shrink-0">
                 <div className="flex-1 bg-bg border border-border p-4 rounded-xl flex flex-col justify-center items-center">
                    <div className="text-sm font-semibold mb-2">Original String</div>
                    <div className="font-mono text-xl md:text-2xl font-bold text-accent tracking-widest bg-accent-bg px-4 py-2 rounded-lg">{data.input}</div>
                 </div>
                 <div className="bg-bg border border-border p-4 rounded-xl overflow-x-auto flex flex-col justify-center max-w-full">
                    <div className="text-sm font-semibold mb-2 whitespace-nowrap text-center">Frequencies</div>
                    <div className="flex gap-2 pb-1 justify-center">
                      {Object.entries(data.freqs || {}).map(([char, freq]) => (
                        <div key={char} className="flex flex-col items-center bg-accent-bg border border-accent/20 rounded px-3 py-1">
                          <span className="font-mono font-bold text-text-h">{char}</span>
                          <span className="font-mono text-sm text-accent font-bold">{freq}</span>
                        </div>
                      ))}
                    </div>
                 </div>
               </div>

               {/* Fixed Tree Container (Panning could be added, but simple overflow is usually enough) */}
               <div className="flex-1 overflow-auto bg-bg rounded-xl border border-border relative flex justify-center pt-8">
                  <svg width={svgWidth} height={svgHeight}>
                    {/* Edges */}
                    <AnimatePresence>
                      {edgeLines.map(edge => {
                         const posS = getPos(edge.source);
                         const posT = getPos(edge.target);
                         
                         const midX = (posS.x + posT.x) / 2;
                         const midY = (posS.y + posT.y) / 2;

                         return (
                           <motion.g key={edge.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                             <motion.line
                               x1={posS.x} y1={posS.y}
                               x2={posT.x} y2={posT.y}
                               stroke={edge.isPath ? "#ec4899" : "var(--border)"}
                               strokeWidth={edge.isPath ? 4 : 2}
                             />
                             {edge.label && (
                               <motion.text
                                 x={midX} y={midY - 5}
                                 textAnchor="middle"
                                 className="text-xs font-bold fill-current text-text-h"
                                 initial={{ opacity: 0, scale: 0 }}
                                 animate={{ opacity: 1, scale: 1 }}
                               >
                                 {edge.label}
                               </motion.text>
                             )}
                           </motion.g>
                         );
                      })}
                    </AnimatePresence>

                    {/* Nodes */}
                    <AnimatePresence>
                      {Array.from(drawableNodeIds).map(id => {
                        const n = data.allNodes[id];
                        const pos = getPos(n);
                        const isHighlighted = data.highlightedNodeIds.includes(id);
                        
                        return (
                          <motion.g 
                            key={id} 
                            initial={{ opacity: 0, scale: 0, x: pos.x, y: pos.y }} 
                            animate={{ opacity: 1, scale: 1, x: pos.x, y: pos.y }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                            className="text-text-h"
                          >
                             <motion.circle
                               r={NODE_RADIUS}
                               className={isHighlighted ? "fill-accent stroke-bg" : "fill-bg stroke-accent/50"}
                               strokeWidth={3}
                               animate={{
                                 fill: isHighlighted ? 'var(--accent)' : 'var(--bg)',
                                 stroke: isHighlighted ? 'var(--bg)' : 'var(--accent)',
                               }}
                             />
                             <text 
                               textAnchor="middle" 
                               alignmentBaseline="middle"
                               dy=".1em"
                               className={`text-sm font-bold ${isHighlighted ? "fill-white" : "fill-current"}`}
                             >
                               {n.label}
                             </text>
                             {/* Frequency Label underneath/beside */}
                             <text
                               textAnchor="middle"
                               y={NODE_RADIUS + 16}
                               className="text-xs font-mono opacity-80 fill-current"
                             >
                               {n.freq}
                             </text>
                          </motion.g>
                        );
                      })}
                    </AnimatePresence>
                  </svg>
               </div>
            </div>
          );
        }}
      />

      <AnimatePresence>
        {showEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-accent-bg border border-accent-border p-6 rounded-2xl shadow-2xl w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4 text-text-h">Edit Input String</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-text">String (Uppercase ASCII)</label>
                  <input
                    name="input"
                    defaultValue={inputStr}
                    type="text"
                    className="w-full bg-bg border border-border rounded-lg p-2 font-mono text-sm text-text-h"
                    pattern="^[A-Z]+$"
                    title="Only uppercase letters allowed"
                    required
                  />
                  {errorMsg && <p className="text-red-500 text-xs mt-1">{errorMsg}</p>}
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowEdit(false); setErrorMsg(""); }}
                    className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-bg text-text transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-accent text-white"
                  >
                    Save & Restart
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
