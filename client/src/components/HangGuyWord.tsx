import React from 'react';

interface HangGuyWordProps {
  displayWord: string;
}

export const HangGuyWord: React.FC<HangGuyWordProps> = ({ displayWord }) => (
  <div className="flex gap-2 text-3xl font-mono tracking-widest select-none" aria-label="Word to guess">
    {displayWord.split(' ').map((char, idx) =>
      char === '_' ? (
        <span key={idx} className="border-b-2 border-gray-400 px-1 text-gray-400" aria-label="Unknown letter">_</span>
      ) : (
        <span key={idx} className="border-b-2 border-gray-400 px-1">{char}</span>
      )
    )}
  </div>
);
