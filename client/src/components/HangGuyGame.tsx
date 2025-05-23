import React from "react";
import { HangmanSVGs } from "./hangman/HangmanSVGs";
import { HangGuyWord } from "./HangGuyWord";
import { GuessDisplay } from "./GuessDisplay";
import { LetterInput } from "./LetterInput";
import { useHangGuyGame } from "../hooks/useHangGuyGame";

export const HangGuyGame: React.FC = () => {
  const { gameState, guessLetter } = useHangGuyGame();

  const incorrectGuessCount = gameState.incorrectGuesses.size;
  const isGameActive = gameState.status === "playing";

  const handleGuess = (letter: string) => {
    if (isGameActive) {
      guessLetter(letter);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Hang Guy Game
        </h1>

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

            {/* Game status */}
            <div className="text-center w-full">
              {gameState.status === "won" && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  🎉 Congratulations! You won!
                </div>
              )}
              {gameState.status === "lost" && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  💀 Game over! The word was: <strong>{gameState.word}</strong>
                </div>
              )}
              {gameState.status === "playing" && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                  🤔 Guess a letter to continue...
                </div>
              )}
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

          {/* Right Column: Input Controls */}
          <div className="flex flex-col items-center space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6 w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Make Your Guess
              </h3>
              <LetterInput
                onGuess={handleGuess}
                disabled={!isGameActive}
                guessedLetters={gameState.guessedLetters}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
