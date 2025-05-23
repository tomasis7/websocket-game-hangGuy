export interface GameState {
  word: string;
  guessedLetters: Set<string>;
  correctGuesses: Set<string>;
  incorrectGuesses: Set<string>;
  remainingGuesses: number;
  status: 'playing' | 'won' | 'lost';
  displayWord: string;
}

export interface GameAction {
  type: 'GUESS_LETTER' | 'RESET_GAME' | 'SET_WORD';
  payload?: string;
}