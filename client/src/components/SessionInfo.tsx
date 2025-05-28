import React from "react";

interface SessionInfoProps {
  gameId?: string;
  sessionId?: string;
  playerCount?: number;
  isConnected?: boolean;
  socketId?: string;
  currentUser?: {
    id: string;
    name: string;
  };
}

export const SessionInfo: React.FC<SessionInfoProps> = ({
  gameId,
  sessionId,
  playerCount = 0,
  isConnected = false,
  socketId,
  currentUser,
}) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="space-y-3">
        {/* First Row: Connection Status and Player Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm font-medium text-gray-700">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>

            {currentUser && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Player:</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                  {currentUser.name}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700">
              {playerCount} {playerCount === 1 ? "player" : "players"}
            </span>
          </div>
        </div>

        {/* Second Row: Session and Technical Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {sessionId && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Session:</span>
                <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                  {sessionId}
                </code>
              </div>
            )}

            {gameId && gameId !== sessionId && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Game:</span>
                <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-mono">
                  {gameId}
                </code>
              </div>
            )}
          </div>

          {socketId && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Socket:</span>
              <code className="bg-gray-50 text-gray-600 px-2 py-1 rounded text-xs font-mono">
                {socketId.slice(-8)}...
              </code>
            </div>
          )}
        </div>
      </div>

      {!isConnected && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          ⚠️ Connection lost. Attempting to reconnect...
        </div>
      )}
    </div>
  );
};
