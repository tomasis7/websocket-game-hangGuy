import { useState, useCallback } from "react";
import { HangGuyGame } from "../utils/gameLogic";
import type { GameState } from "../types/gameTypes";

export const useHangGuyGame = (initialWord?: string) => {
  const [game] = useState(() => new HangGuyGame(initialWord));
  const [gameState, setGameState] = useState<GameState>(game.getState());

  const guessLetter = useCallback(
    (letter: string) => {
      const guessResult = game.guessLetter(letter);
      const newState = game.getState();
      setGameState(newState);
      return guessResult;
    },
    [game]
  );

  const resetGame = useCallback(
    (newWord?: string) => {
      const newState = game.resetGame(newWord);
      setGameState(newState);
      return newState;
    },
    [game]
  );

  const canGuessLetter = useCallback(
    (letter: string) => {
      return game.canGuessLetter(letter);
    },
    [game]
  );

  const getGameStats = useCallback(() => {
    return game.getGameStats();
  }, [game]);

  const getGuessSummary = useCallback(() => {
    return game.getGuessSummary();
  }, [game]);

  const getLastGuessResult = useCallback(() => {
    return game.getLastGuessResult();
  }, [game]);

  return {
    gameState,
    guessLetter,
    resetGame,
    canGuessLetter,
    getGameStats,
    getGuessSummary,
    getLastGuessResult,
    // Legacy methods for compatibility
    getHangmanStage: () => game.getHangmanStage(),
    isGameOver: () => game.isGameOver(),
    getGuessedLettersArray: () => game.getGuessedLettersArray(),
    game,
  };
};
