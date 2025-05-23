import { HangGuyGame } from "../../client/src/utils/gameLogic";
import {
  GameStateEvent,
  GuessEvent,
  PlayerInfo,
} from "../../client/src/types/socketTypes";

export class MultiplayerHangmanGame {
  private game: HangGuyGame;
  private players: Set<string> = new Set();
  private gameId: string;

  constructor(gameId: string = "main-game") {
    this.game = new HangGuyGame();
    this.gameId = gameId;
  }

  addPlayer(playerId: string): void {
    this.players.add(playerId);
  }

  removePlayer(playerId: string): void {
    this.players.delete(playerId);
  }

  getPlayerCount(): number {
    return this.players.size;
  }

  getPlayers(): string[] {
    return Array.from(this.players);
  }

  processGuess(
    letter: string,
    playerId: string
  ): {
    isCorrect: boolean;
    gameState: GameStateEvent;
  } {
    const guessResult = this.game.guessLetter(letter);
    const gameState = this.getGameState();

    return {
      isCorrect: guessResult.isCorrect,
      gameState,
    };
  }

  startNewGame(options?: {
    category?: string;
    difficulty?: "easy" | "medium" | "hard";
  }): GameStateEvent {
    // Note: The current game logic doesn't support category/difficulty in resetGame
    // This would need to be updated in the original game logic
    this.game.resetGame();
    return this.getGameState();
  }

  getGameState(): GameStateEvent {
    const state = this.game.getState();

    return {
      gameId: this.gameId,
      word: state.word,
      guessedLetters: Array.from(state.guessedLetters),
      correctGuesses: Array.from(state.correctGuesses),
      incorrectGuesses: Array.from(state.incorrectGuesses),
      remainingGuesses: state.remainingGuesses,
      maxGuesses: state.maxGuesses,
      status: state.status,
      displayWord: state.displayWord,
      players: this.getPlayers().map((id) => ({
        id,
        name: id,
        joinedAt: new Date().getTime(),
        isActive: true,
      })),
    };
  }

  canPlayerGuess(
    playerId: string,
    letter: string
  ): { canGuess: boolean; reason?: string } {
    if (!this.players.has(playerId)) {
      return { canGuess: false, reason: "Player not in game" };
    }

    return this.game.canGuessLetter(letter);
  }
}
