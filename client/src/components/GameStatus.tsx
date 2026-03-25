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

const CONFETTI_COLORS = ['#8b5cf6','#10b981','#f59e0b','#f43f5e','#0ea5e9'];

const confettiPieces = Array.from({ length: 15 }, (_, i) => ({
  left: `${(i / 15) * 100}%`,
  top: '-10px',
  background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  animation: `confetti-fall ${0.8 + Math.random() * 0.8}s ease-out forwards`,
  animationDelay: `${Math.random() * 0.5}s`,
  transform: `rotate(${Math.random() * 360}deg)`,
}));

export const GameStatus: React.FC<GameStatusProps> = ({ status, word, remainingGuesses }) => {

  if (status === 'playing') {
    const isCritical = (remainingGuesses ?? 0) <= 2;
    const isWarning = (remainingGuesses ?? 0) <= 4;
    const colorClass = isCritical ? 'bg-rose-500 shadow-rose-500/50' : isWarning ? 'bg-amber-500 shadow-amber-500/50' : 'bg-emerald-500 shadow-emerald-500/50';
    const textClass = isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600';

    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-bold bg-white border border-zinc-200 shadow-sm"
      >
        <span
          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-md ${colorClass}`}
          style={{
            animation: isCritical ? 'glow-pulse 0.8s ease-in-out infinite' : 'glow-pulse 2s ease-in-out infinite',
          }}
          aria-hidden="true"
        />
        <span className={textClass}>
          {remainingGuesses ?? 0}
          <span className="text-zinc-500 font-medium ml-1">left</span>
        </span>
      </div>
    );
  }

  if (status === 'won') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="relative overflow-hidden rounded-3xl p-8 text-center animate-bounce-in bg-white border-2 border-emerald-200 shadow-lg"
      >
        {confettiPieces.map((s, i) => <ConfettiPiece key={i} style={s} />)}
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-emerald-100 text-emerald-600 shadow-inner">
          <TrophyIcon />
        </div>
        <h2 className="text-3xl font-bold mb-2 text-emerald-600" style={{ fontFamily: "'Fredoka One', cursive" }}>
          You Won!
        </h2>
        <p className="text-zinc-500 font-medium text-lg">Great job guessing the word!</p>
      </div>
    );
  }

  // Lost
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-3xl p-8 text-center animate-shake bg-white border-2 border-rose-200 shadow-lg"
    >
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-rose-100 text-rose-500 shadow-inner">
        <SkullIcon />
      </div>
      <h2 className="text-3xl font-bold mb-2 text-rose-600" style={{ fontFamily: "'Fredoka One', cursive" }}>
        Game Over
      </h2>
      {word && (
        <p className="text-lg font-medium text-zinc-600 mt-3">
          The word was: <span className="font-bold text-zinc-900 tracking-wider bg-zinc-100 px-3 py-1 rounded-lg ml-1">{word}</span>
        </p>
      )}
      <p className="text-sm mt-4 text-zinc-400 font-medium">Don't give up — try again!</p>
    </div>
  );
};
