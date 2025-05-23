import type { GuessTracker, GuessAttempt } from "../types/gameTypes";

export class GuessTrackingSystem {
  private tracker: GuessTracker;

  constructor(maxGuesses: number = 8) {
    this.tracker = this.createInitialTracker(maxGuesses);
  }

  private createInitialTracker(maxGuesses: number): GuessTracker {
    return {
      allGuesses: [],
      correctGuesses: [],
      incorrectGuesses: [],
      remainingGuesses: maxGuesses,
      maxGuesses,
      guessHistory: [],
    };
  }

  /**
   * Add a new guess and update tracking state
   */
  public addGuess(letter: string, isCorrect: boolean): GuessAttempt {
    const normalizedLetter = letter.toUpperCase();

    // Create guess attempt record
    const attempt: GuessAttempt = {
      letter: normalizedLetter,
      isCorrect,
      timestamp: new Date(),
      remainingGuessesAfter: isCorrect
        ? this.tracker.remainingGuesses
        : this.tracker.remainingGuesses - 1,
    };

    // Update tracker state
    this.tracker.allGuesses.push(normalizedLetter);
    this.tracker.guessHistory.push(attempt);

    if (isCorrect) {
      this.tracker.correctGuesses.push(normalizedLetter);
    } else {
      this.tracker.incorrectGuesses.push(normalizedLetter);
      this.tracker.remainingGuesses--;
    }

    return attempt;
  }

  /**
   * Check if a letter has already been guessed
   */
  public hasBeenGuessed(letter: string): boolean {
    return this.tracker.allGuesses.includes(letter.toUpperCase());
  }

  /**
   * Get remaining guesses count
   */
  public getRemainingGuesses(): number {
    return this.tracker.remainingGuesses;
  }

  /**
   * Get all guessed letters sorted alphabetically
   */
  public getAllGuessedLetters(): string[] {
    return [...this.tracker.allGuesses].sort();
  }

  /**
   * Get correct guesses only
   */
  public getCorrectGuesses(): string[] {
    return [...this.tracker.correctGuesses].sort();
  }

  /**
   * Get incorrect guesses only
   */
  public getIncorrectGuesses(): string[] {
    return [...this.tracker.incorrectGuesses].sort();
  }

  /**
   * Get formatted display of guessed letters
   */
  public getFormattedGuesses(): {
    all: string;
    correct: string;
    incorrect: string;
  } {
    return {
      all: this.getAllGuessedLetters().join(", ") || "None",
      correct: this.getCorrectGuesses().join(", ") || "None",
      incorrect: this.getIncorrectGuesses().join(", ") || "None",
    };
  }

  /**
   * Get guess statistics
   */
  public getGuessStats() {
    return {
      totalGuesses: this.tracker.allGuesses.length,
      correctCount: this.tracker.correctGuesses.length,
      incorrectCount: this.tracker.incorrectGuesses.length,
      remainingGuesses: this.tracker.remainingGuesses,
      maxGuesses: this.tracker.maxGuesses,
      guessAccuracy:
        this.tracker.allGuesses.length > 0
          ? (this.tracker.correctGuesses.length /
              this.tracker.allGuesses.length) *
            100
          : 0,
    };
  }

  /**
   * Get complete guess history with timestamps
   */
  public getGuessHistory(): GuessAttempt[] {
    return [...this.tracker.guessHistory];
  }

  /**
   * Get the last guess made
   */
  public getLastGuess(): GuessAttempt | null {
    return this.tracker.guessHistory.length > 0
      ? this.tracker.guessHistory[this.tracker.guessHistory.length - 1]
      : null;
  }

  /**
   * Check if no guesses remaining
   */
  public isOutOfGuesses(): boolean {
    return this.tracker.remainingGuesses <= 0;
  }

  /**
   * Reset tracker for new game
   */
  public reset(maxGuesses?: number): void {
    this.tracker = this.createInitialTracker(
      maxGuesses || this.tracker.maxGuesses
    );
  }

  /**
   * Get current tracker state (immutable copy)
   */
  public getState(): GuessTracker {
    return {
      allGuesses: [...this.tracker.allGuesses],
      correctGuesses: [...this.tracker.correctGuesses],
      incorrectGuesses: [...this.tracker.incorrectGuesses],
      remainingGuesses: this.tracker.remainingGuesses,
      maxGuesses: this.tracker.maxGuesses,
      guessHistory: [...this.tracker.guessHistory],
    };
  }

  /**
   * Import state from external source (for multiplayer sync)
   */
  public setState(state: GuessTracker): void {
    this.tracker = {
      allGuesses: [...state.allGuesses],
      correctGuesses: [...state.correctGuesses],
      incorrectGuesses: [...state.incorrectGuesses],
      remainingGuesses: state.remainingGuesses,
      maxGuesses: state.maxGuesses,
      guessHistory: [...state.guessHistory],
    };
  }
}

/**
 * Utility functions for guess tracking
 */
export const createGuessTracker = (
  maxGuesses: number = 8
): GuessTrackingSystem => {
  return new GuessTrackingSystem(maxGuesses);
};

export const formatRemainingGuesses = (
  remaining: number,
  max: number
): string => {
  return `${remaining}/${max} guesses remaining`;
};

export const calculateGuessProgress = (
  remaining: number,
  max: number
): number => {
  return ((max - remaining) / max) * 100;
};
