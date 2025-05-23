import { useState, useCallback } from 'react';
import { HangGuyGame } from '../utils/gameLogic';
import { GameState } from '../types/gameTypes';

export const useHangGuyGame = (initialWord?: string) => {
  const [game] = useState(() => new HangGuyGame(initialWord));
  const [gameState, setGameState] = useState<GameState>(game.getState());

  const guessLetter = useCallback((letter: string) => {
    const newState = game.guessLetter(letter);
    setGameState(newState);
    return newState;
  }, [game]);

  const resetGame = useCallback((newWord?: string) => {
    const newState = game.resetGame(newWord);
    setGameState(newState);
    return newState;
  }, [game]);

  const getHangmanStage = useCallback(() => {
    return game.getHangmanStage();
  }, [game]);

  const isGameOver = useCallback(() => {
    return game.isGameOver();
  }, [game]);

  const getGuessedLettersArray = useCallback(() => {
    return game.getGuessedLettersArray();
  }, [game]);

  return {
    gameState,
    guessLetter,
    resetGame,
    getHangmanStage,
    isGameOver,
    getGuessedLettersArray,
    game
  };
};