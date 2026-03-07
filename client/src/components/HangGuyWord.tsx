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
      ref.current.style.animation = 'letter-flip 0.4s ease-out both';
    }
    prevRevealed.current = isRevealed;
  }, [isRevealed]);

  if (!isRevealed) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-xl text-xl sm:text-2xl font-bold select-none animate-shimmer"
        style={{
          width: '2.5rem',
          height: '3rem',
          minWidth: '2.5rem',
          border: '2px solid var(--border)',
          color: 'transparent',
        }}
        aria-label="Unknown letter"
      />
    );
  }

  return (
    <span
      ref={ref}
      className="inline-flex items-center justify-center rounded-xl text-xl sm:text-2xl font-bold select-none"
      style={{
        width: '2.5rem',
        height: '3rem',
        minWidth: '2.5rem',
        background: 'var(--accent)',
        color: '#fff',
        border: '2px solid var(--accent)',
        animation: 'letter-flip 0.4s ease-out both',
        animationDelay: `${index * 0.06}s`,
        perspective: '400px',
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
      className="flex flex-wrap justify-center gap-2 py-4"
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
