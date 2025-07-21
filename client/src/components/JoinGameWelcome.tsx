import React from "react";
import type { GameStateEvent, PlayerInfo } from "../../../shared/types";

interface JoinGameWelcomeProps {
  gameState: GameStateEvent;
  playerInfo: PlayerInfo;
  isGameInProgress: boolean;
  gameSummary: string;
  onDismiss: () => void;
}

export const JoinGameWelcome: React.FC<JoinGameWelcomeProps> = ({
  gameState,
  playerInfo,
  isGameInProgress,
  gameSummary,
  onDismiss,
}) => {
  const getWelcomeIcon = () => {
    if (gameState.status === "won") return "🎉";
    if (gameState.status === "lost") return "💀";
    if (isGameInProgress) return "🎯";
    return "👋";
  };

  const getWelcomeTitle = () => {
    if (gameState.status === "won") return "Game Already Won!";
    if (gameState.status === "lost") return "Game Already Lost";
    if (isGameInProgress) return "Game In Progress!";
    return "Welcome to Hang Guy!";
  };

  const getWelcomeMessage = () => {
    if (gameState.status === "won") {
      return `The word "${gameState.word}" was already guessed successfully. Start a new game to play!`;
    }
    if (gameState.status === "lost") {
      return `The previous game ended. The word was "${gameState.word}". Start a new game to play!`;
    }
    if (isGameInProgress) {
      const revealed = gameState.displayWord.replace(/[_\s]/g, "").length;
      const total = gameState.word.length;
      return `You joined an active game! ${revealed} of ${total} letters have been revealed. You can start guessing letters right away.`;
    }
    return "You've joined the game! Wait for someone to start a new game or start one yourself.";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
        {/* Header */}
        <div className="text-center">
          <div className="text-4xl mb-2">{getWelcomeIcon()}</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Welcome, {playerInfo.name}!
          </h2>
          <h3 className="text-lg font-semibold text-gray-700">
            {getWelcomeTitle()}
          </h3>
        </div>

        {/* Game Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Current Game Status:
          </h4>
          <p className="text-sm text-gray-600 mb-3">{gameSummary}</p>

          {isGameInProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Word Progress:</span>
                <span>{gameState.displayWord}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Remaining Guesses:</span>
                <span>{gameState.remainingGuesses}</span>
              </div>
              {gameState.guessedLetters.length > 0 && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Letters Guessed:</span>
                  <span className="font-mono">
                    {gameState.guessedLetters.join(", ")}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Player Count */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-center gap-2 text-sm text-blue-700">
            <span>👥</span>
            <span>
              {gameState.players.length} player
              {gameState.players.length !== 1 ? "s" : ""} in game
            </span>
          </div>
          {gameState.players.length > 1 && (
            <div className="mt-2 text-xs text-blue-600 text-center">
              Other players:{" "}
              {gameState.players
                .filter((p) => p.id !== playerInfo.id)
                .map((p) => p.name)
                .join(", ")}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">{getWelcomeMessage()}</p>

          {isGameInProgress && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700 font-medium">
                💡 You can start guessing letters immediately!
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={onDismiss}
          className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          {isGameInProgress ? "Start Playing!" : "Got it!"}
        </button>
      </div>
    </div>
  );
};
