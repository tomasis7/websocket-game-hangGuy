import React, { useRef, useEffect } from 'react';

interface HangGuyWordProps {
  displayWord: string;
}

interface LetterTileProps {
  char: string;
  isRevealed: boolean;
}

function LetterTile({ char, isRevealed }: LetterTileProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevRevealed = useRef(isRevealed);

  useEffect(() => {
    if (!prevRevealed.current && isRevealed && ref.current) {
      ref.current.style.animation = 'none';
      void ref.current.offsetHeight;
      ref.current.style.animation = 'reveal 0.22s ease-out both';
    }
    prevRevealed.current = isRevealed;
  }, [isRevealed]);

  if (!isRevealed) {
    return (
      <span
        className="flex items-center justify-center w-10 h-12 sm:w-12 sm:h-14 border-b-[3px] border-ink"
        aria-label="Unknown letter"
      />
    );
  }

  return (
    <span
      ref={ref}
      className="flex items-center justify-center w-10 h-12 sm:w-12 sm:h-14 font-mono text-2xl sm:text-3xl font-bold select-none uppercase bg-accent text-accent-ink"
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
      className="flex flex-wrap justify-center gap-2 sm:gap-3 py-4 px-2"
      aria-live="polite"
      aria-label="Word to guess"
      aria-atomic="false"
    >
      {chars.map((char, idx) => (
        <LetterTile
          key={idx}
          char={char}
          isRevealed={char !== '_'}
        />
      ))}
    </div>
  );
};
