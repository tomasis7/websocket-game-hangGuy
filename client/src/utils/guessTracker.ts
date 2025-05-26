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
   * Enhanced remaining guesses info
   */
  public getRemainingGuessesInfo() {
    const used = this.tracker.maxGuesses - this.tracker.remainingGuesses;
    const percentage = (used / this.tracker.maxGuesses) * 100;

    return {
      remaining: this.tracker.remainingGuesses,
      used,
      total: this.tracker.maxGuesses,
      percentage,
      isLow: this.tracker.remainingGuesses <= 2,
      isCritical: this.tracker.remainingGuesses <= 1,
      status: this.getGuessStatus(),
      progressBar: {
        width: `${percentage}%`,
        color: this.getProgressColor(),
      },
    };
  }

  /**
   * Get guess status for UI styling
   */
  private getGuessStatus(): "safe" | "warning" | "danger" | "critical" {
    const remaining = this.tracker.remainingGuesses;
    if (remaining <= 1) return "critical";
    if (remaining <= 2) return "danger";
    if (remaining <= 4) return "warning";
    return "safe";
  }

  /**
   * Get progress bar color based on remaining guesses
   */
  private getProgressColor(): string {
    const status = this.getGuessStatus();
    switch (status) {
      case "critical":
        return "bg-red-600";
      case "danger":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  }

  /**
   * Check if player should be warned about low guesses
   */
  public shouldShowWarning(): boolean {
    return (
      this.tracker.remainingGuesses <= 3 && this.tracker.remainingGuesses > 0
    );
  }

  /**
   * Get warning message based on remaining guesses
   */
  public getWarningMessage(): string | null {
    const remaining = this.tracker.remainingGuesses;
    if (remaining === 1) return "⚠️ Last chance! Choose carefully!";
    if (remaining === 2) return "🚨 Only 2 guesses left!";
    if (remaining === 3) return "⚡ Running low on guesses...";
    return null;
  }

  /**
   * Get guess statistics
   */
  public getGuessStats() {
    const remainingInfo = this.getRemainingGuessesInfo();

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
      // Enhanced remaining guess info
      ...remainingInfo,
      warningMessage: this.getWarningMessage(),
      shouldShowWarning: this.shouldShowWarning(),
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
  max: number,
  includeEmoji: boolean = false
): string => {
  const emoji = includeEmoji
    ? remaining <= 1
      ? " ⚠️"
      : remaining <= 2
      ? " 🚨"
      : " ✅"
    : "";
  return `${remaining}/${max} guesses remaining${emoji}`;
};

export const calculateGuessProgress = (
  remaining: number,
  max: number
): { percentage: number; status: string; color: string } => {
  const used = max - remaining;
  const percentage = (used / max) * 100;

  let status = "safe";
  let color = "green";

  if (remaining <= 1) {
    status = "critical";
    color = "red";
  } else if (remaining <= 2) {
    status = "danger";
    color = "red";
  } else if (remaining <= 4) {
    status = "warning";
    color = "yellow";
  }

  return { percentage, status, color };
};
