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

export interface GuessResult {
  letter: string;
  isCorrect: boolean;
  isAlreadyGuessed: boolean;
  newLettersRevealed: string[];
  gameStateAfter: 'playing' | 'won' | 'lost';
  message: string;
}

export interface GameState {
  word: string;
  guessedLetters: Set<string>;
  correctGuesses: Set<string>;
  incorrectGuesses: Set<string>;
  remainingGuesses: number;
  maxGuesses: number;
  status: 'playing' | 'won' | 'lost';
  displayWord: string;
  lastGuessResult?: GuessResult;
}

export interface GameAction {
  type: "GUESS_LETTER" | "RESET_GAME" | "SET_WORD";
  payload?: string;
}
