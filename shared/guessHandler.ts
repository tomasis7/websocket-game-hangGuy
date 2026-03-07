import type { GuessResult, GameState } from "./types";

export class GuessHandler {
  /**
   * Process a letter guess and return detailed result
   */
  public static processGuess(
    letter: string,
    currentState: GameState
  ): GuessResult {
    const normalizedLetter = letter.toUpperCase();

    // Validate letter input
    if (!this.isValidLetter(normalizedLetter)) {
      return {
        letter: normalizedLetter,
        isCorrect: false,
        isAlreadyGuessed: false,
        newLettersRevealed: [],
        gameStateAfter: currentState.status,
        message: "Please enter a valid letter (A-Z)",
      };
    }

    // Check if already guessed
    if (currentState.guessedLetters.has(normalizedLetter)) {
      return {
        letter: normalizedLetter,
        isCorrect: false,
        isAlreadyGuessed: true,
        newLettersRevealed: [],
        gameStateAfter: currentState.status,
        message: `You already guessed "${normalizedLetter}"`,
      };
    }

    // Check if game is still active
    if (currentState.status !== "playing") {
      return {
        letter: normalizedLetter,
        isCorrect: false,
        isAlreadyGuessed: false,
        newLettersRevealed: [],
        gameStateAfter: currentState.status,
        message: "Game is not active",
      };
    }

    // Process the guess
    const isCorrect = currentState.word.includes(normalizedLetter);
    const newLettersRevealed = isCorrect
      ? this.getNewRevealedPositions(
          normalizedLetter,
          currentState.word,
          currentState.correctGuesses
        )
      : [];

    return {
      letter: normalizedLetter,
      isCorrect,
      isAlreadyGuessed: false,
      newLettersRevealed,
      gameStateAfter: "playing", // Will be updated by game logic
      message: this.generateGuessMessage(
        normalizedLetter,
        isCorrect,
        newLettersRevealed.length
      ),
    };
  }

  /**
   * Handle correct guess logic
   */
  public static handleCorrectGuess(
    letter: string,
    gameState: GameState
  ): Partial<GameState> {
    const normalizedLetter = letter.toUpperCase();

    // Add to correct guesses
    const newCorrectGuesses = new Set(gameState.correctGuesses);
    newCorrectGuesses.add(normalizedLetter);

    // Add to all guessed letters
    const newGuessedLetters = new Set(gameState.guessedLetters);
    newGuessedLetters.add(normalizedLetter);

    // Update display word
    const newDisplayWord = this.createDisplayWord(
      gameState.word,
      newCorrectGuesses
    );

    // Check if word is complete
    const isWordComplete = this.isWordComplete(
      gameState.word,
      newCorrectGuesses
    );
    const newStatus = isWordComplete ? "won" : "playing";

    return {
      guessedLetters: newGuessedLetters,
      correctGuesses: newCorrectGuesses,
      displayWord: newDisplayWord,
      status: newStatus,
    };
  }

  /**
   * Handle incorrect guess logic
   */
  public static handleIncorrectGuess(
    letter: string,
    gameState: GameState
  ): Partial<GameState> {
    const normalizedLetter = letter.toUpperCase();

    // Add to incorrect guesses
    const newIncorrectGuesses = new Set(gameState.incorrectGuesses);
    newIncorrectGuesses.add(normalizedLetter);

    // Add to all guessed letters
    const newGuessedLetters = new Set(gameState.guessedLetters);
    newGuessedLetters.add(normalizedLetter);

    // Decrease remaining guesses
    const newRemainingGuesses = gameState.remainingGuesses - 1;

    // Check if game is lost
    const isGameLost = newRemainingGuesses <= 0;
    const newStatus = isGameLost ? "lost" : "playing";

    return {
      guessedLetters: newGuessedLetters,
      incorrectGuesses: newIncorrectGuesses,
      remainingGuesses: newRemainingGuesses,
      status: newStatus,
    };
  }

  /**
   * Update game state based on guess result
   */
  public static updateGameState(
    guessResult: GuessResult,
    currentState: GameState
  ): GameState {
    if (
      guessResult.isAlreadyGuessed ||
      !this.isValidLetter(guessResult.letter)
    ) {
      return {
        ...currentState,
        lastGuessResult: guessResult,
      };
    }

    let stateUpdates: Partial<GameState>;

    if (guessResult.isCorrect) {
      stateUpdates = this.handleCorrectGuess(guessResult.letter, currentState);
    } else {
      stateUpdates = this.handleIncorrectGuess(
        guessResult.letter,
        currentState
      );
    }

    // Update guess result with final game state
    const updatedGuessResult = {
      ...guessResult,
      gameStateAfter: stateUpdates.status || currentState.status,
    };

    return {
      ...currentState,
      ...stateUpdates,
      lastGuessResult: updatedGuessResult,
    };
  }

  // Helper methods
  private static isValidLetter(letter: string): boolean {
    return /^[A-Z]$/.test(letter);
  }

  private static getNewRevealedPositions(
    letter: string,
    word: string,
    previousCorrectGuesses: Set<string>
  ): string[] {
    if (previousCorrectGuesses.has(letter)) {
      return [];
    }

    return word
      .split("")
      .map((char, index) => (char === letter ? `${index}` : null))
      .filter((pos) => pos !== null) as string[];
  }

  private static createDisplayWord(
    word: string,
    correctGuesses: Set<string>
  ): string {
    return word
      .split("")
      .map((letter) => (correctGuesses.has(letter) ? letter : "_"))
      .join(" ");
  }

  private static isWordComplete(
    word: string,
    correctGuesses: Set<string>
  ): boolean {
    return word.split("").every((letter) => correctGuesses.has(letter));
  }

  private static generateGuessMessage(
    letter: string,
    isCorrect: boolean,
    revealedCount: number
  ): string {
    if (isCorrect) {
      if (revealedCount === 1) {
        return `Great! "${letter}" appears ${revealedCount} time in the word.`;
      } else {
        return `Excellent! "${letter}" appears ${revealedCount} times in the word.`;
      }
    } else {
      return `Sorry, "${letter}" is not in the word.`;
    }
  }
}
