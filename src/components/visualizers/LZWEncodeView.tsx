import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VisualizerShell } from '../shared/VisualizerShell';
import { runLZWEncode, LZW_ENCODE_PSEUDOCODE, type LZWEncodeState } from '../../algorithms/lzw';

export const LZWEncodeView = ({ onToggleTab }: { onToggleTab: (tab: 'encode' | 'decode') => void }) => {
  const [inputStr, setInputStr] = useState("BABAABAAA");
  const [showEdit, setShowEdit] = useState(false);

  const steps = useMemo(() => runLZWEncode(inputStr), [inputStr]);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const inputEl = form.elements.namedItem('input') as HTMLInputElement;
    setInputStr(inputEl.value.toUpperCase());
    setShowEdit(false);
  };

  return (
    <>
      <VisualizerShell<LZWEncodeState>
        title="LZW Encoding"
        steps={steps}
        pseudocode={LZW_ENCODE_PSEUDOCODE}
        onEditInput={() => setShowEdit(true)}
        renderStage={(data) => (
          <div className="flex flex-col h-full w-full gap-4">
            {/* Tab controls */}
            <div className="flex justify-center shrink-0">
               <div className="flex bg-accent-bg border border-border shadow-sm rounded-lg p-1">
                 <button className="px-4 py-1.5 rounded-md text-sm font-bold bg-accent text-text-h shadow-sm" disabled>Encoding</button>
                 <button className="px-4 py-1.5 rounded-md text-sm font-bold text-text hover:bg-bg transition-colors" onClick={() => onToggleTab('decode')}>Decoding</button>
               </div>
            </div>

            <div className="flex flex-col gap-6 md:flex-row flex-1 min-h-0 overflow-y-auto">
            {/* Left side: Input String and Status */}
            <div className="flex-1 flex flex-col gap-6 w-full">
              {/* Input String */}
              <div className="bg-bg p-4 rounded-xl border border-border">
                <div className="text-sm font-semibold text-text mb-2">Input String</div>
                <div className="flex flex-wrap gap-1">
                  {data.input.split('').map((char, idx) => {
                    const isK = idx === data.currentIndex;
                    const wStartIndex = data.currentIndex - data.w.length;
                    const isW = data.w.length > 0 && idx >= wStartIndex && idx < data.currentIndex;
                    const isWStart = data.w.length > 0 && idx === wStartIndex;

                    let bgClass = "bg-accent-bg text-text-h";
                    let scale = 1;
                    if (isK) {
                       bgClass = "bg-accent text-text-h shadow-lg ring-2 ring-accent ring-offset-2 ring-offset-bg";
                       scale = 1.1;
                    } else if (isW) {
                       bgClass = "bg-blue-500/20 text-blue-500 border border-blue-500/50";
                    }

                    return (
                      <motion.div
                        key={idx}
                        animate={{ scale }}
                        className={`w-8 h-10 flex flex-col items-center justify-center font-mono font-bold relative rounded-md ${bgClass}`}
                      >
                        <span className="text-lg leading-none mt-1">{char}</span>
                        <div className="text-[10px] opacity-40 leading-none mb-1 font-sans">{idx}</div>

                        {isWStart && (
                          <motion.div 
                            layoutId="w-indicator" 
                            className="absolute -top-6 text-xs text-blue-500 font-bold whitespace-nowrap"
                          >
                            W
                          </motion.div>
                        )}
                        {isK && (
                          <motion.div 
                            layoutId="k-indicator" 
                            className="absolute -top-6 text-xs text-accent font-bold"
                          >
                            K
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Variables W, K, WK */}
              <div className="bg-bg p-4 rounded-xl border border-border flex gap-4 text-center">
                <div className="flex-1 space-y-1">
                  <div className="text-xs text-text uppercase font-bold">Sequence (W)</div>
                  <div className="text-2xl font-mono text-blue-500 font-bold bg-blue-500/10 rounded py-2">
                    {data.w === "" ? '""' : `"${data.w}"`}
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-xs text-text uppercase font-bold">Char (K)</div>
                  <div className="text-2xl font-mono text-emerald-500 font-bold bg-emerald-500/10 rounded py-2">
                    {data.k === "" ? '""' : `"${data.k}"`}
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-xs text-text uppercase font-bold">W + K</div>
                  <div className="text-2xl font-mono text-purple-500 font-bold bg-purple-500/10 rounded py-2">
                    {data.w + data.k === "" ? '""' : `"${data.w + data.k}"`}
                  </div>
                </div>
              </div>

              {/* Output Array */}
              <div className="bg-bg p-4 rounded-xl border border-border flex-1">
                <div className="text-sm font-semibold text-text mb-2">Output Sequence</div>
                <div className="flex flex-wrap gap-3">
                  <AnimatePresence>
                    {data.output.map((code, idx) => {
                      const getSeq = (c: number) => {
                        if (c <= 255) return String.fromCharCode(c);
                        const entry = data.codeBook.find(x => x.code === c);
                        return entry ? entry.sequence : '?';
                      };
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center"
                        >
                          <div className="px-3 py-1 font-mono text-sm bg-purple-500 text-white rounded-full font-bold">
                            {code}
                          </div>
                          <div className="text-[10px] font-mono text-text/60 font-bold tracking-widest mt-1">
                            {getSeq(code)}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Right side: Code Book */}
            <div className="w-full md:w-64 bg-bg p-4 rounded-xl border border-border flex flex-col max-h-[500px]">
              <div className="text-sm font-semibold text-text mb-2 sticky top-0 bg-bg pb-2 z-10">Code Book</div>
              <div className="overflow-y-auto pr-2 rounded-lg flex-1">
                {data.codeBook.length === 0 ? (
                  <div className="text-sm text-text/50 italic p-4 text-center">No new codes added yet (Base ASCII is implicit).</div>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-accent-bg text-text sticky top-0">
                      <tr>
                        <th className="px-3 py-2 rounded-tl-lg">Code</th>
                        <th className="px-3 py-2 rounded-tr-lg">Seq</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence initial={false}>
                        {data.codeBook.map((entry) => {
                          const isWK = entry.sequence === data.highlightedSequence;
                          return (
                          <motion.tr
                            key={entry.code}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0, backgroundColor: isWK ? 'rgba(168, 85, 247, 0.25)' : 'rgba(0,0,0,0)' }}
                            style={{ transition: 'background-color 0.3s ease-out' }}
                            className="border-b border-border/50 last:border-0"
                          >
                            <td className="px-3 py-2 font-mono text-accent">{entry.code}</td>
                            <td className="px-3 py-2 font-mono font-bold text-text-h">"{entry.sequence}"</td>
                          </motion.tr>
                        )})}
                      </AnimatePresence>
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
          </div>
        )}
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
                    pattern="^[A-Z\s]+$"
                    title="Only uppercase letters and spaces allowed"
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEdit(false)}
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
