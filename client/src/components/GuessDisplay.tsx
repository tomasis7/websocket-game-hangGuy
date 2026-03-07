import React from 'react';

interface GuessDisplayProps {
  correctGuesses: string[];
  incorrectGuesses: string[];
  remainingGuesses: number;
  maxGuesses: number;
}

function HeartFilled() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function HeartEmpty() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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
    <div className="flex flex-col gap-3">
      {/* Lives strip */}
      <div
        className="flex flex-col items-center gap-2 py-3 px-4 rounded-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        aria-label={`${remainingGuesses} of ${maxGuesses} guesses remaining`}
      >
        <div className="flex gap-1.5">
          {Array.from({ length: maxGuesses }).map((_, i) => {
            const isAlive = i < remainingGuesses;
            return (
              <span
                key={i}
                style={{
                  color: isAlive
                    ? isCritical ? 'var(--danger)' : 'var(--success)'
                    : 'var(--border)',
                  transition: 'color 0.3s',
                }}
              >
                {isAlive ? <HeartFilled /> : <HeartEmpty />}
              </span>
            );
          })}
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          {remainingGuesses} / {maxGuesses} remaining
        </span>
      </div>

      {/* Guessed letters chips */}
      {(correctLetters.length > 0 || incorrectLetters.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {correctLetters.map(letter => (
            <span
              key={letter}
              className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{
                background: 'rgba(132,204,22,0.15)',
                border: '1px solid var(--success)',
                color: 'var(--success)',
              }}
            >
              {letter}
            </span>
          ))}
          {incorrectLetters.map(letter => (
            <span
              key={letter}
              className="px-2 py-0.5 rounded-full text-xs font-bold line-through"
              style={{
                background: 'rgba(244,63,94,0.10)',
                border: '1px solid var(--danger)',
                color: 'var(--danger)',
                opacity: 0.7,
              }}
            >
              {letter}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
