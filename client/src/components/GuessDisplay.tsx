import React from 'react';

interface GuessDisplayProps {
  correctGuesses: string[];
  incorrectGuesses: string[];
  remainingGuesses: number;
  maxGuesses: number;
}

export const GuessDisplay: React.FC<GuessDisplayProps> = ({
  correctGuesses,
  incorrectGuesses,
  remainingGuesses,
  maxGuesses,
}) => {
  const correctLetters = [...correctGuesses].sort();
  const incorrectLetters = [...incorrectGuesses].sort();

  return (
    <div className="flex flex-col gap-5 items-center">
      {/* Lives — depleting pips */}
      <div
        className="flex flex-col items-center gap-2"
        aria-label={`${remainingGuesses} of ${maxGuesses} guesses remaining`}
      >
        <div className="flex gap-1.5">
          {Array.from({ length: maxGuesses }).map((_, i) => {
            const alive = i < remainingGuesses;
            return (
              <span
                key={i}
                className="w-6 h-2 border-[1.5px] transition-colors duration-200"
                style={{
                  background: alive ? 'var(--accent)' : 'transparent',
                  borderColor: alive ? 'var(--ink)' : 'var(--border)',
                }}
              />
            );
          })}
        </div>
        <span className="font-mono text-[11px] font-semibold tracking-[0.12em] uppercase text-muted tabular-nums">
          {remainingGuesses} / {maxGuesses} lives
        </span>
      </div>

      {/* Guessed letters */}
      {(correctLetters.length > 0 || incorrectLetters.length > 0) && (
        <div className="flex flex-wrap justify-center gap-1.5 max-w-md">
          {correctLetters.map((letter) => (
            <span
              key={letter}
              className="w-7 h-7 flex items-center justify-center font-mono text-[13px] font-bold border-[1.5px] border-line bg-bg text-ink"
            >
              {letter}
            </span>
          ))}
          {incorrectLetters.map((letter) => (
            <span
              key={letter}
              className="w-7 h-7 flex items-center justify-center font-mono text-[13px] font-bold border-[1.5px] border-line-soft text-bad line-through"
            >
              {letter}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
