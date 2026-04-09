import { useState } from 'react';
import { LZWEncodeView } from './LZWEncodeView';
import { LZWDecodeView } from './LZWDecodeView';

export const LZWVisualizer = () => {
  const [activeTab, setActiveTab] = useState<'encode' | 'decode'>('encode');

  return (
    <div className="w-full h-screen">
      {activeTab === 'encode' ? (
        <LZWEncodeView onToggleTab={setActiveTab} />
      ) : (
        <LZWDecodeView onToggleTab={setActiveTab} />
      )}
    </div>
  );
};
