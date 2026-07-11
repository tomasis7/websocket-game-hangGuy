import React from "react";

interface TurnBannerProps {
  isMyTurn: boolean;
  currentPlayerName?: string;
}

// Announces whose turn it is. Rendered only with 2+ players; the server
// enforces the turn — this banner is the visible half of that rule.
export const TurnBanner: React.FC<TurnBannerProps> = ({
  isMyTurn,
  currentPlayerName,
}) => {
  return (
    <div
      data-testid="turn-banner"
      role="status"
      aria-live="polite"
      className={`w-full max-w-2xl mx-auto text-center font-mono text-[13px] font-bold uppercase tracking-[0.08em] px-4 py-3 border-[1.5px] ${
        isMyTurn
          ? "bg-accent text-accent-ink border-accent"
          : "bg-surface text-muted border-line"
      }`}
    >
      {isMyTurn
        ? "▶ Your turn — pick a letter"
        : `Waiting for ${currentPlayerName ?? "next player"}…`}
    </div>
  );
};
