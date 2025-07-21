import { describe, it, expect, beforeEach } from 'vitest';
import { HangGuyGame } from './gameLogic';

describe('HangGuyGame', () => {
  let game: HangGuyGame;

  beforeEach(() => {
    // Use a fixed word for predictable testing
    game = new HangGuyGame('TESTING');
  });

  describe('initialization', () => {
    it('should initialize with correct default values', () => {
      const state = game.getState();
      
      expect(state.word).toBe('TESTING');
      expect(state.status).toBe('playing');
      expect(state.remainingGuesses).toBe(8);
      expect(state.maxGuesses).toBe(8);
      expect(state.guessedLetters.size).toBe(0);
      expect(state.correctGuesses.size).toBe(0);
      expect(state.incorrectGuesses.size).toBe(0);
      expect(state.displayWord).toBe('_ _ _ _ _ _ _');
    });
  });

  describe('letter guessing', () => {
    it('should correctly handle a correct guess', () => {
      const result = game.guessLetter('T');
      const state = game.getState();
      
      expect(result.isCorrect).toBe(true);
      expect(result.letter).toBe('T');
      expect(state.correctGuesses.has('T')).toBe(true);
      expect(state.guessedLetters.has('T')).toBe(true);
      expect(state.remainingGuesses).toBe(8); // Should not decrease for correct guess
      expect(state.displayWord).toBe('T _ _ T _ _ _');
    });

    it('should correctly handle an incorrect guess', () => {
      const result = game.guessLetter('Z');
      const state = game.getState();
      
      expect(result.isCorrect).toBe(false);
      expect(result.letter).toBe('Z');
      expect(state.incorrectGuesses.has('Z')).toBe(true);
      expect(state.guessedLetters.has('Z')).toBe(true);
      expect(state.remainingGuesses).toBe(7); // Should decrease for incorrect guess
      expect(state.displayWord).toBe('_ _ _ _ _ _ _'); // Should not change
    });

    it('should not allow duplicate guesses', () => {
      // First guess
      game.guessLetter('T');
      
      // Try to guess the same letter again
      const canGuess = game.canGuessLetter('T');
      
      expect(canGuess.canGuess).toBe(false);
      expect(canGuess.reason).toBe('Letter already guessed');
    });

    it('should not allow guessing when game is over', () => {
      // Make enough incorrect guesses to end the game
      const incorrectLetters = ['Z', 'X', 'W', 'V', 'U', 'Q', 'P', 'O'];
      incorrectLetters.forEach(letter => game.guessLetter(letter));
      
      const state = game.getState();
      expect(state.status).toBe('lost');
      
      // Try to guess after game is over
      const canGuess = game.canGuessLetter('A');
      expect(canGuess.canGuess).toBe(false);
      expect(canGuess.reason).toBe('Game is not in playing state');
    });
  });

  describe('game state transitions', () => {
    it('should transition to won state when word is guessed', () => {
      // Guess all letters in TESTING
      const letters = ['T', 'E', 'S', 'I', 'N', 'G'];
      letters.forEach(letter => game.guessLetter(letter));
      
      const state = game.getState();
      expect(state.status).toBe('won');
      expect(state.displayWord).toBe('T E S T I N G');
    });

    it('should transition to lost state when out of guesses', () => {
      // Make 8 incorrect guesses
      const incorrectLetters = ['Z', 'X', 'W', 'V', 'U', 'Q', 'P', 'O'];
      incorrectLetters.forEach(letter => game.guessLetter(letter));
      
      const state = game.getState();
      expect(state.status).toBe('lost');
      expect(state.remainingGuesses).toBe(0);
    });
  });

  describe('game utilities', () => {
    it('should provide correct game statistics', () => {
      // Make some guesses
      game.guessLetter('T'); // correct
      game.guessLetter('Z'); // incorrect
      game.guessLetter('E'); // correct
      
      const state = game.getState();
      expect(state.guessedLetters.size).toBe(3);
      expect(state.correctGuesses.size).toBe(2);
      expect(state.incorrectGuesses.size).toBe(1);
    });

    it('should reset game correctly', () => {
      // Make some moves
      game.guessLetter('T');
      game.guessLetter('Z');
      
      // Reset game
      game.resetGame();
      
      const state = game.getState();
      expect(state.status).toBe('playing');
      expect(state.remainingGuesses).toBe(8);
      expect(state.guessedLetters.size).toBe(0);
      expect(state.correctGuesses.size).toBe(0);
      expect(state.incorrectGuesses.size).toBe(0);
      // Word might be different after reset, so just check it exists
      expect(state.word).toBeDefined();
      expect(state.word.length).toBeGreaterThan(0);
    });
  });
});