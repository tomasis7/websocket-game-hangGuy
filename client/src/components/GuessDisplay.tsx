import React, { useEffect, useState } from "react";

interface GuessDisplayProps {
  correctGuesses: string[];
  incorrectGuesses: string[];
  remainingGuesses: number;
  maxGuesses: number;
  gameStatus?: "playing" | "won" | "lost";
}

export const GuessDisplay: React.FC<GuessDisplayProps> = ({
  correctGuesses,
  incorrectGuesses,
  remainingGuesses,
  maxGuesses,
  gameStatus = "playing",
}) => {
  // ✅ Add state for real-time updates
  const [currentRemaining, setCurrentRemaining] = useState(remainingGuesses);

  // ✅ Update when props change
  useEffect(() => {
    setCurrentRemaining(remainingGuesses);
  }, [remainingGuesses]);

  const correctLetters = correctGuesses.sort();
  const incorrectLetters = incorrectGuesses.sort();
  const totalGuesses = correctLetters.length + incorrectLetters.length;
  const usedGuesses = maxGuesses - currentRemaining; // ✅ Use currentRemaining
  const progressPercentage = (usedGuesses / maxGuesses) * 100;

  // Enhanced status calculation
  const getGuessStatus = () => {
    if (gameStatus !== "playing") return gameStatus;
    if (currentRemaining <= 1) return "critical";
    if (currentRemaining <= 2) return "danger";
    if (currentRemaining <= 4) return "warning";
    return "safe";
  };

  const status = getGuessStatus();

  // ✅ Rest of component stays the same but uses currentRemaining
  const getStatusMessage = () => {
    if (gameStatus === "won") return "🎉 You won!";
    if (gameStatus === "lost") return "💀 Game over!";
    if (status === "critical") return "⚠️ Last chance!";
    if (status === "danger") return "🚨 Be careful!";
    if (status === "warning") return "⚡ Running low...";
    return "✅ Looking good!";
  };

  // ✅ Use currentRemaining in display
  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-4">
      {/* Enhanced Remaining Guesses Section */}
      <div
        className={`text-center p-4 rounded-lg ${getStatusStyles().bg} ${
          getStatusStyles().border
        } border ${getStatusStyles().pulse}`}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Remaining Guesses
        </h3>

        <div className="flex items-center justify-center gap-2 mb-2">
          <span className={`text-3xl font-bold ${getStatusStyles().text}`}>
            {currentRemaining}
          </span>
          <span className="text-gray-500 text-lg">/ {maxGuesses}</span>
        </div>

        {/* Status Message */}
        <div className={`text-sm font-medium ${getStatusStyles().text} mb-3`}>
          {getStatusMessage()}
        </div>

        {/* Enhanced Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ease-in-out ${
              getStatusStyles().progress
            }`}
            style={{ width: `${Math.max(5, progressPercentage)}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-white drop-shadow">
              {usedGuesses}/{maxGuesses}
            </span>
          </div>
        </div>

        {/* Guess breakdown */}
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span>Used: {usedGuesses}</span>
          <span>Remaining: {currentRemaining}</span>
        </div>
      </div>

      {/* Correct Guesses Section */}
      <div>
        <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
          <span>✅</span>
          Correct Letters ({correctLetters.length})
        </h4>
        <div className="min-h-[2rem] p-3 bg-green-50 rounded border border-green-200">
          {correctLetters.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {correctLetters.map((letter) => (
                <span
                  key={letter}
                  className="px-2 py-1 bg-green-200 text-green-800 rounded text-sm font-mono font-semibold shadow-sm"
                >
                  {letter}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-green-600 text-sm italic">
              No correct guesses yet
            </span>
          )}
        </div>
      </div>

      {/* Incorrect Guesses Section */}
      <div>
        <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
          <span>❌</span>
          Incorrect Letters ({incorrectLetters.length})
        </h4>
        <div className="min-h-[2rem] p-3 bg-red-50 rounded border border-red-200">
          {incorrectLetters.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {incorrectLetters.map((letter) => (
                <span
                  key={letter}
                  className="px-2 py-1 bg-red-200 text-red-800 rounded text-sm font-mono line-through shadow-sm"
                >
                  {letter}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-red-600 text-sm italic">
              No incorrect guesses yet
            </span>
          )}
        </div>
      </div>

      {/* Enhanced Summary Stats */}
      <div className="pt-3 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-semibold text-gray-700">Total Guesses</div>
            <div className="text-lg font-bold text-gray-900">
              {totalGuesses}
            </div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-semibold text-gray-700">Success Rate</div>
            <div className="text-lg font-bold text-gray-900">
              {totalGuesses > 0
                ? Math.round((correctLetters.length / totalGuesses) * 100)
                : 0}
              %
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function getStatusStyles() {
    switch (status) {
      case "critical":
        return {
          text: "text-red-700",
          bg: "bg-red-100",
          border: "border-red-300",
          progress: "bg-red-600",
          pulse: "animate-pulse",
        };
      case "danger":
        return {
          text: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-200",
          progress: "bg-red-500",
          pulse: "",
        };
      case "warning":
        return {
          text: "text-yellow-600",
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          progress: "bg-yellow-500",
          pulse: "",
        };
      case "won":
        return {
          text: "text-green-700",
          bg: "bg-green-100",
          border: "border-green-300",
          progress: "bg-green-600",
          pulse: "",
        };
      case "lost":
        return {
          text: "text-red-700",
          bg: "bg-red-100",
          border: "border-red-300",
          progress: "bg-red-600",
          pulse: "",
        };
      default:
        return {
          text: "text-green-600",
          bg: "bg-green-50",
          border: "border-green-200",
          progress: "bg-green-500",
          pulse: "",
        };
    }
  }
};
