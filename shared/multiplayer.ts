// Cross-cutting multiplayer constants and helpers shared by client and server.

// The single Socket.IO room every player joins. Kept here so the join call
// (gameStateSync) and the broadcasts (broadcastHandlers) can never drift apart.
export const HANGMAN_ROOM = "hangman-room";

// Fallback display name for players who join without supplying one.
export function generateGuestName(): string {
  return `Player${Math.random().toString(36).slice(2, 6)}`;
}
