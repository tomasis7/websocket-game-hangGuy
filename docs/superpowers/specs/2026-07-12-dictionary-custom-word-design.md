# Rich Dictionary + Custom Word Rounds — Design

**Date:** 2026-07-12
**Status:** Approved

## Problem

1. The word dictionary is thin: 4 categories, ~75 words. Repeat players see the
   same words quickly.
2. Players can't play the classic hangman way — one player choosing a secret
   word for the others to guess.

## Decisions (made with user)

1. **Setter spectates** — the player who sets a custom word sits out that
   round: excluded from turn rotation, no keyboard, watches the others guess.
2. **Entry lives in the Customize panel** — a masked "Set your own word" input
   (password-style with show/hide toggle) inside the existing Customize game
   panel in `GameControls`. No new screens or dialogs.
3. **Extend the existing `new-game` event** rather than adding a separate
   host-round event — minimal protocol surface, reuses game-start flow.

## Part 1: Dictionary expansion

`shared/wordSelection.ts` is the single source of truth
(`client/src/utils/wordSelection.ts` only re-exports it). Expand
`WORD_CATEGORIES` from 4 to 10 categories, ~40 words each (~400 total):

- **Grow existing:** Programming, Animals, Countries, Food → ~40 words each.
- **Add:** Sports, Science, Nature, Occupations, Music, Transportation.

Rules for every word: UPPERCASE, A–Z only (no spaces, hyphens, digits,
accents), length 3–20, no duplicates within a category. Words with accents in
their common spelling are excluded rather than transliterated. Difficulty
filtering (length-based) and the category chips in `GameControls` pick up new
categories automatically. A unit test enforces the rules over the whole
dictionary so future additions can't break them.

## Part 2: Custom word rounds

### Protocol (`shared/types.ts`)

- `hangman:new-game` payload gains `customWord?: string`.
- `GameStateEvent` gains `wordSetter?: string` (player ID of the setter;
  absent for normal rounds).

### Server

- **Validation** (in `broadcastHandlers`, before touching game state), using a
  shared `validateCustomWord` helper in `shared/wordSelection.ts`:
  - Uppercase then require `/^[A-Z]{3,20}$/` → else error code
    `INVALID_CUSTOM_WORD` with a human-readable message.
  - At least 2 players in the room → else `NOT_ENOUGH_PLAYERS` ("You need at
    least one other player to guess your word").
- **GameManager:**
  - `startNewGame` accepts the custom word + setter ID; records `wordSetter`;
    a normal new game clears it.
  - Turn rotation skips the setter (`getCurrentPlayerId` / `advanceTurn` never
    land on the setter while others are present). If only the setter remains
    in the room, there is no current player; the game stalls until someone
    joins or a new game starts.
  - `processGuess` rejects the setter with the existing `NOT_YOUR_TURN` path
    (they are never the current player).
  - If the setter leaves mid-round, the round continues unchanged.
- The word stays masked in broadcasts exactly as today (only revealed when the
  game ends).

### Client

- **GameControls (Customize panel):** "Set your own word" input — masked,
  show/hide toggle, client-side validation mirroring the server rules with
  inline feedback, and a "Start with my word" button (disabled when invalid or
  fewer than 2 players). Emits `new-game` with `customWord`; the input clears
  after starting.
- **Setter's view during the round:** keyboard hidden; the banner slot shows a
  spectator state: "You set the word — watching the others guess". Turn banner
  for others behaves exactly as in normal rounds.
- **UserList:** the setter gets a "Word" badge (same chip idiom as the
  existing You/Turn badges).
- **Other players:** the existing game-start broadcast announces the round;
  play proceeds exactly as normal.

### Error handling

Server rejections surface through the existing `hangman:error` → in-game
alert strip path. `INVALID_CUSTOM_WORD` and `NOT_ENOUGH_PLAYERS` must NOT
reopen the join dialog (the code filter added in the turn-indicator feature
already defaults unknown codes to in-game display).

## Testing

- **Unit (server):** custom round records/clears `wordSetter`; rotation skips
  the setter (3-player and 2-player rounds); setter's guess rejected; setter
  leaving keeps the round running; only-setter-left stalls safely; validation
  helper accepts/rejects the documented cases.
- **Unit (dictionary):** every word matches `/^[A-Z]{3,20}$/`, no duplicates,
  ≥10 categories, ≥25 words per category.
- **Component:** word input validation states; spectator banner state.
- **E2E:** extend the two-player spec — Alice sets a custom word, Bob sees a
  fresh board and guesses freely (no waiting banner for Bob since he is the
  only guesser), Alice sees the spectator state and no keyboard.

## Out of scope

- Whole-word guessing
- Scoring / points for the setter
- Multi-word phrases, hyphenated words
- Persisting custom words or a "word history"
