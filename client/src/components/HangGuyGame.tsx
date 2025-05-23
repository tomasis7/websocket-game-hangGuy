import React from "react";
import { HangmanSVGs } from "./hangman/HangmanSVGs";
import { HangGuyWord } from "./HangGuyWord";
import { GuessDisplay } from "./GuessDisplay";
import { LetterInput } from "./LetterInput";
import { GameStatus } from "./GameStatus";
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

  const handleReset = () => {
    resetGame();
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

            {/* Reset/New Game Button */}
            {!isGameActive && (
              <button
                onClick={handleReset}
                className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                🔄 Start New Game
              </button>
            )}
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

          {/* Right Column: Input Controls */}
          <div className="flex flex-col items-center space-y-6">
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

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-4 w-full">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">
                Quick Actions
              </h4>
              <div className="space-y-2">
                <button
                  onClick={handleReset}
                  className="w-full bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  🔄 New Game
                </button>
                {gameState.status === "lost" && (
                  <div className="text-xs text-center text-gray-500 mt-2">
                    The word was:{" "}
                    <span className="font-mono font-semibold">
                      {gameState.word}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
