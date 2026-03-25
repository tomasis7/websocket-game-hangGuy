import React from 'react';

interface GuessDisplayProps {
  correctGuesses: string[];
  incorrectGuesses: string[];
  remainingGuesses: number;
  maxGuesses: number;
}

function HeartFilled() {
  return (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function HeartEmpty() {
  return (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export const GuessDisplay: React.FC<GuessDisplayProps> = ({
  correctGuesses,
  incorrectGuesses,
  remainingGuesses,
  maxGuesses,
}) => {
  const correctLetters = [...correctGuesses].sort();
  const incorrectLetters = [...incorrectGuesses].sort();
  const isCritical = remainingGuesses <= 2;

  return (
    <div className="flex flex-col gap-4 items-center">
      {/* Lives strip */}
      <div
        className="flex flex-col items-center gap-2 py-3 px-6 rounded-2xl bg-white shadow-sm border border-zinc-100"
        aria-label={`${remainingGuesses} of ${maxGuesses} guesses remaining`}
      >
        <div className="flex gap-1.5">
          {Array.from({ length: maxGuesses }).map((_, i) => {
            const isAlive = i < remainingGuesses;
            return (
              <span
                key={i}
                className="transition-colors duration-300"
                style={{
                  color: isAlive
                    ? isCritical ? '#f43f5e' : '#10b981' // rose-500 or emerald-500
                    : '#e4e4e7' // zinc-200
                }}
              >
                {isAlive ? <HeartFilled /> : <HeartEmpty />}
              </span>
            );
          })}
        </div>
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
          {remainingGuesses} / {maxGuesses} Lives
        </span>
      </div>

      {/* Guessed letters chips */}
      {(correctLetters.length > 0 || incorrectLetters.length > 0) && (
        <div className="flex flex-wrap justify-center gap-2 max-w-md">
          {correctLetters.map(letter => (
            <span
              key={letter}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm"
            >
              {letter}
            </span>
          ))}
          {incorrectLetters.map(letter => (
            <span
              key={letter}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold bg-rose-100 text-rose-500 border border-rose-200 line-through opacity-75 shadow-sm"
            >
              {letter}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
