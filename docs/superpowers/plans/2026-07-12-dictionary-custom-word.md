# Rich Dictionary + Custom Word Rounds Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the word dictionary to 10 categories (~400 words) and let a player set a secret custom word that the others guess while the setter spectates.

**Architecture:** The dictionary lives only in `shared/wordSelection.ts` (the client's `utils/wordSelection.ts` is a re-export). Custom rounds extend the existing `hangman:new-game` event with `customWord?: string`; the server validates it with a shared `validateCustomWord` helper, records `wordSetter` in `GameStateEvent`, and the turn rotation from the turn-indicator feature skips the setter. Client: word entry in the existing Customize panel, spectator state in the TurnBanner slot, "Word" badge in UserList.

**Tech Stack:** TypeScript (strict, ESM), Node + Socket.IO server, React 19 + Vite client, Vitest, Playwright. Mono·Lime theme tokens (`bg-accent`, `text-accent-ink`, `border-line`, `text-muted`, `text-bad`, `font-mono`, uppercase tracking).

**Spec:** `docs/superpowers/specs/2026-07-12-dictionary-custom-word-design.md`

## Global Constraints

- No new dependencies.
- Dictionary rules: every word UPPERCASE, matches `/^[A-Z]{3,20}$/`, no duplicates within a category, ≥10 categories, ≥25 words per category.
- Custom-word validation (shared, server-authoritative): trim + uppercase, then 3–20 chars and A–Z only. Error messages exactly: `Word must be 3-20 letters long` and `Word may only contain letters A-Z`. Error codes exactly: `INVALID_CUSTOM_WORD`, `NOT_ENOUGH_PLAYERS` (message: `You need at least one other player to guess your word`).
- The custom word must NEVER appear in any payload sent to clients while the game is playing (beware `lastAction.data`).
- Spectator banner copy exactly: `You set the word — watching the others guess`. UserList badge text `Word`, accessible name `Word setter`.
- The setter is excluded from turn rotation; a normal new game clears `wordSetter`; the round continues if the setter leaves; if only the setter remains there is no current player.
- Match existing code style; commands run from repo root `/var/home/tomasis/Documents/hangguy-game` unless a `cd` is shown.

---

### Task 1: Dictionary expansion + integrity test

**Files:**
- Modify: `shared/wordSelection.ts` (the `WORD_CATEGORIES` array only)
- Test: `client/src/utils/wordSelection.test.ts` (create)

**Interfaces:**
- Consumes: existing `WordCategory`, `WORD_CATEGORIES`, `ALL_WORDS` exports (shapes unchanged).
- Produces: 10 categories, ~400 words. Category names later shown as chips: `Programming`, `Animals`, `Countries`, `Food`, `Sports`, `Science`, `Nature`, `Occupations`, `Music`, `Transportation`.

- [ ] **Step 1: Write the failing test**

Create `client/src/utils/wordSelection.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { WORD_CATEGORIES, ALL_WORDS } from './wordSelection';

describe('word dictionary integrity', () => {
  it('has at least 10 categories with at least 25 words each', () => {
    expect(WORD_CATEGORIES.length).toBeGreaterThanOrEqual(10);
    for (const category of WORD_CATEGORIES) {
      expect(category.words.length).toBeGreaterThanOrEqual(25);
    }
  });

  it('contains only uppercase A-Z words of length 3-20', () => {
    for (const word of ALL_WORDS) {
      expect(word).toMatch(/^[A-Z]{3,20}$/);
    }
  });

  it('has no duplicate words within a category', () => {
    for (const category of WORD_CATEGORIES) {
      expect(new Set(category.words).size).toBe(category.words.length);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd client && npx vitest run src/utils/wordSelection.test.ts`
Expected: FAIL — only 4 categories exist.

- [ ] **Step 3: Replace the WORD_CATEGORIES array**

In `shared/wordSelection.ts`, replace the entire `WORD_CATEGORIES` array (keep the `WordCategory` interface and everything after the array unchanged) with:

```ts
// Word lists organized by categories. Rules (enforced by
// client/src/utils/wordSelection.test.ts): UPPERCASE, A-Z only,
// 3-20 letters, no duplicates within a category.
export const WORD_CATEGORIES: WordCategory[] = [
  {
    name: 'Programming',
    words: [
      'JAVASCRIPT', 'TYPESCRIPT', 'REACT', 'WEBSOCKET', 'COMPUTER',
      'PROGRAMMING', 'DEVELOPER', 'FRONTEND', 'BACKEND', 'DATABASE',
      'ALGORITHM', 'FUNCTION', 'VARIABLE', 'COMPONENT', 'INTERFACE',
      'DEBUGGING', 'FRAMEWORK', 'LIBRARY', 'PACKAGE', 'TERMINAL',
      'COMPILER', 'INTERPRETER', 'SYNTAX', 'SEMANTIC', 'BOOLEAN',
      'ARRAY', 'OBJECT', 'STRING', 'NUMBER', 'CALLBACK',
      'PROMISE', 'CLOSURE', 'RECURSION', 'ITERATOR', 'MUTATION',
      'TEMPLATE', 'MODULE', 'BUNDLER', 'ROUTER', 'SERVER'
    ]
  },
  {
    name: 'Animals',
    words: [
      'ELEPHANT', 'GIRAFFE', 'TIGER', 'PENGUIN', 'DOLPHIN',
      'BUTTERFLY', 'KANGAROO', 'OCTOPUS', 'RHINOCEROS', 'CHEETAH',
      'FLAMINGO', 'HIPPOPOTAMUS', 'CROCODILE', 'PEACOCK', 'KOALA',
      'PANDA', 'ZEBRA', 'GORILLA', 'LEOPARD', 'OSTRICH',
      'PELICAN', 'RACCOON', 'SQUIRREL', 'HEDGEHOG', 'TORTOISE',
      'CHAMELEON', 'ARMADILLO', 'WOLVERINE', 'MONGOOSE', 'PORCUPINE',
      'ANTELOPE', 'BUFFALO', 'WALRUS', 'LOBSTER', 'JELLYFISH',
      'SEAHORSE', 'FALCON', 'SPARROW', 'TOUCAN', 'IGUANA'
    ]
  },
  {
    name: 'Countries',
    words: [
      'AUSTRALIA', 'BRAZIL', 'CANADA', 'DENMARK', 'EGYPT',
      'FRANCE', 'GERMANY', 'HUNGARY', 'ICELAND', 'JAPAN',
      'KAZAKHSTAN', 'LUXEMBOURG', 'MADAGASCAR', 'NETHERLANDS', 'PORTUGAL',
      'ARGENTINA', 'BELGIUM', 'COLOMBIA', 'ECUADOR', 'FINLAND',
      'GREECE', 'INDONESIA', 'IRELAND', 'ITALY', 'JAMAICA',
      'KENYA', 'LITHUANIA', 'MEXICO', 'MOROCCO', 'NIGERIA',
      'NORWAY', 'PAKISTAN', 'PHILIPPINES', 'POLAND', 'SINGAPORE',
      'SLOVAKIA', 'SWEDEN', 'SWITZERLAND', 'THAILAND', 'VIETNAM'
    ]
  },
  {
    name: 'Food',
    words: [
      'PIZZA', 'HAMBURGER', 'SPAGHETTI', 'CHOCOLATE', 'STRAWBERRY',
      'PINEAPPLE', 'SANDWICH', 'PANCAKE', 'BROCCOLI', 'AVOCADO',
      'WATERMELON', 'CROISSANT', 'LASAGNA', 'SMOOTHIE', 'PRETZEL',
      'BURRITO', 'CHEESECAKE', 'DUMPLING', 'ESPRESSO', 'FALAFEL',
      'GRANOLA', 'HUMMUS', 'KETCHUP', 'MEATBALL', 'NOODLES',
      'OATMEAL', 'OMELETTE', 'PAELLA', 'POPCORN', 'QUICHE',
      'RAVIOLI', 'RISOTTO', 'SALAD', 'SUSHI', 'TACO',
      'TIRAMISU', 'WAFFLE', 'YOGURT', 'ZUCCHINI', 'MUFFIN'
    ]
  },
  {
    name: 'Sports',
    words: [
      'SOCCER', 'BASKETBALL', 'TENNIS', 'VOLLEYBALL', 'BASEBALL',
      'CRICKET', 'RUGBY', 'HOCKEY', 'GOLF', 'BOXING',
      'WRESTLING', 'SWIMMING', 'DIVING', 'ROWING', 'SAILING',
      'SURFING', 'SKIING', 'SNOWBOARD', 'SKATING', 'CYCLING',
      'MARATHON', 'SPRINT', 'HURDLES', 'JAVELIN', 'DISCUS',
      'ARCHERY', 'FENCING', 'KARATE', 'JUDO', 'TAEKWONDO',
      'BADMINTON', 'SQUASH', 'HANDBALL', 'LACROSSE', 'SOFTBALL',
      'BOWLING', 'BILLIARDS', 'DARTS', 'GYMNASTICS', 'TRIATHLON'
    ]
  },
  {
    name: 'Science',
    words: [
      'ATOM', 'MOLECULE', 'ELECTRON', 'PROTON', 'NEUTRON',
      'GRAVITY', 'ENERGY', 'PHOTON', 'QUANTUM', 'GALAXY',
      'NEBULA', 'ASTEROID', 'COMET', 'ECLIPSE', 'ORBIT',
      'TELESCOPE', 'MICROSCOPE', 'CHEMISTRY', 'PHYSICS', 'BIOLOGY',
      'GEOLOGY', 'ASTRONOMY', 'EVOLUTION', 'GENETICS', 'BACTERIA',
      'VIRUS', 'ENZYME', 'PROTEIN', 'NEURON', 'SYNAPSE',
      'MAGNETISM', 'FRICTION', 'VELOCITY', 'MOMENTUM', 'PRESSURE',
      'TEMPERATURE', 'CATALYST', 'ISOTOPE', 'PENDULUM', 'SPECTRUM'
    ]
  },
  {
    name: 'Nature',
    words: [
      'MOUNTAIN', 'VALLEY', 'RIVER', 'OCEAN', 'DESERT',
      'FOREST', 'JUNGLE', 'GLACIER', 'VOLCANO', 'CANYON',
      'WATERFALL', 'MEADOW', 'PRAIRIE', 'TUNDRA', 'SAVANNA',
      'LAGOON', 'ISLAND', 'PENINSULA', 'CLIFF', 'CAVE',
      'THUNDER', 'LIGHTNING', 'RAINBOW', 'BLIZZARD', 'HURRICANE',
      'TORNADO', 'MONSOON', 'DRIZZLE', 'SUNRISE', 'SUNSET',
      'HORIZON', 'BREEZE', 'AVALANCHE', 'EARTHQUAKE', 'GEYSER',
      'MARSH', 'SWAMP', 'DUNE', 'REEF', 'ARCHIPELAGO'
    ]
  },
  {
    name: 'Occupations',
    words: [
      'TEACHER', 'DOCTOR', 'NURSE', 'ENGINEER', 'ARCHITECT',
      'LAWYER', 'PLUMBER', 'ELECTRICIAN', 'CARPENTER', 'MECHANIC',
      'PILOT', 'SAILOR', 'FARMER', 'BAKER', 'BUTCHER',
      'CHEF', 'WAITER', 'BARISTA', 'LIBRARIAN', 'SCIENTIST',
      'JOURNALIST', 'PHOTOGRAPHER', 'MUSICIAN', 'PAINTER', 'SCULPTOR',
      'ACTOR', 'DIRECTOR', 'PRODUCER', 'DENTIST', 'SURGEON',
      'PHARMACIST', 'VETERINARIAN', 'ACCOUNTANT', 'BANKER', 'CASHIER',
      'JANITOR', 'GARDENER', 'TAILOR', 'BLACKSMITH', 'FIREFIGHTER'
    ]
  },
  {
    name: 'Music',
    words: [
      'GUITAR', 'PIANO', 'VIOLIN', 'CELLO', 'TRUMPET',
      'TROMBONE', 'SAXOPHONE', 'CLARINET', 'FLUTE', 'OBOE',
      'BASSOON', 'HARP', 'DRUMS', 'CYMBAL', 'TAMBOURINE',
      'XYLOPHONE', 'ACCORDION', 'HARMONICA', 'BANJO', 'MANDOLIN',
      'UKULELE', 'ORGAN', 'SYNTHESIZER', 'MELODY', 'HARMONY',
      'RHYTHM', 'TEMPO', 'CHORUS', 'VERSE', 'OCTAVE',
      'CHORD', 'SCALE', 'SOPRANO', 'BARITONE', 'ORCHESTRA',
      'SYMPHONY', 'CONCERTO', 'SONATA', 'BALLAD', 'ANTHEM'
    ]
  },
  {
    name: 'Transportation',
    words: [
      'BICYCLE', 'MOTORCYCLE', 'AUTOMOBILE', 'TRUCK', 'TRACTOR',
      'BUS', 'TRAIN', 'SUBWAY', 'TRAM', 'TROLLEY',
      'FERRY', 'YACHT', 'CANOE', 'KAYAK', 'GONDOLA',
      'SUBMARINE', 'HELICOPTER', 'AIRPLANE', 'GLIDER', 'BALLOON',
      'ROCKET', 'SHUTTLE', 'SCOOTER', 'SKATEBOARD', 'RICKSHAW',
      'CARRIAGE', 'WAGON', 'SLED', 'SNOWMOBILE', 'HOVERCRAFT',
      'ZEPPELIN', 'FREIGHTER', 'TANKER', 'BARGE', 'LIMOUSINE',
      'AMBULANCE', 'TAXI', 'VAN', 'JEEP', 'CONVOY'
    ]
  }
];
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/utils/wordSelection.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Run the full suites (both workspaces use this data)**

Run: `cd client && npx vitest run && cd ../server && npx vitest run`
Expected: ALL pass (existing tests select from the dictionary and are length/category-agnostic).

- [ ] **Step 6: Commit**

```bash
git add shared/wordSelection.ts client/src/utils/wordSelection.test.ts
git commit -m "feat: expand word dictionary to 10 categories"
```

---

### Task 2: Shared validateCustomWord + protocol types

**Files:**
- Modify: `shared/wordSelection.ts` (append helper), `shared/types.ts`, `client/src/utils/wordSelection.ts` (re-export)
- Test: `client/src/utils/wordSelection.test.ts` (append)

**Interfaces:**
- Consumes: nothing new.
- Produces (later tasks depend on these exact shapes):

```ts
export type CustomWordValidation =
  | { valid: true; word: string }
  | { valid: false; reason: string };
export function validateCustomWord(input: string): CustomWordValidation;
```

`shared/types.ts`: `hangman:new-game` data gains `customWord?: string`; `GameStateEvent` gains `wordSetter?: string`.

- [ ] **Step 1: Write the failing tests**

Append to `client/src/utils/wordSelection.test.ts` (top-level, after the dictionary describe). Also add `validateCustomWord` to the import from `'./wordSelection'`:

```ts
describe('validateCustomWord', () => {
  it('accepts a valid word and normalizes it', () => {
    expect(validateCustomWord('  banana ')).toEqual({ valid: true, word: 'BANANA' });
  });

  it('rejects words shorter than 3 or longer than 20 letters', () => {
    expect(validateCustomWord('ab')).toEqual({
      valid: false,
      reason: 'Word must be 3-20 letters long',
    });
    expect(validateCustomWord('A'.repeat(21))).toEqual({
      valid: false,
      reason: 'Word must be 3-20 letters long',
    });
  });

  it('rejects non-letter characters', () => {
    for (const bad of ['abc1', 'two words', 'well-known', 'café']) {
      expect(validateCustomWord(bad)).toEqual({
        valid: false,
        reason: 'Word may only contain letters A-Z',
      });
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd client && npx vitest run src/utils/wordSelection.test.ts`
Expected: FAIL — `validateCustomWord` is not exported.

- [ ] **Step 3: Implement the helper and types**

3a. Append to `shared/wordSelection.ts` (after `getAvailableCategories`):

```ts
// ─── Custom word validation (shared by client UI and server enforcement) ────

export type CustomWordValidation =
  | { valid: true; word: string }
  | { valid: false; reason: string };

/**
 * Validates and normalizes a player-supplied custom word.
 * The server is authoritative; the client uses this for inline feedback.
 */
export function validateCustomWord(input: string): CustomWordValidation {
  const word = input.trim().toUpperCase();
  if (word.length < 3 || word.length > 20) {
    return { valid: false, reason: "Word must be 3-20 letters long" };
  }
  if (!/^[A-Z]+$/.test(word)) {
    return { valid: false, reason: "Word may only contain letters A-Z" };
  }
  return { valid: true, word };
}
```

3b. In `client/src/utils/wordSelection.ts`, add `validateCustomWord,` to the value re-export list and append to the type re-export:

```ts
export type { WordCategory, CustomWordValidation } from "../../../shared/wordSelection";
```

3c. In `shared/types.ts`:
- In `GameStateEvent`, after `currentPlayer?: string;` add:

```ts
  wordSetter?: string;
```

- In the `hangman:new-game` event signature, add `customWord?: string;` so it reads:

```ts
  "hangman:new-game": (data: {
    category?: string;
    difficulty?: "easy" | "medium" | "hard";
    customWord?: string;
    startedBy: string;
  }) => void;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/utils/wordSelection.test.ts && npx tsc -b`
Expected: PASS (6 tests), typecheck clean.

- [ ] **Step 5: Commit**

```bash
git add shared/wordSelection.ts shared/types.ts client/src/utils/wordSelection.ts client/src/utils/wordSelection.test.ts
git commit -m "feat: add shared custom-word validation and protocol types"
```

---

### Task 3: Server custom word rounds

**Files:**
- Modify: `server/src/gameManager.ts`, `server/src/broadcastHandlers.ts`
- Test: `server/src/gameManager.test.ts`

**Interfaces:**
- Consumes: `validateCustomWord` from `../../shared/wordSelection.ts` (Task 2), `customWord`/`wordSetter` types (Task 2), existing turn fields `turnOrder`/`currentTurnIndex` and methods `getCurrentPlayerId()`/`advanceTurn()`.
- Produces: `startNewGame(options?: { category?; difficulty?; customWord?: string }, startedBy?: string)` — when `customWord` is set, uses it as the word and records the setter; `getGameState()` includes `wordSetter`; rotation skips the setter; `hangman:new-game` handler validates and emits `INVALID_CUSTOM_WORD` / `NOT_ENOUGH_PLAYERS`.

- [ ] **Step 1: Write the failing tests**

Append inside the top-level `describe('GameManager', ...)` in `server/src/gameManager.test.ts`:

```ts
  describe('custom word rounds', () => {
    it('uses the custom word, records the setter, and keeps the word masked', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');

      const state = gameManager.startNewGame({ customWord: 'BANANA' }, 'p1');

      expect(state.wordSetter).toBe('p1');
      expect(state.displayWord).toBe('______');
      expect(state.word).toBe('');
    });

    it('never leaks the custom word through lastAction', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');

      const state = gameManager.startNewGame({ customWord: 'BANANA' }, 'p1');

      expect(JSON.stringify(state.lastAction)).not.toContain('BANANA');
    });

    it('skips the setter in turn rotation', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');
      gameManager.addPlayer('p3', 'Cara');
      gameManager.startNewGame({ customWord: 'BANANA' }, 'p1');

      expect(gameManager.getGameState().currentPlayer).toBe('p2');
      gameManager.processGuess('X', 'p2');
      expect(gameManager.getGameState().currentPlayer).toBe('p3');
      gameManager.processGuess('Y', 'p3');
      // Wraps around, skipping the setter p1
      expect(gameManager.getGameState().currentPlayer).toBe('p2');
    });

    it('keeps the turn on the single guesser in a 2-player round', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');
      gameManager.startNewGame({ customWord: 'BANANA' }, 'p1');

      gameManager.processGuess('X', 'p2');
      expect(gameManager.getGameState().currentPlayer).toBe('p2');
      gameManager.processGuess('Y', 'p2');
      expect(gameManager.getGameState().currentPlayer).toBe('p2');
    });

    it('rejects a guess from the setter', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');
      gameManager.startNewGame({ customWord: 'BANANA' }, 'p1');

      const result = gameManager.processGuess('B', 'p1');

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('NOT_YOUR_TURN');
    });

    it('continues the round when the setter leaves', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');
      gameManager.addPlayer('p3', 'Cara');
      gameManager.startNewGame({ customWord: 'BANANA' }, 'p1');

      gameManager.removePlayer('p1');

      expect(gameManager.getGameState().currentPlayer).toBe('p2');
      expect(gameManager.processGuess('X', 'p2').success).toBe(true);
      expect(gameManager.getGameState().currentPlayer).toBe('p3');
    });

    it('stalls safely when only the setter remains', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');
      gameManager.startNewGame({ customWord: 'BANANA' }, 'p1');

      gameManager.removePlayer('p2');

      expect(gameManager.getGameState().currentPlayer).toBeUndefined();
      expect(gameManager.processGuess('B', 'p1').success).toBe(false);
    });

    it('clears the setter on a normal new game', () => {
      gameManager.addPlayer('p1', 'Alice');
      gameManager.addPlayer('p2', 'Bob');
      gameManager.startNewGame({ customWord: 'BANANA' }, 'p1');

      const state = gameManager.startNewGame(undefined, 'p2');

      expect(state.wordSetter).toBeUndefined();
      expect(gameManager.getGameState().currentPlayer).toBe('p1');
    });
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npx vitest run src/gameManager.test.ts`
Expected: the new `custom word rounds` tests FAIL (`wordSetter` undefined everywhere, rotation lands on p1). Pre-existing tests still pass.

- [ ] **Step 3: Implement in GameManager**

In `server/src/gameManager.ts`:

3a. Add a field after `private currentTurnIndex = 0;`:

```ts
  // Set while a custom-word round is active: the setter spectates.
  private wordSetter?: string;
```

3b. Replace `getCurrentPlayerId()` and `advanceTurn()` with setter-skipping versions:

```ts
  getCurrentPlayerId(): string | undefined {
    if (this.turnOrder.length === 0) {
      return undefined;
    }
    // Walk forward from the pointer to the first eligible (non-setter) player.
    for (let i = 0; i < this.turnOrder.length; i++) {
      const idx = (this.currentTurnIndex + i) % this.turnOrder.length;
      if (this.turnOrder[idx] !== this.wordSetter) {
        return this.turnOrder[idx];
      }
    }
    return undefined; // only the setter remains
  }

  private advanceTurn(): void {
    if (this.turnOrder.length === 0) {
      this.currentTurnIndex = 0;
      return;
    }
    const current = this.getCurrentPlayerId();
    if (current === undefined) {
      return;
    }
    const curIdx = this.turnOrder.indexOf(current);
    for (let i = 1; i <= this.turnOrder.length; i++) {
      const idx = (curIdx + i) % this.turnOrder.length;
      if (this.turnOrder[idx] !== this.wordSetter) {
        this.currentTurnIndex = idx;
        return;
      }
    }
  }
```

3c. Update `startNewGame` — new signature and word selection; also stop leaking options into `lastAction`. Replace the method's opening (down to and including `this.currentTurnIndex = 0;`) with:

```ts
  startNewGame(
    options?: {
      category?: string;
      difficulty?: "easy" | "medium" | "hard";
      customWord?: string;
    },
    startedBy?: string
  ): GameStateEvent {
    let word: string;
    if (options?.customWord) {
      word = options.customWord;
      this.wordSetter = startedBy;
    } else {
      this.wordSetter = undefined;
      if (options?.category) {
        try { word = getRandomWordFromCategory(options.category); }
        catch { word = getRandomWord(); }
      } else if (options?.difficulty) {
        word = getRandomWordByDifficulty(options.difficulty);
      } else {
        word = getRandomWord();
      }
    }
    this.game = new HangGuyGame(word);
    this.currentTurnIndex = 0;
```

and change the `lastAction` assignment in the same method so the secret never rides along (`data: options` today):

```ts
    this.lastAction = {
      type: "new_game",
      playerId: startedBy || "system",
      playerName: player?.name || "System",
      timestamp: Date.now(),
      data: {
        category: options?.category,
        difficulty: options?.difficulty,
        isCustomWord: Boolean(options?.customWord),
      },
    };
```

3d. In `getGameState()`, after `currentPlayer: this.getCurrentPlayerId(),` add:

```ts
      wordSetter: this.wordSetter,
```

- [ ] **Step 4: Wire validation into the new-game handler**

In `server/src/broadcastHandlers.ts`:

4a. Extend the shared import:

```ts
import { HANGMAN_ROOM, generateGuestName } from "../../shared/multiplayer.ts";
import { validateCustomWord } from "../../shared/wordSelection.ts";
```

4b. In the `socket.on("hangman:new-game", (data) => {` handler, after the `if (!player) { ... return; }` block and before `try {`, insert:

```ts
    if (data?.customWord !== undefined) {
      const validation = validateCustomWord(String(data.customWord));
      if (!validation.valid) {
        emitError(socket, validation.reason, "INVALID_CUSTOM_WORD");
        return;
      }
      if (gameManager.getPlayerCount() < 2) {
        emitError(
          socket,
          "You need at least one other player to guess your word",
          "NOT_ENOUGH_PLAYERS"
        );
        return;
      }
      data = { ...data, customWord: validation.word };
    }
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd server && npx vitest run`
Expected: ALL pass (existing turn-management tests must remain green — the rewritten `getCurrentPlayerId`/`advanceTurn` behave identically when `wordSetter` is undefined).

- [ ] **Step 6: Lint and commit**

```bash
cd server && npm run lint && cd ..
git add server/src/gameManager.ts server/src/gameManager.test.ts server/src/broadcastHandlers.ts
git commit -m "feat: server-side custom word rounds with spectating setter"
```

---

### Task 4: Custom word entry in GameControls

**Files:**
- Modify: `client/src/components/GameControls.tsx`, `client/src/components/MultiplayerHangGuy.tsx` (two small prop/type changes), `client/src/hooks/useMultiplayerGame.ts` (options type)
- Test: `client/src/components/GameControls.test.tsx` (create)

**Interfaces:**
- Consumes: `validateCustomWord` from `../utils/wordSelection` (Task 2).
- Produces: `GameControlsProps.onNewGame` options gain `customWord?: string`; new required prop `playerCount: number`. Input accessible name exactly `Set your own word`; start button text exactly `Start with my word` (Task 6's e2e selects on these).

- [ ] **Step 1: Write the failing test**

Create `client/src/components/GameControls.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameControls } from './GameControls';

describe('GameControls custom word', () => {
  const setup = (playerCount = 2) => {
    const onNewGame = vi.fn();
    render(
      <GameControls onNewGame={onNewGame} gameStatus="playing" playerCount={playerCount} />
    );
    fireEvent.click(screen.getByRole('button', { name: /customize game/i }));
    return { onNewGame };
  };

  it('starts a round with a valid custom word and clears the input', () => {
    const { onNewGame } = setup();
    const input = screen.getByLabelText('Set your own word') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'banana' } });
    fireEvent.click(screen.getByRole('button', { name: /start with my word/i }));

    expect(onNewGame).toHaveBeenCalledWith({ customWord: 'BANANA' });
    expect(input.value).toBe('');
  });

  it('shows a validation message and disables start for an invalid word', () => {
    setup();

    fireEvent.change(screen.getByLabelText('Set your own word'), {
      target: { value: 'ab1' },
    });

    expect(screen.getByRole('alert')).toHaveTextContent(/letters/i);
    expect(screen.getByRole('button', { name: /start with my word/i })).toBeDisabled();
  });

  it('disables hosting with fewer than 2 players', () => {
    setup(1);

    fireEvent.change(screen.getByLabelText('Set your own word'), {
      target: { value: 'banana' },
    });

    expect(screen.getByRole('button', { name: /start with my word/i })).toBeDisabled();
    expect(screen.getByText(/at least one other player/i)).toBeInTheDocument();
  });

  it('masks the word by default and toggles visibility', () => {
    setup();
    const input = screen.getByLabelText('Set your own word');

    expect(input).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: /show word/i }));
    expect(input).toHaveAttribute('type', 'text');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd client && npx vitest run src/components/GameControls.test.tsx`
Expected: FAIL — `playerCount` prop and the input don't exist.

- [ ] **Step 3: Implement in GameControls**

In `client/src/components/GameControls.tsx`:

3a. Add the import:

```tsx
import { getAvailableCategories, validateCustomWord } from '../utils/wordSelection';
```

3b. Extend the props interface (options type + new required prop):

```tsx
interface GameControlsProps {
  onNewGame: (options?: {
    category?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    customWord?: string;
  }) => void;
  gameStatus: 'playing' | 'won' | 'lost';
  disabled?: boolean;
  playerCount: number;
}
```

and destructure it: `({ onNewGame, gameStatus, disabled = false, playerCount })`.

3c. Add state + handler after the existing `useState` calls:

```tsx
  const [customWord, setCustomWord] = useState('');
  const [showWord, setShowWord] = useState(false);

  const customValidation = validateCustomWord(customWord);
  const canHostWord = customValidation.valid && playerCount >= 2;

  const handleCustomWordStart = () => {
    if (!customValidation.valid) {return;}
    onNewGame({ customWord: customValidation.word });
    setCustomWord('');
    setShowOptions(false);
  };
```

3d. Inside the options panel, after the Difficulty `</div>` and before the "Start custom" button, add the section:

```tsx
          {/* Set your own word */}
          <div>
            <p className="font-mono text-[11px] font-semibold mb-3 uppercase tracking-[0.14em] text-muted">
              Set your own word
            </p>
            <div className="flex gap-2">
              <input
                id="custom-word-input"
                type={showWord ? 'text' : 'password'}
                value={customWord}
                onChange={e => setCustomWord(e.target.value)}
                placeholder="Secret word (3-20 letters)"
                autoComplete="off"
                maxLength={20}
                aria-label="Set your own word"
                className="flex-1 min-w-0 font-mono text-sm px-3 py-2.5 border-[1.5px] border-line bg-surface text-ink"
              />
              <button
                type="button"
                onClick={() => setShowWord(v => !v)}
                aria-label={showWord ? 'Hide word' : 'Show word'}
                className="font-mono text-xs font-semibold uppercase tracking-[0.04em] px-3 border-[1.5px] border-line text-muted transition-colors hover:text-ink"
              >
                {showWord ? 'Hide' : 'Show'}
              </button>
            </div>
            {customWord.trim() !== '' && !customValidation.valid && (
              <p role="alert" className="font-mono text-xs mt-2 text-bad">
                {customValidation.reason}
              </p>
            )}
            {playerCount < 2 && (
              <p className="font-mono text-xs mt-2 text-muted">
                You need at least one other player to guess your word
              </p>
            )}
            <button
              onClick={handleCustomWordStart}
              disabled={disabled || !canHostWord}
              className="w-full mt-3 font-mono text-[13px] font-bold uppercase tracking-[0.04em] py-3 bg-accent text-accent-ink transition-[filter] hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Start with my word
            </button>
          </div>
```

Note the union narrowing: `customValidation.reason` is only accessed inside the `!customValidation.valid` branch and `customValidation.word` only after the `valid` check — TypeScript needs exactly this structure.

- [ ] **Step 4: Thread the types and the playerCount prop**

4a. `client/src/hooks/useMultiplayerGame.ts` — extend `startNewGame`'s options type:

```ts
    startNewGame: (options?: {
      category?: string;
      difficulty?: "easy" | "medium" | "hard";
      customWord?: string;
    }) => {
```

4b. `client/src/components/MultiplayerHangGuy.tsx` — extend the local `GameOptions` interface:

```tsx
interface GameOptions {
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
  customWord?: string;
}
```

and pass the new prop where `GameControls` is rendered:

```tsx
          <GameControls
            gameStatus={gameState.status}
            onNewGame={handleNewGame}
            playerCount={gameState.players?.length ?? 0}
          />
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd client && npx tsc -b && npx vitest run`
Expected: typecheck clean; ALL client tests pass (4 new).

- [ ] **Step 6: Lint and commit**

```bash
cd client && npm run lint && cd ..
git add client/src/components/GameControls.tsx client/src/components/GameControls.test.tsx client/src/components/MultiplayerHangGuy.tsx client/src/hooks/useMultiplayerGame.ts
git commit -m "feat: custom word entry in the Customize panel"
```

---

### Task 5: Spectator view (banner, hidden keyboard, sidebar badge)

**Files:**
- Modify: `client/src/components/TurnBanner.tsx`, `client/src/components/UserList.tsx`, `client/src/components/MultiplayerHangGuy.tsx`
- Test: `client/src/components/TurnBanner.test.tsx`, `client/src/components/UserList.test.tsx` (append to both)

**Interfaces:**
- Consumes: `gameState.wordSetter` (Task 3), existing `TurnBanner`/`UserList` props.
- Produces: `TurnBanner` gains `spectating?: boolean` (renders exactly `You set the word — watching the others guess`); `UserList` gains `wordSetterId?: string` (badge text `Word`, accessible name `Word setter`).

- [ ] **Step 1: Write the failing tests**

Append to the describe in `client/src/components/TurnBanner.test.tsx`:

```tsx
  it('shows the spectator message for the word setter', () => {
    render(<TurnBanner isMyTurn={false} spectating={true} />);

    expect(screen.getByRole('status')).toHaveTextContent(/you set the word/i);
  });
```

Append to the describe in `client/src/components/UserList.test.tsx`:

```tsx
  it('badges the word setter', () => {
    render(<UserList users={users} currentUserId="p2" wordSetterId="p1" />);

    const badge = screen.getByLabelText('Word setter');
    expect(badge).toHaveTextContent('Word');
    expect(badge.closest('li')).toHaveTextContent('Alice');
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run src/components/TurnBanner.test.tsx src/components/UserList.test.tsx`
Expected: FAIL — unknown props.

- [ ] **Step 3: Implement TurnBanner spectator state**

Replace the body of `client/src/components/TurnBanner.tsx` with:

```tsx
import React from "react";

interface TurnBannerProps {
  isMyTurn: boolean;
  currentPlayerName?: string;
  spectating?: boolean;
}

// Announces whose turn it is. Rendered only with 2+ players; the server
// enforces the turn — this banner is the visible half of that rule.
// `spectating` marks the custom-word setter, who sits the round out.
export const TurnBanner: React.FC<TurnBannerProps> = ({
  isMyTurn,
  currentPlayerName,
  spectating = false,
}) => {
  const active = isMyTurn && !spectating;
  const text = spectating
    ? "You set the word — watching the others guess"
    : active
      ? "▶ Your turn — pick a letter"
      : `Waiting for ${currentPlayerName ?? "next player"}…`;

  return (
    <div
      data-testid="turn-banner"
      role="status"
      aria-live="polite"
      className={`w-full max-w-2xl mx-auto text-center font-mono text-[13px] font-bold uppercase tracking-[0.08em] px-4 py-3 border-[1.5px] ${
        active
          ? "bg-accent text-accent-ink border-accent"
          : "bg-surface text-muted border-line"
      }`}
    >
      {text}
    </div>
  );
};
```

- [ ] **Step 4: Implement the UserList badge**

In `client/src/components/UserList.tsx`:

4a. Extend props and destructuring:

```tsx
interface UserListProps {
  users: User[];
  currentUserId?: string;
  currentTurnPlayerId?: string;
  wordSetterId?: string;
}
```

```tsx
export const UserList: React.FC<UserListProps> = ({
  users,
  currentUserId,
  currentTurnPlayerId,
  wordSetterId,
}) => {
```

4b. Inside `users.map`, after `const isCurrentTurn = ...` add:

```tsx
            const isWordSetter = user.id === wordSetterId;
```

4c. In the name row, after the existing `Turn` badge block, add:

```tsx
                    {isWordSetter && (
                      <span
                        aria-label="Word setter"
                        className="font-mono text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-[0.08em] border-[1.5px] border-line text-muted"
                      >
                        Word
                      </span>
                    )}
```

- [ ] **Step 5: Wire into MultiplayerHangGuy**

In `client/src/components/MultiplayerHangGuy.tsx`:

5a. After the `currentTurnPlayer` const, add:

```tsx
  const isWordSetter =
    isGameActive && gameState?.wordSetter === socket.id;
```

5b. Update the banner usage to pass the spectator flag:

```tsx
          {isGameActive && hasTurnRotation && (
            <TurnBanner
              isMyTurn={isMyTurn}
              currentPlayerName={currentTurnPlayer?.name}
              spectating={isWordSetter}
            />
          )}
```

5c. Hide the keyboard for the setter — change the keyboard condition from `{isGameActive && (` to:

```tsx
          {isGameActive && !isWordSetter && (
```

5d. Pass the badge prop to `UserList` (after `currentTurnPlayerId={...}`):

```tsx
            wordSetterId={isGameActive ? gameState.wordSetter : undefined}
```

- [ ] **Step 6: Run the full client suite**

Run: `cd client && npx tsc -b && npx vitest run`
Expected: typecheck clean; ALL tests pass.

- [ ] **Step 7: Lint and commit**

```bash
cd client && npm run lint && cd ..
git add client/src/components/TurnBanner.tsx client/src/components/TurnBanner.test.tsx client/src/components/UserList.tsx client/src/components/UserList.test.tsx client/src/components/MultiplayerHangGuy.tsx
git commit -m "feat: spectator view for the custom word setter"
```

---

### Task 6: E2E custom word round + full verification

**Files:**
- Modify: `client/e2e/turns.spec.ts`

**Interfaces:**
- Consumes: `Set your own word` input label + `Start with my word` button (Task 4), spectator banner copy (Task 5), `data-testid="turn-banner"`, keyboard `aria-label="Letter keyboard"`, guess buttons `aria-label="Guess letter X"`.

- [ ] **Step 1: Make the file serial and add the test**

1a. In `client/e2e/turns.spec.ts`, after the imports add:

```ts
// Both tests share the server's single game room — never run them in parallel.
test.describe.configure({ mode: 'serial' });
```

1b. Append the new test at the end of the file:

```ts
test('custom word round: setter spectates while the other player guesses', async ({ browser }) => {
  const ctx1 = await browser.newContext();
  const ctx2 = await browser.newContext();
  const alice = await ctx1.newPage();
  const bob = await ctx2.newPage();

  await joinAs(alice, 'Alice');
  await joinAs(bob, 'Bob');

  // Alice sets a secret word from the Customize panel
  await alice.getByRole('button', { name: /customize game/i }).click();
  await alice.getByLabel('Set your own word').fill('BANANA');
  await alice.getByRole('button', { name: /start with my word/i }).click();

  // Alice spectates: spectator banner, no keyboard
  await expect(alice.locator('[data-testid="turn-banner"]')).toContainText(
    /you set the word/i,
    { timeout: T }
  );
  await expect(alice.getByRole('group', { name: 'Letter keyboard' })).toHaveCount(0);

  // Bob is the only guesser, so it is always his turn
  await expect(bob.locator('[data-testid="turn-banner"]')).toContainText(/your turn/i, {
    timeout: T,
  });

  // Bob solves BANANA letter by letter (spaced to stay under the 2-guesses/sec rate limit)
  for (const letter of ['B', 'A', 'N']) {
    const key = bob.getByRole('button', { name: new RegExp(`^Guess letter ${letter}`) });
    await key.click();
    await expect(key).toBeDisabled({ timeout: T }); // guess acknowledged
    await bob.waitForTimeout(600);
  }

  // Both players see the win
  await expect(bob.getByText('You Won!').first()).toBeVisible({ timeout: T });
  await expect(alice.getByText('You Won!').first()).toBeVisible({ timeout: T });

  await ctx1.close();
  await ctx2.close();
});
```

- [ ] **Step 2: Run the new test**

Run: `cd client && npx playwright test e2e/turns.spec.ts --project=chromium`
Expected: 2 passed (the existing rotation test + the new custom-word test, serially). Note: if a dev vite/game-server pair is already running from manual testing, playwright reuses it — that's fine as long as it was started with `VITE_SERVER_URL=http://localhost:3011` / `PORT=3011` (see the comment in playwright.config.ts).

- [ ] **Step 3: Full verification from the repo root**

```bash
npm test && npm run lint && npm run build
cd client && npx playwright test
```

Expected: all unit tests pass in both workspaces, lint clean, build clean, full e2e suite green (turns specs run serially on chromium, ignored on mobile).

- [ ] **Step 4: Commit**

```bash
git add client/e2e/turns.spec.ts
git commit -m "test: e2e coverage for custom word rounds"
```
