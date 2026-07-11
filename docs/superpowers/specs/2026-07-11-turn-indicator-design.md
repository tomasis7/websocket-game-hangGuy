# Turn-Based Guessing with "Your Turn" Indicator — Design

**Date:** 2026-07-11
**Status:** Approved

## Problem

With more than two players, nobody can tell who should guess next. The game
currently has no turn system at all: anyone can guess any letter at any time.
The `currentPlayer?: string` field exists in `GameStateEvent`
(`shared/types.ts`) but the server never sets it and the client never reads it.

## Decisions (made with user)

1. **Strict turns** — the server enforces turn order and rejects out-of-turn
   guesses. No timeout/skip mechanism for now.
2. **Rotate after every guess** — right or wrong, the turn passes to the next
   player. Equal participation over skill reward.
3. **Full UI treatment** — banner above keyboard, keyboard disabled when not
   your turn, and a turn marker in the sidebar player list.

## Server design (`server/src/gameManager.ts`)

- `GameManager` keeps `turnOrder: string[]` (player IDs in join order) and a
  current-turn pointer. The first player to join gets the first turn.
- `getGameState()` populates the existing `currentPlayer` field with the
  current player's **ID**. No wire-format change; every existing broadcast
  already carries the full game state, so clients stay in sync for free.
- `processGuess(letter, playerId)` returns
  `{ success: false, error: "It's not your turn", ... }` with error code
  `NOT_YOUR_TURN` when `playerId` is not the current player. After a
  **successful** guess, the turn advances (wrapping around). Failed guesses
  (already guessed letter, game over) do not advance the turn.
- **Player leaves:** remove them from `turnOrder`; if it was their turn, the
  turn passes immediately to the next player (index wraps).
- **New game:** turn resets to the first player in `turnOrder`.
- **Solo play (1 player):** trivially always their turn; enforcement passes.

## Client design

Three-part indicator, all hidden when fewer than 2 players are in the game:

1. **`TurnBanner`** (new component) rendered above the keyboard in
   `MultiplayerHangGuy.tsx`:
   - Your turn: lime/accent banner — "▶ Your turn — pick a letter"
   - Otherwise: muted banner — "Waiting for {name}…" (name looked up from
     `gameState.players` by `currentPlayer` ID)
2. **`LetterInput`** gains a `disabled` prop: keyboard dimmed and buttons
   unclickable when it's not the local player's turn, so out-of-turn guesses
   can't even be sent.
3. **`UserList`** gains a `currentTurnPlayerId` prop: the current player gets
   a ▶ marker and accent border, consistent with the Mono·Lime theme.

Server-side rejection remains the source of truth; the disabled keyboard is
UX only. If a `NOT_YOUR_TURN` error does arrive (e.g. race with a state
update), it surfaces through the existing `hangman:error` handling.

## Testing

- **Unit (`server/src/gameManager.test.ts`):** turn rotates after each guess
  (correct and incorrect); out-of-turn guess rejected with `NOT_YOUR_TURN`;
  turn passes when current player leaves (including wrap-around); turn resets
  on new game; solo player can always guess; failed guess (duplicate letter)
  does not advance the turn.
- **Component:** `TurnBanner` renders both states; hidden in solo play;
  `LetterInput` disabled state.
- **E2E (`client/e2e/game-ui.spec.ts`):** two-player session — the player
  whose turn it is sees the active banner and enabled keyboard; the other
  sees the waiting banner and disabled keyboard; after a guess the roles swap.

## Out of scope

- Turn timers / auto-skip for idle players
- Persisting turn order across server restarts
- Spectator mode
