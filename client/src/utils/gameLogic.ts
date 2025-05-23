import type { GameState, GuessResult } from "../types/gameTypes";
import { GuessHandler } from "./guessHandler";
import { getRandomWord } from "./wordSelection";

const MAX_INCORRECT_GUESSES = 8; // 9 hangman stages (0-8)

export class HangGuyGame {
  private state: GameState;

  constructor(word?: string) {
    this.state = this.createInitialState(word);
  }

  private createInitialState(word?: string): GameState {
    const selectedWord = word || getRandomWord();
    return {
      word: selectedWord,
      guessedLetters: new Set(),
      correctGuesses: new Set(),
      incorrectGuesses: new Set(),
      remainingGuesses: MAX_INCORRECT_GUESSES,
      maxGuesses: MAX_INCORRECT_GUESSES,
      status: "playing",
      displayWord: this.createDisplayWord(selectedWord, new Set()),
    };
  }

  private createDisplayWord(word: string, correctGuesses: Set<string>): string {
    return word
      .split("")
      .map((letter) => (correctGuesses.has(letter) ? letter : "_"))
      .join(" ");
  }

  /**
   * Main method to handle letter guesses
   */
  public guessLetter(letter: string): GuessResult {
    // Process the guess and get result
    const guessResult = GuessHandler.processGuess(letter, this.state);

    // Update game state based on result
    this.state = GuessHandler.updateGameState(guessResult, this.state);

    return guessResult;
  }

  /**
   * Get detailed information about the last guess
   */
  public getLastGuessResult(): GuessResult | null {
    return this.state.lastGuessResult || null;
  }

  /**
   * Check if the last guess was correct
   */
  public wasLastGuessCorrect(): boolean {
    return this.state.lastGuessResult?.isCorrect || false;
  }

  /**
   * Get game statistics including guess accuracy
   */
  public getGameStats() {
    const totalGuesses = this.state.guessedLetters.size;
    const correctCount = this.state.correctGuesses.size;
    const incorrectCount = this.state.incorrectGuesses.size;

    return {
      totalGuesses,
      correctCount,
      incorrectCount,
      accuracy: totalGuesses > 0 ? (correctCount / totalGuesses) * 100 : 0,
      remainingGuesses: this.state.remainingGuesses,
      maxGuesses: this.state.maxGuesses,
      progressPercentage:
        ((this.state.maxGuesses - this.state.remainingGuesses) /
          this.state.maxGuesses) *
        100,
    };
  }

  /**
   * Get formatted guess summary
   */
  public getGuessSummary() {
    return {
      correct:
        Array.from(this.state.correctGuesses).sort().join(", ") || "None",
      incorrect:
        Array.from(this.state.incorrectGuesses).sort().join(", ") || "None",
      remaining: `${this.state.remainingGuesses}/${this.state.maxGuesses}`,
    };
  }

  /**
   * Check if a specific letter can be guessed
   */
  public canGuessLetter(letter: string): {
    canGuess: boolean;
    reason?: string;
  } {
    const normalizedLetter = letter.toUpperCase();

    if (!/^[A-Z]$/.test(normalizedLetter)) {
      return { canGuess: false, reason: "Invalid letter format" };
    }

    if (this.state.guessedLetters.has(normalizedLetter)) {
      return { canGuess: false, reason: "Letter already guessed" };
    }

    if (this.state.status !== "playing") {
      return { canGuess: false, reason: "Game is not active" };
    }

    return { canGuess: true };
  }

  /**
   * Reset game with optional new word
   */
  public resetGame(newWord?: string): GameState {
    this.state = this.createInitialState(newWord);
    return this.getState();
  }

  /**
   * Get current game state (immutable copy)
   */
  public getState(): GameState {
    return {
      ...this.state,
      guessedLetters: new Set(this.state.guessedLetters),
      correctGuesses: new Set(this.state.correctGuesses),
      incorrectGuesses: new Set(this.state.incorrectGuesses),
    };
  }
}
