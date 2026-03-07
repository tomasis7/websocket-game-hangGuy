import React, { useEffect, useRef, useCallback } from "react";
import type { GameStateEvent, PlayerInfo } from "../../../shared/types";

interface JoinGameWelcomeProps {
  gameState: GameStateEvent;
  playerInfo: PlayerInfo;
  isGameInProgress: boolean;
  gameSummary: string;
  onDismiss: () => void;
}

export const JoinGameWelcome: React.FC<JoinGameWelcomeProps> = ({
  gameState,
  playerInfo,
  isGameInProgress,
  gameSummary,
  onDismiss,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const dismissRef = useRef<HTMLButtonElement>(null);
  const headingId = "welcome-dialog-title";

  useEffect(() => {
    setTimeout(() => dismissRef.current?.focus(), 50);
  }, []);

  // Focus trap + Escape to dismiss
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onDismiss();
      return;
    }
    if (e.key === 'Tab') {
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  }, [onDismiss]);

  const getIcon = () => {
    if (gameState.status === "won") return "🎉";
    if (gameState.status === "lost") return "💀";
    if (isGameInProgress) return "🎯";
    return "👋";
  };

  const getTitle = () => {
    if (gameState.status === "won") return "Game Already Won!";
    if (gameState.status === "lost") return "Game Already Lost";
    if (isGameInProgress) return "Game In Progress!";
    return "Welcome to Hang Guy!";
  };

  const getMessage = () => {
    if (gameState.status === "won") {
      return `The word "${gameState.word}" was already guessed. Start a new game to play!`;
    }
    if (gameState.status === "lost") {
      return `The previous game ended. The word was "${gameState.word}". Start a new game to play!`;
    }
    if (isGameInProgress) {
      const chars = gameState.displayWord.replace(/\s/g, "");
      const revealed = chars.replace(/_/g, "").length;
      return `You joined an active game! ${revealed} of ${chars.length} letters revealed. Guess away!`;
    }
    return "You've joined the game! Wait for someone to start a new game, or start one yourself.";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      aria-modal="true"
      role="dialog"
      aria-labelledby={headingId}
    >
      <div
        ref={dialogRef}
        onKeyDown={handleKeyDown}
        className="w-full sm:max-w-md flex flex-col gap-4 animate-bounce-in"
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '1.5rem 1.5rem 0 0',
          padding: '2rem 1.5rem 2.5rem',
        }}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full mx-auto sm:hidden" style={{ background: 'var(--border)' }} aria-hidden="true" />

        {/* Header */}
        <div className="text-center">
          <div className="text-4xl mb-2" aria-hidden="true">{getIcon()}</div>
          <h2
            id={headingId}
            className="text-xl font-bold"
            style={{ fontFamily: "'Fredoka One', cursive", color: 'var(--accent)' }}
          >
            Welcome, {playerInfo.name}!
          </h2>
          <p className="font-semibold mt-0.5" style={{ color: 'var(--text)' }}>{getTitle()}</p>
        </div>

        {/* Summary */}
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-muted)' }}>{gameSummary}</p>
          {isGameInProgress && (
            <div className="mt-2 flex flex-col gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              <div className="flex justify-between">
                <span>Word:</span>
                <span className="font-mono" style={{ color: 'var(--text)' }}>{gameState.displayWord}</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining guesses:</span>
                <span style={{ color: 'var(--text)' }}>{gameState.remainingGuesses}</span>
              </div>
            </div>
          )}
        </div>

        {/* Player count */}
        <div
          className="rounded-xl px-4 py-3 text-sm text-center"
          style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}
        >
          <span style={{ color: 'var(--accent)' }}>
            {gameState.players.length} player{gameState.players.length !== 1 ? 's' : ''} in game
          </span>
          {gameState.players.length > 1 && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Others: {gameState.players.filter(p => p.id !== playerInfo.id).map(p => p.name).join(', ')}
            </p>
          )}
        </div>

        <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>{getMessage()}</p>

        <button
          ref={dismissRef}
          onClick={onDismiss}
          className="w-full py-3.5 rounded-full font-bold text-white transition-all hover:scale-[1.02] active:scale-95 focus:outline-none focus-visible:ring-2"
          style={{
            background: 'var(--accent)',
            fontFamily: "'Fredoka One', cursive",
            fontSize: '1.1rem',
            boxShadow: '0 4px 16px rgba(139,92,246,0.35)',
          }}
        >
          {isGameInProgress ? 'Start Playing!' : 'Got it!'}
        </button>
      </div>
    </div>
  );
};
