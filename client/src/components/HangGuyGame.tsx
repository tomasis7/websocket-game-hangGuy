import React from "react";
import { HangmanSVGs } from "./hangman/HangmanSVGs";
import { HangGuyWord } from "./HangGuyWord";
import { GuessDisplay } from "./GuessDisplay";
import { LetterInput } from "./LetterInput";
import { GameStatus } from "./GameStatus";
import { GameControls } from "./GameControls";
import { useHangGuyGame } from "../hooks/useHangGuyGame";

export const HangGuyGame: React.FC = () => {
  const { gameState, guessLetter, resetGame } = useHangGuyGame();

  const incorrectGuessCount = gameState.incorrectGuesses.size;
  const isGameActive = gameState.status === "playing";

  const handleGuess = (letter: string) => {
    if (isGameActive) {
      guessLetter(letter);
    }
  };

  const handleNewGame = (options?: {
    category?: string;
    difficulty?: "easy" | "medium" | "hard";
  }) => {
    resetGame(undefined); // For now, just reset with random word
    // TODO: Update resetGame to accept category and difficulty options
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Hang Guy Game
        </h1>

        {/* Game Status Banner */}
        <div className="mb-8">
          <GameStatus
            status={gameState.status}
            word={gameState.status === "lost" ? gameState.word : undefined}
            remainingGuesses={gameState.remainingGuesses}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column: Game Visual */}
          <div className="flex flex-col items-center space-y-6">
            {/* SVG Hangman image */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <HangmanSVGs stage={incorrectGuessCount} className="w-48 h-60" />
            </div>

            {/* Display word with underscores */}
            <div className="bg-white rounded-lg shadow-md p-6 w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Word to Guess
              </h3>
              <div className="flex justify-center">
                <HangGuyWord
                  word={gameState.word}
                  correctGuesses={gameState.correctGuesses}
                />
              </div>
            </div>
          </div>

          {/* Middle Column: Guess Tracking */}
          <div className="flex justify-center">
            <GuessDisplay
              correctGuesses={gameState.correctGuesses}
              incorrectGuesses={gameState.incorrectGuesses}
              remainingGuesses={gameState.remainingGuesses}
              maxGuesses={gameState.maxGuesses}
            />
          </div>

          {/* Right Column: Input Controls & Game Controls */}
          <div className="flex flex-col items-center space-y-6">
            {/* Input Controls */}
            <div className="bg-white rounded-lg shadow-md p-6 w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                {isGameActive ? "Make Your Guess" : "Game Finished"}
              </h3>
              <LetterInput
                onGuess={handleGuess}
                disabled={!isGameActive}
                guessedLetters={gameState.guessedLetters}
              />
            </div>

            {/* Game Controls */}
            <GameControls
              onNewGame={handleNewGame}
              gameStatus={gameState.status}
              disabled={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
