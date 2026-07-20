import { HangGuyGame } from "../../shared/gameLogic.ts";
import {
  GameStateEvent,
  PlayerInfo,
  GameAction,
} from "../../shared/types.ts";
import {
  getRandomWordByDifficulty,
  getRandomWordFromCategory,
  getRandomWord,
} from "../../shared/wordSelection.ts";

export class GameManager {
  private game: HangGuyGame;
  private players: Map<string, PlayerInfo> = new Map();
  private gameId: string;
  private lastAction?: GameAction;
  // Player IDs in join order; the pointer marks whose turn it is.
  private turnOrder: string[] = [];
  private currentTurnIndex = 0;
  // Set while a custom-word round is active: the setter spectates.
  private wordSetter?: string;

  constructor(gameId: string = "main-hangman-game") {
    this.game = new HangGuyGame();
    this.gameId = gameId;
  }

  // Walk forward from `start` to the first eligible (non-setter) player's index.
  private firstEligibleFrom(start: number): number | undefined {
    for (let i = 0; i < this.turnOrder.length; i++) {
      const idx = (start + i) % this.turnOrder.length;
      if (this.turnOrder[idx] !== this.wordSetter) {
        return idx;
      }
    }
    return undefined; // only the setter remains
  }

  getCurrentPlayerId(): string | undefined {
    if (this.turnOrder.length === 0) {
      return undefined;
    }
    const idx = this.firstEligibleFrom(this.currentTurnIndex);
    return idx === undefined ? undefined : this.turnOrder[idx];
  }

  private advanceTurn(): void {
    if (this.turnOrder.length === 0) {
      this.currentTurnIndex = 0;
      return;
    }
    // The stored pointer may sit on the setter, so start from the effective
    // current player and step to the next eligible one.
    const curIdx = this.firstEligibleFrom(this.currentTurnIndex);
    if (curIdx === undefined) {
      return;
    }
    const nextIdx = this.firstEligibleFrom((curIdx + 1) % this.turnOrder.length);
    if (nextIdx !== undefined) {
      this.currentTurnIndex = nextIdx;
    }
  }

  addPlayer(playerId: string, playerName: string): PlayerInfo {
    const playerInfo: PlayerInfo = {
      id: playerId,
      name: playerName,
      joinedAt: Date.now(),
      isActive: true,
      avatar: undefined,
    };

    this.players.set(playerId, playerInfo);

    // Guard against duplicate entries when a reconnecting socket re-joins.
    if (!this.turnOrder.includes(playerId)) {
      this.turnOrder.push(playerId);
    }

    this.lastAction = {
      type: "player_join",
      playerId,
      playerName,
      timestamp: Date.now(),
      data: { playerCount: this.players.size },
    };

    console.log(
      `Player ${playerName} (${playerId}) joined game. Total: ${this.players.size}`
    );
    return playerInfo;
  }

  removePlayer(playerId: string): {
    removed: boolean;
    playerInfo?: PlayerInfo;
  } {
    const playerInfo = this.players.get(playerId);
    const removed = this.players.delete(playerId);

    if (removed && playerInfo) {
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

      if (playerId === this.wordSetter) {
        this.wordSetter = undefined;
      }

      this.lastAction = {
        type: "player_leave",
        playerId,
        playerName: playerInfo.name,
        timestamp: Date.now(),
        data: { playerCount: this.players.size },
      };

      console.log(
        `Player ${playerInfo.name} (${playerId}) left game. Total: ${this.players.size}`
      );
    }

    return { removed, playerInfo };
  }

  getPlayer(playerId: string): PlayerInfo | undefined {
    return this.players.get(playerId);
  }

  getPlayers(): PlayerInfo[] {
    return Array.from(this.players.values());
  }

  getPlayerCount(): number {
    return this.players.size;
  }

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

    const player = startedBy ? this.players.get(startedBy) : undefined;

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

    console.log(`New game started by ${player?.name || "System"}`);

    return this.getGameState();
  }

  processGuess(
    letter: string,
    playerId: string
  ): {
    success: boolean;
    isCorrect: boolean;
    gameState: GameStateEvent;
    error?: string;
    errorCode?: string;
  } {
    const player = this.players.get(playerId);
    if (!player) {
      return {
        success: false,
        isCorrect: false,
        gameState: this.getGameState(),
        error: "Player not found in game",
      };
    }

    // Check if game is already over
    const currentState = this.game.getState();
    if (currentState.status !== "playing") {
      return {
        success: false,
        isCorrect: false,
        gameState: this.getGameState(),
        error: "Game is not in playing state",
      };
    }

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

    // Validate the guess
    const canGuess = this.game.canGuessLetter(letter);
    if (!canGuess.canGuess) {
      return {
        success: false,
        isCorrect: false,
        gameState: this.getGameState(),
        error: canGuess.reason,
      };
    }

    // Process the guess
    const guessResult = this.game.guessLetter(letter);
    this.advanceTurn();

    this.lastAction = {
      type: "guess",
      playerId,
      playerName: player.name,
      timestamp: Date.now(),
      data: {
        letter,
        isCorrect: guessResult.isCorrect,
        gameStateAfter: guessResult.gameStateAfter,
      },
    };

    console.log(
      `${player.name} guessed "${letter}" - ${
        guessResult.isCorrect ? "Correct" : "Incorrect"
      }`
    );
    console.log(`Remaining guesses: ${this.game.getState().remainingGuesses}`);

    return {
      success: true,
      isCorrect: guessResult.isCorrect,
      gameState: this.getGameState(),
    };
  }

  getGameState(): GameStateEvent {
    const state = this.game.getState();

    return {
      // Only reveal word when game is over
      word: state.status === "playing" ? "" : state.word,
      guessedLetters: Array.from(state.guessedLetters),
      correctGuesses: Array.from(state.correctGuesses),
      incorrectGuesses: Array.from(state.incorrectGuesses),
      remainingGuesses: state.remainingGuesses,
      maxGuesses: state.maxGuesses,
      status: state.status,
      displayWord: state.displayWord,
      currentPlayer: this.getCurrentPlayerId(),
      wordSetter: this.wordSetter,
      players: this.getPlayers(),
      gameId: this.gameId,
      lastAction: this.lastAction,
    };
  }

  getGameStats() {
    return {
      gameId: this.gameId,
      playerCount: this.players.size,
      gameStatus: this.game.getState().status,
      totalGuesses: this.game.getState().guessedLetters.size,
      correctGuesses: this.game.getState().correctGuesses.size,
      incorrectGuesses: this.game.getState().incorrectGuesses.size,
    };
  }
}
