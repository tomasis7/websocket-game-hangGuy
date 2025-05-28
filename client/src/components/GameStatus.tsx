import React from "react";

interface GameStatusProps {
  status: "playing" | "won" | "lost";
  word?: string;
  remainingGuesses?: number;
}

export const GameStatus: React.FC<GameStatusProps> = ({
  status,
  word,
  remainingGuesses,
}) => {
  // Debug logging
  console.log("GameStatus props:", { status, word, remainingGuesses });

  const getStatusConfig = () => {
    switch (status) {
      case "playing":
        return {
          icon: "🎯",
          title: "Game In Progress",
          message: `Keep guessing! ${remainingGuesses || 0} guesses remaining.`,
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-800",
          iconBg: "bg-blue-100",
        };
      case "won":
        return {
          icon: "🎉",
          title: "Congratulations!",
          message: "You successfully guessed the word!",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-800",
          iconBg: "bg-green-100",
        };
      case "lost":
        return {
          icon: "💀",
          title: "Game Over",
          message: word ? `The word was: "${word}"` : "Better luck next time!",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-800",
          iconBg: "bg-red-100",
        };
      default:
        return {
          icon: "❓",
          title: "Unknown Status",
          message: "Something went wrong.",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-800",
          iconBg: "bg-gray-100",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`
      ${config.bgColor} ${config.borderColor} ${config.textColor}
      border-2 rounded-lg p-6 text-center shadow-sm
      transition-all duration-300 ease-in-out
      w-full
    `}
    >
      <div
        className={`
        ${config.iconBg} w-16 h-16 rounded-full 
        flex items-center justify-center mx-auto mb-4
        text-2xl
      `}
      >
        {config.icon}
      </div>

      <h2 className="text-xl font-bold mb-2">{config.title}</h2>

      <p className="text-base font-medium">{config.message}</p>

      {/* Additional status details */}
      {status === "playing" && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-center items-center gap-2">
            <div
              className={`
              w-3 h-3 rounded-full animate-pulse
              ${
                remainingGuesses && remainingGuesses <= 2
                  ? "bg-red-500"
                  : remainingGuesses && remainingGuesses <= 4
                  ? "bg-yellow-500"
                  : "bg-blue-500"
              }
            `}
            />
            <span className="text-sm font-medium">
              {remainingGuesses && remainingGuesses <= 2
                ? "Critical!"
                : remainingGuesses && remainingGuesses <= 4
                ? "Be careful!"
                : "You're doing great!"}
            </span>
          </div>
        </div>
      )}

      {status === "won" && (
        <div className="mt-4">
          <div className="flex justify-center items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className="text-yellow-400 text-lg animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                ⭐
              </span>
            ))}
          </div>
          <p className="text-sm mt-2 font-medium">You saved the day!</p>
        </div>
      )}

      {status === "lost" && (
        <div className="mt-4">
          <div className="text-4xl mb-2">⚰️</div>
          <p className="text-sm font-medium">Don't give up - try again!</p>
        </div>
      )}
    </div>
  );
};
