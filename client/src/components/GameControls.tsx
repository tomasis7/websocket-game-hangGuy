import React from "react";
import type { GameStatus } from "../../../shared/types";

// Update the interface to match UML specifications
export interface GameControlsProps {
  gameStatus: GameStatus;
  onNewGame: () => void;
  onLeaveGame?: () => void;
  isConnected?: boolean;
  playerCount?: number;
  disabled?: boolean; // Add this for compatibility with existing code
}

// Update the component
export const GameControls: React.FC<GameControlsProps> = ({
  gameStatus,
  onNewGame,
  onLeaveGame,
  isConnected = true,
  playerCount = 0,
  disabled = false, // Add this
}) => {
  const canStartNewGame = gameStatus === "won" || gameStatus === "lost";
  const isGameInProgress = gameStatus === "playing";

  return (
    <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg">
      {/* Connection & Player Status */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Players: {playerCount} </span>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-gray-600">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onNewGame}
          disabled={!isConnected || disabled}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            canStartNewGame || !isGameInProgress
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          } disabled:bg-gray-300 disabled:cursor-not-allowed`}
        >
          {canStartNewGame
            ? "New Game"
            : isGameInProgress
            ? "Restart Game"
            : "Start Game"}
        </button>

        {onLeaveGame && (
          <button
            onClick={onLeaveGame}
            disabled={disabled}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Leave
          </button>
        )}
      </div>

      {/* Game Status Messages */}
      {gameStatus === "won" && (
        <div className="text-center p-2 bg-green-100 border border-green-300 rounded text-green-700 text-sm font-medium">
          🎉 Congratulations! You won!
        </div>
      )}

      {gameStatus === "lost" && (
        <div className="text-center p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm font-medium">
          💀 Game Over! Better luck next time!
        </div>
      )}
    </div>
  );
};
