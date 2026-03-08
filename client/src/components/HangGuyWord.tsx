import React, { useRef, useEffect } from 'react';

interface HangGuyWordProps {
  displayWord: string;
}

interface LetterTileProps {
  char: string;
  index: number;
  isRevealed: boolean;
}

function LetterTile({ char, index, isRevealed }: LetterTileProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevRevealed = useRef(isRevealed);

  useEffect(() => {
    if (!prevRevealed.current && isRevealed && ref.current) {
      ref.current.style.animation = 'none';
      void ref.current.offsetHeight;
      ref.current.style.animation = 'letter-flip 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both';
    }
    prevRevealed.current = isRevealed;
  }, [isRevealed]);

  if (!isRevealed) {
    return (
      <span
        className="flex items-center justify-center w-10 h-12 sm:w-12 sm:h-14 rounded-xl bg-zinc-100 sm:bg-white text-transparent sm:shadow-sm sm:border sm:border-zinc-200"
        style={{
          borderBottomWidth: '3px',
          borderBottomColor: 'var(--border)'
        }}
        aria-label="Unknown letter"
      />
    );
  }

  return (
    <span
      ref={ref}
      className="flex items-center justify-center w-10 h-12 sm:w-12 sm:h-14 rounded-xl text-2xl sm:text-3xl font-bold select-none text-white shadow-md uppercase tracking-widest"
      style={{
        background: 'var(--accent)',
        borderBottomWidth: '3px',
        borderBottomColor: 'rgba(0,0,0,0.2)',
        animation: 'letter-flip 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
        animationDelay: `${index * 0.05}s`,
        perspective: '400px',
        fontFamily: 'monospace'
      }}
      aria-label={`Letter ${char}`}
    >
      {char}
    </span>
  );
}

export const HangGuyWord: React.FC<HangGuyWordProps> = ({ displayWord }) => {
  const chars = displayWord.split(' ');

  return (
    <div
      className="flex flex-wrap justify-center gap-2 sm:gap-3 py-6 px-2"
      aria-live="polite"
      aria-label="Word to guess"
      aria-atomic="false"
    >
      {chars.map((char, idx) => (
        <LetterTile
          key={idx}
          char={char}
          index={idx}
          isRevealed={char !== '_'}
        />
      ))}
    </div>
  );
};
