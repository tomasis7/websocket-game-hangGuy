import React, { useEffect, useState } from "react";
import { HangmanSVGs } from "./hangman/HangmanSVGs";
import { HangGuyWord } from "./HangGuyWord";
import { GuessDisplay } from "./GuessDisplay";
import { LetterInput } from "./LetterInput";
import { GameStatus } from "./GameStatus";
import { GameControls } from "./GameControls";
import { JoinGameWelcome } from "./JoinGameWelcome";
import { useMultiplayerGame } from "../hooks/useMultiplayerGame";
import { UserJoinDialog } from "./UserJoinDialog";
import { UserList } from "./UserList";
import type { User } from "../../../shared/types";
import { socket } from "../socket";

export const MultiplayerHangGuy: React.FC = () => {
  const {
    gameState,
    players,
    playerInfo,
    isConnected,
    isJoining,
    error,
    notifications,
    joinWelcome,
    actions,
  } = useMultiplayerGame();

  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionInfo, setSessionInfo] = useState<{
    id: string;
    userCount: number;
  } | null>(null);
  const [showJoinDialog, setShowJoinDialog] = useState(true);

  const incorrectGuessCount = gameState?.incorrectGuesses.length || 0;
  const isGameActive = gameState?.status === "playing";

  const handleGuess = (letter: string) => {
    if (isGameActive && isConnected) {
      actions.guessLetter(letter);
    }
  };

  const handleNewGame = (options?: {
    category?: string;
    difficulty?: "easy" | "medium" | "hard";
  }) => {
    if (isConnected) {
      actions.startNewGame(options);
    }
  };

  const joinGame = (nickname: string, sessionId?: string) => {
    socket?.emit("joinGame", { nickname, sessionId });
    setShowJoinDialog(false);
  };

  const leaveGame = () => {
    socket?.emit("leaveGame");
    setCurrentUser(null);
    setUsers([]);
    setSessionInfo(null);
    setShowJoinDialog(true);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("userJoined", (user: User) => {
      setUsers((prev) => [...prev.filter((u) => u.id !== user.id), user]);
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: `${user.nickname} joined the game`,
          type: "info" as const,
          timestamp: new Date(),
        },
      ]);
    });

    socket.on("userLeft", (userId: string) => {
      setUsers((prev) => {
        const user = prev.find((u) => u.id === userId);
        if (user) {
          setNotifications((prevNotifs) => [
            ...prevNotifs,
            {
              id: Date.now(),
              message: `${user.nickname} left the game`,
              type: "info" as const,
              timestamp: new Date(),
            },
          ]);
        }
        return prev.filter((u) => u.id !== userId);
      });
    });

    socket.on("userListUpdated", (userList: User[]) => {
      setUsers(userList);
    });

    socket.on("sessionInfo", (info: { id: string; userCount: number }) => {
      setSessionInfo(info);
    });

    return () => {
      socket.off("userJoined");
      socket.off("userLeft");
      socket.off("userListUpdated");
      socket.off("sessionInfo");
    };
  }, [socket]);

  // Loading/connecting state
  if (!isConnected || isJoining) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {isJoining ? "Joining Game..." : "Connecting to Game..."}
          </h2>
          <p className="text-gray-600 mb-4">
            {isJoining
              ? "Please wait while we sync you with the current game state."
              : "Please wait while we connect you to the multiplayer game."}
          </p>
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              Error: {error}
            </div>
          )}
          <button
            onClick={actions.requestSync}
            disabled={!isConnected}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Show welcome modal for new joiners
  if (joinWelcome.show && joinWelcome.gameState && joinWelcome.playerInfo) {
    return (
      <JoinGameWelcome
        gameState={joinWelcome.gameState}
        playerInfo={joinWelcome.playerInfo}
        isGameInProgress={joinWelcome.isGameInProgress}
        gameSummary={joinWelcome.gameSummary}
        onDismiss={actions.dismissWelcome}
      />
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Loading Game...
          </h2>
          <div className="space-y-2">
            <button
              onClick={actions.requestSync}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Sync Game State
            </button>
            <button
              onClick={actions.requestGameHistory}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 ml-2"
            >
              Get Game History
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <UserJoinDialog onJoin={joinGame} isVisible={showJoinDialog} />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Hang Guy</h1>
          <div className="flex justify-center items-center space-x-4 text-sm">
            <ConnectionStatus isConnected={isConnected} />
            {sessionInfo && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Session: {sessionInfo.id} | {sessionInfo.userCount} player(s)
              </span>
            )}
            {currentUser && (
              <button
                onClick={leaveGame}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
              >
                Leave Game
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header with multiplayer info */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Hang Guy - Multiplayer
              </h1>
              <div className="flex justify-center items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isConnected ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span>{isConnected ? "Connected" : "Disconnected"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>
                    👥 {players.length} player{players.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🆔 You: {playerInfo.name}</span>
                </div>
              </div>
            </div>

            {/* Error display */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
                ⚠️ {error}
              </div>
            )}

            {/* Notifications */}
            {notifications.length > 0 && (
              <div className="mb-6 space-y-2">
                {notifications.slice(-3).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg text-sm ${
                      notification.type === "success"
                        ? "bg-green-100 border border-green-400 text-green-700"
                        : notification.type === "error"
                        ? "bg-red-100 border border-red-400 text-red-700"
                        : notification.type === "warning"
                        ? "bg-yellow-100 border border-yellow-400 text-yellow-700"
                        : "bg-blue-100 border border-blue-400 text-blue-700"
                    }`}
                  >
                    {notification.message}
                  </div>
                ))}
                {notifications.length > 3 && (
                  <button
                    onClick={actions.clearNotifications}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear all notifications
                  </button>
                )}
              </div>
            )}

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
                  <HangmanSVGs
                    stage={incorrectGuessCount}
                    className="w-48 h-60"
                  />
                </div>

                {/* Display word with underscores */}
                <div className="bg-white rounded-lg shadow-md p-6 w-full">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                    Word to Guess
                  </h3>
                  <div className="flex justify-center">
                    <HangGuyWord
                      word={gameState.word}
                      correctGuesses={new Set(gameState.correctGuesses)}
                    />
                  </div>
                </div>

                {/* Players list */}
                <div className="bg-white rounded-lg shadow-md p-4 w-full">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">
                    Players ({players.length})
                  </h4>
                  <div className="space-y-1">
                    {players.map((player) => (
                      <div
                        key={player.id}
                        className={`text-sm p-2 rounded ${
                          player.id === playerInfo.id
                            ? "bg-blue-100 text-blue-800 font-medium"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {player.id === playerInfo.id
                          ? "👤 You"
                          : `👤 ${player.name}`}
                        {player.id === gameState.lastAction?.playerId && (
                          <span className="ml-2 text-xs text-green-600">
                            • last action
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Middle Column: Guess Tracking */}
              <div className="flex justify-center">
                <GuessDisplay
                  correctGuesses={new Set(gameState.correctGuesses)}
                  incorrectGuesses={new Set(gameState.incorrectGuesses)}
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
                    disabled={!isGameActive || !isConnected}
                    guessedLetters={
                      new Set([
                        ...gameState.correctGuesses,
                        ...gameState.incorrectGuesses,
                      ])
                    }
                  />
                </div>

                {/* Game Controls */}
                <GameControls
                  onNewGame={handleNewGame}
                  gameStatus={gameState.status}
                  disabled={!isConnected}
                />

                {/* Connection Controls */}
                <div className="bg-white rounded-lg shadow-md p-4 w-full">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">
                    Debug
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={actions.requestSync}
                      disabled={!isConnected}
                      className="w-full bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 transition-colors disabled:bg-gray-400"
                    >
                      🔄 Sync Game State
                    </button>
                    <button
                      onClick={actions.requestGameHistory}
                      disabled={!isConnected}
                      className="w-full bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 transition-colors disabled:bg-gray-400"
                    >
                      📚 Get Game History
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <UserList users={users} currentUserId={currentUser?.id} />
            {/* ...existing sidebar components... */}
          </div>
        </div>
      </div>
    </div>
  );
};
