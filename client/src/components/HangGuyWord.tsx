import React from 'react';

interface HangGuyWordProps {
  word: string;
  correctGuesses: Set<string>;
}

export const HangGuyWord: React.FC<HangGuyWordProps> = ({ word, correctGuesses }) => (
  <div className="flex gap-2 text-3xl font-mono tracking-widest select-none">
    {word.split('').map((letter, idx) =>
      correctGuesses.has(letter) ? (
        <span key={idx} className="border-b-2 border-gray-400 px-1">{letter}</span>
      ) : (
        <span key={idx} className="border-b-2 border-gray-400 px-1 text-gray-400">_</span>
      )
    )}
  </div>
);