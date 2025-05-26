import { GameStatus } from "../../shared/types";

export interface GameState {
  word: string;
  correctGuesses: string[];
  incorrectGuesses: string[];
  remainingGuesses: number;
  maxGuesses: number;
  status: GameStatus;
  displayWord: string;
}

export interface GameAction {
  type: string;
  playerId: string;
  letter?: string;
  timestamp: number;
}

export class MultiplayerHangmanGame {
  startNewGame: any;
  processGuess(letter: any, playerId: string) {
    throw new Error("Method not implemented.");
  }
  canPlayerGuess(playerId: string, letter: any) {
    throw new Error("Method not implemented.");
  }
  private gameId: string;
  private players: Set<string>;
  private gameState: GameState;
  private lastAction?: GameAction;

  constructor(gameId: string, word: string, maxGuesses: number = 6) {
    this.gameId = gameId;
    this.players = new Set();
    this.gameState = {
      word: word.toLowerCase(),
      correctGuesses: [],
      incorrectGuesses: [],
      remainingGuesses: maxGuesses,
      maxGuesses,
      status: "playing",
      displayWord: word.replace(/[a-z]/gi, "_").split("").join(" "),
    };
  }

  getGameId(): string {
    return this.gameId;
  }

  getPlayers(): Set<string> {
    return this.players;
  }

  getPlayerCount(): number {
    return this.players.size;
  }

  addPlayer(playerId: string): void {
    this.players.add(playerId);
  }

  removePlayer(playerId: string): boolean {
    return this.players.delete(playerId);
  }

  getGameState(): GameState {
    return { ...this.gameState };
  }

  getLastAction(): GameAction | undefined {
    return this.lastAction;
  }

  makeGuess(playerId: string, letter: string): boolean {
    if (this.gameState.status !== "playing") {
      return false;
    }

    const normalizedLetter = letter.toLowerCase();

    if (
      this.gameState.correctGuesses.includes(normalizedLetter) ||
      this.gameState.incorrectGuesses.includes(normalizedLetter)
    ) {
      return false;
    }

    this.lastAction = {
      type: "guess",
      playerId,
      letter: normalizedLetter,
      timestamp: Date.now(),
    };

    if (this.gameState.word.includes(normalizedLetter)) {
      this.gameState.correctGuesses.push(normalizedLetter);
      this.updateDisplayWord();

      if (this.isWordComplete()) {
        this.gameState.status = "won";
      }
    } else {
      this.gameState.incorrectGuesses.push(normalizedLetter);
      this.gameState.remainingGuesses--;

      if (this.gameState.remainingGuesses <= 0) {
        this.gameState.status = "lost";
      }
    }

    return true;
  }

  private updateDisplayWord(): void {
    this.gameState.displayWord = this.gameState.word
      .split("")
      .map((char) =>
        this.gameState.correctGuesses.includes(char) ? char : "_"
      )
      .join(" ");
  }

  private isWordComplete(): boolean {
    return this.gameState.word
      .split("")
      .every((char) => this.gameState.correctGuesses.includes(char));
  }
}
