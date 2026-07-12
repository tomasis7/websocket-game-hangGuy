# Turn-Based Guessing + "Your Turn" Indicator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Server-enforced turn rotation in multiplayer hangman, with a three-part UI indicator (banner, disabled keyboard, sidebar marker) so players always know whose turn it is.

**Architecture:** `GameManager` (server) gains a `turnOrder` array + pointer; it populates the already-existing-but-unused `currentPlayer` field on `GameStateEvent`, so the wire format doesn't change and every existing broadcast carries turn info for free. The client derives `isMyTurn` by comparing `gameState.currentPlayer` to `socket.id` and renders a new `TurnBanner`, disables `LetterInput` (its `disabled` prop already exists and works), and marks the current player in `UserList`. All turn UI is hidden with fewer than 2 players.

**Tech Stack:** TypeScript (strict, ESM), Node + Socket.IO server, React 19 + Vite client, Vitest for unit/component tests, Playwright for e2e. Tailwind 4 with the project's Mono·Lime theme tokens (`bg-accent`, `text-accent-ink`, `border-line`, `text-muted`, `font-mono`, uppercase tracking).

**Spec:** `docs/superpowers/specs/2026-07-11-turn-indicator-design.md`

## Global Constraints

- No new dependencies.
- Turn rules (from spec): strict enforcement server-side; turn advances after every **successful** guess (correct or incorrect); invalid guesses (duplicate letter, out of turn, game over) do NOT advance the turn; first player to join gets the first turn; turn passes to the next player when the current player leaves; new game resets the turn to the first player in join order; solo player can always guess.
- Error code for out-of-turn guesses is exactly `NOT_YOUR_TURN`, message exactly `It's not your turn`.
- Banner copy exactly: `▶ Your turn — pick a letter` (your turn) and `Waiting for {name}…` (someone else's turn).
- All turn UI hidden when `players.length < 2`.
- Match existing code style: comments only for non-obvious constraints, existing naming conventions, Tailwind utility classes in the same idiom as neighboring components.
- Working directory for commands is the repo root `/var/home/tomasis/Documents/hangguy-game` unless a `cd` is shown.

---

### Task 1: Server turn logic in GameManager

**Files:**
- Modify: `server/src/gameManager.ts`
- Modify: `server/src/broadcastHandlers.ts` (2-line error-code passthrough)
- Test: `server/src/gameManager.test.ts`

**Interfaces:**
- Consumes: existing `GameManager` API (`addPlayer`, `removePlayer`, `processGuess`, `startNewGame`, `getGameState`), existing `GameStateEvent.currentPlayer?: string` field in `shared/types.ts` (already declared — no type changes needed there).
- Produces: `GameStateEvent.currentPlayer` populated with the current player's socket ID (or `undefined` when no players). `processGuess` return type gains optional `errorCode?: string`; out-of-turn guesses return `{ success: false, error: "It's not your turn", errorCode: "NOT_YOUR_TURN" }`. `hangman:error` socket event now carries `code: "NOT_YOUR_TURN"` for that case. Later tasks rely on `currentPlayer` being a player ID matching `PlayerInfo.id`.

- [ ] **Step 1: Write the failing tests**

Append this describe block inside the top-level `describe('GameManager', ...)` in `server/src/gameManager.test.ts` (after the `'game statistics'` block):

```ts
  describe('turn management', () => {
    it('gives the first turn to the first player who joined', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');

      expect(gameManager.getGameState().currentPlayer).toBe('p1');
    });

    it('reports no current player when the game is empty', () => {
      expect(gameManager.getGameState().currentPlayer).toBeUndefined();
    });

    it('advances the turn after every successful guess and wraps around', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');

      const first = gameManager.processGuess('A', 'p1');
      expect(first.success).toBe(true);
      expect(gameManager.getGameState().currentPlayer).toBe('p2');

      const second = gameManager.processGuess('B', 'p2');
      expect(second.success).toBe(true);
      expect(gameManager.getGameState().currentPlayer).toBe('p1');
    });

    it('rejects an out-of-turn guess with NOT_YOUR_TURN and does not advance', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');

      const result = gameManager.processGuess('A', 'p2');

      expect(result.success).toBe(false);
      expect(result.error).toBe("It's not your turn");
      expect(result.errorCode).toBe('NOT_YOUR_TURN');
      expect(gameManager.getGameState().currentPlayer).toBe('p1');
      expect(gameManager.getGameState().guessedLetters).not.toContain('A');
    });

    it('does not advance the turn on an invalid guess (duplicate letter)', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');
      gameManager.processGuess('A', 'p1'); // turn -> p2

      const dup = gameManager.processGuess('A', 'p2');

      expect(dup.success).toBe(false);
      expect(gameManager.getGameState().currentPlayer).toBe('p2');
    });

    it('passes the turn to the next player when the current player leaves', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');
      gameManager.addPlayer('p3', 'Cara');

      gameManager.removePlayer('p1');

      expect(gameManager.getGameState().currentPlayer).toBe('p2');
    });

    it('wraps the turn to the first player when the last player leaves mid-turn', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');
      gameManager.processGuess('A', 'p1'); // turn -> p2 (last in order)

      gameManager.removePlayer('p2');

      expect(gameManager.getGameState().currentPlayer).toBe('p1');
    });

    it('keeps the turn on the current player when an earlier player leaves', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');
      gameManager.addPlayer('p3', 'Cara');
      gameManager.processGuess('A', 'p1'); // turn -> p2

      gameManager.removePlayer('p1');

      expect(gameManager.getGameState().currentPlayer).toBe('p2');
    });

    it('resets the turn to the first player in join order on new game', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');
      gameManager.processGuess('A', 'p1'); // turn -> p2

      gameManager.startNewGame();

      expect(gameManager.getGameState().currentPlayer).toBe('p1');
    });

    it('always lets a solo player guess', () => {
      gameManager.addPlayer('p1', 'Alice');

      const result = gameManager.processGuess('A', 'p1');

      expect(result.success).toBe(true);
      expect(gameManager.getGameState().currentPlayer).toBe('p1');
    });

    it('does not duplicate a player in the turn order on re-join', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');
      gameManager.addPlayer('p1', 'Alice'); // reconnection re-add, same id

      gameManager.processGuess('A', 'p1'); // turn -> p2, not p1 again

      expect(gameManager.getGameState().currentPlayer).toBe('p2');
    });
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npx vitest run src/gameManager.test.ts`
Expected: the new `turn management` tests FAIL (e.g. `expected undefined to be 'p1'`, `errorCode` undefined). The pre-existing tests still pass.

- [ ] **Step 3: Implement turn logic in GameManager**

In `server/src/gameManager.ts`, make these exact changes:

3a. Add two private fields after `private lastAction?: GameAction;`:

```ts
  // Player IDs in join order; the pointer marks whose turn it is.
  private turnOrder: string[] = [];
  private currentTurnIndex = 0;
```

3b. Add these two methods right after the constructor:

```ts
  getCurrentPlayerId(): string | undefined {
    return this.turnOrder.length > 0
      ? this.turnOrder[this.currentTurnIndex]
      : undefined;
  }

  private advanceTurn(): void {
    if (this.turnOrder.length === 0) {
      this.currentTurnIndex = 0;
      return;
    }
    this.currentTurnIndex = (this.currentTurnIndex + 1) % this.turnOrder.length;
  }
```

3c. In `addPlayer`, after `this.players.set(playerId, playerInfo);` add:

```ts
    // Guard against duplicate entries when a reconnecting socket re-joins.
    if (!this.turnOrder.includes(playerId)) {
      this.turnOrder.push(playerId);
    }
```

3d. In `removePlayer`, inside the `if (removed && playerInfo) {` block, before `this.lastAction = {` add:

```ts
      const idx = this.turnOrder.indexOf(playerId);
      if (idx !== -1) {
        this.turnOrder.splice(idx, 1);
        if (idx < this.currentTurnIndex) {
          this.currentTurnIndex--;
        } else if (idx === this.currentTurnIndex && this.currentTurnIndex >= this.turnOrder.length) {
          // Current player was last in order: wrap to the first player.
          this.currentTurnIndex = 0;
        }
      }
```

(When `idx === currentTurnIndex` and players remain after it, the next player slides into the same index — the turn passes naturally without touching the pointer.)

3e. In `startNewGame`, right after `this.game = new HangGuyGame(word);` add:

```ts
    this.currentTurnIndex = 0;
```

3f. In `processGuess`, change the return type annotation to include the error code:

```ts
  ): {
    success: boolean;
    isCorrect: boolean;
    gameState: GameStateEvent;
    error?: string;
    errorCode?: string;
  } {
```

3g. Still in `processGuess`, insert the turn check between the "game is already over" check and the `canGuessLetter` validation:

```ts
    // Strict turns: only the current player may guess.
    if (playerId !== this.getCurrentPlayerId()) {
      return {
        success: false,
        isCorrect: false,
        gameState: this.getGameState(),
        error: "It's not your turn",
        errorCode: "NOT_YOUR_TURN",
      };
    }
```

3h. Still in `processGuess`, after `const guessResult = this.game.guessLetter(letter);` add:

```ts
    this.advanceTurn();
```

3i. In `getGameState`, add `currentPlayer` to the returned object (after `displayWord: state.displayWord,`):

```ts
      currentPlayer: this.getCurrentPlayerId(),
```

- [ ] **Step 4: Pass the error code through to the socket error event**

In `server/src/broadcastHandlers.ts`, inside the `hangman:guess-letter` handler, change:

```ts
      if (!result.success) {
        emitError(socket, result.error || "Failed to process guess", "GUESS_ERROR");
        return;
      }
```

to:

```ts
      if (!result.success) {
        emitError(socket, result.error || "Failed to process guess", result.errorCode ?? "GUESS_ERROR");
        return;
      }
```

- [ ] **Step 5: Run server tests to verify they pass**

Run: `cd server && npx vitest run`
Expected: ALL tests pass, including the 11 new `turn management` tests and every pre-existing test.

- [ ] **Step 6: Lint and commit**

```bash
cd server && npm run lint && cd ..
git add server/src/gameManager.ts server/src/gameManager.test.ts server/src/broadcastHandlers.ts
git commit -m "feat: enforce turn rotation in multiplayer guessing"
```

---

### Task 2: TurnBanner component

**Files:**
- Create: `client/src/components/TurnBanner.tsx`
- Test: `client/src/components/TurnBanner.test.tsx`

**Interfaces:**
- Consumes: nothing from other tasks (pure presentational component).
- Produces: `export const TurnBanner: React.FC<TurnBannerProps>` with props `{ isMyTurn: boolean; currentPlayerName?: string }`. Renders a `role="status"` element with `data-testid="turn-banner"` (Task 5's e2e selector relies on this exact test id). Task 4 imports it as `import { TurnBanner } from "./TurnBanner";`.

- [ ] **Step 1: Write the failing test**

Create `client/src/components/TurnBanner.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TurnBanner } from './TurnBanner';

describe('TurnBanner', () => {
  it('shows the call-to-action when it is your turn', () => {
    render(<TurnBanner isMyTurn={true} />);

    expect(screen.getByRole('status')).toHaveTextContent(/your turn/i);
    expect(screen.getByRole('status')).toHaveTextContent(/pick a letter/i);
  });

  it('shows a waiting message with the current player name otherwise', () => {
    render(<TurnBanner isMyTurn={false} currentPlayerName="Alice" />);

    expect(screen.getByRole('status')).toHaveTextContent(/waiting for alice/i);
  });

  it('falls back to a generic waiting message without a name', () => {
    render(<TurnBanner isMyTurn={false} />);

    expect(screen.getByRole('status')).toHaveTextContent(/waiting for next player/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd client && npx vitest run src/components/TurnBanner.test.tsx`
Expected: FAIL — cannot resolve `./TurnBanner`.

- [ ] **Step 3: Implement the component**

Create `client/src/components/TurnBanner.tsx`:

```tsx
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd client && npx vitest run src/components/TurnBanner.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add client/src/components/TurnBanner.tsx client/src/components/TurnBanner.test.tsx
git commit -m "feat: add TurnBanner component"
```

---

### Task 3: Turn marker in UserList

**Files:**
- Modify: `client/src/components/UserList.tsx`
- Test: `client/src/components/UserList.test.tsx` (create)

**Interfaces:**
- Consumes: existing `UserList` props (`users: User[]`, `currentUserId?: string`).
- Produces: new optional prop `currentTurnPlayerId?: string` on `UserListProps`. The matching player row shows a ▶ marker plus a `Turn` badge whose accessible name is exactly `Current turn`. Task 4 passes this prop from `MultiplayerHangGuy`.

- [ ] **Step 1: Write the failing test**

Create `client/src/components/UserList.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserList } from './UserList';
import type { User } from '../../../shared/types';

const users: User[] = [
  { id: 'p1', nickname: 'Alice', isActive: true, joinedAt: 1 },
  { id: 'p2', nickname: 'Bob', isActive: true, joinedAt: 2 },
];

describe('UserList turn marker', () => {
  it('marks the player whose turn it is', () => {
    render(
      <UserList users={users} currentUserId="p2" currentTurnPlayerId="p1" />
    );

    const badge = screen.getByLabelText('Current turn');
    expect(badge).toBeInTheDocument();
    // The badge sits in Alice's row, not Bob's
    expect(badge.closest('li')).toHaveTextContent('Alice');
  });

  it('shows no turn marker when currentTurnPlayerId is not set', () => {
    render(<UserList users={users} currentUserId="p2" />);

    expect(screen.queryByLabelText('Current turn')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd client && npx vitest run src/components/UserList.test.tsx`
Expected: FAIL — first test cannot find `Current turn` (prop doesn't exist yet, and TypeScript errors on the unknown prop).

- [ ] **Step 3: Implement the marker**

In `client/src/components/UserList.tsx`:

3a. Extend the props interface:

```tsx
interface UserListProps {
  users: User[];
  currentUserId?: string;
  currentTurnPlayerId?: string;
}
```

3b. Update the component signature:

```tsx
export const UserList: React.FC<UserListProps> = ({
  users,
  currentUserId,
  currentTurnPlayerId,
}) => {
```

3c. Inside `users.map`, after `const isCurrentUser = user.id === currentUserId;` add:

```tsx
            const isCurrentTurn = user.id === currentTurnPlayerId;
```

3d. In the name row (the `div` with `className="flex items-center gap-2"` that contains the nickname and the `You` badge), add a ▶ marker before the nickname and a `Turn` badge after the `You` badge:

```tsx
                  <div className="flex items-center gap-2">
                    {isCurrentTurn && (
                      <span className="font-mono text-xs text-accent" aria-hidden="true">
                        ▶
                      </span>
                    )}
                    <span className="font-mono font-semibold truncate text-sm text-ink">
                      {user.nickname}
                    </span>
                    {isCurrentUser && (
                      <span className="font-mono text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-[0.08em] bg-accent text-accent-ink">
                        You
                      </span>
                    )}
                    {isCurrentTurn && (
                      <span
                        aria-label="Current turn"
                        className="font-mono text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-[0.08em] border-[1.5px] border-accent text-ink"
                      >
                        Turn
                      </span>
                    )}
                  </div>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/components/UserList.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add client/src/components/UserList.tsx client/src/components/UserList.test.tsx
git commit -m "feat: mark current-turn player in UserList"
```

---

### Task 4: Wire turn state into MultiplayerHangGuy + dim disabled keyboard

**Files:**
- Modify: `client/src/components/MultiplayerHangGuy.tsx`
- Modify: `client/src/components/LetterInput.tsx` (dim when disabled)

**Interfaces:**
- Consumes: `TurnBanner` from Task 2 (`{ isMyTurn, currentPlayerName }`), `UserList.currentTurnPlayerId` from Task 3, `gameState.currentPlayer` populated by Task 1, existing `LetterInput.disabled` prop, `socket` from `../socket`.
- Produces: the assembled feature. No new exports.

- [ ] **Step 1: Dim the keyboard when disabled**

In `client/src/components/LetterInput.tsx`, the root `div` currently has:

```tsx
      className="w-full flex flex-col items-center gap-1.5 sm:gap-2 py-2 select-none"
```

Change it to fade the whole keyboard when disabled:

```tsx
      className={`w-full flex flex-col items-center gap-1.5 sm:gap-2 py-2 select-none transition-opacity ${
        disabled ? "opacity-40 pointer-events-none" : ""
      }`}
```

(The buttons are already individually `disabled` and the global key handler already checks `disabled` — this is only the visual dim.)

- [ ] **Step 2: Derive turn state and render the banner**

In `client/src/components/MultiplayerHangGuy.tsx`:

2a. Add the import next to the other component imports:

```tsx
import { TurnBanner } from "./TurnBanner";
```

2b. Derive the turn state near the top of the component, right after `const isJoining = userJoining || gameJoining || isJoiningLocal;` — it must sit ABOVE `handleGuess` (which needs it as a dependency) and therefore above the early returns, so it uses null-safe access on `gameState`:

```tsx
  // Turn indication only matters with 2+ players; solo play is always "your turn".
  const hasTurnRotation = (gameState?.players?.length ?? 0) >= 2;
  const isMyTurn = !hasTurnRotation || gameState?.currentPlayer === socket.id;
  const currentTurnPlayer = gameState?.players?.find(
    (p) => p.id === gameState?.currentPlayer
  );
```

2c. In the JSX, replace the keyboard block:

```tsx
          {/* Keyboard */}
          {isGameActive && (
            <LetterInput
              onGuess={handleGuess}
              guessedLetters={allGuessed}
              correctLetters={correctSet}
              incorrectLetters={incorrectSet}
            />
          )}
```

with the banner + disabled-aware keyboard:

```tsx
          {/* Turn banner + keyboard */}
          {isGameActive && hasTurnRotation && (
            <TurnBanner
              isMyTurn={isMyTurn}
              currentPlayerName={currentTurnPlayer?.name}
            />
          )}
          {isGameActive && (
            <LetterInput
              onGuess={handleGuess}
              disabled={!isMyTurn}
              guessedLetters={allGuessed}
              correctLetters={correctSet}
              incorrectLetters={incorrectSet}
            />
          )}
```

2d. Pass the turn player to the sidebar. In the `<UserList ... />` usage, add the prop:

```tsx
            currentUserId={currentUser?.id}
            currentTurnPlayerId={
              hasTurnRotation && isGameActive ? gameState.currentPlayer : undefined
            }
```

2e. Guard the guess handler so an out-of-turn keypress can't even emit. Replace `handleGuess`:

```tsx
  const handleGuess = useCallback(
    (letter: string): void => {
      if (isGameActive && isConnected) {
        actions.guessLetter(letter);
      }
    },
    [isGameActive, isConnected, actions]
  );
```

with:

```tsx
  const handleGuess = useCallback(
    (letter: string): void => {
      if (isGameActive && isConnected && isMyTurn) {
        actions.guessLetter(letter);
      }
    },
    [isGameActive, isConnected, isMyTurn, actions]
  );
```

(This works because 2b placed the turn consts above `handleGuess`.)

- [ ] **Step 3: Typecheck, run the full client suite**

Run: `cd client && npx tsc -b && npx vitest run`
Expected: typecheck clean; ALL client tests pass.

- [ ] **Step 4: Lint and commit**

```bash
cd client && npm run lint && cd ..
git add client/src/components/MultiplayerHangGuy.tsx client/src/components/LetterInput.tsx
git commit -m "feat: show turn banner and disable keyboard when not your turn"
```

---

### Task 5: Two-player e2e test

**Files:**
- Create: `client/e2e/turns.spec.ts`
- Modify: `client/playwright.config.ts`

**Interfaces:**
- Consumes: `data-testid="turn-banner"` from Task 2; keyboard buttons' `aria-label="Guess letter X"` (existing); join dialog `#nickname-input` (existing); the real Socket.IO server on port 3001.
- Produces: e2e coverage; playwright config that also boots the game server.

- [ ] **Step 1: Boot the game server in playwright and keep turn tests off the mobile project**

In `client/playwright.config.ts`:

1a. Replace the `webServer` object with an array that also starts the backend (the game server keeps global state, so e2e needs a real one; `CORS_ORIGIN` must allow the vite origin):

```ts
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
    {
      command: 'npm run dev --prefix ../server',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
      env: { CORS_ORIGIN: 'http://localhost:5173' },
    },
  ],
```

1b. The server holds one shared game, so running the turn test from two projects at once would have 4 players in one room. Exclude it from the `mobile` project by adding `testIgnore` to that project:

```ts
    {
      name: 'mobile',
      testIgnore: /turns/,
      use: {
        ...devices['Pixel 5'],
        executablePath: '/usr/bin/chromium',
      },
    },
```

- [ ] **Step 2: Write the e2e test**

Create `client/e2e/turns.spec.ts`:

```ts
import { test, expect, type Page } from '@playwright/test';

const T = 10_000;

async function joinAs(page: Page, name: string) {
  await page.goto('/');
  await page.locator('[role="dialog"]').waitFor({ timeout: T });
  await page.fill('#nickname-input', name);
  await page.locator('button[type="submit"]').click();
  // Joined once the game panel (players sidebar) renders
  await expect(page.getByRole('button', { name: /players/i })).toBeVisible({ timeout: T });
}

test('turn banner rotates between two players', async ({ browser }) => {
  const ctx1 = await browser.newContext();
  const ctx2 = await browser.newContext();
  const alice = await ctx1.newPage();
  const bob = await ctx2.newPage();

  await joinAs(alice, 'Alice');

  // Solo: no turn banner
  await expect(alice.locator('[data-testid="turn-banner"]')).toHaveCount(0);

  await joinAs(bob, 'Bob');

  // Reset to a known state: fresh word, no guessed letters, turn -> Alice
  await bob.getByRole('button', { name: /^(new game|play again|try again)$/i }).click();

  const aliceBanner = alice.locator('[data-testid="turn-banner"]');
  const bobBanner = bob.locator('[data-testid="turn-banner"]');

  await expect(aliceBanner).toContainText(/your turn/i, { timeout: T });
  await expect(bobBanner).toContainText(/waiting for alice/i, { timeout: T });

  // Bob's keyboard is disabled while waiting
  await expect(
    bob.getByRole('button', { name: 'Guess letter Q' })
  ).toBeDisabled();

  // Alice guesses; the turn swaps
  await alice.getByRole('button', { name: 'Guess letter Q' }).click();

  await expect(bobBanner).toContainText(/your turn/i, { timeout: T });
  await expect(aliceBanner).toContainText(/waiting for bob/i, { timeout: T });

  await ctx1.close();
  await ctx2.close();
});
```

- [ ] **Step 3: Run the e2e test**

Run: `cd client && npx playwright test e2e/turns.spec.ts --project=chromium`
Expected: 1 passed. (Playwright boots vite on 5173 and the game server on 3001 via the webServer array. If a stale dev server is already running on either port with different env, stop it first — `reuseExistingServer` would otherwise pick it up.)

- [ ] **Step 4: Run the full e2e suite to check nothing regressed**

Run: `cd client && npx playwright test`
Expected: all e2e tests pass on both projects (turns.spec skipped on mobile).

- [ ] **Step 5: Commit**

```bash
git add client/e2e/turns.spec.ts client/playwright.config.ts
git commit -m "test: e2e coverage for turn rotation between two players"
```

---

### Task 6: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run everything from the repo root**

```bash
npm test && npm run lint
```

Expected: client + server unit tests all pass; lint clean in both workspaces.

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: `tsc -b` and vite build succeed with no errors.
