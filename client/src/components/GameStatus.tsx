import React from 'react';

interface GameStatusProps {
  status: 'playing' | 'won' | 'lost';
  word?: string;
  remainingGuesses?: number;
}

function TrophyIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="8 21 12 17 16 21" />
      <line x1="12" y1="17" x2="12" y2="11" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
      <path d="M4 4h3v3a3 3 0 0 1-3 0V4z" />
      <path d="M17 4h3v3a3 3 0 0 1-3 0V4z" />
    </svg>
  );
}

function SkullIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="11" r="7" />
      <path d="M12 18v3" />
      <path d="M9 21h6" />
      <line x1="9.5" y1="10" x2="9.5" y2="10" strokeWidth="3" strokeLinecap="round" />
      <line x1="14.5" y1="10" x2="14.5" y2="10" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function ConfettiPiece({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute w-2 h-2 rounded-sm pointer-events-none"
      style={style}
    />
  );
}

export const GameStatus: React.FC<GameStatusProps> = ({ status, word, remainingGuesses }) => {
  if (status === 'playing') {
    const isCritical = (remainingGuesses ?? 0) <= 2;
    const isWarning = (remainingGuesses ?? 0) <= 4;
    const color = isCritical ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--success)';

    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-3 px-4 py-2 rounded-full text-sm font-semibold"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
        }}
      >
        <span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{
            background: color,
            boxShadow: `0 0 8px ${color}`,
            animation: isCritical ? 'glow-pulse 0.8s ease-in-out infinite' : 'glow-pulse 2s ease-in-out infinite',
          }}
          aria-hidden="true"
        />
        <span style={{ color }}>
          <strong>{remainingGuesses ?? 0}</strong>
          <span style={{ color: 'var(--text-muted)' }}> guesses left</span>
        </span>
      </div>
    );
  }

  if (status === 'won') {
    const confettiColors = ['#8b5cf6','#84cc16','#f59e0b','#f43f5e','#06b6d4'];
    const pieces = Array.from({ length: 12 }, (_, i) => ({
      left: `${(i / 12) * 100}%`,
      top: '-10px',
      background: confettiColors[i % confettiColors.length],
      animation: `confetti-fall ${0.8 + Math.random() * 0.8}s ease-out forwards`,
      animationDelay: `${Math.random() * 0.5}s`,
      transform: `rotate(${Math.random() * 360}deg)`,
    }));

    return (
      <div
        role="status"
        aria-live="polite"
        className="relative overflow-hidden rounded-2xl p-6 text-center animate-bounce-in"
        style={{
          background: 'linear-gradient(135deg, rgba(132,204,22,0.15) 0%, rgba(139,92,246,0.15) 100%)',
          border: '2px solid var(--success)',
        }}
      >
        {pieces.map((s, i) => <ConfettiPiece key={i} style={s} />)}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ background: 'rgba(132,204,22,0.2)', color: 'var(--success)' }}
        >
          <TrophyIcon />
        </div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--success)', fontFamily: "'Fredoka One', cursive" }}>
          You Won!
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>You saved the day!</p>
      </div>
    );
  }

  // Lost
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-2xl p-6 text-center animate-shake"
      style={{
        background: 'rgba(244,63,94,0.08)',
        border: '2px solid var(--danger)',
      }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
        style={{ background: 'rgba(244,63,94,0.15)', color: 'var(--danger)' }}
      >
        <SkullIcon />
      </div>
      <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--danger)', fontFamily: "'Fredoka One', cursive" }}>
        Game Over
      </h2>
      {word && (
        <p className="text-lg font-bold mt-2" style={{ color: 'var(--text)' }}>
          The word was: <span style={{ color: 'var(--accent)' }}>{word}</span>
        </p>
      )}
      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Don't give up — try again!</p>
    </div>
  );
};
