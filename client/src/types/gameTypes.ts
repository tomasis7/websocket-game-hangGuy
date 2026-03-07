export type {
  GuessResult,
  GameState,
  GameAction,
} from "../../../shared/types";

// GuessTracker types are only used by guessTracker.ts which is dead code,
// but we keep the re-export for any remaining references during cleanup.
export interface GuessTracker {
  allGuesses: string[];
  correctGuesses: string[];
  incorrectGuesses: string[];
  remainingGuesses: number;
  maxGuesses: number;
  guessHistory: GuessAttempt[];
}

export interface GuessAttempt {
  letter: string;
  isCorrect: boolean;
  timestamp: Date;
  remainingGuessesAfter: number;
}
