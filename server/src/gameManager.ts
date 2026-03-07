import { HangGuyGame } from "../../shared/gameLogic.ts";
import {
  GameStateEvent,
  PlayerInfo,
  GameAction,
} from "../../shared/types.ts";

export class GameManager {
  private game: HangGuyGame;
  private players: Map<string, PlayerInfo> = new Map();
  private gameId: string;
  private lastAction?: GameAction;

  constructor(gameId: string = "main-hangman-game") {
    this.game = new HangGuyGame();
    this.gameId = gameId;
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
    options?: { category?: string; difficulty?: "easy" | "medium" | "hard" },
    startedBy?: string
  ): GameStateEvent {
    // Create a completely new game instance instead of just resetting
    this.game = new HangGuyGame();

    const player = startedBy ? this.players.get(startedBy) : undefined;

    this.lastAction = {
      type: "new_game",
      playerId: startedBy || "system",
      playerName: player?.name || "System",
      timestamp: Date.now(),
      data: options,
    };

    console.log(`New game started by ${player?.name || "System"}`);
    console.log(
      `Game state after reset: remaining guesses = ${
        this.game.getState().remainingGuesses
      }`
    );

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
