import React from 'react';

interface GameStatusProps {
  status: 'playing' | 'won' | 'lost';
  word?: string;
  remainingGuesses?: number;
}

export const GameStatus: React.FC<GameStatusProps> = ({ status, word, remainingGuesses }) => {

  if (status === 'playing') {
    const isCritical = (remainingGuesses ?? 0) <= 2;
    return (
      <div
        role="status"
        aria-live="polite"
        className="inline-flex items-center gap-2.5 px-3.5 py-2 font-mono text-[13px] font-semibold border-[1.5px] border-line tabular-nums"
      >
        <span
          className="w-2 h-2 flex-shrink-0"
          style={{ background: isCritical ? 'var(--ink)' : 'var(--accent)' }}
          aria-hidden="true"
        />
        <span className="text-ink">{remainingGuesses ?? 0}</span>
        <span className="text-muted font-medium">left</span>
      </div>
    );
  }

  if (status === 'won') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="w-full animate-reveal panel p-8 text-center"
        style={{ borderColor: 'var(--accent)' }}
      >
        <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted">Result</p>
        <h2 className="font-mono text-3xl font-extrabold mt-3 inline-block bg-accent text-accent-ink px-3 py-1">
          You Won!
        </h2>
        <p className="text-muted mt-4">Great job guessing the word!</p>
      </div>
    );
  }

  // Lost
  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full animate-nudge panel p-8 text-center"
    >
      <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted">Result</p>
      <h2 className="font-mono text-3xl font-extrabold mt-3 text-ink">Game Over</h2>
      {word && (
        <p className="text-muted mt-4">
          The word was:{' '}
          <span className="font-mono font-bold text-ink uppercase tracking-wider border-[1.5px] border-line px-2.5 py-1 ml-1">
            {word}
          </span>
        </p>
      )}
      <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-muted mt-5">Try again</p>
    </div>
  );
};
