import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VisualizerShell } from '../shared/VisualizerShell';
import { runLZWDecode, LZW_DECODE_PSEUDOCODE, type LZWDecodeState } from '../../algorithms/lzw';

export const LZWDecodeView = ({ onToggleTab }: { onToggleTab: (tab: 'encode' | 'decode') => void }) => {
  const [inputCodesStr, setInputCodesStr] = useState("66, 65, 257, 258, 65, 261");
  const [showEdit, setShowEdit] = useState(false);

  const inputCodes = useMemo(() => {
    return inputCodesStr.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
  }, [inputCodesStr]);

  const steps = useMemo(() => runLZWDecode(inputCodes), [inputCodes]);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const inputEl = form.elements.namedItem('codes') as HTMLInputElement;
    setInputCodesStr(inputEl.value);
    setShowEdit(false);
  };

  return (
    <>
      <VisualizerShell<LZWDecodeState>
        title="LZW Decoding"
        steps={steps}
        pseudocode={LZW_DECODE_PSEUDOCODE}
        onEditInput={() => setShowEdit(true)}
        renderStage={(data) => (
          <div className="flex flex-col h-full w-full gap-4">
            {/* Tab controls */}
            <div className="flex justify-center shrink-0">
               <div className="flex bg-accent-bg border border-border shadow-sm rounded-lg p-1">
                 <button className="px-4 py-1.5 rounded-md text-sm font-bold text-text hover:bg-bg transition-colors" onClick={() => onToggleTab('encode')}>Encoding</button>
                 <button className="px-4 py-1.5 rounded-md text-sm font-bold bg-accent text-text-h shadow-sm" disabled>Decoding</button>
               </div>
            </div>

            <div className="flex flex-col gap-6 md:flex-row flex-1 min-h-0 overflow-y-auto">
            {/* Left side: Variables and Output */}
            <div className="flex-1 flex flex-col gap-6 w-full">
              {/* Input Codes */}
              <div className="bg-bg p-4 rounded-xl border border-border">
                <div className="text-sm font-semibold text-text mb-2">Input Codes</div>
                <div className="flex flex-wrap gap-2">
                  {data.inputCodes.map((code, idx) => (
                    <motion.div
                      key={idx}
                      className={`px-3 py-1.5 font-mono text-sm rounded ${data.currentIndex === idx ? 'bg-accent text-text-h shadow-md ring-2 ring-accent ring-offset-2 ring-offset-bg' : 'bg-accent-bg text-text-h'}`}
                    >
                      {code}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Output Process */}
              <div className="bg-bg p-4 rounded-xl border border-border flex-1 min-h-[150px]">
                <div className="text-sm font-semibold text-text mb-2">Decoded String (Output)</div>
                <motion.div
                  layout
                  className="text-2xl font-mono tracking-widest text-text-h font-bold flex flex-wrap gap-1"
                >
                  {data.output.split('').map((char, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-block"
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Right side: Code Book */}
            <div className="w-full md:w-64 bg-bg p-4 rounded-xl border border-border flex flex-col max-h-[400px]">
              <div className="text-sm font-semibold text-text mb-2 sticky top-0 bg-bg pb-2 z-10">Code Book</div>
              <div className="overflow-y-auto pr-2 rounded-lg flex-1">
                {data.codeBook.length === 0 ? (
                  <div className="text-sm text-text/50 italic p-4 text-center">No new codes yet.</div>
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
                        {data.codeBook.map((entry) => (
                          <motion.tr
                            key={entry.code}
                            initial={{ opacity: 0, x: -10, backgroundColor: '#10b98120' }}
                            animate={{ opacity: 1, x: 0, backgroundColor: 'transparent' }}
                            className="border-b border-border/50 last:border-0"
                          >
                            <td className="px-3 py-2 font-mono text-accent">{entry.code}</td>
                            <td className="px-3 py-2 font-mono font-bold text-text-h">"{entry.sequence}"</td>
                          </motion.tr>
                        ))}
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
              <h2 className="text-xl font-bold mb-4 text-text-h">Edit Input Codes</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-text">Codes (comma separated)</label>
                  <input
                    name="codes"
                    defaultValue={inputCodesStr}
                    type="text"
                    className="w-full bg-bg border border-border rounded-lg p-2 font-mono text-sm text-text-h"
                    pattern="^([0-9]+\s*,\s*)*[0-9]+$"
                    title="Comma separated integers"
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
