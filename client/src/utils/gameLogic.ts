import type { GameState } from "../types/gameTypes";
import {
  getRandomWord,
  getRandomWordFromCategory,
  getRandomWordByDifficulty,
  getRandomUnguessedLetterFromWord,
  getWordStats,
} from "./wordSelection";

const MAX_INCORRECT_GUESSES = 8; // 9 hangman stages (0-8)

export class HangGuyGame {
  private state: GameState;

  constructor(
    word?: string,
    category?: string,
    difficulty?: "easy" | "medium" | "hard"
  ) {
    this.state = this.createInitialState(word, category, difficulty);
  }

  private createInitialState(
    word?: string,
    category?: string,
    difficulty?: "easy" | "medium" | "hard"
  ): GameState {
    const selectedWord = word || this.selectRandomWord(category, difficulty);
    return {
      word: selectedWord,
      guessedLetters: new Set(),
      correctGuesses: new Set(),
      incorrectGuesses: new Set(),
      remainingGuesses: MAX_INCORRECT_GUESSES,
      status: "playing",
      displayWord: this.createDisplayWord(selectedWord, new Set()),
    };
  }

  private selectRandomWord(
    category?: string,
    difficulty?: "easy" | "medium" | "hard"
  ): string {
    if (difficulty) {
      return getRandomWordByDifficulty(difficulty);
    }

    if (category) {
      return getRandomWordFromCategory(category);
    }

    return getRandomWord();
  }

  private createDisplayWord(word: string, correctGuesses: Set<string>): string {
    return word
      .split("")
      .map((letter) => (correctGuesses.has(letter) ? letter : "_"))
      .join(" ");
  }

  private updateGameStatus(): void {
    const { word, correctGuesses, remainingGuesses } = this.state;

    // Check if all letters are guessed
    const allLettersGuessed = word
      .split("")
      .every((letter) => correctGuesses.has(letter));

    if (allLettersGuessed) {
      this.state.status = "won";
    } else if (remainingGuesses <= 0) {
      this.state.status = "lost";
    } else {
      this.state.status = "playing";
    }
  }

  public guessLetter(letter: string): GameState {
    const normalizedLetter = letter.toUpperCase();

    // Validate input
    if (!normalizedLetter.match(/[A-Z]/) || normalizedLetter.length !== 1) {
      return this.getState();
    }

    // Check if already guessed
    if (this.state.guessedLetters.has(normalizedLetter)) {
      return this.getState();
    }

    // Only allow guesses if game is still playing
    if (this.state.status !== "playing") {
      return this.getState();
    }

    // Add to guessed letters
    this.state.guessedLetters.add(normalizedLetter);

    // Check if letter is in word
    if (this.state.word.includes(normalizedLetter)) {
      this.state.correctGuesses.add(normalizedLetter);
    } else {
      this.state.incorrectGuesses.add(normalizedLetter);
      this.state.remainingGuesses--;
    }

    // Update display word
    this.state.displayWord = this.createDisplayWord(
      this.state.word,
      this.state.correctGuesses
    );

    // Update game status
    this.updateGameStatus();

    return this.getState();
  }

  public resetGame(
    newWord?: string,
    category?: string,
    difficulty?: "easy" | "medium" | "hard"
  ): GameState {
    this.state = this.createInitialState(newWord, category, difficulty);
    return this.getState();
  }

  public getState(): GameState {
    return {
      ...this.state,
      guessedLetters: new Set(this.state.guessedLetters),
      correctGuesses: new Set(this.state.correctGuesses),
      incorrectGuesses: new Set(this.state.incorrectGuesses),
    };
  }

  public getIncorrectGuessCount(): number {
    return this.state.incorrectGuesses.size;
  }

  public getHangmanStage(): number {
    return Math.min(this.state.incorrectGuesses.size, MAX_INCORRECT_GUESSES);
  }

  public isGameOver(): boolean {
    return this.state.status === "won" || this.state.status === "lost";
  }

  public getGuessedLettersArray(): string[] {
    return Array.from(this.state.guessedLetters).sort();
  }

  public getWord(): string {
    return this.state.word;
  }

  public getWordStats() {
    return getWordStats(this.state.word);
  }

  public getHint(): string | null {
    return getRandomUnguessedLetterFromWord(
      this.state.word,
      this.state.guessedLetters
    );
  }
}

// Utility functions for game state management
export const createNewGame = (
  word?: string,
  category?: string,
  difficulty?: "easy" | "medium" | "hard"
): HangGuyGame => {
  return new HangGuyGame(word, category, difficulty);
};

export const isValidLetter = (input: string): boolean => {
  return /^[A-Za-z]$/.test(input);
};

export const formatGuessedLetters = (letters: Set<string>): string => {
  return Array.from(letters).sort().join(", ");
};
